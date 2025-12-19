<template>
	<div class="Marker__container">
		<canvas ref="canvasElement" :width="canvasWidth" :height="canvasHeight" />
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
	import { computed, onMounted, shallowRef } from "vue";
	import { useMarker } from ".";

	const canvasElement = shallowRef<HTMLCanvasElement | null>(null);

	const props = defineProps<{
		canvasWidth: number;
		canvasHeight: number;
		color?: string;
		size?: number;
		disabled?: boolean;
	}>();

	const { context } = useMarker({
		canvasElement,
		color: computed(() => props.color),
		size: computed(() => props.size),
		disabled: computed(() => props.disabled),
	});

	onMounted(() => {
		if (context.value != null) {
			context.value.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
		}
	})
</script>
