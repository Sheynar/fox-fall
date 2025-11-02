<template>
	<label
		ref="containerElement"
		class="FoxText__container"
		@pointerdown.prevent="
			!inputElement?.matches(':focus-within')
				? ($event.stopPropagation(), inputElement?.focus())
				: undefined
		"
	>
		<span
			class="FoxText__icons FoxText__icons-before"
			v-if="$slots['icons-before']"
		>
			<slot name="icons-before" />
		</span>
		<input
			class="FoxText__input"
			type="text"
			ref="inputElement"
			:placeholder="props.placeholder"
			:readonly="props.readonly"
			:disabled="props.disabled"
			v-model="modelValue"
			@focus="inputElement?.select()"
			@pointerdown.stop
			@pointerup.stop.prevent
		/>
		<span
			class="FoxText__icons FoxText__icons-after"
			v-if="$slots['icons-after']"
		>
			<slot name="icons-after" />
		</span>
	</label>
</template>

<style lang="scss">
	@use '@/styles/mixins/border' as border;

	.FoxText__container {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
		cursor: text;

		@include border.border-gradient();
		border-radius: 0.25em;

		&:hover {
			@include border.border-gradient-hovered();
		}

		&:focus,
		&:focus-within {
			@include border.border-gradient-focused();
			outline: none;
		}
		@include border.border-gradient-transition();
	}

	.FoxText__icons {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;

		&-before {
			margin-left: 0.5em;
		}
		&-after {
			margin-right: 0.5em;
		}

		> .pi {
			font-size: 1.25em;
		}
	}

	.FoxText__input {
		background: transparent;
		padding: 0.5em 0.75em;
		margin: 0;
		border: none;
		outline: none;
		flex: 1;
		font-size: inherit;
	}
</style>

<script setup lang="ts">
	import { onMounted, shallowRef } from 'vue';

	const containerElement = shallowRef<HTMLLabelElement>(null!);
	const inputElement = shallowRef<HTMLInputElement>(null!);

	const modelValue = defineModel<string>('modelValue', { required: true });

	const props = defineProps<{
		autofocus?: boolean;
		placeholder?: string;
		readonly?: boolean;
		disabled?: boolean;
	}>();

	const focus = () => {
		inputElement.value.focus();
	};

	onMounted(() => {
		if (props.autofocus) {
			inputElement.value.focus();
		}
	});

	defineExpose({
		containerElement,
		inputElement,

		focus,
	});
</script>
