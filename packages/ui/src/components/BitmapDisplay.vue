<template>
	<canvas
		ref="screenCanvas"
		class="BitmapDisplay__canvas"
		:class="
			props.image
				? 'BitmapDisplay__canvas-visible'
				: 'BitmapDisplay__canvas-hidden'
		"
	/>
</template>

<style lang="scss">
	.BitmapDisplay__canvas {
		pointer-events: none;
	}

	.BitmapDisplay__canvas-hidden {
		visibility: hidden;
	}
</style>

<script setup lang="ts">
	import { shallowRef, watch } from 'vue';

	const props = defineProps<{
		image: ImageBitmap | null;
	}>();

	const screenCanvas = shallowRef<HTMLCanvasElement | null>(null);

	watch(
		() => props.image,
		(imageBitmap) => {
			if (!imageBitmap) return;
			const canvas = screenCanvas.value;
			if (!canvas) return;
			canvas.width = imageBitmap.width;
			canvas.height = imageBitmap.height;

			const context = canvas.getContext('2d');
			if (!context) return;
			context.drawImage(imageBitmap, 0, 0);
		}
	);
</script>
