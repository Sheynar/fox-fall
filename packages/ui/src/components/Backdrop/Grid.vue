<template>
	<svg
		class="Grid__container"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:viewBox="`0 0 ${gridSize} ${gridSize}`"
		xml:space="preserve"
		:style="{
			'--viewport-x': screenPosition.x,
			'--viewport-y': screenPosition.y,
			'--offset-x': screenOffset.x,
			'--offset-y': screenOffset.y,
			'--viewport-deg': viewport.rotation,
			'--viewport-zoom': viewport.resolvedZoom,
			'--grid-size': gridSize,
		}"
		:stroke-width="settings.gridLineWidth / viewport.resolvedZoom"
		:stroke-dasharray="`${settings.gridDashLength / viewport.resolvedZoom} ${settings.gridDashGap / viewport.resolvedZoom}`"
	>
		<g class="Grid__vertical__container">
			<line
				v-for="x in cellCount * 3 + 1"
				:key="x"
				:x1="(x - 1) * SUBCELL_SIZE"
				:x2="(x - 1) * SUBCELL_SIZE"
				y1="0"
				:y2="gridSize"
				:stroke="(x - 1) % 3 === 0 ? '#000000' : '#333333'"
			/>
		</g>
		<g class="Grid__horizontal__container">
			<line
				v-for="y in cellCount * 3 + 1"
				:key="y"
				x1="0"
				:x2="gridSize"
				:y1="(y - 1) * SUBCELL_SIZE"
				:y2="(y - 1) * SUBCELL_SIZE"
				:stroke="(y - 1) % 3 === 0 ? '#000000' : '#333333'"
			/>
		</g>
	</svg>
</template>

<style lang="scss">
	.Grid__container {
		position: absolute;
		left: 0;
		top: 0;
		width: calc(var(--grid-size) * 1px);
		height: calc(var(--grid-size) * 1px);

		transform-origin: 0 0;
		transform: translate(
				calc(1px * (var(--viewport-x) + var(--offset-x))),
				calc(1px * (var(--viewport-y) + var(--offset-y)))
			)
			rotate(calc(var(--viewport-deg) * 1deg - 90deg))
			scale(var(--viewport-zoom));
		overflow: visible;
	}
</style>

<script lang="ts">
	const CELL_SIZE = 125;
	const SUBCELL_SIZE = CELL_SIZE / 3;
</script>

<script setup lang="ts">
	import { useWindowSize } from '@vueuse/core';
	import { computed } from 'vue';
	import { injectViewport } from '@/contexts/viewport';
	import { settings } from '@/lib/settings';
	import { Vector } from '@/lib/vector';

	const viewport = injectViewport();
	const windowSize = useWindowSize();

	const cellCount = computed(() => {
		const hypot = Math.sqrt(windowSize.width.value ** 2 + windowSize.height.value ** 2);
		let minCells = Math.ceil(
			hypot / (viewport.value.resolvedZoom * CELL_SIZE)
		) + 2;
		if (minCells % 2 === 0) minCells += 1;
		return minCells;
	});

	const gridSize = computed(() => cellCount.value * CELL_SIZE);

	const screenPosition = computed(() => {
		return viewport.value.fromViewportVector(
			Vector.fromCartesianVector({
				x: -gridSize.value / 2,
				y: gridSize.value / 2,
			})
		);
	});

	const screenOffset = computed(() => {
		const CELL_VIEWPORT_SIZE = CELL_SIZE;
		const position = viewport.value.getFocusedPosition();

		return viewport.value.fromViewportOffset(
			Vector.fromCartesianVector({
				x: Math.floor(position.x / CELL_VIEWPORT_SIZE) * CELL_VIEWPORT_SIZE,
				y: Math.floor(position.y / CELL_VIEWPORT_SIZE) * CELL_VIEWPORT_SIZE,
			})
		);
	});
</script>
