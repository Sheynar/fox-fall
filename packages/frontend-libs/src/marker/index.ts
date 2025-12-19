import { Vector } from "@packages/data/dist/artillery/vector";
import { useEventListener } from "@vueuse/core";
import { computed, type Ref, type ShallowRef, shallowRef, watch } from "vue";

export enum MarkerType {
	Pen = "pen",
	Erase = "erase",
}

export type UseMarkerOptions = {
	canvasElement: ShallowRef<HTMLCanvasElement | null>;
	markerType?: MarkerType;
	color?: Ref<string | undefined>;
	size?: Ref<number | undefined>;
	disabled?: Ref<boolean | undefined>;
};
export function useMarker(options: UseMarkerOptions) {
	const context = shallowRef<CanvasRenderingContext2D | null>(null);
	const markerType = computed(() => options.markerType ?? MarkerType.Pen);
	const color = computed(() => options.color?.value ?? "rgb(0, 0, 255)");
	const size = computed(() => options.size?.value ?? 1);
	const disabled = computed(() => options.disabled?.value ?? false);

	watch(
		options.canvasElement,
		(canvas) => {
			if (canvas == null) return;
			const newContext = canvas.getContext("2d");
			if (newContext == null) {
				throw new Error("Failed to get context");
			}
			newContext.fillStyle = "red";
			newContext.fillRect(0, 0, canvas.width, canvas.height);
			context.value = newContext;
		},
		{ immediate: true, flush: "sync" }
	);

	const activeMarker = shallowRef<{
		position: Vector;
		tempCanvas: HTMLCanvasElement;
		tempContext: CanvasRenderingContext2D;
	} | null>(null);
	function placeMarker(position: Vector) {
		if (options.canvasElement.value == null) return;
		if (activeMarker.value != null) removeMarker();
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = options.canvasElement.value.width;
		tempCanvas.height = options.canvasElement.value.height;
		const tempContext = tempCanvas.getContext("2d", {
			premultipliedAlpha: false,
		}) as CanvasRenderingContext2D;
		if (tempContext == null) {
			throw new Error("Failed to get context");
		}
		tempContext.lineWidth = size.value;
		tempContext.strokeStyle = color.value;
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
		activeMarker.value = null;
	}
	function moveMarker(position: Vector) {
		if (activeMarker.value == null) return;
		activeMarker.value.tempContext.globalCompositeOperation = "source-over";
		activeMarker.value.tempContext.lineTo(position.x, position.y);
		activeMarker.value.position = position;
		activeMarker.value.tempContext.stroke();

		context.value!.globalCompositeOperation =
			markerType.value === MarkerType.Pen ? "source-over" : "destination-out";
		context.value!.drawImage(activeMarker.value.tempCanvas, 0, 0);
	}

	watch(
		() => disabled.value && activeMarker.value != null,
		(disabled) => {
			if (disabled) removeMarker();
		},
		{ immediate: true, flush: "sync" }
	);

	function onPointerDown(event: PointerEvent) {
		if (disabled.value || event.button !== 0) return;
		event.preventDefault();
		event.stopPropagation();

		placeMarker(
			Vector.fromCartesianVector({ x: event.clientX, y: event.clientY })
		);
		options.canvasElement.value!.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (disabled.value || !activeMarker.value) return;

		moveMarker(
			Vector.fromCartesianVector({ x: event.clientX, y: event.clientY })
		);
	}

	function onPointerUp(event: PointerEvent) {
		if (disabled.value || !activeMarker.value) return;
		event.preventDefault();
		event.stopPropagation();

		moveMarker(
			Vector.fromCartesianVector({ x: event.clientX, y: event.clientY })
		);
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
