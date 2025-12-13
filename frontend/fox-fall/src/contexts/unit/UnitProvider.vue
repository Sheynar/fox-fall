<template>
	<slot />
</template>

<script setup lang="ts">
	import { toRef } from 'vue';
	import { type Unit } from '@packages/data/dist/artillery/unit';
	import { provideUnit } from '.';

	const props = defineProps<{
		unit: Unit;
	}>();

	provideUnit(toRef(props, 'unit'));
</script>
