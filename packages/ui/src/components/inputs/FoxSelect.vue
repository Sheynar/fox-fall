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
		@keydown.stop.enter="toggle()"
		@keydown.stop.space="toggle()"
		@keydown.stop.escape="
			isOpen ? close() : props.enableClear ? submit(null) : undefined
		"
		@keydown.stop.arrow-up="toggle()"
		@keydown.stop.arrow-down="toggle()"
		@keydown.stop.tab="close()"
		@keydown.stop.shift.tab="close()"
	>
		<span v-if="modelValue != null" class="FoxSelect__label">
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
		@focusout="!optionsElement.matches(':focus-within') && false && close()"
	>
		<slot
			name="search-input"
			v-if="props.enableSearch"
			:value="searchString"
			:update-value="(value: string) => (searchString = value)"
			:link-el="(el: HTMLInputElement) => (searchInputElement = el)"
		>
			<TextInput
				:ref="
					(el) =>
						(searchInputElement = (el as InstanceType<typeof TextInput>)
							?.inputElement)
				"
				v-model="searchString"
				placeholder="Search"
			/>
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
	.FoxSelect__container {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		padding: 0.5em 0.75em;
		gap: 0.5em;

		border: 1px solid;
		border-radius: 0.25em;
		user-select: none;
		cursor: pointer;

		&.FoxSelect__container--open,
		&:focus {
			border-color: var(--color-selected);
			outline: 1px solid var(--color-selected);
		}
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

		&:popover-open {
			display: flex;
			transform: translateY(0);
			clip-path: inset(0 0 0 0);

			@starting-style {
				transform: translateY(-100%);
				clip-path: inset(100% 0 0 0);
			}
		}
		flex-direction: column;
		align-items: stretch;
		margin: 0;
		padding: 0.25em;
		gap: 0.125em;
		border-radius: 0.25em;

		transition:
			transform 0.1s ease-in-out,
			clip-path 0.1s ease-in-out;
		transition-behavior: allow-discrete;
		transform: translateY(0);
		clip-path: inset(0 0 0 0);
	}

	.FoxSelect__option {
		border-radius: inherit;
		padding: 0.5em 0.75em;
		background: var(--color-primary-contrast);
		cursor: pointer;
		border: 1px solid transparent;

		&:hover,
		&.FoxSelect__option--focused {
			border: 1px dashed var(--color-selected);
		}

		&.FoxSelect__option--selected {
			border: 1px solid var(--color-selected);
		}
	}
</style>

<script setup lang="ts">
	import { computed, ref, shallowRef, watch } from 'vue';
	import TextInput from './TextInput.vue';

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

	const open = () => {
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

	const onOptionsEnter = () => {
		let newValue = focused.value;
		if (newValue == null && finalValues.value.length === 1)
			newValue = { index: 0, value: finalValues.value[0] };
		if (newValue == null && !props.enableClear) return;

		submit(newValue?.value);
	};
</script>
