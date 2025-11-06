<template>
	<span
		ref="containerElement"
		v-bind="$attrs"
		class="FoxSelect__container"
		:class="{ 'FoxSelect__container--open': isOpen }"
		@click.stop.prevent="
			containerElement.focus();
			toggle();
		"
		@pointerdown.stop.prevent
		tabindex="0"
		@keydown.enter="toggle()"
		@keydown.space="toggle()"
		@keydown.escape="isOpen && close()"
		@keydown.delete="
			props.enableClear &&
				modelValue != null &&
				(submit(null), $event.stopPropagation())
		"
		@keydown.backspace="
			props.enableClear &&
				modelValue != null &&
				(submit(null), $event.stopPropagation())
		"
		@keydown.arrow-up="toggle()"
		@keydown.arrow-down="toggle()"
		@keydown.tab="isOpen && close()"
		@keydown.shift.tab="isOpen && close()"
	>
		<span v-if="modelValue != null && props.options.get(modelValue) != null" class="FoxSelect__label">
			<slot name="label" :value="modelValue">
				<Component
					v-if="props.options.get(modelValue)!.icon"
					:is="props.options.get(modelValue)!.icon"
					class="FoxSelect__icon"
				/>
				{{ props.options.get(modelValue)!.label }}
			</slot>
		</span>
		<span v-else class="FoxSelect__placeholder">
			<slot name="placeholder" />
		</span>

		<span class="FoxSelect__icons">
			<i
				v-if="modelValue != null && props.enableClear"
				class="pi pi-times"
				@click.stop.prevent="submit(null)"
			/>
			<i
				class="pi"
				:class="{ 'pi-angle-down': !isOpen, 'pi-angle-up': isOpen }"
			/>
		</span>
	</span>

	<ul
		ref="optionsElement"
		class="FoxSelect__options"
		popover
		@toggle="
			searchString = '';
			searchInputElement?.select();
			isOpen = optionsElement.matches(':popover-open');
		"
		@keydown.stop.arrow-up="focusPrevious()"
		@keydown.stop.arrow-down="focusNext()"
		@keydown.stop.enter="onOptionsEnter()"
		@keydown.stop.escape="close()"
		@focusout="!optionsElement.matches(':focus-within') && close()"
	>
		<slot
			name="search-input"
			v-if="props.enableSearch"
			:value="searchString"
			:update-value="(value: string) => (searchString = value)"
			:link-el="(el: HTMLInputElement) => (searchInputElement = el)"
		>
			<FoxText
				:ref="
					(el) =>
						(searchInputElement = (el as InstanceType<typeof FoxText>)
							?.inputElement)
				"
				v-model="searchString"
				placeholder="Search"
				@keydown.escape="
					searchString
						? ($event.stopPropagation(),
							$event.preventDefault(),
							(searchString = ''))
						: undefined
				"
			>
				<template #icons-after>
					<i v-if="!searchString" class="pi pi-search" />
					<i
						v-else
						class="pi pi-times"
						style="pointer-events: auto; cursor: pointer"
						@pointerdown.stop.prevent="searchString = ''"
					/>
				</template>
			</FoxText>
		</slot>
		<li
			class="FoxSelect__option"
			v-for="value in finalValues"
			:class="{
				'FoxSelect__option--selected': modelValue === value,
				'FoxSelect__option--focused': focused?.value === value,
			}"
			@pointerdown.stop.prevent="submit(value)"
		>
			<slot
				name="option-label"
				:value="value"
				:data="props.options.get(value)!"
				:selected="modelValue === value"
			>
				<Component
					v-if="props.options.get(value)!.icon"
					:is="props.options.get(value)!.icon"
					class="FoxSelect__icon"
				/>
				{{ props.options.get(value)!.label }}
			</slot>
		</li>
	</ul>
</template>

