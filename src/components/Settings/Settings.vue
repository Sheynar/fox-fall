<template>
	<PrimeDialog
		v-model:visible="visible"
		:style="{ minWidth: '50vw' }"
		header="Settings"
		@pointerdown.stop
		@wheel.stop
	>
		<PrimeFloatLabel>
			<SelectOneUnit v-model="selectedUnit" />
			<label>You:</label>
		</PrimeFloatLabel>
		<PrimeFloatLabel>
			<SelectMultipleUnits
				v-model="pointsOfInterest"
				placeholder="Select other units to ensure are visible"
			/>
			<label>Points of interest:</label>
		</PrimeFloatLabel>
	</PrimeDialog>
</template>

<script setup lang="ts">
	import PrimeDialog from 'primevue/dialog';
	import PrimeFloatLabel from 'primevue/floatlabel';
	import { ref } from 'vue';
	import SelectOneUnit from '@/components/inputs/select-unit/SelectOneUnit.vue';
	import SelectMultipleUnits from '@/components/inputs/select-unit/SelectMultipleUnits.vue';
	import { type Unit } from '@/lib/unit';

	const visible = defineModel('visible', { default: false, type: Boolean });

	const selectedUnit = ref<Unit | undefined>(undefined);
	const pointsOfInterest = ref<Unit[]>([]);
</script>
