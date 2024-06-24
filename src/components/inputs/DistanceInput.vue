<template>
	<PrimeInputNumber
		ref="primeInputNumber"
		v-model="modelValue"
		suffix="m"
		locale="en-UK"
		:allowEmpty="false"
		highlightOnFocus
		:minFractionDigits="0"
		:maxFractionDigits="0"
	/>
</template>

<script setup lang="ts">
	import PrimeInputNumber from 'primevue/inputnumber';
	import { defineModel, nextTick, onMounted, ref } from 'vue';

	const primeInputNumber = ref<InstanceType<typeof PrimeInputNumber>>(null!);

	const props = defineProps<{
		autoFocus?: boolean;
	}>();

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
