<template>
	<FoxText
		ref="textInput"
		:autofocus="props.autofocus"
		v-model="stringValue"
		@keydown="onKeyDown"
	>
		<template #icons-before v-if="$slots['icons-before']">
			<slot name="icons-before" />
		</template>
		<template #icons-after v-if="$slots['icons-after']">
			<slot name="icons-after" />
		</template>
	</FoxText>
</template>

<script setup lang="ts">
	import { computed, ref, shallowRef, watch } from 'vue';
	import FoxText from './FoxText.vue';

	const textInput = shallowRef<InstanceType<typeof FoxText>>(null!);
	const inputElement = computed(() => textInput.value.inputElement);

	const props = defineProps<{
		autofocus?: boolean;
		min?: number;
		max?: number;
		fractionDigits?: number;
	}>();

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
		return `${props.fractionDigits != null ? numberValue.value.toFixed(props.fractionDigits) : numberValue.value}`;
	});

	const stringValue = ref('');
	watch(
		stringValue,
		() => {
			let _stringValue = stringValue.value;
			if (stringValue.value !== _stringValue) stringValue.value = _stringValue;
		},
		{ flush: 'sync' }
	);
	const parsedValue = computed(() => {
		return Number(stringValue.value);
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
				numberValue.value += event.ctrlKey ? 5 : event.altKey ? 0.1 : 1;
				event.preventDefault();
				break;
			case 'ArrowDown':
				numberValue.value -= event.ctrlKey ? 5 : event.altKey ? 0.1 : 1;
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
