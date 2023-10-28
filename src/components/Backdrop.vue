<template>
	<div class="Backdrop__compass">
		<div>
			cursor: x{{ Math.round(resolvedCursor.x) }} y{{
				Math.round(resolvedCursor.y)
			}}
		</div>
		<div>
			position: x{{ Math.round(position.x) }} y{{
				Math.round(position.y)
			}}
		</div>
		<div>rotation: {{ viewport.rotation.toFixed(1) }}</div>
		<div>zoom: {{ Math.round(viewport.zoom * 100) }}%</div>
	</div>

	<div
		class="Backdrop__grid"
		:style="{
			'--background-x': backgroundOffset.x,
			'--background-y': backgroundOffset.y,
		}"
	/>

	<svg
		class="Backdrop__compass"
		xmlns="http://www.w3.org/2000/svg"
		preserve-aspect-ratio="none"
	></svg>
</template>

<style lang="scss">
	.Backdrop__grid {
		position: absolute;
		left: -150vmax;
		right: -150vmax;
		top: -150vmax;
		bottom: -150vmax;

		background: linear-gradient(
				180deg,
				rgba(0, 0, 0, 1) 0%,
				rgba(0, 0, 0, 0) 1px,
				rgba(0, 0, 0, 0) calc(100% - 1px),
				rgba(0, 0, 0, 1) 100%
			),
			linear-gradient(
				90deg,
				rgba(0, 0, 0, 1) 0%,
				rgba(0, 0, 0, 0) 1px,
				rgba(0, 0, 0, 0) calc(100% - 1px),
				rgba(0, 0, 0, 1) 100%
			);

		background-size: calc(100px * var(--viewport-zoom))
			calc(100px * var(--viewport-zoom));
		background-position: calc(var(--background-y) * 1px + 150vmax)
			calc(var(--background-x) * 1px + 150vmax);

		transform: rotate(calc(var(--viewport-deg) * 1deg));
		transform-origin: 150vmax 150vmax;
	}

	.Backdrop__compass {
		position: absolute;
		top: 1em;
		right: 1em;

		user-select: none;
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { injectCursor } from '@/contexts/cursor';
	import { injectViewport } from '@/contexts/viewport';
	import { toRadians } from '@/lib/angle';
	import { useWindowSize } from '@vueuse/core';
	import { Vector } from '@/lib/vector';

	const cursor = injectCursor();
	const viewport = injectViewport();
	const windowSize = useWindowSize();

	const resolvedCursor = computed(() => {
		return viewport.value.toViewportVector(cursor.value);
	});

	const position = computed(() =>
		viewport.value.toViewportVector(
			Vector.fromCartesianVector({
				x: windowSize.width.value / 2,
				y: windowSize.height.value / 2,
			})
		)
	);

	const backgroundOffset = computed(() => ({
		x:
			-viewport.value.position.x *
				Math.sin(toRadians(viewport.value.rotation)) +
			viewport.value.position.y * Math.cos(toRadians(viewport.value.rotation)),
		y:
			viewport.value.position.y * Math.sin(toRadians(viewport.value.rotation)) +
			viewport.value.position.x * Math.cos(toRadians(viewport.value.rotation)),
	}));
</script>
