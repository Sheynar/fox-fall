import { Vector } from '@packages/data/dist/artillery/vector';
import { useEventListener } from '@vueuse/core';
import { computed, onScopeDispose, ref, Ref, shallowRef, watch } from 'vue';
import { injectIntelInstance } from '@/lib/intel-instance';
import { useCanvasStorage } from './canvas-storage';
import { withHandlingAsync } from '@packages/frontend-libs/dist/error';

export enum MarkerType {
	Pen = 'pen',
	Erase = 'erase',
}

export type MarkerStroke = {
	type: MarkerType;
	color: string;
	size: number;
	viewportPosition: Vector['cartesianVector'];
	viewportZoom: number;
	points: Vector['cartesianVector'][];
};

export type MarkerExport = {
	base?: string;
	strokes: MarkerStroke[];
};

export type UseMarkerOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
	eventElement: Ref<HTMLElement | null>;

	zoom: Ref<number>;
	position: Ref<Vector>;
	width: Ref<number>;
	height: Ref<number>;

	maxWidth: number;
	maxHeight: number;

	markerType: Ref<MarkerType>;
	markerColor: Ref<string>;
	markerSize: Ref<number>;
	markerDisabled: Ref<boolean>;

	onDispose?: () => void;
};
export function useMarker(options: UseMarkerOptions) {
	const canvasElement = new OffscreenCanvas(
		options.width.value,
		options.height.value
	);
	const context = canvasElement.getContext('2d')!;
	if (context == null) {
		throw new Error('Failed to get context');
	}

	watch(
		() => options.width.value,
		(newWidth) => {
			canvasElement.width = newWidth;
		},
		{ immediate: true, flush: 'sync' }
	);

	watch(
		() => options.height.value,
		(newHeight) => {
			canvasElement.height = newHeight;
		},
		{ immediate: true, flush: 'sync' }
	);

	const storageCanvas = new OffscreenCanvas(
		options.maxWidth,
		options.maxHeight
	);
	storageCanvas.width = options.maxWidth;
	storageCanvas.height = options.maxHeight;
	const storageContext = storageCanvas.getContext('2d')!;
	if (storageContext == null) {
		throw new Error('Failed to get context');
	}

	const markingCanvas = new OffscreenCanvas(
		canvasElement.width,
		canvasElement.height
	);
	const markingContext = markingCanvas.getContext('2d')!;
	if (markingContext == null) {
		throw new Error('Failed to get context');
	}

	const markerZoom = computed(() => Math.max(1, options.zoom.value));

	watch(
		() => options.width.value / markerZoom.value,
		(newWidth) => {
			markingCanvas.width = newWidth;
		},
		{ immediate: true, flush: 'sync' }
	);
	watch(
		() => options.height.value / markerZoom.value,
		(newHeight) => {
			markingCanvas.height = newHeight;
		},
		{ immediate: true, flush: 'sync' }
	);

	const activeMarker = shallowRef<{
		type: MarkerType;
		color: string;
		size: number;
		viewportPosition: Vector;
		viewportZoom: number;
		position?: Vector;
		minX: number;
		minY: number;
		maxX: number;
		maxY: number;
		noSave: boolean;
	} | null>(null);

	const getActiveMarkerBounds = () => {
		if (activeMarker.value == null) return null;

		const tempCanvasBounds = {
			x:
				-activeMarker.value.viewportPosition.x /
					activeMarker.value.viewportZoom +
				options.maxWidth / 2 -
				options.width.value / activeMarker.value.viewportZoom / 2,
			y:
				-activeMarker.value.viewportPosition.y /
					activeMarker.value.viewportZoom +
				options.maxHeight / 2 -
				options.height.value / activeMarker.value.viewportZoom / 2,
			width: options.width.value / activeMarker.value.viewportZoom,
			height: options.height.value / activeMarker.value.viewportZoom,
		};

		return {
			x1:
				tempCanvasBounds.x +
				activeMarker.value.minX / activeMarker.value.viewportZoom -
				activeMarker.value.size / 2,
			y1:
				tempCanvasBounds.y +
				activeMarker.value.minY / activeMarker.value.viewportZoom -
				activeMarker.value.size / 2,
			x2:
				tempCanvasBounds.x +
				activeMarker.value.maxX / activeMarker.value.viewportZoom +
				activeMarker.value.size / 2,
			y2:
				tempCanvasBounds.y +
				activeMarker.value.maxY / activeMarker.value.viewportZoom +
				activeMarker.value.size / 2,
		};
	};

	const getActiveMarkerRegionCount = () => {
		const activeMarkerBounds = getActiveMarkerBounds();
		if (activeMarkerBounds == null) return 0;
		return canvasStorage.getRegionCount(
			activeMarkerBounds.x1,
			activeMarkerBounds.y1,
			activeMarkerBounds.x2,
			activeMarkerBounds.y2
		);
	};

	function dumpMarkerCanvas() {
		if (activeMarker.value == null) return;
		storageContext.globalCompositeOperation =
			activeMarker.value.type === MarkerType.Pen
				? 'source-over'
				: 'destination-out';
		storageContext.drawImage(
			markingCanvas,
			-activeMarker.value.viewportPosition.x / activeMarker.value.viewportZoom +
				options.maxWidth / 2 -
				options.width.value / activeMarker.value.viewportZoom / 2,
			-activeMarker.value.viewportPosition.y / activeMarker.value.viewportZoom +
				options.maxHeight / 2 -
				options.height.value / activeMarker.value.viewportZoom / 2,
			options.width.value / activeMarker.value.viewportZoom,
			options.height.value / activeMarker.value.viewportZoom
		);
	}

	function placeMarker(
		position: Vector,
		type: MarkerType = options.markerType.value,
		color: string = options.markerColor.value,
		size: number = options.markerSize.value,
		viewportPosition: Vector = options.position.value.clone(),
		viewportZoom: number = options.zoom.value,
		isLoading = false
	) {
		if (activeMarker.value != null) removeMarker();
		markingContext.clearRect(0, 0, markingCanvas.width, markingCanvas.height);
		markingContext.lineWidth = (size * options.zoom.value) / markerZoom.value;
		markingContext.strokeStyle = type === MarkerType.Erase ? 'white' : color;
		markingContext.lineCap = 'round';
		markingContext.lineJoin = 'round';
		markingContext.beginPath();
		markingContext.moveTo(position.x, position.y);
		activeMarker.value = {
			type,
			color,
			size,
			viewportPosition,
			viewportZoom,
			minX: position.x,
			minY: position.y,
			maxX: position.x,
			maxY: position.y,
			noSave: isLoading,
		};
	}
	function removeMarker() {
		if (activeMarker.value == null) return;

		dumpMarkerCanvas();
		markingContext.clearRect(0, 0, markingCanvas.width, markingCanvas.height);
		const activeMarkerBounds = getActiveMarkerBounds();
		if (activeMarkerBounds != null) {
			withHandlingAsync(() =>
				canvasStorage.saveArea(
					activeMarkerBounds.x1,
					activeMarkerBounds.y1,
					activeMarkerBounds.x2,
					activeMarkerBounds.y2
				)
			);
		}

		activeMarker.value = null;
	}
	function moveMarker(position: Vector) {
		if (
			activeMarker.value == null ||
			(activeMarker.value.position?.x === position.x &&
				activeMarker.value.position?.y === position.y)
		)
			return;
		markingContext.globalCompositeOperation = 'source-over';
		markingContext.lineTo(position.x, position.y);
		activeMarker.value.position = position;
		markingContext.stroke();

		markingContext.globalCompositeOperation = 'source-in';
		markingContext.fillStyle = markingContext.strokeStyle;
		markingContext.fillRect(0, 0, markingCanvas.width, markingCanvas.height);

		activeMarker.value.minX = Math.min(activeMarker.value.minX, position.x);
		activeMarker.value.minY = Math.min(activeMarker.value.minY, position.y);
		activeMarker.value.maxX = Math.max(activeMarker.value.maxX, position.x);
		activeMarker.value.maxY = Math.max(activeMarker.value.maxY, position.y);

		if (activeMarker.value.type === MarkerType.Erase) {
			dumpMarkerCanvas();
		}
	}

	const eventToVector = (event: PointerEvent) => {
		const bounds = options.eventElement.value!.getBoundingClientRect();
		if (bounds == null) return Vector.fromCartesianVector({ x: 0, y: 0 });

		return Vector.fromCartesianVector({
			x: (event.clientX * markingCanvas.width) / options.width.value,
			y: (event.clientY * markingCanvas.height) / options.height.value,
		});
	};

	function onPointerDown(event: PointerEvent) {
		if (options.markerDisabled?.value || event.button !== 0 || !ready.value)
			return;
		event.preventDefault();
		event.stopPropagation();

		options.eventElement.value!.focus();

		placeMarker(eventToVector(event));
		moveMarker(eventToVector(event));
		options.eventElement.value!.setPointerCapture(event.pointerId);
	}

	let lastPointerMoveEvent: PointerEvent | null = null;
	function onPointerMove(event: PointerEvent) {
		lastPointerMoveEvent = event;
		if (!activeMarker.value) return;

		moveMarker(eventToVector(event));
		if (getActiveMarkerRegionCount() > 500) {
			removeMarker();
			alert(
				'You are modifying too much of the map at once. Please split your modifications into smaller areas.'
			);
		}
	}

	function onPointerUp(event: PointerEvent) {
		options.eventElement.value!.releasePointerCapture(event.pointerId);
		if (!activeMarker.value) return;
		event.preventDefault();
		event.stopPropagation();

		moveMarker(eventToVector(event));
		removeMarker();
	}

	function onWheel(event: WheelEvent) {
		if (options.markerDisabled?.value || !event.ctrlKey) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		options.markerSize.value = Math.max(
			1,
			options.markerSize.value +
				(event.deltaY > 0 ? -1 : 1) * (event.shiftKey ? 1 : 5)
		);
	}

	useEventListener(options.eventElement, 'pointerdown', onPointerDown);
	useEventListener(options.eventElement, 'pointermove', onPointerMove);
	useEventListener('pointermove', onPointerMove);
	useEventListener(options.eventElement, 'pointerup', onPointerUp);
	useEventListener(options.eventElement, 'wheel', onWheel);
	useEventListener('wheel', onWheel);

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
			context.globalCompositeOperation = 'source-over';
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
			if (options.markerType.value !== MarkerType.Erase) {
				context.drawImage(
					markingCanvas,
					0,
					0,
					canvasElement.width,
					canvasElement.height
				);
			}

			if (
				lastPointerMoveEvent != null &&
				!options.markerDisabled?.value &&
				ready.value
			) {
				context.strokeStyle = 'white';
				context.lineWidth = Math.max(1, 1 * options.zoom.value);
				context.beginPath();
				context.arc(
					lastPointerMoveEvent.clientX,
					lastPointerMoveEvent.clientY,
					((options.markerSize.value + 1) * options.zoom.value) / 2,
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

	const canvasStorage = useCanvasStorage({
		intelInstance: options.intelInstance,
		canvas: storageCanvas,
		context: storageContext,
		regionWidth: ref(100),
		regionHeight: ref(100),
	});

	const ready = ref(false);
	const readyPromise = withHandlingAsync(() => canvasStorage.ready)
		.finally(() => {
			ready.value = true;
		})
		.catch(console.error);

	let isDisposed = false;
	onScopeDispose(() => {
		isDisposed = true;
		options.onDispose?.();
	});

	return {
		activeMarker,
		canvasElement,
		markingCanvas,
		storageCanvas,
		start,
		stop,
		ready,
		readyPromise,
	};
}
