<template>
	<div class="TileSet__container" :style="{ '--grid-size': props.size }">
		<template v-for="y in props.size" :key="y">
			<template v-for="x in props.size" :key="x">
				<Tile :x="props.x + x - 1" :y="props.y + y - 1" :lod="props.lod" />
			</template>
		</template>
	</div>
</template>

<style lang="scss">
	.TileSet__container {
		display: grid;
		grid-template-columns: repeat(var(--grid-size), max-content);
		grid-template-rows: repeat(var(--grid-size), max-content);
	}
</style>

<script setup lang="ts">
	import Tile from './Tile.vue';

	const props = defineProps<{
		lod: number;
		x: number;
		y: number;
		size: number;
	}>();
</script>