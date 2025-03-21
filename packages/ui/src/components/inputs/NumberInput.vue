<template>
	<TextInput
		ref="textInput"
		:autofocus="props.autofocus"
		v-model="stringValue"
		@keydown="onKeyDown"
	/>
</template>

<script setup lang="ts">
	import { computed, ref, shallowRef, watch } from 'vue';
	import TextInput from './TextInput.vue';

	const textInput = shallowRef<InstanceType<typeof TextInput>>(null!);
	const inputElement = computed(() => textInput.value.inputElement);

	const props = withDefaults(
		defineProps<{
			autofocus?: boolean;
			prefix?: string;
			suffix?: string;
			min?: number;
			max?: number;
			fractionDigits?: number;
		}>(),
		{
			prefix: '',
			suffix: '',
		}
	);

	const _modelValue = defineModel({ type: Number, required: true });
	const numberValue = computed({
		get: () => {
			return _modelValue.value;
		},
		set: (newNumber: number) => {
			if (props.min != null) newNumber = Math.max(props.min, newNumber);
			if (props.max != null) newNumber = Math.min(props.max, newNumber);
			_modelValue.value = Number(
				props.fractionDigits != null
					? newNumber.toFixed(props.fractionDigits)
					: newNumber
			);
		},
	});
	const formattedValue = computed(() => {
		return `${props.prefix}${props.fractionDigits != null ? numberValue.value.toFixed(props.fractionDigits) : numberValue.value}${props.suffix}`;
	});

	const stringValue = ref('');
	watch(
		stringValue,
		() => {
			let _stringValue = stringValue.value;
			if (!_stringValue.startsWith(props.prefix))
				_stringValue = `${props.prefix}${_stringValue}`;
			if (!_stringValue.endsWith(props.suffix))
				_stringValue = `${_stringValue}${props.suffix}`;

			if (stringValue.value !== _stringValue) stringValue.value = _stringValue;
		},
		{ flush: 'sync' }
	);
	const parsedValue = computed(() => {
		return Number(
			stringValue.value.substring(
				props.prefix.length,
				stringValue.value.length - props.suffix.length
			)
		);
	});

	const checkCursor = () => {
		if (!textInput.value.$el.matches(':focus-within')) return;
		const inputElement = textInput.value?.inputElement;
		if (!inputElement) return;

		let selectionInvalid = false;
		const selection = [
			inputElement.selectionStart!,
			inputElement.selectionEnd!,
		];
		for (const [index, value] of selection.entries()) {
			selection[index] = Math.max(props.prefix.length, value);
			selection[index] = Math.min(
				inputElement.value.length - props.suffix.length,
				value
			);
			if (selection[index] !== value) selectionInvalid = true;
		}

		if (selectionInvalid)
			inputElement.setSelectionRange(
				selection[0],
				selection[1],
				inputElement.selectionDirection || undefined
			);
	};
	document.addEventListener('selectionchange', checkCursor);
	onScopeDispose(() => {
		document.removeEventListener('selectionchange', checkCursor);
	});

	const valuesOutOfSync = computed(
		() => numberValue.value !== parsedValue.value
	);

	watch(
		numberValue,
		() => {
			if (
				isNaN(numberValue.value) ||
				(!valuesOutOfSync.value && stringValue.value)
			)
				return;
			stringValue.value = formattedValue.value;

			const inputElement = textInput.value?.inputElement;
			if (inputElement == null) return;
			inputElement.value = stringValue.value;
			if (inputElement.matches(':focus')) inputElement.select();
		},
		{ flush: 'sync', immediate: true }
	);

	watch(
		stringValue,
		() => {
			if (!isNaN(parsedValue.value) && valuesOutOfSync.value) {
				numberValue.value = parsedValue.value;
			}
		},
		{ flush: 'sync' }
	);

	const onKeyDown = (event: KeyboardEvent) => {
		switch (event.code) {
			case 'ArrowUp':
				numberValue.value += event.ctrlKey ? 5 : event.shiftKey ? 0.1 : 1;
				event.preventDefault();
				break;
			case 'ArrowDown':
				numberValue.value -= event.ctrlKey ? 5 : event.shiftKey ? 0.1 : 1;
				event.preventDefault();
				break;
		}
	};

	defineExpose({
		textInput,
		inputElement,
		numberValue,
		formattedValue,
		stringValue,
		parsedValue,
		valuesOutOfSync,
	});
</script>
