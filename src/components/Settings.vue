<template>
	<PrimeDialog
		v-model:visible="visible"
		:style="{ minWidth: '50vw' }"
		header="Settings"
		@pointerdown.stop
		@wheel.stop
	>
		<div class="Settings__content">
			<div class="Settings__row">
				<label>Automatic camera targeting</label>
				<PrimeCheckBox binary v-model="settings.automaticCameraTargeting" />
			</div>
			<div class="Settings__row">
				<label>Automatic camera zoom</label>
				<PrimeCheckBox binary v-model="settings.automaticCameraZoom" />
			</div>
		</div>
	</PrimeDialog>
</template>

<style lang="scss">
	.Settings__content {
		display: grid;
		grid-template-columns: max-content 1fr;
		grid-auto-rows: auto;
		gap: 1em;
	}

	.Settings__row {
		grid-column: auto / span 2;
		display: grid;
		grid-template-columns: subgrid;
	}
</style>

<script setup lang="ts">
	import PrimeDialog from 'primevue/dialog';
	import PrimeCheckBox from 'primevue/checkbox';
	import { settings } from '@/lib/settings';

	const visible = defineModel('visible', { default: false, type: Boolean });
</script>
