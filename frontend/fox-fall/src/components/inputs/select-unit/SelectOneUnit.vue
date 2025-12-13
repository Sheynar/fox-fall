<template>
	<FoxSelect
		ref="selectElement"
		v-model="modelValue"
		enable-search
		enable-clear
		:options="selectUnitOptions"
		:placeholder="props.placeholder"
	>
		<template #placeholder>{{ props.placeholder }}</template>
	</FoxSelect>
</template>

<script setup lang="ts">
	import { shallowRef } from 'vue';
	import FoxSelect from '@/components/inputs/FoxSelect.vue';
	import {
		useSelectUnitOptions,
		type Options as SelectUnitOptions,
	} from './index';

	const selectElement = shallowRef<InstanceType<typeof FoxSelect>>(null!);

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

	const selectUnitOptions = useSelectUnitOptions({
		whiteList: props.whiteList,
		blackList: props.blackList,
	});

	const focus = () => selectElement.value?.focus();
	const blur = () => selectElement.value?.blur();

	defineExpose({
		selectElement,
		focus,
		blur,
	});
</script>
