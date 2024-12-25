import { type Ref, computed, ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { Viewport } from '@/lib/viewport';
import { useMultiPointerDrag } from '@/mixins/multi-pointer';
import { calibrateGrid as _calibrateGrid } from '@/lib/grid-calibration';
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
				options.viewport.value.panTo(position.value);
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

					options.viewport.value.rotateBy(rotation, dragStatus.startPosition.addVector(options.viewport.value.viewportSize.scale(-0.5)));
				}
			} else {
				if (canPan.value) {
					options.viewport.value.position.x +=
						dragStatus.transformDelta.x;
					options.viewport.value.position.y +=
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
						x: event.clientX - options.viewport.value.viewportSize.x / 2,
						y: event.clientY - options.viewport.value.viewportSize.y / 2,
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
				if (['ArrowUp', 'ArrowDown'].includes(event.key) && canZoom.value) {
					const zoomDelta =
						(event.key === 'ArrowUp'
							? 0.001
							: event.key === 'ArrowDown'
								? -0.001
								: 0) * options.viewport.value.zoom;

					options.viewport.value.zoomBy(zoomDelta);
				}
				if (
					['ArrowLeft', 'ArrowRight'].includes(event.key) &&
					canRotate.value
				) {
					const rotationDelta =
						event.key === 'ArrowLeft'
							? -0.1
							: event.key === 'ArrowRight'
								? 0.1
								: 0;

					options.viewport.value.rotateBy(rotationDelta);
				}
			} else {
				if (canPan.value) {
					const movementMagnitude = event.shiftKey
						? (125 * options.viewport.value.resolvedZoom)
						: 1;

					const movement = Vector.fromCartesianVector({
						x:
							movementMagnitude *
							(event.key === 'ArrowLeft'
								? 1
								: event.key === 'ArrowRight'
									? -1
									: 0),
						y:
							movementMagnitude *
							(event.key === 'ArrowUp'
								? 1
								: event.key === 'ArrowDown'
									? -1
									: 0),
					});
					options.viewport.value.withSmoothing(() => {
						options.viewport.value.panBy(
							options.viewport.value.toWorldOffset(movement)
						);
					}, 100);
				}
			}
		}
	};
	useEventListener('keydown', onKeyPress);

	const calibrating = ref(false);
	const calibrateGrid = async () => {
		if (calibrating.value) return;
		calibrating.value = true;
		try {
			await _calibrateGrid(options.viewport.value);
		} finally {
			calibrating.value = false;
		}
	};

	return {
		moving,
		canPan,
		canRotate,
		canZoom,
		calibrating,
		calibrateGrid,
	};
};
