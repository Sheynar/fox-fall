<template>
	<div class="PlatformInfo__container">
		<AmmoSelect
			v-model="settings.globalAmmo"
			@update:model-value="settings.globalPlatform = undefined; saveSettings()"
		/>
		<PlatformSelect
			:ammo-type="settings.globalAmmo"
			v-model="settings.globalPlatform"
			@update:model-value="saveSettings()"
		/>
	</div>
</template>

<style lang="scss">
	.PlatformInfo__container {
		position: fixed;
		top: 0.25em;
		left: 0.25em;

		display: flex;
		flex-direction: row;
		gap: 0.25em;
	}
</style>

<script setup lang="ts">
	import AmmoSelect from '@/components/inputs/AmmoSelect.vue';
	import PlatformSelect from '@/components/inputs/PlatformSelect.vue';
	import { saveSettings, settings } from '@/lib/settings';
</script>
