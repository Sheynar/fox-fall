<template>
	<svg
		class="Grid__container"
		:style="{
			'--viewport-x': screenPosition.x,
			'--viewport-y': screenPosition.y,
			'--offset-x': screenOffset.x,
			'--offset-y': screenOffset.y,
			'--viewport-deg': viewport.rotation,
			'--viewport-zoom': viewport.resolvedZoom,
			'--grid-size': gridSize * viewport.resolvedZoom,
			'z-index': props.layer,
		}"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		:viewBox="`0 0 ${gridSize} ${gridSize}`"
		xml:space="preserve"
		:stroke-width="
			props.gridLineWidth / viewport.resolvedZoom
		"
		:stroke-dasharray="`${props.gridDashLength / viewport.resolvedZoom} ${props.gridDashGap / viewport.resolvedZoom}`"
	>
		<g class="Grid__vertical__container">
			<line
				v-for="x in cellCount * 3 + 1"
				:key="x"
				:x1="(x - 1) * SUBCELL_SIZE"
				:x2="(x - 1) * SUBCELL_SIZE"
				y1="0"
				:y2="gridSize"
				:stroke="(x - 1) % 3 === 0 ? '#000000' : 'hsla(0deg, 0%, 50%, 80%)'"
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
				:stroke="(y - 1) % 3 === 0 ? '#000000' : 'hsla(0deg, 0%, 50%, 80%)'"
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

		overflow: visible;
		pointer-events: none;

		transform-origin: 0 0;
		transform: translate(
				calc(1px * (var(--viewport-x) + var(--offset-x)) + 50vw),
				calc(1px * (var(--viewport-y) + var(--offset-y)) + 50vh)
			)
			rotate(calc(var(--viewport-deg) * 1deg));
	}
</style>

<script lang="ts">
	const CELL_SIZE = 125;
	const SUBCELL_SIZE = CELL_SIZE / 3;
</script>

<script setup lang="ts">
	import { computed } from 'vue';
	import { Vector } from '@packages/data/dist/artillery/vector';
	import { injectViewport } from './viewport/viewport';

	const props = withDefaults(defineProps<{
		layer: number;
		gridLineWidth: number;
		gridDashLength: number;
		gridDashGap: number;
	}>(), {
		layer: 0,
		gridLineWidth: 1,
		gridDashLength: 10,
		gridDashGap: 0,
	});

	const viewport = injectViewport();

	const cellCount = computed(() => {
		const hypot = Math.sqrt(
			viewport.value.viewportSize.x ** 2 +
				viewport.value.viewportSize.y ** 2
		);
		let minCells =
			Math.ceil(hypot / (viewport.value.resolvedZoom * CELL_SIZE)) +
			2;
		if (minCells % 2 === 0) minCells += 1;
		return minCells;
	});

	const gridSize = computed(() => cellCount.value * CELL_SIZE);

	const screenPosition = computed(() => {
		return viewport.value.toScreenPosition(
			Vector.fromCartesianVector({
				x: -gridSize.value / 2,
				y: -gridSize.value / 2,
			})
		);
	});

	const screenOffset = computed(() => {
		const position = computed(() =>
			viewport.value
				.toWorldOffset(viewport.value.position)
				.scale(-1)
		);
		const CELL_VIEWPORT_SIZE = CELL_SIZE;

		return viewport.value.toScreenOffset(
			Vector.fromCartesianVector({
				x:
					Math.floor(position.value.x / CELL_VIEWPORT_SIZE) *
					CELL_VIEWPORT_SIZE,
				y:
					Math.floor(position.value.y / CELL_VIEWPORT_SIZE) *
					CELL_VIEWPORT_SIZE,
			})
		);
	});
</script>
