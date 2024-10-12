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
	import { useSelectUnitOptions, type Options as SelectUnitOptions } from './index';

	const modelValue = defineModel<string[]>('modelValue', { required: true });

	const props = withDefaults(
		defineProps<{
			placeholder?: string;
			whiteList?: SelectUnitOptions['whiteList'];
			blackList?: SelectUnitOptions['blackList'];
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
	} = useSelectUnitOptions({
		whiteList: props.whiteList,
		blackList: props.blackList,
	});

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
