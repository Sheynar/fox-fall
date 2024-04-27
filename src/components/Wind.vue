<template>
	<div
		class="Wind__container"
		:class="{ Wind__open: open }"
		@pointerdown.stop="open = !open"
		@touchstart.stop
	>
		<WindIcon
			class="Wind__indicator"
			:style="{
				'--wind-deg': wind.azimuth,
				'--viewport-deg': viewport.rotation,
			}"
		/>
		<div class="Wind_information">
			<span>Wind direction: {{ wind.azimuth.toFixed(1) }}°</span>
			<span>Wind distance: {{ wind.distance }}</span>
			<button
				class="Wind__button"
				@pointerdown.stop="emit('reset')"
			>
				Reset
			</button>
		</div>
	</div>
</template>

<style lang="scss">
	.Wind__container {
		&:not(.Wind__open) {
			.Wind_information {
				display: none;
			}
		}

		&.Wind__open {
			display: flex;
			flex-direction: column;
			align-items: center;

			padding: 1em;
			gap: 0.5em;
			border: 1px solid;

			background: black;
		}

		cursor: pointer;
		user-select: none;
	}

	.Wind__indicator {
		height: 5em;
		width: 5em;

		border-radius: 50%;

		transform: rotate(calc((var(--wind-deg) + var(--viewport-deg)) * 1deg + 180deg));
		transform-origin: 50% 50%;
	}

	.Wind_information {
		display: contents;
	}

	.Wind__button {
		color: inherit;
		font-size: inherit;
	}
</style>

<script setup lang="ts">
	import { ref } from 'vue';
	import WindIcon from '@/components/icons/WindIcon.vue';
	import { injectViewport } from '@/contexts/viewport';
	import { injectWind } from '@/contexts/wind';
	import { Vector } from '@/lib/vector';

	const emit = defineEmits<{
		(event: 'reset'): void;
	}>();

	const viewport = injectViewport();
	const wind = injectWind();

	const open = ref(false);
</script>
