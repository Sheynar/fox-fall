<template>
	<div
		class="RadialMenu__container"
		:style="{
			'--_radial-menu-layer-count': Math.min(MAX_VISIBLE_LAYERS, layers.length),
		}"
		@pointerdown.stop
	>
		<ul
			v-for="layer in layers"
			:key="layer.id"
			class="RadialMenu__layer"
			:style="{
				'--_radial-menu-layer-index': layers.length - layer.index - 1,
				'--_options-count': layer.options.size,
			}"
		>
			<li
				v-for="(value, index) in getSortedValues(layer.options)"
				:key="index"
				class="RadialMenu__option-outer"
				:class="{
					'RadialMenu__option--selected': layer.selection === value,
				}"
				:style="{
					'--_option-index': index,
					opacity: layers.length - layer.index <= MAX_VISIBLE_LAYERS ? 1 : 0,
				}"
				@pointerdown.stop.prevent="select(value, layer.index)"
				@pointerover="hover(layer.options.get(value)!)"
				@pointermove="hover(layer.options.get(value)!)"
				@pointerout="unhover(layer.options.get(value)!)"
			>
				<div class="RadialMenu__option-intermediate">
					<div class="RadialMenu__option-inner">
						<Component
							class="RadialMenu__icon"
							v-if="layer.options.get(value)!.icon"
							:is="layer.options.get(value)!.icon"
						/>
					</div>
				</div>
			</li>
		</ul>
		<li class="RadialMenu__center-outer" @pointerdown.stop.prevent="back()">
			<div class="RadialMenu__center-inner">
				<template v-if="hoveredOption">
					<span class="RadialMenu__option-label">
						{{ hoveredOption.label }}
					</span>
				</template>
				<slot v-else-if="layers.length > 1" name="back-icon">
					<i class="RadialMenu__icon pi pi-arrow-circle-left" />
				</slot>
				<slot v-else name="cancel-icon">
					<i class="RadialMenu__icon pi pi-times" />
				</slot>
			</div>
		</li>
	</div>
</template>

