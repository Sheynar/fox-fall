<template>
	<TextInput
		:model-value="valueDisplay"
		readonly
		@keydown.stop.prevent="onKeypress"
		@keyup.stop.prevent="onKeyrelease"
		@focus="emit('focus')"
		@blur="emit('blur')"
	/>
</template>

<script lang="ts" setup>
	import { keyDefinitionByCode } from '@packages/types/dist/keyboard-config';
	import TextInput from '@/components/inputs/TextInput.vue';
	import { computed, ref } from 'vue';

	const emit = defineEmits<{
		(event: 'blur'): void;
		(event: 'focus'): void;
	}>();

	const modelValue = defineModel({ type: Array<string>, required: true });
	const internalValue = ref([] as string[]);
	const finalized = ref(true);

	const valueDisplay = computed(() => {
		const accelerator = finalized ? modelValue.value : internalValue.value;
		return accelerator
			.map((key) => {
				const keyName = key.startsWith('@')
					? keyDefinitionByCode[key.substring(1)]?.name
					: undefined;
				return keyName ?? key;
			})
			.join(' + ');
	});

	const onKeypress = async (event: KeyboardEvent) => {
		const key = `@${event.code}`;

		if (key === '@Escape') {
			finalized.value = true;
			modelValue.value = [];
			return;
		}

		if (internalValue.value.includes(key)) return;
		internalValue.value.push(key);
		finalized.value = false;
	};

	const onKeyrelease = async (event: KeyboardEvent) => {
		const key = `@${event.code}`;
		const index = internalValue.value.indexOf(key);
		if (index === -1) return;
		if (!finalized.value) {
			finalized.value = true;
			modelValue.value = JSON.parse(JSON.stringify(internalValue.value));
		}
		internalValue.value.splice(index, 1);
	};
</script>
