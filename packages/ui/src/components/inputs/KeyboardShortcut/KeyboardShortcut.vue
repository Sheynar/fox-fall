<template>
	<TextInput
		:model-value="modelValue"
		readonly
		@keydown.stop.prevent="onKeypress"
		@focus="emit('focus')"
		@blur="emit('blur')"
	/>
</template>

<script lang="ts" setup>
	import { mapKeyboardEventToAccelerator } from '@packages/types/dist/keyboard-config';
	import TextInput from '@/components/inputs/TextInput.vue';

	const emit = defineEmits<{
		(event: 'blur'): void;
		(event: 'focus'): void;
	}>();

	const modelValue = defineModel({ type: String, required: true });

	const onKeypress = async (event: KeyboardEvent) => {
		const newAccelerator = mapKeyboardEventToAccelerator(event);
		modelValue.value = newAccelerator ?? '';
	};
</script>
