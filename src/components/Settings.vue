<template>
	<PrimeDialog
		v-model:visible="visible"
		:style="{ minWidth: '25vw' }"
		header="Settings"
		@pointerdown.stop
		@wheel.stop
	>
		<div class="Settings__content">
			<div class="Settings__row">
				<label>Automatic camera targeting</label>
				<PrimeCheckBox binary v-model="settings.automaticCameraTargeting" @update:model-value="saveSettings" />
			</div>
			<div class="Settings__row">
				<label>Automatic camera zoom</label>
				<PrimeCheckBox binary v-model="settings.automaticCameraZoom" @update:model-value="saveSettings" />
			</div>
			<div class="Settings__row">
				<label>Use NATO alphabet</label>
				<PrimeCheckBox binary v-model="settings.useNatoAlphabet" @update:model-value="saveSettings" />
			</div>
			<div class="Settings__row">
				<label>Unit icon scale</label>
				<PrimeInputNumber
					:model-value="settings.unitIconScale"
					@input="settings.unitIconScale = Number($event.value); saveSettings()"
					suffix="x"
					locale="en-UK"
					:allowEmpty="false"
					highlightOnFocus
					:minFractionDigits="0"
					:maxFractionDigits="2"
					:min="0.25"
				/>
			</div>
			<div class="Settings__row">
				<label>Unit settings scale</label>
				<PrimeInputNumber
					:model-value="settings.unitSettingsScale"
					@input="settings.unitSettingsScale = Number($event.value); saveSettings()"
					suffix="x"
					locale="en-UK"
					:allowEmpty="false"
					highlightOnFocus
					:minFractionDigits="0"
					:maxFractionDigits="2"
					:min="0.25"
				/>
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
	import PrimeInputNumber from 'primevue/inputnumber';
	import { saveSettings, settings } from '@/lib/settings';

	const visible = defineModel('visible', { default: false, type: Boolean });
</script>
