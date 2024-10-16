import { type Ref, computed, ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { Viewport } from '@/lib/viewport';
import { useMultiPointerDrag } from '@/mixins/multi-pointer';
import { settings } from '@/lib/settings';
import { Vector } from '@/lib/vector';

export enum DragType {
	Translate,
	Rotate,
}

export type ViewportLockOptions = {
	containerElement: Ref<HTMLElement | null>;
	viewport: Ref<Viewport>;
	position?: Ref<Vector | null>;
	rotation?: Ref<number | null>;
	zoom?: Ref<number | null>;
};
export const useViewPortLock = (options: ViewportLockOptions) => {
	const position = options.position ?? ref(null);
	const rotation = options.rotation ?? ref(null);
	const zoom = options.zoom ?? ref(null);

	const updateViewport = () => {
		if (position.value == null && rotation.value == null && zoom.value == null)
			return;
		options.viewport.value.withSmoothing(() => {
			if (zoom.value != null) options.viewport.value.zoomTo(zoom.value);
			if (rotation.value != null)
				options.viewport.value.rotateTo(rotation.value);
			if (position.value != null)
				options.viewport.value.panToCentered(position.value);
		});
	};

	const stopWatcher = watch(
		() => [position.value, zoom.value] as const,
		updateViewport,
		{ immediate: true }
	);

	const stopEventListener = useEventListener(window, 'resize', updateViewport);

	return {
		stop: () => {
			stopWatcher();
			stopEventListener();
		},
	};
};

export type ViewportControlOptions = {
	containerElement: Ref<HTMLElement | null>;
	viewport: Ref<Viewport>;
	lockPan?: Ref<Vector | null>;
	lockRotate?: Ref<number | null>;
	lockZoom?: Ref<number | null>;
};
export const useViewPortControl = (options: ViewportControlOptions) => {
	const moving = ref<null | {
		dragType: DragType;
	}>(null);

	const lockPanTo = options.lockPan ?? ref(null);
	const lockRotateTo = options.lockRotate ?? ref(null);
	const lockZoomTo = options.lockZoom ?? ref(null);

	const canPan = computed(
		() => lockPanTo.value == null && !settings.value.lockPan
	);
	const canRotate = computed(
		() => lockRotateTo.value == null && !settings.value.lockRotate
	);
	const canZoom = computed(
		() => lockZoomTo.value == null && !settings.value.lockZoom
	);

	useViewPortLock({
		...options,
		position: lockPanTo,
		rotation: lockRotateTo,
		zoom: lockZoomTo,
	});

	useMultiPointerDrag({
		element: options.containerElement,
		onBeforePointerDown: (event) => {
			return event.button <= 2;
		},
		onDragStart: (event) => {
			const newMove: typeof moving.value = {
				// startViewport: viewport.value.clone(),
				dragType:
					event.shiftKey || event.button === 2 || !canPan.value
						? DragType.Rotate
						: DragType.Translate,
			};

			moving.value = newMove;
		},
		onUpdate: (dragStatus) => {
			if (!moving.value) return;

			if (moving.value.dragType === DragType.Rotate) {
				if (Object.keys(dragStatus.pointers).length === 1 && canRotate.value) {
					const rotation =
						dragStatus.rotationDelta +
						(dragStatus.transformDelta.x * 720) /
							window.document.body.clientWidth;

					options.viewport.value.rotateBy(rotation);
				}
			} else {
				if (canPan.value) {
					options.viewport.value.position.cartesianVector.x +=
						dragStatus.transformDelta.x;
					options.viewport.value.position.cartesianVector.y +=
						dragStatus.transformDelta.y;
				}
			}

			if (Object.keys(dragStatus.pointers).length > 1) {
				if (canZoom.value) {
					options.viewport.value.zoomBy(
						dragStatus.zoomDelta,
						canPan.value ? dragStatus.currentPosition : undefined
					);
				}
				if (canRotate.value) {
					options.viewport.value.rotateBy(
						dragStatus.rotationDelta,
						canPan.value ? dragStatus.currentPosition : undefined
					);
				}
			}
		},
		onDragEnd: () => {
			moving.value = null;
		},
	});

	const onWheel = (event: WheelEvent) => {
		event.stopPropagation();
		event.preventDefault();
		if (!canZoom.value) return;
		let zoomModifier = 1;
		if (event.ctrlKey && event.shiftKey) {
			zoomModifier = 0.01;
		} else if (event.ctrlKey) {
			zoomModifier = 5;
		} else if (event.shiftKey) {
			zoomModifier = 0.1;
		}

		const zoomDelta =
			(event.deltaY > 0 ? -0.1 : 0.1) *
			zoomModifier *
			options.viewport.value.zoom;

		options.viewport.value.zoomBy(
			zoomDelta,
			canPan.value
				? Vector.fromCartesianVector({
						x: event.clientX,
						y: event.clientY,
					})
				: undefined
		);
	};
	useEventListener(options.containerElement, 'wheel', onWheel);

	const onKeyPress = (event: KeyboardEvent) => {
		if (
			['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
		) {
			if (event.ctrlKey) {
				if (canZoom.value) {
					const zoomDelta =
						(event.key === 'ArrowUp'
							? 0.001
							: event.key === 'ArrowDown'
								? -0.001
								: 0) * options.viewport.value.zoom;

					options.viewport.value.zoomBy(zoomDelta);
				}
			} else {
				if (canPan.value) {
					const movement = Vector.fromCartesianVector({
						x:
							event.key === 'ArrowLeft'
								? 1
								: event.key === 'ArrowRight'
									? -1
									: 0,
						y: event.key === 'ArrowUp' ? 1 : event.key === 'ArrowDown' ? -1 : 0,
					});
					options.viewport.value.panBy(
						options.viewport.value.toViewportOffset(movement)
					);
				}
			}
		}
	};
	useEventListener(options.containerElement, 'keydown', onKeyPress);
};
