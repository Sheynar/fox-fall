<template>
	<PrimeSelect
		v-model="selectedUnit"
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
	import PrimeSelect from 'primevue/select';
	import { computed } from 'vue';
	import {
		useSelectUnitOptions,
		type Options as SelectUnitOptions,
	} from './index';

	const modelValue = defineModel<string | undefined>('modelValue', {
		required: true,
	});

	const props = withDefaults(
		defineProps<{
			placeholder?: string;
			whiteList?: SelectUnitOptions['whiteList'];
			blackList?: SelectUnitOptions['blackList'];
		}>(),
		{
			placeholder: 'Select a unit',
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

	const selectedUnit = computed({
		get: () => {
			for (const selectUnitOption of selectUnitOptions.value) {
				for (const unit of selectUnitOption.units) {
					if (unit.id === modelValue.value) return unit;
				}
			}
		},
		set: (value) => (modelValue.value = value?.id),
	});
</script>
