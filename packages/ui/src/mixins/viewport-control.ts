import { type Ref, ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { Viewport } from '@/lib/viewport';
import { useMultiPointerDrag } from '@/mixins/multi-pointer';
import { Vector } from '@/lib/vector';

export enum DragType {
	Translate,
	Rotate,
}

export type ViewportLockOptions = {
	containerElement: Ref<HTMLElement | null>;
	viewport: Ref<Viewport>;
	position?: Ref<Vector | null>;
	zoom?: Ref<number | null>;
};
export const useViewPortLock = (options: ViewportLockOptions) => {
	const position = options.position ?? ref(null);
	const zoom = options.zoom ?? ref(null);

	const updateViewport = () => {
		if (position.value == null && zoom.value == null) return;
		options.viewport.value.withSmoothing(() => {
			if (zoom.value != null) options.viewport.value.zoomTo(zoom.value);
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
	lockPosition?: Ref<Vector | null>;
	lockZoom?: Ref<number | null>;
};
export const useViewPortControl = (options: ViewportControlOptions) => {
	const moving = ref<null | {
		dragType: DragType;
	}>(null);

	const lockPosition = options.lockPosition ?? ref(null);
	const lockZoom = options.lockZoom ?? ref(null);

	useViewPortLock({
		...options,
		position: lockPosition,
		zoom: lockZoom,
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
					event.shiftKey || event.button === 2 || lockPosition.value != null
						? DragType.Rotate
						: DragType.Translate,
			};

			moving.value = newMove;
		},
		onUpdate: (dragStatus) => {
			if (!moving.value) return;

			if (moving.value.dragType === DragType.Rotate) {
				if (Object.keys(dragStatus.pointers).length === 1) {
					const rotation =
						dragStatus.rotationDelta +
						(dragStatus.transformDelta.x * 720) /
							window.document.body.clientWidth;

					options.viewport.value.rotateBy(rotation);
				}
			} else {
				options.viewport.value.position.cartesianVector.x +=
					dragStatus.transformDelta.x;
				options.viewport.value.position.cartesianVector.y +=
					dragStatus.transformDelta.y;
			}

			if (Object.keys(dragStatus.pointers).length > 1) {
				if (!lockZoom.value) {
					options.viewport.value.zoomBy(
						dragStatus.zoomDelta,
						lockPosition.value == null ? dragStatus.currentPosition : undefined
					);
				}
				options.viewport.value.rotateBy(
					dragStatus.rotationDelta,
					lockPosition.value == null ? dragStatus.currentPosition : undefined
				);
			}
		},
		onDragEnd: () => {
			moving.value = null;
		},
	});

	const onWheel = (event: WheelEvent) => {
		event.stopPropagation();
		event.preventDefault();
		if (lockZoom.value) return;
		const zoomDelta =
			(event.deltaY > 0 ? -0.1 : 0.1) * (event.ctrlKey ? 5 : 1) * (event.shiftKey ? .1 : 1);

		options.viewport.value.zoomBy(
			zoomDelta * options.viewport.value.zoom,
			lockPosition.value == null
				? Vector.fromCartesianVector({
						x: event.clientX,
						y: event.clientY,
					})
				: undefined
		);
	};
	useEventListener(options.containerElement, 'wheel', onWheel);
};
