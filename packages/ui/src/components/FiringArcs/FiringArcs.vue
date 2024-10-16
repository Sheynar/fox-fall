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
	import { injectUnitMap } from '@/contexts/unit';
	import { UnitType, type Unit } from '@/lib/unit';
	import { useFocusedUnitIds } from '@/mixins/focused-units';
	import FiringArc from './FiringArc.vue';

	const firingLines = ref<HTMLElement | null>(null);
	const firingLabels = ref<HTMLElement | null>(null);

	const unitMap = injectUnitMap();

	const focusedUnitIds = useFocusedUnitIds();

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
					!focusedUnitIds.value.includes(artilleryUnit.id) &&
					!focusedUnitIds.value.includes(targetUnit.id)
				)
					continue;
				output.push({ from: artilleryUnit, to: targetUnit });
			}
		}

		return output;
	});
</script>
