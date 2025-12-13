<template>
	<div
		class="Viewport__container"
		:style="{
			'--viewport-x': viewport.position.x,
			'--viewport-y': viewport.position.y,

			'--viewport-deg': viewport.rotation,
			'--viewport-zoom': viewport.resolvedZoom,
		}"
	>
		<slot />
	</div>
</template>

<style lang="scss">
	.Viewport__container {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;

		transform-origin: 50% 50%;
		transform: translate(
				calc(var(--viewport-x) * 1px + 50vw),
				calc(var(--viewport-y) * 1px + 50vh)
			)
			rotate(calc(var(--viewport-deg) * 1deg)) scale(var(--viewport-zoom));
	}
</style>

<script setup lang="ts">
	import { injectViewport } from './viewport';

	const viewport = injectViewport();
</script>
