<template>
	<div ref="containerElement" class="Marker__container">
		<canvas
			ref="canvasElement"
			class="Marker__canvas"
			:width="canvasWidth"
			:height="canvasHeight"
		/>
	</div>
</template>

<style lang="scss">
	.Marker__container {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: auto;
		grid-template-areas: "canvas";

		> * {
			grid-area: canvas;
		}
	}
</style>

<script setup lang="ts">
	import { computed, shallowRef, watch } from "vue";
	import { MarkerType, useMarker } from ".";

	const containerElement = shallowRef<HTMLDivElement | null>(null);
	const canvasElement = shallowRef<HTMLCanvasElement | null>(null);

	const props = defineProps<{
		canvasWidth: number;
		canvasHeight: number;
		type?: MarkerType;
		color?: string;
		size?: number;
		disabled?: boolean;
	}>();

	const { context, activeMarker } = useMarker({
		canvasElement,
		color: computed(() => props.color),
		size: computed(() => props.size),
		disabled: computed(() => props.disabled),
		markerType: computed(() => props.type),
	});

	watch(
		() => activeMarker.value?.tempCanvas,
		(newCanvas, prevCanvas) => {
			if (prevCanvas != null) {
				prevCanvas.remove();
			}
			if (newCanvas != null && props.type === MarkerType.Pen) {
				containerElement.value?.appendChild(newCanvas);
			}
		},
		{ immediate: true }
	);

	watch(context, (newContext) => {
		if (newContext == null) return;
		newContext.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
	});
</script>
