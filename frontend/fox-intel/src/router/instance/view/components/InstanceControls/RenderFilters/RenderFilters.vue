<template>
	<div class="RenderFilters__container">
		<RenderFilter description="Documents" v-model:filterState="renderFilters.documents.value" />
		<RenderFilter description="Marker layer" v-model:filterState="renderFilters.markerLayer.value" />
		<RenderFilter description="User icons" v-model:filterState="renderFilters.userIcons.value" />
		<FilterGroup v-model:state="gameMapGroupState">
			<template #title>FoxHole game map</template>
			<RenderFilter description="Map layer" v-model:filterState="renderFilters.map.value" />
			<RenderFilter description="Map zones" v-model:filterState="renderFilters.mapZone.value" />
			<RenderFilter description="Map icons" v-model:filterState="renderFilters.mapIcon.value" />

			<FilterGroup v-model:state="gameMapLabelsState">
				<template #title>Labels</template>
				<RenderFilter description="Hex labels" v-model:filterState="renderFilters.hexLabel.value" />
				<RenderFilter description="Region labels" v-model:filterState="renderFilters.regionLabel.value" />
				<RenderFilter description="Minor labels" v-model:filterState="renderFilters.minorLabel.value" />
			</FilterGroup>
		</FilterGroup>
	</div>
</template>

<style lang="scss">
.RenderFilters__container {
	display: flex;
	flex-direction: column;
	gap: 0.5em;
	user-select: none;
}
</style>

<script setup lang="ts">
import { renderFilters } from '@/lib/globals';
import RenderFilter from './RenderFilter.vue';
import FilterGroup from './FilterGroup.vue';
import { computed } from 'vue';
import { FilterGroupState } from './types';

const gameMapLabelsState = computed({
	get: () => {
		const values = [renderFilters.hexLabel.value, renderFilters.regionLabel.value, renderFilters.minorLabel.value];
		return values.every(value => value) ? FilterGroupState.AllEnabled : values.some(value => value) ? FilterGroupState.Mixed : FilterGroupState.AllDisabled;
	},
	set: (value) => {
		if (value === FilterGroupState.AllEnabled) {
			renderFilters.hexLabel.value = true;
			renderFilters.regionLabel.value = true;
			renderFilters.minorLabel.value = true;
		} else if (value === FilterGroupState.AllDisabled) {
			renderFilters.hexLabel.value = false;
			renderFilters.regionLabel.value = false;
			renderFilters.minorLabel.value = false;
		}
	}
});

const gameMapGroupState = computed({
	get: () => {
		if (gameMapLabelsState.value === FilterGroupState.Mixed) {
			return FilterGroupState.Mixed;
		}
		const values = [renderFilters.map.value, renderFilters.mapZone.value, renderFilters.mapIcon.value, gameMapLabelsState.value === FilterGroupState.AllEnabled];
		return values.every(value => value) ? FilterGroupState.AllEnabled : values.some(value => value) ? FilterGroupState.Mixed : FilterGroupState.AllDisabled;
	},
	set: (value) => {
		if (value === FilterGroupState.AllEnabled) {
			renderFilters.map.value = true;
			renderFilters.mapZone.value = true;
			renderFilters.mapIcon.value = true;
			gameMapLabelsState.value = FilterGroupState.AllEnabled;
		} else if (value === FilterGroupState.AllDisabled) {
			renderFilters.map.value = false;
			renderFilters.mapZone.value = false;
			renderFilters.mapIcon.value = false;
			gameMapLabelsState.value = FilterGroupState.AllDisabled;
		}
	}
});
</script>