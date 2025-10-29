<template>
	<Teleport to=".App__container" v-if="visible">
		<div
			class="FoxDialog__container"
			v-bind="$attrs"
			:style="{
				'--toggle-button-size': toggleButtonStore.sizeY + 'px',
			}"
			@pointerdown.stop
			@contextmenu.stop
			@wheel.stop
		>
			<h1 class="FoxDialog__header">
				<slot name="header" />
				<span class="FoxDialog__header-actions">
					<slot name="header-actions" />
					<PrimeButton
						class="FoxDialog__header-action"
						severity="secondary"
						@pointerdown.stop="visible = false"
					>
						<i class="pi pi-times" />
					</PrimeButton>
				</span>
			</h1>
			<div class="FoxDialog__body">
				<slot />
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	@use '@/styles/constants' as constants;
	@use '@/styles/mixins/border' as border;

	@property --ui-scale {
		syntax: '<number>';
		initial-value: 1;
		inherits: false;
	}

	.FoxDialog__container {
		position: fixed;
		inset: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: auto;
		align-items: inherit;

		font-size: calc(1em * var(--ui-scale) * 0.6);
		margin: 0.75rem;
		margin-bottom: calc(0.75rem + var(--toggle-button-size, 0px));

		@include border.border-gradient();
		&:focus,
		&:focus-within {
			@include border.border-gradient-focused();
		}
		&:hover {
			@include border.border-gradient-hovered();
		}
		--_background: 100% 75% / 200% 200% no-repeat
			radial-gradient(canvas, #{constants.$dark}) !important;
		border-radius: 1.25em;
	}

	.FoxDialog__header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		@include border.border-gradient();

		border-width: 0 !important;
		border-bottom-width: calc(0.125em / 2) !important;
		border-top-left-radius: inherit;
		border-top-right-radius: inherit;

		margin: 0;
		padding: 0.5em;

		font-size: 2em;
		user-select: none;
	}

	.FoxDialog__container:focus .FoxDialog__header,
	.FoxDialog__container:focus-within .FoxDialog__header {
		@include border.border-gradient-focused();
	}
	.FoxDialog__container:hover .FoxDialog__header {
		@include border.border-gradient-hovered();
	}

	.FoxDialog__header-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
		cursor: pointer;
	}

	.FoxDialog__body {
		display: grid;
		grid-template-rows: auto;
		grid-template-columns: auto;
		align-items: inherit;
	}
</style>

<script setup lang="ts">
	import { useEventListener } from '@vueuse/core';
	import PrimeButton from 'primevue/button';
	import { useToggleButtonStore } from '@/stores/toggle-button';

	const visible = defineModel('visible', { type: Boolean, required: true });
	const toggleButtonStore = useToggleButtonStore();

	useEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			visible.value = false;
		}
	});
</script>
