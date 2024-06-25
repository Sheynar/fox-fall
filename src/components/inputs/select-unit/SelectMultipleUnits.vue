<template>
	<PrimeMultiSelect
		v-model="selectedUnits"
		filter
		showClear
		:options="selectUnitOptions"
		:optionLabel="optionLabel"
		:optionGroupLabel="optionGroupLabel"
		:optionGroupChildren="optionGroupChildren"
		:placeholder="props.placeholder"
	/>
</template>

<script setup lang="ts">
	import PrimeMultiSelect from 'primevue/multiselect';
	import { computed } from 'vue';
	import { useSelectUnitOptions } from '.';

	const modelValue = defineModel<string[]>('modelValue', { required: true });

	const props = withDefaults(
		defineProps<{
			placeholder?: string;
		}>(),
		{
			placeholder: 'Select units',
		}
	);

	const {
		selectUnitOptions,
		optionLabel,
		optionGroupLabel,
		optionGroupChildren,
	} = useSelectUnitOptions();

	const selectedUnits = computed({
		get: () => modelValue.value.map((unitId) => {
			for (const selectUnitOption of selectUnitOptions.value) {
				for (const unit of selectUnitOption.units) {
					if (unit.id === unitId) return unit;
				}
			}
		}),
		set: (value) => modelValue.value = value.map((unit) => unit!.id),
	});
</script>
