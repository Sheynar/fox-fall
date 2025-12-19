import { type Ref, computed, nextTick, ref, shallowRef } from 'vue';
import { useEventListener } from '@vueuse/core';
import { Vector } from '@packages/data/dist/artillery/vector';
import type { Viewport } from '@packages/frontend-libs/dist/viewport/viewport';
import { useMultiPointerDrag } from '@/mixins/multi-pointer';
import { artillery } from '@/lib/globals';
import { calibrateGrid as _calibrateGrid } from '@/lib/grid-calibration';
import { settings } from '@/lib/settings';

export enum DragType {
	Translate,
	Rotate,
}

export type ViewportControlOptions = {
	containerElement: Ref<HTMLElement | null>;
	viewport: Ref<Viewport>;
	lockPan?: Ref<Vector | null>;
	lockRotate?: Ref<number | null>;
	lockZoom?: Ref<number | null>;
};
export function useViewportControl(options: ViewportControlOptions) {
	const moving = ref<null | {
		dragType: DragType;
	}>(null);

	const canPan = computed(() => !settings.value.lockPan && !screenShot.value);
	const canRotate = computed(
		() => !settings.value.lockRotate && !screenShot.value
	);
	const canZoom = computed(() => !settings.value.lockZoom && !screenShot.value);

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

					options.viewport.value.rotateBy(
						rotation,
						canPan.value
							? dragStatus.startPosition.addVector(
									options.viewport.value.viewportSize.scale(-0.5)
								)
							: undefined
					);
				}
			} else {
				if (canPan.value) {
					options.viewport.value.position.x += dragStatus.transformDelta.x;
					options.viewport.value.position.y += dragStatus.transformDelta.y;
				}
			}

			if (Object.keys(dragStatus.pointers).length > 1) {
				const centerPoint = dragStatus.currentPosition.addVector(
					options.viewport.value.viewportSize.scale(-0.5)
				);

				if (canZoom.value) {
					options.viewport.value.zoomBy(
						dragStatus.zoomDelta,
						canPan.value ? centerPoint : undefined
					);
				}
				if (canRotate.value) {
					options.viewport.value.rotateBy(
						dragStatus.rotationDelta,
						canPan.value ? centerPoint : undefined
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
		if (artillery.selectedUnit.value) return;
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
						? 125 * options.viewport.value.resolvedZoom
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

	const screenShotting = ref(false);
	const screenShot = shallowRef<ImageBitmap | null>(null);
	const captureScreenShot = async () => {
		if (screenShotting.value) return;
		screenShotting.value = true;
		try {
			await nextTick();
			await new Promise((resolve) => requestAnimationFrame(resolve));
			const mediaStream = await navigator.mediaDevices.getDisplayMedia({
				video: true,
			});
			const videoStreamTrack = mediaStream.getVideoTracks()[0];
			const imageCapture = new ImageCapture(videoStreamTrack);
			screenShot.value = await imageCapture.grabFrame();
			videoStreamTrack.stop();
		} finally {
			screenShotting.value = false;
		}
	};

	return {
		moving,
		canPan,
		canRotate,
		canZoom,
		calibrating,
		calibrateGrid,
		screenShotting,
		screenShot,
		captureScreenShot,
	};
};
