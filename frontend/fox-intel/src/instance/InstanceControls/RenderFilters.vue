<template>
	<div class="RenderFilters__container">
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.documents.value" />
			Documents
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.markerLayer.value" />
			Marker Layer
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.map.value" />
			Map
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.mapZone.value" />
			Map Zones
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.mapIcon.value" />
			Map Icons
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.hexLabel.value" />
			Hex Labels
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.regionLabel.value" />
			Region Labels
		</label>
		<label class="RenderFilters__entry">
			<input type="checkbox" v-model="renderFilters.minorLabel.value" />
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
import { renderFilters } from '@/lib/globals';
</script>