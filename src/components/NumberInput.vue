<template>
	<input type="text" v-model="stringValue" />
</template>

<script setup lang="ts">
	import { computed, ref, watch, watchEffect } from 'vue';

	const props = defineProps<{
		modelValue: number;
	}>();

	const stringValue = ref('');
	watchEffect(() => (stringValue.value = props.modelValue.toString()));

	const numberValue = computed(() => Number(stringValue.value));
	watch(numberValue, () => {
		if (isNaN(numberValue.value) || numberValue.value === props.modelValue)
			return;
		emit('update:modelValue', numberValue.value);
	});

	const emit = defineEmits<{
		(event: 'update:modelValue', value: number): void;
	}>();
</script>
