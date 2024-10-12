<template>
	<PrimeInputNumber
		ref="primeInputNumber"
		v-model="modelValue"
		@input="setValue($event.value)"
		suffix="m"
		locale="en-UK"
		:allowEmpty="false"
		highlightOnFocus
		:minFractionDigits="0"
		:maxFractionDigits="props.fractionDigits"
		:min="props.min"
	/>
</template>

<script setup lang="ts">
	import PrimeInputNumber from 'primevue/inputnumber';
	import { defineModel, nextTick, onMounted, ref } from 'vue';

	const primeInputNumber = ref<InstanceType<typeof PrimeInputNumber>>(null!);

	const props = withDefaults(defineProps<{
		autoFocus?: boolean;
		fractionDigits?: number;
		min?: number;
	}>(), {
		fractionDigits: 1,
	});

	const modelValue = defineModel({ type: Number, required: true });

	const setValue = (newValue: number) => {
		if (props.min != null) newValue = Math.max(newValue, props.min);
		modelValue.value = newValue;
	};

	onMounted(() => {
		const inputElement = primeInputNumber.value.$el.children[0] as HTMLInputElement;

		if (props.autoFocus) {
			nextTick(() => {
				inputElement.select();
			});
		}
	});
</script>
