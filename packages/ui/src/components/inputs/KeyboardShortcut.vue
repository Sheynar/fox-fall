<template>
	<TextInput :model-value="accelerator" readonly @keydown.stop.prevent="onKeypress" @focus="onFocus" @blur="onBlur"	/>
</template>

<script lang="ts" setup>
	import { type KeyboardCommand, mapKeyboardEventToAccelerator } from '@packages/types/dist/keyboard-config';
	import TextInput from '@/components/inputs/TextInput.vue';
	import { ref } from 'vue';

	const props = defineProps<{
		command: KeyboardCommand;
	}>();

	const accelerator = ref('');
	window.electronApi?.getKeyboardShortcut(props.command).then((currentAccelerator) => accelerator.value = currentAccelerator ?? '');

	const onKeypress = async (event: KeyboardEvent) => {
		const newAccelerator = mapKeyboardEventToAccelerator(event);
		await window.electronApi?.updateKeyboardShortcut(props.command, newAccelerator);
		accelerator.value = newAccelerator ?? '';
	};

	const onFocus = async () => {
		await window.electronApi?.pauseKeyboardShortcuts();
	};

	const onBlur = async () => {
		await window.electronApi?.resumeKeyboardShortcuts();
	};
</script>