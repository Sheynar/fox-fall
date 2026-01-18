<template>
	<div class="MarkerControls__container" @pointerdown.stop @keydown.stop @wheel.stop.prevent>
		<div class="MarkerControls__entry">
			<label>Size</label>
			<NumberInput v-model="markerSize" />
		</div>
		<div class="MarkerControls__entry" ref="colorPickerContainer" tabindex="0">
			<label>Color</label>
			<div class="MarkerControls__color-picker-container"
				:class="{ 'MarkerControls__color-picker-container-open': colorPickerOpen }">
				<div class="MarkerControls__color-indicator"
					:style="{ backgroundColor: markerColor, width: '2em', height: '2em', borderRadius: '0.5em' }"></div>
				<Teleport v-if="colorPickerOpen" to="body">
					<Vue3ColorPicker ref="colorPicker" class="MarkerControls__color-picker" v-model="markerColor" theme="dark"
						mode="solid" :showPickerMode="false" :show-color-list="false" :show-eye-drop="true"
						@pointerdown.stop="nextTick(() => colorPickerContainer?.focus())" />
				</Teleport>
			</div>
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

.MarkerControls__color-picker-container {
	cursor: pointer;

	&.MarkerControls__color-picker-container-open {
		anchor-name: --color-picker-container;
	}
}

.MarkerControls__color-picker {
	position: fixed;
	position-anchor: --color-picker-container;
	left: calc(anchor(right) + 0.5em);
	top: anchor(top);
}
</style>

<script setup lang="ts">
import { Vue3ColorPicker } from '@cyhnkckali/vue3-color-picker';
import NumberInput from '@packages/frontend-libs/dist/inputs/NumberInput.vue';
import { useFocus, useFocusWithin } from '@vueuse/core';
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import {
	markerColor,
	markerDisabled,
	markerSize,
	markerType,
} from '../../lib/globals';
import { MarkerType } from '../canvas/marker';

const colorPickerContainer = shallowRef<HTMLDivElement | null>(null);
const colorPicker = shallowRef<InstanceType<typeof Vue3ColorPicker> | null>(null);

const { focused: colorPickerContainerFocusedWithin } = useFocusWithin(colorPickerContainer);
const { focused: colorPickerContainerFocused } = useFocus(colorPickerContainer);
const { focused: colorPickerFocusedWithin } = useFocusWithin(computed(() => colorPicker.value?.$el));
const { focused: colorPickerFocused } = useFocus(computed(() => colorPicker.value?.$el));

const _colorPickerOpen = computed(() => colorPickerContainerFocusedWithin.value || colorPickerContainerFocused.value || colorPickerFocusedWithin.value || colorPickerFocused.value);
const colorPickerOpen = ref(false);
let colorPickerCheckIdentifier = {};
watch(_colorPickerOpen, (value) => {
	const checkIdentifier = colorPickerCheckIdentifier = {};
	if (value) {
		colorPickerOpen.value = true;
	} else {
		setTimeout(() => {
			if (colorPickerCheckIdentifier !== checkIdentifier) return;
			colorPickerOpen.value = false;
		}, 100);
	}
});
</script>