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
	import { computed, defineModel, shallowRef } from 'vue';
	import NumberInput from './NumberInput.vue';

	const numberInput = shallowRef<InstanceType<typeof NumberInput>>(null!);
	const inputElement = computed(() => numberInput.value?.inputElement);

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

	defineExpose({
		numberInput,
		inputElement,
	})
</script>
