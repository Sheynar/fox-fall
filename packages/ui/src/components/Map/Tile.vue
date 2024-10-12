<template>
	<div class="Tile__container">
		<img
			ref="imageElement"
			class="Tile__img"
			:width="tileSize"
			:height="tileSize"
			:src="tileUrl"
			:style="{
				width: tileSize + 'px',
				height: tileSize + 'px',
				zIndex: props.lod,
			}"
		/>
		<TileSet
			v-if="showChildren"
			class="Tile__children"
			:x="props.x * 2"
			:y="props.y * 2"
			:lod="props.lod + 1"
			:size="2"
		/>
	</div>
</template>

<style lang="scss">
	.Tile__container {
		display: grid;
		grid-template-columns: max-content;
		grid-template-rows: max-content;
	}

	.Tile__img {
		object-fit: contain;
	}

	.Tile__img,
	.Tile__children {
		grid-column: 1 / 2;
		grid-row: 1 / 2;
	}
</style>

<script setup lang="ts">
	import { useElementBounding, useWindowSize } from '@vueuse/core';
	import { computed, ref, watch } from 'vue';
	import { injectViewport } from '@/contexts/viewport';
	import { MAP_SIZE, MAX_LOD } from './constants';
	import TileSet from './TileSet.vue';

	const props = defineProps<{
		x: number;
		y: number;
		lod: number;
	}>();

	const viewport = injectViewport();
	const windowSize = useWindowSize();
	const windowMax = computed(() => {
		return Math.max(windowSize.width.value, windowSize.height.value);
	});

	const imageElement = ref<HTMLImageElement | null>(null);
	const imageBounding = useElementBounding(imageElement);
	const imageVisible = computed(() => {
		if (imageBounding.top.value + imageBounding.height.value < 0) return false;
		if (imageBounding.left.value + imageBounding.width.value < 0) return false;
		if (imageBounding.top.value > windowMax.value) return false;
		if (imageBounding.left.value > windowMax.value) return false;
		return true;
	});

	watch(
		() => [
			viewport.value.position.x,
			viewport.value.position.y,
			viewport.value.zoom,
			viewport.value.rotation,
		],
		() => {
			imageBounding.update();
		}
	);

	const tileUrl = computed(() => {
		return `/tiles/${props.lod}_${props.x}_${props.y}.webp`;
	});

	const tileSize = computed(() => {
		return MAP_SIZE / Math.pow(2, props.lod);
	});

	const showChildren = ref(false);

	const lodOffset = computed(() => {
		if (props.lod >= MAX_LOD) return 0;
		if (!imageVisible.value) return 0;
		if (viewport.value.resolvedZoom * tileSize.value < windowMax.value / 4)
			return -1;
		return 1;
	});

	let idleCallbackId: ReturnType<typeof requestIdleCallback> | null = null;

	watch(
		lodOffset,
		() => {
			if (idleCallbackId != null) return;
			if (lodOffset.value === 0) return;

			idleCallbackId = requestIdleCallback(() => {
				showChildren.value = lodOffset.value > 0;
				idleCallbackId = null;
			});
		},
		{ immediate: true, flush: 'sync' }
	);
</script>
