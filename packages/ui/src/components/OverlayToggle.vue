<template>
	<button
		v-if="overlayActive"
		ref="toggleButton"
		class="OverlayToggle__button"
		@pointerdown.prevent="electronApi?.toggleOverlay()"
	>
		<ShellIcon class="OverlayToggle__icon" />
	</button>
</template>

<style lang="scss">
	.OverlayToggle__button {
		--size: 100vmin;

		position: fixed;
		bottom: 0;
		right: 0;
		width: var(--size);
		height: var(--size);
		padding: 0;
		background: var(--p-button-secondary-background);
		border: 1px solid var(--p-button-secondary-color);
		font-size: var(--size);

		z-index: 1000;
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
	import { onMounted, shallowRef } from 'vue';

	const toggleButton = shallowRef<HTMLButtonElement | null>(null);
	const overlayOpen = defineModel('overlayOpen', {
		type: Boolean,
		required: true,
	});

	// TODO : Move the overlay package's API type definitions to the shared package
	const electronApi = (<any>window).electronApi;
	const overlayActive = 'electronApi' in window;

	const onOverlayToggled = (isOverlayVisible: boolean) => {
		overlayOpen.value = isOverlayVisible;
	};

	if (overlayActive) {
		electronApi.onOverlayToggled(onOverlayToggled);
		electronApi.getOverlayOpen().then(onOverlayToggled);
	} else {
		overlayOpen.value = true;
	}

	onMounted(() => {
		toggleButton.value?.style.setProperty(
			'--size',
			new URL(location.href).searchParams.get('size') || '100vmin'
		);
	});
</script>
