import { Vector } from '@packages/data/dist/artillery/vector';
import { useEventListener } from '@vueuse/core';
import { computed, onScopeDispose, Ref, shallowRef, watch } from 'vue';

export enum MarkerType {
	Pen = 'pen',
	Erase = 'erase',
}

export type UseMarkerOptions = {
	eventElement?: Ref<HTMLElement | null>;
	canvasElement?: HTMLCanvasElement;

	zoom: Ref<number>;
	position: Ref<Vector>;
	width: Ref<number>;
	height: Ref<number>;

	maxWidth: number;
	maxHeight: number;
	imageData?: ImageData;

	markerType: Ref<MarkerType>;
	markerColor: Ref<string>;
	markerSize: Ref<number>;
	markerDisabled: Ref<boolean>;

	onDispose?: () => void;
};
export function useMarker(options: UseMarkerOptions) {
	const canvasElement =
		options.canvasElement ?? document.createElement('canvas');
	const context = canvasElement.getContext('2d')!;
	if (context == null) {
		throw new Error('Failed to get context');
	}

	watch(
		() => options.width.value,
		(newWidth) => {
			canvasElement.width = newWidth;
		},
		{ immediate: true }
	);

	watch(
		() => options.height.value,
		(newHeight) => {
			canvasElement.height = newHeight;
		},
		{ immediate: true }
	);

	const eventElement = computed(() => options.eventElement?.value ?? canvasElement);

	const storageCanvas = document.createElement('canvas');
	storageCanvas.width = options.maxWidth;
	storageCanvas.height = options.maxHeight;
	const storageContext = storageCanvas.getContext('2d')!;
	if (storageContext == null) {
		throw new Error('Failed to get context');
	}
	if (options.imageData != null) {
		storageContext.putImageData(options.imageData, 0, 0);
	}

	const activeMarker = shallowRef<{
		position: Vector;
		tempCanvas: HTMLCanvasElement;
		tempContext: CanvasRenderingContext2D;
	} | null>(null);
	function dumpMarkerCanvas() {
		if (activeMarker.value == null) return;
		storageContext.globalCompositeOperation =
			options.markerType.value === MarkerType.Pen
				? 'source-over'
				: 'destination-out';
		storageContext.drawImage(
			activeMarker.value.tempCanvas,
			-options.position.value.x / options.zoom.value +
				options.maxWidth / 2 -
				options.width.value / options.zoom.value / 2,
			-options.position.value.y / options.zoom.value +
				options.maxHeight / 2 -
				options.height.value / options.zoom.value / 2,
			options.width.value / options.zoom.value,
			options.height.value / options.zoom.value
		);
	}

	function placeMarker(position: Vector) {
		if (activeMarker.value != null) removeMarker();
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = canvasElement.width;
		tempCanvas.height = canvasElement.height;
		const tempContext = tempCanvas.getContext('2d');
		if (tempContext == null) {
			throw new Error('Failed to get context');
		}
		tempContext.lineWidth = options.markerSize.value * options.zoom.value;
		tempContext.strokeStyle =
			options.markerType.value === MarkerType.Erase
				? 'white'
				: options.markerColor.value;
		tempContext.lineCap = 'round';
		tempContext.lineJoin = 'round';
		tempContext.beginPath();
		tempContext.moveTo(position.x, position.y);
		activeMarker.value = {
			position,
			tempCanvas,
			tempContext,
		};
	}
	function removeMarker() {
		if (activeMarker.value == null) return;

		dumpMarkerCanvas();
		activeMarker.value.tempCanvas.remove();

		activeMarker.value = null;
	}
	function moveMarker(position: Vector) {
		if (activeMarker.value == null) return;
		activeMarker.value.tempContext.globalCompositeOperation = 'source-over';
		activeMarker.value.tempContext.lineTo(position.x, position.y);
		activeMarker.value.position = position;
		activeMarker.value.tempContext.stroke();

		activeMarker.value.tempContext.globalCompositeOperation = 'source-in';
		activeMarker.value.tempContext.fillStyle =
			activeMarker.value.tempContext.strokeStyle;
		activeMarker.value.tempContext.fillRect(
			0,
			0,
			activeMarker.value.tempCanvas.width,
			activeMarker.value.tempCanvas.height
		);

		if (options.markerType.value === MarkerType.Erase) {
			dumpMarkerCanvas();
		}
	}

	watch(
		() => options.markerDisabled?.value && activeMarker.value != null,
		(disabled) => {
			if (disabled) removeMarker();
		},
		{ immediate: true, flush: 'sync' }
	);

	const eventToVector = (event: PointerEvent) => {
		const bounds = eventElement.value.getBoundingClientRect();
		if (bounds == null) return Vector.fromCartesianVector({ x: 0, y: 0 });

		return Vector.fromCartesianVector({
			x: ((event.clientX - bounds.left) * bounds.width) / bounds.width,
			y: ((event.clientY - bounds.top) * bounds.height) / bounds.height,
		});
	};

	function onPointerDown(event: PointerEvent) {
		if (options.markerDisabled?.value || event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();

		placeMarker(eventToVector(event));
		moveMarker(eventToVector(event));
		eventElement.value.setPointerCapture(event.pointerId);
	}

	let lastPointerMoveEvent: PointerEvent | null = null;
	function onPointerMove(event: PointerEvent) {
		lastPointerMoveEvent = event;
		if (options.markerDisabled?.value || !activeMarker.value) return;

		moveMarker(eventToVector(event));
	}

	function onPointerUp(event: PointerEvent) {
		if (options.markerDisabled?.value || !activeMarker.value) return;
		event.preventDefault();
		event.stopPropagation();

		moveMarker(eventToVector(event));
		eventElement.value.releasePointerCapture(event.pointerId);
		removeMarker();
	}

	useEventListener(eventElement, 'pointerdown', onPointerDown);
	useEventListener(eventElement, 'pointermove', onPointerMove);
	useEventListener(eventElement, 'pointerup', onPointerUp);

	let frameRequest: ReturnType<typeof requestAnimationFrame> | null = null;
	const cancelFrame = () => {
		if (frameRequest != null) {
			cancelAnimationFrame(frameRequest);
			frameRequest = null;
		}
	};
	const requestFrame = () => {
		cancelFrame();
		frameRequest = requestAnimationFrame(render);
	};

	function render() {
		if (isDisposed) return;
		cancelFrame();

		try {
			context.clearRect(0, 0, options.width.value, options.height.value);
			context.drawImage(
				storageCanvas,
				options.position.value.x +
					options.width.value / 2 -
					(options.maxWidth * options.zoom.value) / 2,
				options.position.value.y +
					options.height.value / 2 -
					(options.maxHeight * options.zoom.value) / 2,
				options.maxWidth * options.zoom.value,
				options.maxHeight * options.zoom.value
			);
			if (activeMarker.value != null && options.markerType.value === MarkerType.Pen) {
				context.drawImage(
					activeMarker.value.tempCanvas,
					0,
					0,
					activeMarker.value.tempCanvas.width,
					activeMarker.value.tempCanvas.height
				);
			}

			if (lastPointerMoveEvent != null && !options.markerDisabled?.value) {
				context.strokeStyle = 'white';
				context.beginPath();
				context.arc(
					lastPointerMoveEvent.clientX,
					lastPointerMoveEvent.clientY,
					(options.markerSize.value * options.zoom.value) / 2,
					0,
					2 * Math.PI
				);
				context.stroke();
			}
		} finally {
			requestFrame();
		}
	}

	function start() {
		requestFrame();
	}
	function stop() {
		cancelFrame();
	}

	let isDisposed = false;
	onScopeDispose(() => {
		isDisposed = true;
		options.onDispose?.();
	});

	return {
		activeMarker,
		eventElement,
		canvasElement,
		start,
		stop,
	};
}
