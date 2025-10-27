<template>
	<NumberInput
		class="DirectionInput__input"
		ref="numberInput"
		v-model="modelValue"
		v-bind="$attrs"
		:autofocus="props.autofocus"
		:fractionDigits="1"
	/>
	<Teleport to="body">
		<div
			v-if="focused"
			class="DirectionInput__tooltip"
			:style="tooltipStyle"
			@focusin.prevent
		>
			<div class="DirectionInput__tooltip__content" @pointerdown.prevent>
				<DirectionAlternateInput v-model:modelValue="modelValue" />
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.DirectionInput__input {
		flex: 1 0 auto;
	}

	.DirectionInput__tooltip {
		position: fixed;

		display: grid;
		grid-template-columns: max-content;
		grid-template-rows: max-content;

		background-color: var(--p-primary-contrast-color);
		border: 1px solid var(--p-inputtext-border-color);
		border-radius: var(--p-inputtext-border-radius);

		z-index: 1000000;
	}

	.DirectionInput__tooltip__content {
		display: flex;
		padding: 0.5em;
		overflow: auto;
	}
</style>

<script setup lang="ts">
	import { useElementBounding, useFocus, useWindowSize } from '@vueuse/core';
	import NumberInput from '../NumberInput.vue';
	import {
		StyleValue,
		computed,
		defineModel,
		nextTick,
		onMounted,
		shallowRef,
		watch,
	} from 'vue';
	import DirectionAlternateInput from './DirectionAlternateInput.vue';

	const numberInput = shallowRef<InstanceType<typeof NumberInput>>(null!);
	const inputElement = computed(() => numberInput.value?.textInput?.inputElement);
	const { focused } = useFocus(inputElement);
	const inputBounding = useElementBounding(inputElement);
	const windowSize = useWindowSize();

	watch(focused, (isFocused) => {
		if (!isFocused) return;
		inputBounding.update();
		setTimeout(() => inputBounding.update(), 100);
	});

	const tooltipVerticalDirection = computed(() =>
		inputBounding.top.value + inputBounding.height.value / 2 >
		windowSize.height.value / 2
			? 'top'
			: 'bottom'
	);

	const tooltipHorizontalDirection = computed(() =>
		inputBounding.left.value + inputBounding.width.value / 2 >
		windowSize.width.value / 2
			? 'right'
			: 'left'
	);

	const tooltipStyle = computed<StyleValue | undefined>(() => {
		if (!focused.value) return undefined;

		const output: StyleValue = {};

		if (tooltipVerticalDirection.value === 'top') {
			output.bottom = `calc(${windowSize.height.value - inputBounding.top.value}px + 0.25em)`;
		} else {
			output.top = `calc(${inputBounding.top.value + inputBounding.height.value}px + 0.25em)`;
		}

		if (tooltipHorizontalDirection.value === 'left') {
			output.left = `${inputBounding.left.value}px`;
		} else {
			output.right = `${windowSize.width.value - (inputBounding.left.value + inputBounding.width.value)}px`;
		}

		return output;
	});

	const props = defineProps<{
		autofocus?: boolean;
	}>();

	const modelValue = defineModel({ type: Number, required: true });

	onMounted(() => {
		if (props.autofocus) {
			nextTick(() => {
				inputElement.value?.select();
			});
		}
	});

	defineExpose({
		inputElement,
	});
</script>
