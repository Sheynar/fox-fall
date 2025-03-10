<template>
	<NumberInput
		ref="numberInput"
		v-model="modelValue"
		:suffix="props.suffix"
		:autofocus="props.autofocus"
		:fractionDigits="props.fractionDigits"
		:min="props.min"
	/>
</template>

<script setup lang="ts">
	import { defineModel, ref } from 'vue';
	import NumberInput from './NumberInput.vue';

	const numberInput = ref<InstanceType<typeof NumberInput>>(null!);

	const props = withDefaults(defineProps<{
		autofocus?: boolean;
		fractionDigits?: number;
		min?: number;
		suffix?: string;
	}>(), {
		fractionDigits: 1,
		suffix: 'm',
	});

	const modelValue = defineModel({ type: Number, required: true });
</script>
