<template>
	<div class="FiringArcs__container FiringArcs__lines" ref="firingLines" />
	<div class="FiringArcs__container FiringArcs__labels" ref="firingLabels" />
	<FiringArc
		v-for="firingArc in firingArcList"
		:key="firingArc.to.id"
		:line-container="firingLines!"
		:label-container="firingLabels!"
		:unit-id-from="firingArc.from.id"
		:unit-id-to="firingArc.to.id"
	/>
</template>

<style lang="scss">
	.FiringArcs__container {
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
	import { computed, ref } from 'vue';
	import { injectHighlightedUnits } from '@/contexts/highlighted-units';
	import { injectPinnedUnits } from '@/contexts/pinned-units';
	import { injectSelectedUnits } from '@/contexts/selected-unit';
	import { injectUnitMap } from '@/contexts/unit';
	import { UnitType, type Unit } from '@/lib/unit';
	import FiringArc from './FiringArc.vue';

	const firingLines = ref<HTMLElement | null>(null);
	const firingLabels = ref<HTMLElement | null>(null);

	const selectedUnits = injectSelectedUnits();
	const highlightedUnits = injectHighlightedUnits();
	const pinnedUnits = injectPinnedUnits();
	const unitMap = injectUnitMap();

	const relevantUnitIds = computed(() =>
		Array.from(
			new Set([
				...highlightedUnits.value,
				...pinnedUnits.value,
				...selectedUnits.value,
			])
		)
	);

	const artilleryUnits = computed(() => {
		const output: Unit[] = [];
		for (const unitId of Object.keys(unitMap.value)) {
			const unit = unitMap.value[unitId];
			if (unit.type !== UnitType.Artillery) continue;
			output.push(unit);
		}
		return output;
	});

	const targetUnits = computed(() => {
		const output: Unit[] = [];
		for (const unitId of Object.keys(unitMap.value)) {
			const unit = unitMap.value[unitId];
			if (unit.type !== UnitType.Target) continue;
			output.push(unit);
		}
		return output;
	});

	const firingArcList = computed(() => {
		const output: { from: Unit; to: Unit }[] = [];

		for (const targetUnit of targetUnits.value) {
			for (const artilleryUnit of artilleryUnits.value) {
				if (
					!relevantUnitIds.value.includes(artilleryUnit.id) &&
					!relevantUnitIds.value.includes(targetUnit.id)
				)
					continue;
				output.push({ from: artilleryUnit, to: targetUnit });
			}
		}

		return output;
	});

	(<any>window).firingArcList = firingArcList;
</script>
