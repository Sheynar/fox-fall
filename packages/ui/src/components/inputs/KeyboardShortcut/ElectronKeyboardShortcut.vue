<template>
	<KeyboardShortcut
		:model-value="accelerator"
		@update:model-value="onUpdate($event)"
		@focus="onFocus"
		@blur="onBlur"
	/>
</template>

<script lang="ts" setup>
	import { type KeyboardCommand } from '@packages/types/dist/keyboard-config';
	import { ref } from 'vue';
	import KeyboardShortcut from './KeyboardShortcut.vue';

	const props = defineProps<{
		command: KeyboardCommand;
	}>();

	const accelerator = ref('');
	window.electronApi
		?.getKeyboardShortcut(props.command)
		.then(
			(currentAccelerator) => (accelerator.value = currentAccelerator ?? '')
		);

	const onUpdate = async (newAccelerator: string) => {
		await window.electronApi?.updateKeyboardShortcut(
			props.command,
			newAccelerator
		);
		accelerator.value = newAccelerator;
	};

	const onFocus = async () => {
		await window.electronApi?.pauseKeyboardShortcuts();
	};

	const onBlur = async () => {
		await window.electronApi?.resumeKeyboardShortcuts();
	};
</script>
