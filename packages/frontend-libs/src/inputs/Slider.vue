<template>
	<div
		ref="sliderContainer"
		class="Slider__container"
		:class="{
			'Slider__container--horizontal': !props.vertical,
			'Slider__container--vertical': props.vertical,
			'Slider__container--dragging': isDragging,
		}"
		:style="{
			'--_slider-percent': `${(props.modelValue / (props.max - props.min)) * 100}%`,
		}"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerUp"
	>
		<div class="Slider__track" />
		<div class="Slider__handle" />
	</div>
</template>

<style lang="scss">
	.Slider__container {
		display: flex;
		flex-direction: row;
		align-items: center;
		cursor: pointer;
		&.Slider__container--dragging {
			cursor: grabbing;
		}

		&--horizontal {
			min-width: 5em;
			height: 1em;
		}
		&--vertical {
			min-height: 5em;
			width: 1em;
		}
	}

	.Slider__track {
		color: var(--border-color_darker);

		.Slider__container--horizontal & {
			max-height: 0;
			width: 100%;
			border-bottom: 2px solid;
		}
		.Slider__container--vertical & {
			max-width: 0;
			height: 100%;
			border-right: 2px solid;
		}
	}

	.Slider__handle {
		position: absolute;
		color: var(--color-selected);
		background: var(--color-primary);
		width: 1em;
		height: 1em;
		border-radius: 50%;
		border: 1px solid;
		transform: translate(-50%, -50%);

		cursor: grab;
		.Slider__container--dragging & {
			cursor: grabbing;
		}

		.Slider__container--horizontal & {
			top: 50%;
			left: var(--_slider-percent);
		}
		.Slider__container--vertical & {
			top: var(--_slider-percent);
			left: 50%;
		}
	}
</style>

<script setup lang="ts">
	import { ref, shallowRef } from 'vue';

	const props = defineProps<{
		min: number;
		max: number;
		modelValue: number;
		vertical?: boolean;
	}>();

	const emit = defineEmits<{
		(e: 'update:modelValue', value: number): void;
		(e: 'change', value: number): void;
	}>();

	const sliderContainer = shallowRef<HTMLDivElement>(null!);

	const isDragging = ref(false);
	const onPointerDown = (event: PointerEvent) => {
		console.log('onPointerDown');
		isDragging.value = true;
		event.preventDefault();
		event.stopPropagation();
		sliderContainer.value.setPointerCapture(event.pointerId);
		onPointerMove(event);
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!isDragging.value) return;
		console.log('onPointerMove');
		event.preventDefault();
		event.stopPropagation();
		const bounding = sliderContainer.value.getBoundingClientRect();
		const offset = props.vertical
			? event.clientY - bounding.top
			: event.clientX - bounding.left;
		const offsetPercentage =
			offset / (props.vertical ? bounding.height : bounding.width);

		const newValue =
			Math.max(0, Math.min(1, offsetPercentage)) * (props.max - props.min) +
			props.min;
		emit('update:modelValue', newValue);
	};

	const onPointerUp = (event: PointerEvent) => {
		console.log('onPointerUp');
		isDragging.value = false;
		event.preventDefault();
		event.stopPropagation();
		sliderContainer.value.releasePointerCapture(event.pointerId);
		emit('change', props.modelValue);
	};
</script>
