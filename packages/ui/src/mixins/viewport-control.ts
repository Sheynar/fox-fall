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

	const _calibrateGrid = async () => {
		const calibrationPane = document.createElement('div');
		calibrationPane.style.setProperty('position', 'fixed');
		calibrationPane.style.setProperty('inset', '0');
		calibrationPane.style.setProperty('width', '100vw');
		calibrationPane.style.setProperty('height', '100vh');
		calibrationPane.style.setProperty('z-index', '1000000');
		calibrationPane.style.setProperty('font-size', '4vmin');
		calibrationPane.style.setProperty('display', 'flex');
		calibrationPane.style.setProperty('align-items', 'center');
		calibrationPane.style.setProperty('justify-content', 'center');
		calibrationPane.style.setProperty('text-align', 'center');
		calibrationPane.style.setProperty('filter', "url('#outline')");
		calibrationPane.style.setProperty('opacity', '0.4');

		calibrationPane.innerText = 'Calibrating grid. \n Drag from one corner of a cell to the other';

		let resolve: () => void, reject: (e: unknown) => void;
		const promise = new Promise<void>((res, rej) => {
			resolve = res;
			reject = rej;
		});

		let draggingData: {
			startPosition: Vector;
			endPosition: Vector;
			indicator: HTMLDivElement;
		} | null = null;
		calibrationPane.addEventListener('pointerdown', (event) => {
			event.preventDefault();
			event.stopPropagation();

			draggingData = {
				startPosition: Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				}),
				endPosition: Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				}),
				indicator: document.createElement('div'),
			};

			calibrationPane.setPointerCapture(event.pointerId);
		});

		calibrationPane.addEventListener('pointermove', (event) => {
			if (draggingData == null) return;
			event.preventDefault();
			event.stopPropagation();

			draggingData.endPosition = Vector.fromCartesianVector({
				x: event.clientX,
				y: event.clientY,
			});
		});

		calibrationPane.addEventListener('pointerup', (event) => {
			if (draggingData == null) return;
			event.preventDefault();
			event.stopPropagation();

			const offset = options.viewport.value
				.toViewportOffset(draggingData.endPosition)
				.addVector(
					options.viewport.value
						.toViewportOffset(draggingData.startPosition)
						.scale(-1)
				);

			options.viewport.value.withSmoothing(() => {
				options.viewport.value.rotation =
					options.viewport.value.rotation > 270 ? 360 + 90 : 90;
				options.viewport.value.zoomTo(
					(options.viewport.value.zoom *
						(Math.abs(offset.x) + Math.abs(offset.y))) /
						250
				);

				const midpoint = options.viewport.value
					.toViewportVector(draggingData!.endPosition)
					.addVector(
						options.viewport.value.toViewportVector(draggingData!.startPosition)
					)
					.scale(0.5);

				options.viewport.value.panBy(
					Vector.fromCartesianVector({
						x: Math.round(midpoint.x / 125) * 125 - midpoint.x,
						y: Math.round(midpoint.y / 125) * 125 - midpoint.y,
					})
				);
			});

			draggingData.indicator.remove();
			draggingData = null;

			calibrationPane.releasePointerCapture(event.pointerId);
			resolve();
		});

		document.body.appendChild(calibrationPane);

		return promise.finally(() => {
			calibrationPane.remove();
		});
	};

	const calibrating = ref(false);
	const calibrateGrid = async () => {
		if (calibrating.value) return;
		calibrating.value = true;
		try {
			await _calibrateGrid();
		} finally {
			calibrating.value = false;
		}
	}

	return {
		moving,
		canPan,
		canRotate,
		canZoom,
		calibrating,
		calibrateGrid,
	};
};
