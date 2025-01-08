<template>
	<PrimeDialog
		append-to=".App__container"
		v-model:visible="visible"
		:style="{ minWidth: '25vw' }"
		header="Settings"
		@pointerdown.stop
		@wheel.stop
	>
		<div class="Settings__content">
			<div class="Settings__row">
				<label>Show tooltip</label>
				<PrimeCheckBox binary v-model="settings.showTooltip" @update:model-value="saveSettings" />
			</div>
			<div class="Settings__row">
				<label>Use NATO alphabet</label>
				<PrimeCheckBox binary v-model="settings.useNatoAlphabet" @update:model-value="saveSettings" />
			</div>
			<div class="Settings__row">
				<label>Show X/Y offsets</label>
				<PrimeCheckBox binary v-model="settings.showXYOffsets" @update:model-value="saveSettings" />
			</div>
			<div class="Settings__row">
				<label>Grid dash length</label>
				<PrimeInputNumber
					:model-value="settings.gridDashLength"
					@input="settings.gridDashLength = Number($event.value); saveSettings()"
					suffix="px"
					locale="en-UK"
					:allowEmpty="false"
					highlightOnFocus
					:minFractionDigits="0"
					:maxFractionDigits="2"
					:min="0"
				/>
			</div>
			<div class="Settings__row">
				<label>Grid dash gap</label>
				<PrimeInputNumber
					:model-value="settings.gridDashGap"
					@input="settings.gridDashGap = Number($event.value); saveSettings()"
					suffix="px"
					locale="en-UK"
					:allowEmpty="false"
					highlightOnFocus
					:minFractionDigits="0"
					:maxFractionDigits="2"
					:min="0"
				/>
			</div>
			<div class="Settings__row">
				<label>Grid line width</label>
				<PrimeInputNumber
					:model-value="settings.gridLineWidth"
					@input="settings.gridLineWidth = Number($event.value); saveSettings()"
					suffix="px"
					locale="en-UK"
					:allowEmpty="false"
					highlightOnFocus
					:minFractionDigits="0"
					:maxFractionDigits="2"
					:min="0.25"
				/>
			</div>
			<div class="Settings__row">
				<label>Firing arc opacity</label>
				<PrimeInputNumber
					:model-value="Math.floor(settings.firingArcOpacity * 100)"
					@input="settings.firingArcOpacity = Math.floor(Number($event.value)) / 100; saveSettings()"
					suffix="%"
					locale="en-UK"
					:allowEmpty="false"
					highlightOnFocus
					:minFractionDigits="0"
					:maxFractionDigits="0"
					:min="0.1"
				/>
			</div>
			<div class="Settings__row">
				<label>Screenshot opacity</label>
				<PrimeInputNumber
					:model-value="Math.floor(settings.screenshotOpacity * 100)"
					@input="settings.screenshotOpacity = Math.floor(Number($event.value)) / 100; saveSettings()"
					suffix="%"
					locale="en-UK"
					:allowEmpty="false"
					highlightOnFocus
					:minFractionDigits="0"
					:maxFractionDigits="0"
					:min="0.1"
				/>
			</div>
			<div class="Settings__row" v-if="isOverlay">
				<label>Overlay button scale</label>
				<PrimeInputNumber
					:model-value="settings.toggleButtonScale"
					@input="settings.toggleButtonScale = Number($event.value); saveSettings()"
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
	import { isOverlay } from '@/lib/constants';
	import { saveSettings, settings } from '@/lib/settings';

	const visible = defineModel('visible', { default: false, type: Boolean });
</script>
