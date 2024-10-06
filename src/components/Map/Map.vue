<template>
	<div
		class="Map__container"
		:style="{
			'--map-x': screenPosition.x,
			'--map-y': screenPosition.y,
			'--viewport-deg': viewport.rotation,
			'--viewport-zoom': viewport.resolvedZoom,
		}"
	>
		<HexagonGrid class="Map__hexagons" />
		<TileSet class="Map__tileset" :lod="0" :x="0" :y="0" :size="1" />
	</div>
</template>

<style lang="scss">
	.Map__container {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;

		transform-origin: 0 0;
		transform: translate(
				calc(1px * var(--map-x)),
				calc(1px * var(--map-y))
			)
			rotate(calc(var(--viewport-deg) * 1deg - 90deg))
			scale(var(--viewport-zoom));

		pointer-events: none;

		display: grid;
		grid-template-columns: max-content;
		grid-template-rows: max-content;
	}

	.Map__tileset,
	.Map__hexagons {
		grid-column: 1 / span 1;
		grid-row: 1 / span 1;
	}

	.Map__hexagons {
		z-index: 1000;
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { injectViewport } from '@/contexts/viewport';
	import { Vector } from '@/lib/vector';
	import { MAP_SIZE } from './constants';
	import HexagonGrid from './HexagonGrid.vue';
	import TileSet from './TileSet.vue';

	const viewport = injectViewport();

	const screenPosition = computed(() => {
		return viewport.value.fromViewportVector(
			Vector.fromCartesianVector({ x: -MAP_SIZE / 2, y: MAP_SIZE / 2 })
		);
	});
</script>
