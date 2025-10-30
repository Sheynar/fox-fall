<template>
	<ul
		class="RadialMenu__container"
		:style="{
			'--_options-count': availableOptions.size,
		}"
		@pointerdown.stop
	>
		<li
			v-for="(value, index) in finalValues"
			:key="index"
			class="RadialMenu__option-outer"
			:style="{ '--_option-index': index }"
			@pointerdown.stop.prevent="select(value)"
			@pointerover="hover(value)"
			@pointermove="hover(value)"
			@pointerout="unhover(value)"
		>
			<div class="RadialMenu__option-intermediate">
				<div class="RadialMenu__option-inner">
					<Component
						class="RadialMenu__icon"
						v-if="availableOptions.get(value)!.icon"
						:is="availableOptions.get(value)!.icon"
					/>
				</div>
			</div>
		</li>
		<li class="RadialMenu__center-outer" @pointerdown.stop.prevent="back()">
			<div class="RadialMenu__center-inner">
				<template v-if="hoveredOption">
					<span class="RadialMenu__option-label">
						{{ hoveredOption.label }}
					</span>
				</template>
				<slot v-else-if="selections.length > 0" name="back-icon">
					<i class="RadialMenu__icon pi pi-arrow-circle-left" />
				</slot>
				<slot v-else name="cancel-icon">
					<i class="RadialMenu__icon pi pi-times" />
				</slot>
			</div>
		</li>
	</ul>
</template>

