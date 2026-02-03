<template>
	<div ref="colorPickerContainer" class="ColorPicker__container" :class="{ 'ColorPicker__container-open': colorPickerOpen }" tabindex="0">
		<div class="ColorPicker__indicator"
			:style="{ backgroundColor: modelValue, width: '2em', height: '2em', borderRadius: '0.5em' }"></div>
		<Teleport v-if="colorPickerOpen" to="body">
			<Vue3ColorPicker ref="colorPicker" class="MarkerControls__color-picker" v-model="modelValue" theme="dark"
				mode="solid" :showPickerMode="false" :show-color-list="false" :show-eye-drop="true"
				@pointerdown.stop="nextTick(() => colorPickerContainer?.focus())" />
		</Teleport>
	</div>
</template>

<style lang="scss">
@import '@cyhnkckali/vue3-color-picker/dist/style.css';

.ColorPicker__container {
	cursor: pointer;

	&.ColorPicker__container-open {
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
import { useFocus, useFocusWithin } from '@vueuse/core';
import { computed, nextTick, ref, shallowRef, watch } from 'vue';

const modelValue = defineModel('modelValue', { type: String, required: true });

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