import { Vector } from '@packages/data/dist/artillery/vector';
import { useEventListener } from '@vueuse/core';
import { computed, onScopeDispose, ref, Ref, shallowRef, watch } from 'vue';
import { useCanvasStorage } from './canvas-storage';

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

	markerId: string;

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

	const activeMarker = shallowRef<{
		type: MarkerType;
		color: string;
		size: number;
		viewportPosition: Vector;
		viewportZoom: number;
		position?: Vector;
		tempCanvas: OffscreenCanvas;
		tempContext: OffscreenCanvasRenderingContext2D;
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
			activeMarker.value.tempCanvas,
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
		const tempCanvas = new OffscreenCanvas(
			canvasElement.width,
			canvasElement.height
		);
		const tempContext = tempCanvas.getContext('2d');
		if (tempContext == null) {
			throw new Error('Failed to get context');
		}
		tempContext.lineWidth = size * viewportZoom;
		tempContext.strokeStyle = type === MarkerType.Erase ? 'white' : color;
		tempContext.lineCap = 'round';
		tempContext.lineJoin = 'round';
		tempContext.beginPath();
		tempContext.moveTo(position.x, position.y);
		activeMarker.value = {
			type,
			color,
			size,
			tempCanvas,
			tempContext,
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
		const activeMarkerBounds = getActiveMarkerBounds();
		if (activeMarkerBounds != null) {
			canvasStorage
				.saveArea(
					activeMarkerBounds.x1,
					activeMarkerBounds.y1,
					activeMarkerBounds.x2,
					activeMarkerBounds.y2
				)
				.catch(console.error);
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
			x: ((event.clientX - bounds.left) * bounds.width) / bounds.width,
			y: ((event.clientY - bounds.top) * bounds.height) / bounds.height,
		});
	};

	function onPointerDown(event: PointerEvent) {
		if (options.markerDisabled?.value || event.button !== 0) return;
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
		if (options.markerDisabled?.value || !activeMarker.value) return;

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
		if (options.markerDisabled?.value || !activeMarker.value) return;
		event.preventDefault();
		event.stopPropagation();

		moveMarker(eventToVector(event));
		removeMarker();
	}

	useEventListener(options.eventElement, 'pointerdown', onPointerDown);
	useEventListener(options.eventElement, 'pointermove', onPointerMove);
	useEventListener(options.eventElement, 'pointerup', onPointerUp);

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
			if (
				activeMarker.value != null &&
				options.markerType.value === MarkerType.Pen
			) {
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

	const canvasStorage = useCanvasStorage({
		canvas: storageCanvas,
		context: storageContext,
		regionWidth: ref(100),
		regionHeight: ref(100),
		intelInstance: computed(() => ({
			id: options.markerId,
			password: options.markerId,
		})),
	});
	console.log('Loading canvas storage');
	canvasStorage
		.loadAll()
		.then(() => {
			console.log('Loaded canvas storage');
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
		start,
		stop,
	};
}
