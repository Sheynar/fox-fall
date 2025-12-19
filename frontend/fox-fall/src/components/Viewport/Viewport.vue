<template>
	<Viewport>
		<PositionedElement v-if="settings.backdropMode === BackdropMode.Map" :layer="LAYER.BACKDROP" :x="0" :y="0">
			<HexMap :mapSource="settings.mapSource" />
		</PositionedElement>

		<RangeFinders />

		<Units />

		<FiringArcs />

		<slot />
	</Viewport>
</template>

<script setup lang="ts">
	import Viewport from '@packages/frontend-libs/dist/viewport/Viewport.vue';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import HexMap from '@packages/frontend-libs/dist/HexMap/HexMap.vue';
	import { provideViewport } from '@packages/frontend-libs/dist/viewport/viewport';
	import RangeFinders from '@/components/Viewport/RangeFinders/RangeFinders.vue';
	import Units from '@/components/Viewport/Units/Units.vue';
	import FiringArcs from '@/components/Viewport/FiringArcs/FiringArcs.vue';
	import { LAYER } from '@/lib/constants/ui';
	import { artillery } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import { BackdropMode } from '@/lib/settings';

	provideViewport(artillery.viewport);
</script>