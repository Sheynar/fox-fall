<template>
	<PrimeDialog
		append-to=".App__container"
		v-model:visible="visible"
		:style="{ minWidth: '25vw' }"
		header="Settings"
		@pointerdown.stop
		@wheel.stop
	>
		<Tabs value="features">
			<TabList>
				<Tab as="div" value="features">Feature selection</Tab>
				<Tab as="div" value="grid">Grid tweaks</Tab>
				<Tab as="div" value="interface">Interface tweaks</Tab>
				<Tab as="div" value="keyboard-shortcuts">Keyboard shortcuts</Tab>
			</TabList>
			<TabPanels>
				<TabPanel value="features">
					<div class="Settings__content">
						<div class="Settings__row">
							<label>Backdrop mode</label>
							<PrimeSelect
								:options="
									Object.keys(BackdropMode).map((backdropMode) => ({
										id: BackdropMode[backdropMode as keyof typeof BackdropMode],
										label: backdropMode,
									}))
								"
								optionLabel="label"
								optionValue="id"
								v-model="settings.backdropMode"
								@update:model-value="saveSettings"
							/>
						</div>
						<div class="Settings__row">
							<label>User mode</label>
							<PrimeSelect
								:options="
									Object.keys(UserMode).map((userMode) => ({
										id: UserMode[userMode as keyof typeof UserMode],
										label: userMode,
									}))
								"
								optionLabel="label"
								optionValue="id"
								v-model="settings.userMode"
								@update:model-value="saveSettings"
							/>
						</div>
						<div class="Settings__row">
							<label>{{ settings.userMode === UserMode.Basic ? 'Global ammo' : 'Default Ammo' }}</label>
							<AmmoSelect
								v-model="settings.globalAmmo"
								@update:model-value="saveSettings"
							/>
						</div>
						<div class="Settings__row" v-if="settings.globalAmmo != null">
							<label>{{ settings.userMode === UserMode.Basic ? 'Global platform' : 'Default platform' }}</label>
							<PlatformSelect
								:ammo-type="settings.globalAmmo"
								v-model="settings.globalPlatform"
								@update:model-value="saveSettings"
							/>
						</div>
						<div class="Settings__row">
							<label>Show tooltip</label>
							<PrimeCheckBox
								binary
								v-model="settings.showTooltip"
								@update:model-value="saveSettings"
							/>
						</div>
						<div class="Settings__row">
							<label>Use NATO alphabet</label>
							<PrimeCheckBox
								binary
								v-model="settings.useNatoAlphabet"
								@update:model-value="saveSettings"
							/>
						</div>
						<div class="Settings__row">
							<label>Show X/Y offsets</label>
							<PrimeCheckBox
								binary
								v-model="settings.showXYOffsets"
								@update:model-value="saveSettings"
							/>
						</div>
					</div>
				</TabPanel>
				<TabPanel value="grid">
					<div class="Settings__content">
						<div class="Settings__row">
							<label>Grid dash length</label>
							<PrimeInputNumber
								:model-value="settings.gridDashLength"
								@input="
									settings.gridDashLength = Number($event.value);
									saveSettings();
								"
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
								@input="
									settings.gridDashGap = Number($event.value);
									saveSettings();
								"
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
								@input="
									settings.gridLineWidth = Number($event.value);
									saveSettings();
								"
								suffix="px"
								locale="en-UK"
								:allowEmpty="false"
								highlightOnFocus
								:minFractionDigits="0"
								:maxFractionDigits="2"
								:min="0.25"
							/>
						</div>
					</div>
				</TabPanel>
				<TabPanel value="interface">
					<div class="Settings__content">
						<div class="Settings__row">
							<label>Compass opacity</label>
							<PrimeInputNumber
								:model-value="Math.floor(settings.compassOpacity * 100)"
								@input="
									settings.compassOpacity =
										Math.floor(Number($event.value)) / 100;
									saveSettings();
								"
								suffix="%"
								locale="en-UK"
								:allowEmpty="false"
								highlightOnFocus
								:minFractionDigits="0"
								:maxFractionDigits="0"
								:min="0"
							/>
						</div>
						<div class="Settings__row">
							<label>Firing arc opacity</label>
							<PrimeInputNumber
								:model-value="Math.floor(settings.firingArcOpacity * 100)"
								@input="
									settings.firingArcOpacity =
										Math.floor(Number($event.value)) / 100;
									saveSettings();
								"
								suffix="%"
								locale="en-UK"
								:allowEmpty="false"
								highlightOnFocus
								:minFractionDigits="0"
								:maxFractionDigits="0"
								:min="0"
							/>
						</div>
						<div class="Settings__row">
							<label>Screenshot opacity</label>
							<PrimeInputNumber
								:model-value="Math.floor(settings.screenshotOpacity * 100)"
								@input="
									settings.screenshotOpacity =
										Math.floor(Number($event.value)) / 100;
									saveSettings();
								"
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
								@input="
									settings.toggleButtonScale = Number($event.value);
									saveSettings();
								"
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
								@input="
									settings.unitIconScale = Number($event.value);
									saveSettings();
								"
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
								@input="
									settings.unitSettingsScale = Number($event.value);
									saveSettings();
								"
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
				</TabPanel>
				<TabPanel value="keyboard-shortcuts">
					<div class="Settings__content">
						<div class="Settings__row">
							<label>Toggle overlay</label>
							<KeyboardShortcut :command="KeyboardCommand.ToggleOverlay" />
						</div>
					</div>
				</TabPanel>
			</TabPanels>
		</Tabs>
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
	import { KeyboardCommand } from '@packages/types/dist/keyboard-config';
	import PrimeDialog from 'primevue/dialog';
	import PrimeCheckBox from 'primevue/checkbox';
	import PrimeInputNumber from 'primevue/inputnumber';
	import PrimeSelect from 'primevue/select';
	import Tab from 'primevue/tab';
	import Tabs from 'primevue/tabs';
	import TabList from 'primevue/tablist';
	import TabPanel from 'primevue/tabpanel';
	import TabPanels from 'primevue/tabpanels';
	import AmmoSelect from '@/components/inputs/AmmoSelect.vue';
	import KeyboardShortcut from '@/components/inputs/KeyboardShortcut.vue';
	import PlatformSelect from '@/components/inputs/PlatformSelect.vue';
	import { isOverlay } from '@/lib/constants';
	import { BackdropMode, saveSettings, settings, UserMode } from '@/lib/settings';

	const visible = defineModel('visible', { default: false, type: Boolean });
</script>
