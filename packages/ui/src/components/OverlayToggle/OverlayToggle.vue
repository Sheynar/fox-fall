<template>
	<div
		v-if="overlayActive"
		ref="containerElement"
		class="OverlayToggle__container"
		:style="{ '--_scale': settings.toggleButtonScale }"
		@pointerdown.prevent="executeToggle"
	>
		<OverlayTooltip v-if="settings.showTooltip" />
		<button class="OverlayToggle__button">
			<ShellIcon class="OverlayToggle__icon" />
		</button>
	</div>
</template>

<style lang="scss">
	.OverlayToggle__container {
		--_scale: 1;

		position: fixed;
		bottom: 0;
		right: 0;

		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: 0.5em;

		cursor: pointer;
		user-select: none;

		--button-size: round(calc(3rem * var(--_scale)), 1px);
	}

	.OverlayToggle__button {
		position: relative;
		width: var(--button-size);
		height: var(--button-size);
		padding: 0;
		background: var(--p-button-secondary-background);
		border: 1px solid var(--p-button-secondary-color);
		border-radius: calc(0.15 * var(--button-size));
	}

	.OverlayToggle__icon {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
</style>

<script setup lang="ts">
	import ShellIcon from '@/components/icons/artillery/shell/300mm.vue';
	import { isOverlay } from '@/lib/constants';
	import { settings } from '@/lib/settings';
	import { useToggleButtonStore } from '@/stores/toggle-button';
	import { useElementBounding } from '@vueuse/core';
	import { shallowRef, watchEffect } from 'vue';
	import OverlayTooltip from './OverlayTooltip.vue';

	const containerElement = shallowRef<HTMLButtonElement | null>(null);
	const overlayOpen = defineModel('overlayOpen', {
		type: Boolean,
		required: true,
	});

	const toggleButtonStore = useToggleButtonStore();

	const overlayActive = isOverlay;

	const onOverlayToggled = (isOverlayVisible: boolean) => {
		overlayOpen.value = isOverlayVisible;
	};
	const executeToggle = () => {
		window.electronApi?.toggleOverlay();
	};

	if (overlayActive) {
		window.electronApi?.onOverlayToggled(onOverlayToggled);
		window.electronApi?.getOverlayOpen().then(onOverlayToggled);
	} else {
		overlayOpen.value = true;
	}

	const bounding = useElementBounding(containerElement);
	watchEffect(() => {
		if (!overlayActive) return;
		window.electronApi?.sendToggleSize({
			x: bounding.width.value,
			y: bounding.height.value,
		});

		toggleButtonStore.setSize(bounding.width.value, bounding.height.value);
	});
</script>
