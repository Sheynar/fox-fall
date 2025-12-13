<template>
	<div
		class="Viewport__container"
		:style="{
			'--viewport-x': artillery.viewport.value.position.x,
			'--viewport-y': artillery.viewport.value.position.y,

			'--viewport-deg': artillery.viewport.value.rotation,
			'--viewport-zoom': artillery.viewport.value.resolvedZoom,
		}"
	>
		<HexMap v-if="settings.backdropMode === BackdropMode.Map" />

		<RangeFinders />

		<Units />

		<FiringArcs />

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
	import FiringArcs from '@/components/Viewport/FiringArcs/FiringArcs.vue';
	import HexMap from '@/components/Viewport/HexMap/HexMap.vue';
	import RangeFinders from '@/components/Viewport/RangeFinders/RangeFinders.vue';
	import Units from '@/components/Viewport/Units/Units.vue';
	import { artillery } from '@/lib/globals';
	import { BackdropMode, settings } from '@/lib/settings';
</script>
