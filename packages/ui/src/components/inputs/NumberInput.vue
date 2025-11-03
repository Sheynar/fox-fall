<template>
	<FoxText
		class="NumberInput__container"
		ref="textInput"
		:autofocus="props.autofocus"
		v-model="stringValue"
		:input-attributes="props.inputAttributes"
		@keydown="onKeyDown"
		@focus="emit('focus')"
		@blur="stringValue = formattedValue; emit('blur')"
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
	import { type InputHTMLAttributes, computed, ref, shallowRef, watch } from 'vue';
	import FoxText from './FoxText.vue';

	const textInput = shallowRef<InstanceType<typeof FoxText>>(null!);
	const inputElement = computed(() => textInput.value.inputElement);

	const props = defineProps<{
		autofocus?: boolean;
		min?: number;
		max?: number;
		fractionDigits?: number;
		inputAttributes?: Partial<InputHTMLAttributes>;
	}>();

	const _modelValue = defineModel({ type: Number, required: true });
	const numberValue = computed({
		get: () => {
			return _modelValue.value;
		},
		set: (newNumber: number) => {
			if (props.min != null) newNumber = Math.max(props.min, newNumber);
			if (props.max != null) newNumber = Math.min(props.max, newNumber);
			if (inputElement.value?.matches(':focus')) {
				_modelValue.value = newNumber;
			};
		},
	});
	const formattedValue = computed(() => {
		return `${props.fractionDigits != null ? numberValue.value.toFixed(props.fractionDigits) : numberValue.value}`;
	});

	const stringValue = ref(formattedValue.value);
	const parsedValue = computed(() => {
		return Number(stringValue.value);
	});

	const valuesOutOfSync = computed(
		() => {
			return Number(formattedValue.value) !== parsedValue.value;
		}
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

	const emit = defineEmits<{
		(event: 'focus'): void;
		(event: 'blur'): void;
	}>();

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
