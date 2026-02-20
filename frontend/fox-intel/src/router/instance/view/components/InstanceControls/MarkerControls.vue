<template>
	<div class="MarkerControls__container" @pointerdown.stop @keydown.stop @wheel.stop.prevent>
		<div class="MarkerControls__entry">
			<label>Size</label>
			<NumberInput v-model="markerSize" />
		</div>
		<div class="MarkerControls__entry">
			<label>Color</label>
			<ColorInput v-model="markerColor" />
		</div>
		<div class="MarkerControls__entry">
			<button class="MarkerControls__button" :class="{
				'MarkerControls__button-active':
					!markerDisabled && markerType === MarkerType.Pen,
			}" title="Draw" @pointerdown.stop="
				markerDisabled = false;
			markerType = MarkerType.Pen;
			">
				<i class="pi pi-pencil" />
			</button>
			<button class="MarkerControls__button" :class="{
				'MarkerControls__button-active':
					!markerDisabled && markerType === MarkerType.Erase,
			}" title="Erase" @pointerdown.stop="
				markerDisabled = false;
			markerType = MarkerType.Erase;
			">
				<i class="pi pi-eraser" />
			</button>
		</div>
	</div>
</template>

<style lang="scss">
.MarkerControls__container {
	display: flex;
	flex-direction: column;
	align-items: start;
	justify-content: start;
	gap: 1em;
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
import ColorInput from '@packages/frontend-libs/dist/inputs/ColorInput.vue';
import NumberInput from '@packages/frontend-libs/dist/inputs/NumberInput.vue';
import {
	markerColor,
	markerDisabled,
	markerSize,
	markerType,
} from '../../../../../lib/globals';
import { MarkerType } from '../canvas/marker';
</script>