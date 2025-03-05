<template>
	<div class="FiringArcs__container" :style="{ opacity: settings.firingArcOpacity }">
		<FiringArc
			v-for="firingArc in firingArcList"
			:key="firingArc.to.id"
			:unit-id-from="firingArc.from.id"
			:unit-id-to="firingArc.to.id"
		/>
	</div>
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
	import { artillery } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import { UnitType, type Unit } from '@/lib/unit';
	import { useFocusedUnitIds } from '@/mixins/focused-units';
	import { computed } from 'vue';
	import FiringArc from './FiringArc.vue';

	const focusedUnitIds = useFocusedUnitIds();

	const artilleryUnits = computed(() => {
		const output: Unit[] = [];
		for (const unitId of Object.keys(artillery.unitMap.value)) {
			const unit = artillery.unitMap.value[unitId];
			if (unit.type !== UnitType.Artillery) continue;
			if (artillery.draggingUnits.value.has(unitId)) continue;
			output.push(unit);
		}
		return output;
	});

	const targetUnits = computed(() => {
		const output: Unit[] = [];
		for (const unitId of Object.keys(artillery.unitMap.value)) {
			const unit = artillery.unitMap.value[unitId];
			if (unit.type !== UnitType.Target) continue;
			if (artillery.draggingUnits.value.has(unitId)) continue;
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
