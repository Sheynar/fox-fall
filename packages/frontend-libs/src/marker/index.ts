import { Vector } from "@packages/data/dist/artillery/vector";
import { useEventListener } from "@vueuse/core";
import { computed, type Ref, type ShallowRef, shallowRef, watch } from "vue";

export enum MarkerType {
	Pen = "pen",
	Erase = "erase",
}

export type UseMarkerOptions = {
	canvasElement: ShallowRef<HTMLCanvasElement | null>;
	markerType?: Ref<MarkerType | undefined>;
	color?: Ref<string | undefined>;
	size?: Ref<number | undefined>;
	disabled?: Ref<boolean | undefined>;
};
export function useMarker(options: UseMarkerOptions) {
	const context = shallowRef<CanvasRenderingContext2D | null>(null);
	const markerType = computed(() => options.markerType?.value ?? MarkerType.Pen);
	const color = computed(() => options.color?.value ?? "rgb(0, 0, 255)");
	const size = computed(() => options.size?.value ?? 5);
	const disabled = computed(() => options.disabled?.value ?? false);

	watch(
		options.canvasElement,
		(canvas) => {
			if (canvas == null) return;
			const newContext = canvas.getContext("2d");
			if (newContext == null) {
				throw new Error("Failed to get context");
			}
			context.value = newContext;
		},
		{ immediate: true, flush: "sync" }
	);

	const activeMarker = shallowRef<{
		position: Vector;
		tempCanvas: HTMLCanvasElement;
		tempContext: CanvasRenderingContext2D;
	} | null>(null);
	function renderMarkerCanvas() {
		if (activeMarker.value == null) return;
		context.value!.globalCompositeOperation =
			markerType.value === MarkerType.Pen ? "source-over" : "destination-out";
		context.value!.drawImage(activeMarker.value.tempCanvas, 0, 0);
	}


	function placeMarker(position: Vector) {
		if (options.canvasElement.value == null) return;
		if (activeMarker.value != null) removeMarker();
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = options.canvasElement.value.width;
		tempCanvas.height = options.canvasElement.value.height;
		const tempContext = tempCanvas.getContext("2d");
		if (tempContext == null) {
			throw new Error("Failed to get context");
		}
		tempContext.lineWidth = size.value;
		tempContext.strokeStyle = markerType.value === MarkerType.Erase ? "white" : color.value;
		tempContext.lineCap = "round";
		tempContext.lineJoin = "round";
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

		renderMarkerCanvas();

		activeMarker.value = null;
	}
	function moveMarker(position: Vector) {
		if (activeMarker.value == null) return;
		activeMarker.value.tempContext.globalCompositeOperation = "source-over";
		activeMarker.value.tempContext.lineTo(position.x, position.y);
		activeMarker.value.position = position;
		activeMarker.value.tempContext.stroke();

		activeMarker.value.tempContext.globalCompositeOperation = "source-in";
		activeMarker.value.tempContext.fillStyle = activeMarker.value.tempContext.strokeStyle;
		activeMarker.value.tempContext.fillRect(0, 0, activeMarker.value.tempCanvas.width, activeMarker.value.tempCanvas.height);

		if (markerType.value === MarkerType.Erase) {
			renderMarkerCanvas();
		}
	}

	watch(
		() => disabled.value && activeMarker.value != null,
		(disabled) => {
			if (disabled) removeMarker();
		},
		{ immediate: true, flush: "sync" }
	);

	const eventToVector = (event: PointerEvent) => {
		const bounds = options.canvasElement.value?.getBoundingClientRect();
		if (bounds == null) return Vector.fromCartesianVector({ x: 0, y: 0 });

		return Vector.fromCartesianVector({
			x: (event.clientX - bounds.left) * options.canvasElement.value!.width / bounds.width,
			y: (event.clientY - bounds.top) * options.canvasElement.value!.height / bounds.height,
		});
	};

	function onPointerDown(event: PointerEvent) {
		if (disabled.value || event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();

		placeMarker(eventToVector(event));
		options.canvasElement.value!.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (disabled.value || !activeMarker.value) return;

		moveMarker(eventToVector(event));
	}

	function onPointerUp(event: PointerEvent) {
		if (disabled.value || !activeMarker.value) return;
		event.preventDefault();
		event.stopPropagation();

		moveMarker(eventToVector(event));
		options.canvasElement.value!.releasePointerCapture(event.pointerId);
		removeMarker();
	}

	useEventListener(options.canvasElement, "pointerdown", onPointerDown);
	useEventListener(options.canvasElement, "pointermove", onPointerMove);
	useEventListener(options.canvasElement, "pointerup", onPointerUp);

	return {
		context,
		activeMarker,
		placeMarker,
		removeMarker,
		moveMarker,
	};
}
