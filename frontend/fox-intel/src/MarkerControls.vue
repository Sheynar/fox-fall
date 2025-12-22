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
		<div class="MarkerControls__entry">
			<label>Color</label>
			<FoxText v-model="markerColor" />
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
</style>

<script setup lang="ts">
	import FoxText from '@packages/frontend-libs/dist/inputs/FoxText.vue';
	import NumberInput from '@packages/frontend-libs/dist/inputs/NumberInput.vue';
	import { MarkerType } from './rendering/marker';
	import {
		markerColor,
		markerDisabled,
		markerSize,
		markerType,
	} from './lib/globals';
</script>
