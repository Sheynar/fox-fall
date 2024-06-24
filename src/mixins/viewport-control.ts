import { type Ref, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { Viewport } from '@/lib/viewport';
import { useMultiPointerDrag } from '@/mixins/multi-pointer';
import { Vector } from '@/lib/vector';

export enum DragType {
	Translate,
	Rotate,
}

export type ViewportControlOptions = {
	containerElement: Ref<HTMLElement | null>;
	viewport: Ref<Viewport>;
};
export const useViewPortControl = (options: ViewportControlOptions) => {
	const moving = ref<null | {
		dragType: DragType;
	}>(null);

	useMultiPointerDrag({
		element: options.containerElement,
		onBeforePointerDown: (event) => {
			return event.button <= 2;
		},
		onDragStart: (event) => {
			moving.value = {
				// startViewport: viewport.value.clone(),
				dragType:
					event.shiftKey || event.button === 2
						? DragType.Rotate
						: DragType.Translate,
			};
		},
		onUpdate: (dragStatus) => {
			if (!moving.value) return;

			if (moving.value.dragType === DragType.Rotate) {
				const rotation =
					dragStatus.rotationDelta +
					(dragStatus.transformDelta.x * 720) /
						window.document.body.clientWidth;

				options.viewport.value.rotateBy(rotation);
			} else {
				options.viewport.value.position.cartesianVector.x +=
					dragStatus.transformDelta.x;
				options.viewport.value.position.cartesianVector.y +=
					dragStatus.transformDelta.y;
				options.viewport.value.rotateBy(
					dragStatus.rotationDelta,
					dragStatus.currentPosition
				);
			}

			options.viewport.value.zoomBy(-dragStatus.zoomDelta, dragStatus.currentPosition);
		},
		onDragEnd: () => {
			moving.value = null;
		},
	});

	const onWheel = (event: WheelEvent) => {
		event.stopPropagation();
		event.preventDefault();
		const zoomDelta =
			(event.deltaY > 0 ? 0.1 : -0.1) * (event.ctrlKey ? 10 : 1);

		options.viewport.value.zoomBy(
			zoomDelta,
			Vector.fromCartesianVector({
				x: event.clientX,
				y: event.clientY,
			})
		);
	};
	useEventListener(options.containerElement, 'wheel', onWheel);
};
