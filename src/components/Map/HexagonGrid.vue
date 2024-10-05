<template>
	<div
		class="HexagonGrid__container"
		:style="{
			'stroke-width': 1 / 50 / viewport.zoom,
		}"
	>
		<template v-for="y in 7" :key="y">
			<Hexagon
				class="HexagonGrid__hexagon"
				v-for="x in 5"
				:key="x"
				v-show="hexShouldShow(x - 1, y - 1)"
				:style="{ gridColumnStart: (x - 1) * 6 + 1, gridRowStart: (y - 1) * 4 + 1 }"
			/>
		</template>
		<template v-for="y in 6" :key="y">
			<Hexagon
				class="HexagonGrid__hexagon"
				v-for="x in 4"
				:key="x"
				v-show="hexShouldShow(x - 0.5, y - 0.5)"
				:style="{ gridColumnStart: (x - 1) * 6 + 4, gridRowStart: (y - 1) * 4 + 3 }"
			/>
		</template>
	</div>
</template>

<style lang="scss">
	.HexagonGrid__container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;

		display: grid;
		grid-template-columns: repeat(28, 1fr);
		grid-template-rows: repeat(28, 1fr);
		padding: 6.65% 0;

		color: black;
	}

	.HexagonGrid__hexagon {
		grid-column: 1 / span 4;
		grid-row: 1 / span 4;
		width: 100%;
		height: 100%;

		transform-origin: 50% 50%;
		transform: scale(1.1778, 1.1135169);
	}
</style>

<script setup lang="ts">
	import { injectViewport } from '@/contexts/viewport';
	import Hexagon from './Hexagon.vue';

	const viewport = injectViewport();

	const hexShouldShow = (x: number, y: number): boolean => {
		if ((y === 0 || y === 6) && x !== 2) return false;
		if ((y === 1 || y === 5) && (x < 1 || x > 3)) return false;
		// if (y % 1 === 0) return false;
		if ((y === 0.5 || y === 5.5) && (x < 1.5 || x > 2.5)) return false;
		return true;
	};
</script>
