<template>
	<div class="RangeFinders__container">
		<RangeFinder
			v-for="rangeFinder in rangeFinders"
			:key="rangeFinder.unit.id"
			:position="rangeFinder.resolvedPosition"
			:outer-radius="rangeFinder.specs.MAX_RANGE"
			:inner-radius="rangeFinder.specs.MIN_RANGE"
			:style="RangeFinderStyle.Artillery"
		/>
		<RangeFinder
			v-for="spotter in spotters"
			:key="spotter.unit.id"
			:position="spotter.resolvedPosition"
			:outer-radius="spotter.specs.MAX_RANGE"
			:style="RangeFinderStyle.Spotting"
		/>
	</div>
</template>

<style lang="scss">
	.RangeFinders__container {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;

		pointer-events: none;
	}
</style>

<script setup lang="ts">
	import {
		ArtilleryPlatform,
		SPOTTING_BY_TYPE,
		SpottingSpecs,
	} from '@packages/data/dist/artillery/unit/constants';
	import { UnitType, type Unit } from '@packages/data/dist/artillery/unit';
	import type { Vector } from '@packages/data/dist/artillery/vector';
	import { artillery } from '@/lib/globals';
	import {
		getUnitResolvedVector,
		getUnitSpecs,
	} from '@/lib/unit';
	import { useFocusedUnitIds } from '@/mixins/focused-units';
	import { computed } from 'vue';
	import RangeFinder from './RangeFinder.vue';
	import { RangeFinderStyle } from './enums';

	const focusedUnitIds = useFocusedUnitIds();

	const rangeFinders = computed(() => {
		const output: {
			unit: Unit;
			specs: ArtilleryPlatform;
			resolvedPosition: Vector;
		}[] = [];

		for (const unitId of focusedUnitIds.value) {
			const unit = artillery.sharedState.currentState.value.unitMap[unitId];

			if (unit.type !== UnitType.Artillery) continue;

			const specs = getUnitSpecs(artillery.sharedState.currentState.value.unitMap, unitId);
			if (specs == null) continue;

			output.push({
				unit,
				specs,
				resolvedPosition: getUnitResolvedVector(
					artillery.sharedState.currentState.value.unitMap,
					unit.id
				).addVector(
					artillery.getWindOffset(unit.id).scale(unit.type === UnitType.Artillery ? 1 : -1)
				),
			});
		}

		return output;
	});

	const spotters = computed(() => {
		const output: {
			unit: Unit;
			specs: SpottingSpecs;
			resolvedPosition: Vector;
		}[] = [];

		for (const unitId of focusedUnitIds.value) {
			const unit = artillery.sharedState.currentState.value.unitMap[unitId];
			if (
				unit.type !== UnitType.Spotter ||
				unit.spottingType == null
			)
				continue;

			output.push({
				unit,
				specs: SPOTTING_BY_TYPE[unit.spottingType],
				resolvedPosition: getUnitResolvedVector(
					artillery.sharedState.currentState.value.unitMap,
					unit.id
				),
			});
		}

		return output;
	});
</script>