<style lang="scss">
	@use '@/styles/constants' as constants;
	@use '@/styles/mixins/border' as border;

	.FoxSelect__container {
		position: relative;
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		padding: 0.5em 0.75em;
		gap: 0.5em;

		color: var(--color-primary);

		border-radius: 0.25em;
		user-select: none;
		cursor: pointer;

		@include border.border-gradient();
		&:hover {
			@include border.border-gradient-hovered();
		}
		&.FoxSelect__container--open,
		&:focus {
			@include border.border-gradient-focused();
			outline: none;
		}
		@include border.border-gradient-transition();
	}

	.FoxSelect__label,
	.FoxSelect__placeholder,
	.FoxSelect__option {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
	}

	.FoxSelect__icon {
		width: 1.5em;
		height: 1.5em;
		margin: -0.25em 0;
	}

	.FoxSelect__placeholder {
		color: grey;
	}

	.FoxSelect__icons {
		display: flex;
		flex-direction: row;
		gap: 0.5em;

		> .pi {
			font-size: 1.25em;
		}
	}

	.FoxSelect__options {
		position: fixed;
		/*
		inset: auto;
		top: anchor(bottom);
		bottom: 0;
		left: anchor(left);
		right: anchor(right);
		*/
		position-area: bottom span-right;
		width: auto;
		min-width: anchor-size(width);
		max-height: 100%;
		position-try-fallbacks:
			flip-block,
			bottom span-left,
			top span-left;
		margin: 0;
		padding: 0;
		border: none;
		background: canvas;
		overflow: auto;

		/* display: flex; */
		flex-direction: column;
		align-items: stretch;
		margin: 0;
		padding: 0.125em;
		gap: 0.125em;
		border-radius: 0.25em;

		transition: transform 0.1s ease-in-out;
		transition-behavior: allow-discrete;
		transform-origin: top center;

		&:popover-open {
			display: flex;
			transform: rotateX(0);

			@starting-style {
				transform: rotateX(90deg);
			}
		}

		.FoxSelect__option:hover,
		.FoxSelect__option.FoxSelect__option--focused {
			@include border.border-gradient-focused();
			outline: none;
			--_background: linear-gradient(#{constants.$dark});
		}

		.FoxSelect__option:hover {
			@include border.border-gradient-hovered();
		}

		&:hover .FoxSelect__option.FoxSelect__option--focused:not(:hover) {
			--_background: linear-gradient(canvas);
		}
	}

	.FoxSelect__option {
		border-radius: inherit;
		padding: 0.5em 0.75em;
		cursor: pointer;

		color: var(--color-primary);
		--_background: linear-gradient(canvas);

		@include border.border-gradient();
		/*
		&.FoxSelect__option--selected {
			@include border.border-gradient-focused();
		}
		*/
		@include border.border-gradient-transition();
	}
</style>

<script setup lang="ts">
	import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue';
	import FoxText from './FoxText.vue';

	const containerElement = shallowRef<HTMLSpanElement>(null!);
	const optionsElement = shallowRef<HTMLDivElement>(null!);
	const searchInputElement = shallowRef<HTMLInputElement | undefined>(
		undefined
	);

	const modelValue = defineModel<any>('modelValue', { required: true });
	const searchString = ref('');
	const isOpen = ref(false);

	const props = defineProps<{
		options: Map<
			any,
			{ label: string; searchKeys?: string[]; icon?: any; order?: number }
		>;
		disabled?: boolean;
		autofocus?: boolean;
		enableSearch?: boolean;
		enableClear?: boolean;
	}>();

	// TODO : optimize this
	const filteredValues = computed(() => {
		const output: typeof props.options = new Map();
		for (const [value, data] of props.options.entries()) {
			if (
				[data.label, ...(data.searchKeys ?? [])].some((key) =>
					key.toLowerCase().includes(searchString.value.toLowerCase())
				)
			) {
				output.set(value, data);
			}
		}
		return output;
	});

	const finalValues = computed(() => {
		return Array.from(filteredValues.value.entries())
			.sort(([_valueA, dataA], [_valueB, dataB]) =>
				dataA.order != null && dataB.order != null
					? dataA.order - dataB.order
					: 0 || dataA.label.localeCompare(dataB.label)
			)
			.map(([value]) => value);
	});

	const focused = shallowRef<{ index: number; value: any } | undefined>(
		undefined
	);
	const checkFocused = () => {
		const focusedValue = focused.value?.value ?? modelValue.value;
		if (!filteredValues.value.has(focusedValue)) {
			focused.value = undefined;
		} else {
			const newIndex = finalValues.value.indexOf(focusedValue);
			if (newIndex !== focused.value?.index) {
				focused.value = {
					index: newIndex,
					value: focusedValue,
				};
			}
		}
	};
	const focusNext = () => {
		if (focused.value == null) {
			focused.value = {
				index: 0,
				value: finalValues.value[0],
			};
		} else if (focused.value.index < finalValues.value.length - 1) {
			focused.value = {
				index: focused.value.index + 1,
				value: finalValues.value[focused.value.index + 1],
			};
		}
	};
	const focusPrevious = () => {
		if (focused.value == null) {
			focused.value = {
				index: finalValues.value.length - 1,
				value: finalValues.value[finalValues.value.length - 1],
			};
		} else if (focused.value.index > 0) {
			focused.value = {
				index: focused.value.index - 1,
				value: finalValues.value[focused.value.index - 1],
			};
		}
	};

	const open = () => {
		if (props.disabled) return;
		optionsElement.value.togglePopover(<any>{
			source: containerElement.value,
			force: true,
		});
	};
	const close = () => {
		optionsElement.value.togglePopover(<any>{
			source: containerElement.value,
			force: false,
		});
	};
	const toggle = () => {
		if (isOpen.value) {
			close();
		} else {
			open();
		}
	};

	const submit = (value?: any) => {
		modelValue.value = value;
		close();
	};

	const focus = () => containerElement.value!.focus();

	const blur = () => containerElement.value!.blur();

	watch([isOpen], () => {
		focused.value = undefined;
		checkFocused();
	});

	watch(
		[modelValue, () => finalValues.value.length],
		() => {
			checkFocused();
		},
		{ immediate: true }
	);

	watch(
		() => props.disabled,
		() => {
			if (props.disabled) {
				close();
			}
		}
	);

	onMounted(() => {
		if (props.autofocus) {
			nextTick(() => {
				focus();
			});
		}
	});

	const onOptionsEnter = () => {
		let newValue = focused.value;
		if (newValue == null && finalValues.value.length === 1)
			newValue = { index: 0, value: finalValues.value[0] };
		if (newValue == null && !props.enableClear) return;

		submit(newValue?.value);
	};

	defineExpose({
		containerElement,
		optionsElement,
		searchInputElement,

		open,
		close,
		toggle,
		focus,
		blur,
		submit,
	});
</script>
