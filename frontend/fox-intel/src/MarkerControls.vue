<template>
	<div class="MarkerControls__container" @pointerdown.stop @keydown.stop>
		<div class="MarkerControls__entry">
			<button
				class="MarkerControls__button"
				:class="{
					'MarkerControls__button-active': markerDisabled,
				}"
				@pointerdown.stop="markerDisabled = true"
			>
				<i class="pi pi-arrows-alt" />
			</button>
			<button
				class="MarkerControls__button"
				:class="{
					'MarkerControls__button-active':
						!markerDisabled && markerType === MarkerType.Pen,
				}"
				@pointerdown.stop="
					markerDisabled = false;
					markerType = MarkerType.Pen;
				"
			>
				<i class="pi pi-pencil" />
			</button>
			<button
				class="MarkerControls__button"
				:class="{
					'MarkerControls__button-active':
						!markerDisabled && markerType === MarkerType.Erase,
				}"
				@pointerdown.stop="
					markerDisabled = false;
					markerType = MarkerType.Erase;
				"
			>
				<i class="pi pi-eraser" />
			</button>
		</div>

		<div class="MarkerControls__entry">
			<label>Size</label>
			<NumberInput v-model="markerSize" />
		</div>
		<div class="MarkerControls__entry" ref="colorPickerContainer" tabindex="0">
			<label>Color</label>
			<div class="MarkerControls__color-picker-container">
				<div class="MarkerControls__color-indicator" :style="{ backgroundColor: markerColor, width: '2em', height: '2em', borderRadius: '0.5em' }"></div>
				<Vue3ColorPicker
					class="MarkerControls__color-picker"
					v-model="markerColor"
					theme="dark"
					mode="solid"
					:showPickerMode="false"
					:show-color-list="false"
					@pointerdown.stop="colorPickerContainer?.focus()"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.MarkerControls__container {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		background-color: rgba(0, 0, 0, 0.5);
		padding: 1em;
		border-radius: 0.5em;
		gap: 1em;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.MarkerControls__entry {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
	}

	.MarkerControls__button {
		padding: 0.5em;
		border-radius: 0.5em;
		background-color: rgba(0, 0, 0, 0.5);
		color: var(--color-primary);

		&-active {
			background-color: rgba(255, 255, 255, 0.5);
			color: var(--color-primary-contrast);
		}
	}

	.MarkerControls__color-picker-container {
		position: relative;

		.MarkerControls__entry:not(:focus-within) & .MarkerControls__color-picker {
			display: none;
		}
	}

	.MarkerControls__color-picker {
		position: absolute;
		top: auto;
		bottom: 110%;
		left: 50%;
		transform: translateX(-50%);
	}
</style>

<script setup lang="ts">
	import { Vue3ColorPicker } from '@cyhnkckali/vue3-color-picker';
	import NumberInput from '@packages/frontend-libs/dist/inputs/NumberInput.vue';
	import { MarkerType } from './rendering/marker';
	import {
		markerColor,
		markerDisabled,
		markerSize,
		markerType,
	} from './lib/globals';
	import { shallowRef, watchEffect } from 'vue';

	const colorPickerContainer = shallowRef<HTMLDivElement | null>(null);

	watchEffect(() => {
		console.log(markerColor.value);
	});
</script>
