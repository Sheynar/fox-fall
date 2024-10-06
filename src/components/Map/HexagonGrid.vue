<template>
	<div
		class="HexagonGrid__container"
		:style="{
			'stroke-width': 1 / 50 / viewport.zoom,
		}"
	>
		<template v-for="y in 7" :key="y">
			<Hex
				class="HexagonGrid__hex"
				v-for="x in 5"
				:key="x"
				v-show="hexNames[x - 1]?.[y - 1] != null"
				:style="{ gridColumnStart: (x - 1) * 6 + 1, gridRowStart: (y - 1) * 4 + 1 }"
			>
				{{ showHexNames ? hexNames[x - 1]?.[y - 1] : '' }}
			</Hex>
		</template>
		<template v-for="y in 6" :key="y">
			<Hex
				class="HexagonGrid__hex"
				v-for="x in 4"
				:key="x"
				v-show="hexNames[x - 0.5]?.[y - 0.5] != null"
				:style="{ gridColumnStart: (x - 1) * 6 + 4, gridRowStart: (y - 1) * 4 + 3 }"
			>
				{{ showHexNames ? hexNames[x - 0.5]?.[y - 0.5] : '' }}
			</Hex>
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
		grid-template-columns: repeat(28, minmax(0, 1fr));
		grid-template-rows: repeat(28, minmax(0, 1fr));
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

	.HexagonGrid__hex {
		grid-column: 1 / span 4;
		grid-row: 1 / span 4;
		width: 100%;
		height: 100%;

		transform-origin: 50% 50%;
	}
</style>

<script setup lang="ts">
	import { useWindowSize } from '@vueuse/core';
	import { computed } from 'vue';
	import { injectViewport } from '@/contexts/viewport';
	import Hex from './Hex.vue';

	const viewport = injectViewport();
	const windowSize = useWindowSize();
	const windowMin = computed(() => {
		return Math.min(windowSize.width.value, windowSize.height.value);
	});

	const showHexNames = computed(() => viewport.value.resolvedZoom * 1092 < windowMin.value / 2);

	const hexNames: Record<number, Record<number, string>> = {
		0: {
			2: 'The Oarbreaker Isles',
			3: `Fisherman's Row`,
			4: 'Stema Landing',
		},
		0.5: {
			1.5: 'Nevish Line',
			2.5: 'Farranac Coast',
			3.5: 'Westgate',
			4.5: 'Origin',
		},
		1: {
			1: `Callum's Cape`,
			2: 'Stonecradle',
			3: `King's Cage`,
			4: 'Sableport',
			5: 'Ash Fields',
		},
		1.5: {
			0.5: 'Speaking Woods',
			1.5: 'The Moors',
			2.5: 'The Linn of Mercy',
			3.5: 'Loch Mór',
			4.5: 'The Heartlands',
			5.5: 'Red River',
		},
		2: {
			0: 'Basin Sionnach',
			1: 'Reaching Trail',
			2: `Callahan's Passage`,
			3: 'Deadlands',
			4: 'Umbral Wildwood',
			5: 'Great March',
			6: 'Kalokai',
		},
		2.5: {
			0.5: 'Howl County',
			1.5: 'Viper Pit',
			2.5: 'Marban Hollow',
			3.5: 'The Drowned Vale',
			4.5: 'Shackled Chasm',
			5.5: 'Acrithia',
		},
		3: {
			1: 'Clanshead Valley',
			2: 'Weathered Expanse',
			3: 'The Clahstra',
			4: `Allod's Bight`,
			5: 'Terminus',
		},
		3.5: {
			1.5: `Morgen's Crossing`,
			2.5: 'Stlican Shelf',
			3.5: 'Endless Shore',
			4.5: `Reaver's Pass`,
		},
		4: {
			2: 'Godcrofts',
			3: 'Tempest Island',
			4: 'The Fingers',
		},
	};

</script>
