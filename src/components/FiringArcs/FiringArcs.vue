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

	const getRootParent = (unitId: string): Unit => {
		const unit = unitMap.value[unitId];
		if (unit.parentId == null) return unit;
		return getRootParent(unit.parentId);
	};
	const artilleryByRootParent = computed(() => {
		const output: Record<string, string[]> = {};
		for (const unitId of Object.keys(unitMap.value)) {
			const unit = unitMap.value[unitId];
			const rootParent = getRootParent(unitId);
			if (unit.type !== UnitType.Artillery) continue;

			if (output[rootParent.id] == null) {
				output[rootParent.id] = [];
			}
			output[rootParent.id].push(unitId);
		}
		return output;
	});

	const targetByRootParent = computed(() => {
		const output: Record<string, string[]> = {};
		for (const unitId of Object.keys(unitMap.value)) {
			const unit = unitMap.value[unitId];
			const rootParent = getRootParent(unitId);
			if (unit.type !== UnitType.Target) continue;

			if (output[rootParent.id] == null) {
				output[rootParent.id] = [];
			}
			output[rootParent.id].push(unitId);
		}
		return output;
	});

	const firingArcList = computed(() => {
		const output: { from: Unit; to: Unit }[] = [];

		const unitIds = new Set([...highlightedUnits.value, ...pinnedUnits.value, ...selectedUnits.value]);

		for (const unitId of unitIds) {
			const unit = unitMap.value[unitId];
			if (unit == null) continue;

			if (unit.type === UnitType.Target) {
				const rootParent = getRootParent(unitId);
				const artilleryList = artilleryByRootParent.value[rootParent.id] ?? [];
				for (const artilleryId of artilleryList) {
					const artillery = unitMap.value[artilleryId];
					output.push({ from: artillery, to: unit });
				}
			}
			if (unit.type === UnitType.Artillery) {
				const rootParent = getRootParent(unitId);
				const targetList = targetByRootParent.value[rootParent.id] ?? [];
				for (const targetId of targetList) {
					const target = unitMap.value[targetId];
					output.push({ from: unit, to: target });
				}
			}
		}

		return output;
	});
</script>
