<template>
	<PrimeInputText
		ref="primeInputText"
		v-model="modelValue"
		:autofocus="props.autofocus"
		:allowEmpty="props.allowEmpty"
		@focus="inputElement.select()"
	/>
</template>

<script setup lang="ts">
	import PrimeInputText from 'primevue/inputtext';
	import { computed, defineModel, nextTick, onMounted, ref } from 'vue';

	const primeInputText = ref<InstanceType<typeof PrimeInputText>>(null!);
	const inputElement = computed(
		() => (primeInputText.value as any).$el as HTMLInputElement
	);

	const props = defineProps<{
		autofocus?: boolean;
		allowEmpty?: boolean;
	}>();

	const modelValue = defineModel({ type: String, required: true });
	onMounted(() => {
		if (props.autofocus) {
			nextTick(() => {
				inputElement.value.select();
			});
		}
	});

	defineExpose({
		primeInputText,
		inputElement,
	});
</script>
