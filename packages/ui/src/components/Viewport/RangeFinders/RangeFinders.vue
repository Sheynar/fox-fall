<template>
	<div class="RangeFinders__container">
		<PositionedElement
			v-for="rangeFinder in rangeFinders"
			:key="rangeFinder.unit.id"
			:x="rangeFinder.resolvedPosition.x"
			:y="rangeFinder.resolvedPosition.y"
			:layer="LAYER.RANGE_FINDERS"
		>
			<svg
				class="RangeFinders__indicator"
				:class="{
					RangeFinders__artillery: rangeFinder.unit.type === UnitType.Artillery,
					RangeFinders__target: rangeFinder.unit.type === UnitType.Target,
				}"
				xmlns="http://www.w3.org/2000/svg"
				preserve-aspect-ratio="none"
			>
				<Disk
					:outerRadius="
						rangeFinder.specs.MAX_RANGE * artillery.viewport.value.resolvedZoom
					"
					:innerRadius="
						rangeFinder.specs.MIN_RANGE * artillery.viewport.value.resolvedZoom
					"
				/>
			</svg>
		</PositionedElement>
		<PositionedElement
			v-for="spotter in spotters"
			:key="spotter.unit.id"
			:x="spotter.resolvedPosition.x"
			:y="spotter.resolvedPosition.y"
			:layer="LAYER.RANGE_FINDERS"
		>
			<svg
				class="RangeFinders__indicator RangeFinders__spotter"
				xmlns="http://www.w3.org/2000/svg"
				preserve-aspect-ratio="none"
			>
				<Disk
					:outerRadius="
						spotter.specs.MAX_RANGE * artillery.viewport.value.resolvedZoom
					"
					:innerRadius="0"
				/>
			</svg>
		</PositionedElement>
		<PositionedElement
			v-for="spread in spreads"
			:key="spread.unit.id"
			:x="spread.resolvedPosition.x"
			:y="spread.resolvedPosition.y"
			:layer="LAYER.RANGE_FINDERS"
		>
			<svg
				class="RangeFinders__indicator RangeFinders__spread"
				xmlns="http://www.w3.org/2000/svg"
				preserve-aspect-ratio="none"
			>
				<Disk
					:outerRadius="
						spread.specs.MIN_RANGE * artillery.viewport.value.resolvedZoom
					"
					:innerRadius="0"
				/>
			</svg>
			<svg
				class="RangeFinders__indicator RangeFinders__spread"
				xmlns="http://www.w3.org/2000/svg"
				preserve-aspect-ratio="none"
			>
				<Disk
					:outerRadius="
						spread.specs.MAX_RANGE * artillery.viewport.value.resolvedZoom
					"
					:innerRadius="0"
				/>
			</svg>
		</PositionedElement>
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

	.RangeFinders__indicator {
		position: absolute;
		inset: 0;
		overflow: visible;

		stroke: black;
		opacity: 0.15;

		&.RangeFinders__artillery {
			fill: var(--p-red-500);
		}
		&.RangeFinders__target {
			fill: var(--p-green-500);
		}
		&.RangeFinders__spotter {
			fill: var(--p-blue-500);
		}
		&.RangeFinders__spread {
			fill: var(--p-orange-500);
		}
	}
</style>

<script setup lang="ts">
	import Disk from '@/components/svg/Disk.vue';
	import PositionedElement from '@/components/Viewport/PositionedElement.vue';
	import {
		ArtilleryPlatform,
		SPOTTING_BY_TYPE,
		SpottingSpecs,
	} from '@/lib/constants/data';
	import { LAYER } from '@/lib/constants/ui';
	import { artillery } from '@/lib/globals';
	import { getUnitResolvedVector, getUnitSpecs, UnitType, type Unit } from '@/lib/unit';
	import type { Vector } from '@/lib/vector';
	import { useFocusedUnitIds } from '@/mixins/focused-units';
	import { computed } from 'vue';

	const focusedUnitIds = useFocusedUnitIds();

	const rangeFinders = computed(() => {
		const output: {
			unit: Unit;
			specs: ArtilleryPlatform;
			resolvedPosition: Vector;
		}[] = [];

		for (const unitId of focusedUnitIds.value) {
			const unit = artillery.unitMap.value[unitId];
			if (unit.type !== UnitType.Artillery && unit.type !== UnitType.Target)
				continue;

			const specs = getUnitSpecs(artillery.unitMap.value, unitId);
			if (specs == null) continue;

			output.push({
				unit,
				specs,
				resolvedPosition: getUnitResolvedVector(
					artillery.unitMap.value,
					unit.id
				).addVector(
					artillery.wind.value.scale(unit.type === UnitType.Artillery ? 1 : -1)
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
			const unit = artillery.unitMap.value[unitId];
			if (
				(unit.type !== UnitType.Spotter && unit.type !== UnitType.Target) ||
				unit.spottingType == null
			)
				continue;

			output.push({
				unit,
				specs: SPOTTING_BY_TYPE[unit.spottingType],
				resolvedPosition: getUnitResolvedVector(
					artillery.unitMap.value,
					unit.id
				),
			});
		}

		return output;
	});

	const spreads = computed(() => {
		const output: {
			unit: Unit;
			specs: { MAX_RANGE: number; MIN_RANGE: number };
			resolvedPosition: Vector;
		}[] = [];

		for (const unitId of Object.keys(artillery.unitMap.value)) {
			const unit = artillery.unitMap.value[unitId];
			if (
				unit.type !== UnitType.Target
			)
				continue;

			const specs = getUnitSpecs(artillery.unitMap.value, unitId);
			if (specs == null) continue;

			output.push({
				unit,
				specs: {
					MIN_RANGE: specs.MIN_SPREAD,
					MAX_RANGE: specs.MAX_SPREAD,
				},
				resolvedPosition: getUnitResolvedVector(
					artillery.unitMap.value,
					unit.id
				),
			});
		}

		return output;
	});
</script>
