<template>
	<PrimeInputNumber
		ref="primeInputNumber"
		v-model="modelValue"
		suffix="m"
		locale="en-UK"
		:allowEmpty="false"
		highlightOnFocus
		:minFractionDigits="0"
		:maxFractionDigits="props.fractionDigits"
	/>
</template>

<script setup lang="ts">
	import PrimeInputNumber from 'primevue/inputnumber';
	import { defineModel, nextTick, onMounted, ref } from 'vue';

	const primeInputNumber = ref<InstanceType<typeof PrimeInputNumber>>(null!);

	const props = withDefaults(defineProps<{
		autoFocus?: boolean;
		fractionDigits?: number;
	}>(), {
		fractionDigits: 0,
	});

	const modelValue = defineModel({ type: Number, required: true });

	onMounted(() => {
		const inputElement = primeInputNumber.value.$el.children[0] as HTMLInputElement;

		if (props.autoFocus) {
			nextTick(() => {
				inputElement.select();
			});
		}
	});
</script>
