<template>
	<div class="FiringArcs__container">
		<FiringArc
			v-for="firingArc in firingArcList"
			:key="firingArc.to.id"
			:unit-id-from="firingArc.from.id"
			:unit-id-to="firingArc.to.id"
			:hide-label="firingArc.hideLabel"
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
			output.push(unit);
		}
		return output;
	});

	const targetUnits = computed(() => {
		const output: Unit[] = [];
		for (const unitId of Object.keys(artillery.unitMap.value)) {
			const unit = artillery.unitMap.value[unitId];
			if (unit.type !== UnitType.Target) continue;
			output.push(unit);
		}
		return output;
	});

	const firingArcList = computed(() => {
		const output: { from: Unit; to: Unit; hideLabel: boolean }[] = [];

		for (const targetUnit of targetUnits.value) {
			for (const artilleryUnit of artilleryUnits.value) {
				if (
					!focusedUnitIds.value.includes(artilleryUnit.id) &&
					!focusedUnitIds.value.includes(targetUnit.id)
				)
					continue;
				output.push({
					from: artilleryUnit,
					to: targetUnit,
					hideLabel:
						artillery.draggingUnits.value.has(artilleryUnit.id) ||
						artillery.draggingUnits.value.has(targetUnit.id),
				});
			}
		}

		return output;
	});
</script>
