<template>
	<NumberInput
		class="DistanceInput__container"
		ref="numberInput"
		v-model="modelValue"
		:autofocus="props.autofocus"
		:fractionDigits="props.fractionDigits"
		:min="props.min"
		:inputAttributes="{ size: 3 }"
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
	}>(), {
		fractionDigits: 1,
	});

	const modelValue = defineModel({ type: Number, required: true });

	defineExpose({
		numberInput,
		inputElement,
	})
</script>
