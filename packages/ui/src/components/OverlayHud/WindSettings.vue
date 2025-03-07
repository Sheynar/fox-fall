<template>
	<PrimeDialog
		append-to=".App__container"
		v-model:visible="visible"
		header="Wind"
		position="bottomleft"
		@pointerdown.stop
		@wheel.stop
		:style="{ animation: 'none', transition: 'none' }"
	>
		<div class="Wind__information">
			<div class="Wind__information__item">
				<label>Wind direction:</label>
				<DirectionInput v-model="artillery.wind.value.azimuth" @update:model-value="syncedRoom.updateWind()" autofocus />
			</div>
			<div class="Wind__information__item">
				<label>Wind tier:</label>
				<DistanceInput :model-value="artillery.wind.value.distance" @update:model-value="artillery.wind.value.distance = $event; syncedRoom.updateWind()" :suffix="''" />
			</div>
			<div class="Wind__information__item" v-if="windMultiplier">
				<label>Wind distance:</label>
				<DistanceInput :model-value="artillery.wind.value.distance * windMultiplier" @update:model-value="artillery.wind.value.distance = $event / windMultiplier; syncedRoom.updateWind()" />
			</div>
			<PrimeButton
				class="Wind__information__button"
				label="Reset"
				@pointerdown.stop="artillery.resetWind()"
			/>
		</div>
	</PrimeDialog>
</template>

<style lang="scss">
	.Wind__information {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 1rem;
		align-items: center;
	}

	.Wind__information__item {
		grid-column: auto / span 2;
		display: grid;
		grid-template-columns: subgrid;
		align-items: inherit;
	}

	.Wind__information__item__angle-input {
		margin: 0 !important;
	}

	.Wind__information__button {
		grid-column: auto / span 2;
	}
</style>

<script setup lang="ts">
	import PrimeButton from 'primevue/button';
	import PrimeDialog from 'primevue/dialog';
	import DirectionInput from '@/components/inputs/DirectionInput/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import { ARTILLERY_BY_SHELL } from '@/lib/constants/data';
	import { artillery, syncedRoom } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import { getUnitSpecs } from '@/lib/unit';
	import { computed } from 'vue';

	const visible = defineModel('visible', { type: Boolean, required: true });

	const windMultiplier = computed(() => {
		const windOffsets = Object.keys(artillery.unitMap.value).map((unitId) => getUnitSpecs(artillery.unitMap.value, unitId)?.WIND_OFFSET).filter((windOffset) => windOffset != null);
		if (windOffsets.length > 0) return windOffsets.reduce((a, b) => a + b, 0) / windOffsets.length;

		if (settings.value.globalAmmo == null || settings.value.globalPlatform == null) return null;
		return ARTILLERY_BY_SHELL[settings.value.globalAmmo]?.PLATFORM[settings.value.globalPlatform]?.WIND_OFFSET ?? null;
	});
</script>
