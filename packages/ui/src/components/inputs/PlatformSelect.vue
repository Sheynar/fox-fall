<template>
	<IconSelect
		class="UnitSettings__select"
		filter
		showClear
		v-model="selectedPlatform"
		placeholder="Select artillery platform"
		:options="platformOptions"
		optionLabel="label"
	/>
</template>

<script setup lang="ts">
	import {
		AMMO_TYPE,
		ARTILLERY_BY_SHELL,
		Platform,
	} from '@/lib/constants/data';
	import IconSelect from './IconSelect.vue';
	import { computed, markRaw } from 'vue';

	const modelValue = defineModel<Platform<AMMO_TYPE>>('modelValue');
	const props = defineProps<{
		ammoType: AMMO_TYPE;
	}>();

	const platformOptions = computed(() => {
		if (props.ammoType == null || ARTILLERY_BY_SHELL[props.ammoType] == null)
			return [];
		return (
			Object.keys(
				ARTILLERY_BY_SHELL[props.ammoType].PLATFORM
			) as Platform<AMMO_TYPE>[]
		)
			.sort()
			.map((platform) => ({
				label: platform,
				icon: markRaw(ARTILLERY_BY_SHELL[props.ammoType!].PLATFORM[platform]?.ICON),
				value: platform,
			}));
	});
	const selectedPlatform = computed({
		get: () =>
			platformOptions.value.find((option) => option.value === modelValue.value),
		set: (option) => {
			modelValue.value = option?.value;
		},
	});
</script>
