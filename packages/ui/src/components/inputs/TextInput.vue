<template>
	<PrimeInputText
		ref="primeInputText"
		v-model="modelValue"
		:autofocus="props.autofocus"
		:allowEmpty="props.allowEmpty"
		highlightOnFocus
	/>
</template>

<script setup lang="ts">
	import PrimeInputText from 'primevue/inputtext';
	import { defineModel, nextTick, onMounted, ref } from 'vue';

	const primeInputText = ref<InstanceType<typeof PrimeInputText>>(null!);

	const props = defineProps<{
		autofocus?: boolean;
		allowEmpty?: boolean;
	}>();

	const modelValue = defineModel({ type: String, required: true });
	onMounted(() => {
		const inputElement = (primeInputText.value as any).$el as HTMLInputElement;

		if (props.autofocus) {
			nextTick(() => {
				inputElement.select();
			});
		}
	});
</script>
