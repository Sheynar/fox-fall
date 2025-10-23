<template>
	<IconSelect
		class="UnitSettings__select"
		filter
		showClear
		v-model="selectedAmmoType"
		placeholder="Select ammo type"
		:options="ammoOptions"
		optionLabel="label"
	/>
</template>

<script setup lang="ts">
	import { computed, markRaw } from 'vue';
	import { AMMO_TYPE, ARTILLERY_BY_SHELL } from '@packages/data/dist/artillery/unit/constants';
	import { ICONS } from '@/lib/constants/icons';
	import IconSelect from './IconSelect.vue';

	const modelValue = defineModel<AMMO_TYPE>('modelValue');

	const ammoOptions = computed(() => {
		return (Object.keys(ARTILLERY_BY_SHELL) as AMMO_TYPE[])
			.sort()
			.map((shell) => ({
				label: shell,
				icon: markRaw(ICONS[shell]),
				value: shell,
			}));
	});
	const selectedAmmoType = computed({
		get: () =>
			ammoOptions.value.find((option) => option.value === modelValue.value),
		set: (option) => {
			modelValue.value = option?.value;
		},
	});
</script>
