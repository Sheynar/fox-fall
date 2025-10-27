<template>
	<FoxSelect
		class="UnitSettings__select"
		enable-search
		enable-clear
		v-model="modelValue"
		:options="ammoOptions"
	>
		<template #placeholder>Select ammo type</template>
	</FoxSelect>
</template>

<script setup lang="ts">
	import { computed, markRaw } from 'vue';
	import { AMMO_TYPE, ARTILLERY_BY_SHELL } from '@packages/data/dist/artillery/unit/constants';
	import { ICONS } from '@/lib/constants/icons';
	import FoxSelect from './FoxSelect.vue';

	const modelValue = defineModel<AMMO_TYPE>('modelValue');

	const ammoOptions = computed(() => {
		const output: Map<AMMO_TYPE, { label: string; icon?: any, order: number }> = new Map();
		for (const [index, shell] of (Object.keys(ARTILLERY_BY_SHELL) as AMMO_TYPE[]).sort().entries()) {
			output.set(shell, { label: shell, icon: markRaw(ICONS[shell]), order: index });
		}
		return output;
	});
</script>
