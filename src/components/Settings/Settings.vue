<template>
	<PrimeDialog
		v-model:visible="visible"
		header="Settings"
		@pointerdown.stop
		@wheel.stop
	>
		<PrimeFloatLabel>
			<PrimeSelect
				v-model="selectedUnit"
				filter
				showClear
				:options="unitSelectOptions"
				optionLabel="label"
				optionGroupLabel="label"
				optionGroupChildren="units"
				placeholder="Select a unit to focus on"
			/>
			<label>You:</label>
		</PrimeFloatLabel>
		<PrimeFloatLabel>
			<PrimeMultiSelect
				v-model="pointsOfInterest"
				filter
				showClear
				:options="unitSelectOptions"
				optionLabel="label"
				optionGroupLabel="label"
				optionGroupChildren="units"
				placeholder="Select other units to ensure are visible"
			/>
			<label>Points of interest:</label>
		</PrimeFloatLabel>
	</PrimeDialog>
</template>

<script setup lang="ts">
	import PrimeDialog from 'primevue/dialog';
	import PrimeFloatLabel from 'primevue/floatlabel';
	import PrimeMultiSelect from 'primevue/multiselect';
	import PrimeSelect from 'primevue/select';
	import { computed, ref } from 'vue';
	import { injectUnitMap } from '@/contexts/unit';
	import { UnitType, type Unit } from '@/lib/unit';

	const unitMap = injectUnitMap();

	const visible = defineModel('visible', { default: false, type: Boolean });

	const unitSelectOptions = computed(() => {
		const output: { label: string; units: Unit[] }[] = [];

		for (const unitType of [
			UnitType.Artillery,
			UnitType.Spotter,
			UnitType.Target,
			UnitType.LandingZone,
		]) {
			const units: Unit[] = [];
			for (const unit of Object.values(unitMap.value)) {
				if (unit.type !== unitType) continue;
				units.push(unit);
			}
			if (units.length > 0) {
				output.push({ label: UnitType[unitType], units });
			}
		}

		return output;
	});

	const selectedUnit = ref<Unit | null>(null);
	const pointsOfInterest = ref<Unit[]>([]);
</script>
