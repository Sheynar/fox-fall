<template>
	<div class="RangeFinders__container">
		<RangeFinder
			v-for="rangeFinder in rangeFinders"
			:key="rangeFinder.unit.id"
			:specs="rangeFinder.specs"
			:position="rangeFinder.resolvedPosition"
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
	import { computed } from 'vue';
	import { injectUnitMap } from '@/contexts/unit';
	import { ARTILLERY_BY_SHELL, ArtilleryPlatform } from '@/lib/constants/data';
	import { getUnitResolvedVector, UnitType, type Unit } from '@/lib/unit';
	import type { Vector } from '@/lib/vector';
	import { useFocusedUnitIds } from '@/mixins/focused-units';
	import RangeFinder from './RangeFinder.vue';
import { injectWind } from '@/contexts/wind';

	const unitMap = injectUnitMap();
	const wind = injectWind();
	const focusedUnitIds = useFocusedUnitIds();

	const rangeFinders = computed(() => {
		const output: {
			unit: Unit;
			specs: ArtilleryPlatform;
			resolvedPosition: Vector;
		}[] = [];

		for (const unitId of focusedUnitIds.value) {
			const unit = unitMap.value[unitId];
			if (unit.type !== UnitType.Artillery) continue;
			const ammoDetails =
				unit.ammunition != null
					? ARTILLERY_BY_SHELL[unit.ammunition]
					: undefined;
			if (ammoDetails == null) continue;
			const specs =
				unit.platform != null ? ammoDetails.PLATFORM[unit.platform] : undefined;
			if (specs == null) continue;

			output.push({
				unit,
				specs,
				resolvedPosition: getUnitResolvedVector(unitMap.value, unit.id).addVector(wind.value.scale(-1)),
			});
		}

		return output;
	});
</script>