<style lang="scss">
	@use '@/styles/constants' as constants;
	@use '@/styles/mixins/border' as border;

	@property --_radial-menu-inner-radius {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	@property --_radial-menu-outer-radius {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	@property --_radial-menu-layer-count {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	@property --_radial-layer-inner-radius {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	@property --_radial-layer-outer-radius {
		syntax: '<number>';
		inherits: true;
		initial-value: 0;
	}

	@property --_segment-scale {
		syntax: '<number>';
		inherits: true;
		initial-value: 1;
	}

	.RadialMenu__container {
		transition: --_radial-menu-outer-radius 0.25s ease-in-out;

		--_radial_menu_layer_height: 10;
		--_radial-menu-outer-radius: calc(
			var(--_radial-menu-inner-radius) + var(--_radial_menu_layer_height) *
				var(--_radial-menu-layer-count) + 1
		);

		--_radial-menu-inner-radius: 10;

		position: fixed;
		inset: 0;

		height: calc(var(--_radial-menu-outer-radius) * 2vmin);
		margin: 0;
		padding: 0;
		border-radius: 50%;
		aspect-ratio: 1;
		background: rgba(0, 0, 0, 0.5);

		font-size: calc(var(--_radial_menu_layer_height) * 2vmin / 10);
		cursor: pointer;
		user-select: none;

		transform: translate(-50%, -50%);
	}

	.RadialMenu__layer {
		display: contents;

		@starting-style {
			--_radial-layer-inner-radius: calc(
				var(--_radial-menu-inner-radius) + var(--_radial_menu_layer_height) *
					(var(--_radial-menu-layer-index) - 1)
			);
		}
		transition: --_radial-layer-inner-radius 0.25s ease-in-out;

		--_radial-layer-inner-radius: calc(
			var(--_radial-menu-inner-radius) + (var(--_radial_menu_layer_height) + 1) *
				var(--_radial-menu-layer-index) + 1
		);
		--_chord-width-inner: calc(
			var(--_radial-layer-inner-radius) *
				sin(360deg / var(--_options-count) / 2) * 2
		);
		--_chord-arc-height-inner: calc(
			(var(--_radial-layer-inner-radius)) - sqrt(
					pow(var(--_radial-layer-inner-radius), 2) - pow(
							var(--_chord-width-inner) / 2,
							2
						)
				)
		);

		--_radial-layer-outer-radius: calc(
			var(--_radial-layer-inner-radius) + var(--_radial_menu_layer_height)
		);
		--_chord-width-outer: calc(
			var(--_radial-layer-outer-radius) *
				sin(360deg / var(--_options-count) / 2) * 2
		);
		--_chord-arc-height-outer: calc(
			(var(--_radial-layer-outer-radius)) - sqrt(
					pow(var(--_radial-layer-outer-radius), 2) - pow(
							var(--_chord-width-outer) / 2,
							2
						)
				)
		);

		--_segment-height: calc(
			var(--_radial-layer-outer-radius) - var(--_radial-layer-inner-radius) +
				var(--_chord-arc-height-inner)
		);
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
							var(--_radial-layer-inner-radius) - var(--_chord-arc-height-inner)
						) * 1vmin
				)
			);
		transform-origin: 50% 50%;

		display: block;
		pointer-events: none;
		opacity: 1;
		transition: opacity 0.25s ease-in-out;

		@starting-style {
			opacity: 0;
		}

		--_clip-path: shape(
			from 0% calc(var(--_chord-arc-height-outer) * 1vmin),
			arc to 100% calc(var(--_chord-arc-height-outer) * 1vmin) of
				calc((var(--_radial-layer-outer-radius)) * 1vmin) cw,
			line to calc(50% + (var(--_chord-width-inner) * 1vmin / 2)) 100%,
			arc to calc(50% - (var(--_chord-width-inner) * 1vmin / 2)) 100% of
				calc((var(--_radial-layer-inner-radius)) * 1vmin) ccw,
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
						(var(--_radial-layer-inner-radius) - var(--_chord-arc-height-inner)) *
						1vmin
				);
			transition: transform 0.1s ease-in-out;
		}
	}

	.RadialMenu__option-inner {
		transform: translateY(calc(-0.5vmin * var(--_chord-arc-height-inner)))
			rotate(calc(var(--_option-angle) * -1));
		transform-origin: 50% 50%;
		margin-bottom: calc(var(--_radial-layer-outer-radius) / 5);

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
		padding: 1em;
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

	.RadialMenu__option--selected .RadialMenu__option-intermediate {
		background-image: linear-gradient(to bottom, #{constants.$selected_foreground}, #{constants.$dark});
	}

	.RadialMenu__option-outer:hover {
		--_segment-scale: 1.2;
	}

	.RadialMenu__icon {
		font-size: 300% !important;
	}
</style>

<script lang="ts">
	const MAX_VISIBLE_LAYERS = 2;
</script>

<script setup lang="ts">
	import { generateId } from '@packages/data/dist/id';
	import { ref, shallowRef } from 'vue';

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

	const id = shallowRef(0);
	const hoveredOption = shallowRef<Option<any> | null>(null);

	type Layer = {
		id: string;
		index: number;
		options: Options<any>;
		selection?: any;
	};
	const layers = ref<Layer[]>([
		{
			id: generateId(),
			index: 0,
			options: props.options,
			selection: undefined,
		},
	]);

	const getSortedValues = <T,>(options: Options<T>): T[] => {
		return Array.from(options.entries())
			.sort(
				([_valueA, optionA], [_valueB, optionB]) =>
					(optionA.order ?? 0) - (optionB.order ?? 0) ||
					optionA.label.localeCompare(optionB.label)
			)
			.map(([value]) => value);
	};

	const hover = (option: Option<any>) => {
		hoveredOption.value = option;
	};

	const unhover = (option: Option<any>) => {
		if (hoveredOption.value === option) {
			hoveredOption.value = null;
		}
	};

	const select = (value: any, layerIndex: number) => {
		const layer = layers.value[layerIndex];
		layer.selection = value;
		const newLayers: Layer[] = [
			...layers.value.slice(0, layerIndex),
			{
				...layer,
				selection: value,
			},
		];

		const childOptions = layer.options.get(value)?.subOptions;
		if (childOptions != null) {
			newLayers.push({
				id: generateId(),
				index: layerIndex + 1,
				options: childOptions,
				selection: undefined,
			});
		} else {
			emit('submit', { value, path: newLayers.map((layer) => layer.selection) });
		}
		layers.value = newLayers;

		if (childOptions?.size === 1) {
				select(childOptions.keys().next().value, layerIndex + 1);
			}
	};

	const back = () => {
		for (let i = layers.value.length - 1; i >= 0; i--) {
			if (layers.value[i].selection != null) {
				id.value++;
				layers.value[i].selection = undefined;
				layers.value = layers.value.slice(0, i + 1);
				return;
			}
		}
		emit('cancel');
	};
</script>
