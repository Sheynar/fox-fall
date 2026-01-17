<template>
	<div class="RenderFilters__container">
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="elementFilters.map.value" />
			Map
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="elementFilters.mapZone.value" />
			Map Zones
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="elementFilters.mapIcon.value" />
			Map Icons
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="elementFilters.hexLabel.value" />
			Hex Labels
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="elementFilters.regionLabel.value" />
			Region Labels
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="elementFilters.minorLabel.value" />
			Minor Labels
		</label>
	</div>
</template>

<style lang="scss">
	.RenderFilters__container {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		user-select: none;
	}

	.RenderFilters__entry {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
		cursor: pointer;
	}
</style>

<script setup lang="ts">
import { elementFilters } from '@/lib/globals';
</script>