<style lang="scss">
	@use '@/styles/constants' as constants;
	@use '@/styles/mixins/border' as border;

	@property --_segment-scale {
		syntax: '<number>';
		inherits: true;
		initial-value: 1;
	}

	.RadialMenu__container {
		--_radial-menu-outer-radius: 20;
		--_chord-width-outer: calc(
			var(--_radial-menu-outer-radius) * sin(360deg / var(--_options-count) / 2) *
				2
		);
		--_chord-arc-height-outer: calc(
			(var(--_radial-menu-outer-radius)) - sqrt(
					pow(var(--_radial-menu-outer-radius), 2) - pow(
							var(--_chord-width-outer) / 2,
							2
						)
				)
		);

		--_radial-menu-inner-radius: 10;
		--_chord-width-inner: calc(
			var(--_radial-menu-inner-radius) * sin(360deg / var(--_options-count) / 2) *
				2
		);
		--_chord-arc-height-inner: calc(
			(var(--_radial-menu-inner-radius)) - sqrt(
					pow(var(--_radial-menu-inner-radius), 2) - pow(
							var(--_chord-width-inner) / 2,
							2
						)
				)
		);

		--_segment-height: calc(
			var(--_radial-menu-outer-radius) - var(--_radial-menu-inner-radius) +
				var(--_chord-arc-height-inner)
		);

		position: fixed;
		inset: 0;

		height: calc(var(--_radial-menu-outer-radius) * 2vmin);
		margin: 0;
		padding: 0;
		border-radius: 50%;
		aspect-ratio: 1;
		background: rgba(0, 0, 0, 0.5);

		font-size: calc(var(--_radial-menu-outer-radius) * 1vmin / 10);
		cursor: pointer;
		user-select: none;

		transform: translate(-50%, -50%);
	}

	.RadialMenu__option-outer {
		--_option-angle: calc(
			var(--_option-index) * 360deg / var(--_options-count)
		);

		height: calc(var(--_segment-height) * 1vmin);
		width: calc(var(--_chord-width-outer) * 1vmin);

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(var(--_option-angle))
			translate(
				0,
				calc(
					-50% - (
							var(--_radial-menu-inner-radius) - var(--_chord-arc-height-inner)
						) * 1vmin
				)
			);
		transform-origin: 50% 50%;

		display: block;
		pointer-events: none;

		/*
		clip-path: shape(
			from 0% calc(var(--_chord-arc-height-outer) * 1vmin),
			line to 0% 0%,
			arc to 100% 0% of calc((var(--_radial-menu-outer-radius)) * 1vmin) cw,
			line to 100% calc(var(--_chord-arc-height-outer) * 1vmin),
			line to calc(50% + (var(--_chord-width-inner) * 1vmin / 2)) 100%,
			arc to calc(50% - (var(--_chord-width-inner) * 1vmin / 2)) 100% of
				calc((var(--_radial-menu-inner-radius)) * 1vmin) ccw,
			close
		);
		*/

		--_clip-path: shape(
			from 0% calc(var(--_chord-arc-height-outer) * 1vmin),
			arc to 100% calc(var(--_chord-arc-height-outer) * 1vmin) of
				calc((var(--_radial-menu-outer-radius)) * 1vmin) cw,
			line to calc(50% + (var(--_chord-width-inner) * 1vmin / 2)) 100%,
			arc to calc(50% - (var(--_chord-width-inner) * 1vmin / 2)) 100% of
				calc((var(--_radial-menu-inner-radius)) * 1vmin) ccw,
			close
		);

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			clip-path: var(--_clip-path);
			z-index: -1;
			pointer-events: auto;
			user-select: none;
		}

		.RadialMenu__option-intermediate {
			position: absolute;
			inset: 0;
			clip-path: var(--_clip-path);

			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			pointer-events: auto;

			transform: scale(var(--_segment-scale));
			transform-origin: 50%
				calc(
					100% +
						(var(--_radial-menu-inner-radius) - var(--_chord-arc-height-inner)) *
						1vmin
				);
			transition: transform 0.1s ease-in-out;
		}
	}

	.RadialMenu__option-inner {
		transform: translateY(calc(-0.5vmin * var(--_chord-arc-height-inner)))
			rotate(calc(var(--_option-angle) * -1));
		transform-origin: 50% 50%;
		margin-bottom: calc(var(--_radial-menu-outer-radius) / 5);

		width: 50%;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 0.25em;
	}

	.RadialMenu__center-outer {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: calc(var(--_radial-menu-inner-radius) * 2vmin);
		height: calc(var(--_radial-menu-inner-radius) * 2vmin);
		display: block;
		pointer-events: none;
	}

	.RadialMenu__center-inner {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		overflow: hidden;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 0.25em;

		transform: scale(var(--_segment-scale));
		transform-origin: 50% 50%;
		transition: transform 0.1s ease-in-out;
		pointer-events: auto;
	}

	.RadialMenu__option-intermediate,
	.RadialMenu__center-inner {
		background: 100% 75% / 200% 200% no-repeat
			radial-gradient(canvas, #{constants.$dark});
	}

	.RadialMenu__option-outer:hover {
		--_segment-scale: 1.2;
	}

	.RadialMenu__icon {
		font-size: 300% !important;
	}
</style>

<script setup lang="ts">
	import { computed, markRaw, shallowRef } from 'vue';

	export type Option<T> = {
		label: string;
		icon?: string;
		disabled?: boolean;
		order?: number;

		subOptions?: Options<T>;
	};

	export type Options<T> = Map<T, Option<T>>;

	const props = defineProps<{
		options: Options<any>;
	}>();

	const emit = defineEmits<{
		(e: 'cancel'): void;
		(e: 'submit', payload: { value: any; path: any[] }): void;
	}>();

	const selections = shallowRef<any[]>([]);
	const hoveredValue = shallowRef<any | null>(null);

	const availableOptions = computed(() => {
		return selections.value.reduce(
			(acc: Options<any>, selection): Options<any> => {
				return acc.get(markRaw(selection))!.subOptions ?? new Map();
			},
			props.options
		);
	});

	const hoveredOption = computed(() => {
		return hoveredValue.value != null
			? availableOptions.value.get(hoveredValue.value)
			: null;
	});

	const finalValues = computed(() => {
		return Array.from(availableOptions.value.entries())
			.sort(
				([_valueA, optionA], [_valueB, optionB]) =>
					(optionA.order ?? 0) - (optionB.order ?? 0) ||
					optionA.label.localeCompare(optionB.label)
			)
			.map(([value]) => value);
	});

	const hover = (value: any) => {
		hoveredValue.value = value;
	};

	const unhover = (value: any) => {
		if (hoveredValue.value === value) {
			hoveredValue.value = null;
		}
	};

	const select = (value: any) => {
		const option = availableOptions.value.get(value)!;
		if (option.subOptions != null) {
			selections.value = [...selections.value, value];
			if (option.subOptions.size === 1) {
				return select(option.subOptions.keys().next().value);
			}
			return;
		}

		emit('submit', {
			value,
			path: JSON.parse(JSON.stringify(selections.value)),
		});
		selections.value = [];
	};

	const back = () => {
		if (selections.value.length === 0) {
			emit('cancel');
			return;
		}
		selections.value = selections.value.slice(0, -1);
	};
</script>
