<template>
	<PrimeInputText
		ref="primeInputText"
		v-model="modelValue"
		:autofocus="props.autofocus"
		:allowEmpty="props.allowEmpty"
		@focus="inputElement?.select()"
	/>
</template>

<script setup lang="ts">
	import PrimeInputText from 'primevue/inputtext';
	import { computed, defineModel, nextTick, onMounted, shallowRef } from 'vue';

	const primeInputText = shallowRef<InstanceType<typeof PrimeInputText>>(null!);
	const inputElement = computed(
		() => (primeInputText.value as any)?.$el as HTMLInputElement | undefined
	);

	const props = defineProps<{
		autofocus?: boolean;
		allowEmpty?: boolean;
	}>();

	const modelValue = defineModel({ type: String, required: true });
	onMounted(() => {
		if (props.autofocus) {
			nextTick(() => {
				inputElement.value?.select();
			});
		}
	});

	defineExpose({
		primeInputText,
		inputElement,
	});
</script>
