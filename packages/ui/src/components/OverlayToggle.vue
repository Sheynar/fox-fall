<template>
	<div class="OverlayToggle__container">
		<button
			v-if="overlayActive"
			ref="toggleButton"
			class="OverlayToggle__button"
			:style="{ '--_scale': settings.toggleButtonScale }"
			@pointerdown.prevent="electronApi.toggleOverlay()"
		>
			<ShellIcon class="OverlayToggle__icon" />
		</button>
	</div>
</template>

<style lang="scss">
	.OverlayToggle__container {
		position: fixed;
		bottom: 0;
		right: 0;

		display: flex;
		flex-direction: row;
	}

	.OverlayToggle__button {
		--_scale: 1;

		width: 1em;
		height: 1em;
		padding: 0;
		background: var(--p-button-secondary-background);
		border: 1px solid var(--p-button-secondary-color);
		border-radius: 0.15em;
		font-size: round(calc(3rem * var(--_scale)), 1px);
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
	import { useElementBounding } from '@vueuse/core';
	import { shallowRef, watchEffect } from 'vue';

	const toggleButton = shallowRef<HTMLButtonElement | null>(null);
	const overlayOpen = defineModel('overlayOpen', {
		type: Boolean,
		required: true,
	});

	// TODO : Move the overlay package's API type definitions to the shared package
	const electronApi = (<any>window).electronApi;
	const overlayActive = isOverlay;

	const onOverlayToggled = (isOverlayVisible: boolean) => {
		overlayOpen.value = isOverlayVisible;
	};

	if (overlayActive) {
		electronApi.onOverlayToggled(onOverlayToggled);
		electronApi.getOverlayOpen().then(onOverlayToggled);
	} else {
		overlayOpen.value = true;
	}

	const bounding = useElementBounding(toggleButton);
	watchEffect(() => {
		if (!overlayActive) return;
		electronApi.sendToggleSize({
			x: bounding.width.value,
			y: bounding.height.value,
		});
	});
</script>
