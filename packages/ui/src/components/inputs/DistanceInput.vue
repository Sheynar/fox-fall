<template>
	<PrimeInputNumber
		ref="primeInputNumber"
		v-model="modelValue"
		@input="setValue(Number($event.value))"
		:suffix="props.suffix"
		locale="en-UK"
		:autofocus="props.autofocus"
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
		autofocus?: boolean;
		fractionDigits?: number;
		min?: number;
		suffix?: string;
	}>(), {
		fractionDigits: 1,
		suffix: 'm',
	});

	const modelValue = defineModel({ type: Number, required: true });

	const setValue = (newValue: number) => {
		if (props.min != null) newValue = Math.max(newValue, props.min);
		modelValue.value = newValue;
	};

	onMounted(() => {
		const inputElement = (primeInputNumber.value as any).$el.children[0] as HTMLInputElement;

		if (props.autofocus) {
			nextTick(() => {
				inputElement.select();
			});
		}
	});
</script>
