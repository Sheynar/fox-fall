<template>
	<PrimeInputText
		ref="primeInputText"
		v-model="modelValue"
		:allowEmpty="props.allowEmpty"
		highlightOnFocus
	/>
</template>

<script setup lang="ts">
	import PrimeInputText from 'primevue/inputtext';
	import { defineModel, nextTick, onMounted, ref } from 'vue';

	const primeInputText = ref<InstanceType<typeof PrimeInputText>>(null!);

	const props = defineProps<{
		autoFocus?: boolean;
		allowEmpty?: boolean;
	}>();

	const modelValue = defineModel({ type: String, required: true });
	onMounted(() => {
		const inputElement = primeInputText.value.$el as HTMLInputElement;

		if (props.autoFocus) {
			nextTick(() => {
				inputElement.select();
			});
		}
	});
</script>
