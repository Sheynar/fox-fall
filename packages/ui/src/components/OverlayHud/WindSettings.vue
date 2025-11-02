<template>
	<FoxDialog
		persist-position-id="wind-settings"
		v-model:visible="visible"
		class="WindSettings__dialog"
		@pointerdown.stop
		@wheel.stop
		:style="{ animation: 'none', transition: 'none' }"
	>
		<template #header>Wind</template>
		<div class="Wind__information">
			<div class="Wind__information__item">
				<label>Wind direction:</label>
				<DirectionInput
					:model-value="artillery.sharedState.currentState.value.wind.azimuth"
					@update:model-value="
						artillery.sharedState.produceUpdate(() => {
							artillery.sharedState.currentState.value.wind.azimuth = $event;
							syncedRoom.updateWind();
						});
						syncedRoom.updateWind();
					"
					autofocus
				/>
			</div>
			<div class="Wind__information__item">
				<label>Wind tier:</label>
				<NumberInput
					:model-value="artillery.sharedState.currentState.value.wind.distance"
					@update:model-value="
						artillery.sharedState.produceUpdate(() => {
							artillery.sharedState.currentState.value.wind.distance = $event;
							syncedRoom.updateWind();
						})
					"
				/>
			</div>
			<div
				class="Wind__information__item"
				v-if="windMultiplier && settings.showWindMeters"
			>
				<label>Wind distance:</label>
				<DistanceInput
					:model-value="
						artillery.sharedState.currentState.value.wind.distance * windMultiplier
					"
					@update:model-value="
						artillery.sharedState.produceUpdate(() => {
							artillery.sharedState.currentState.value.wind.distance =
								$event / windMultiplier!;
							syncedRoom.updateWind();
						})
					"
				/>
			</div>
			<PrimeButton
				class="Wind__information__button"
				label="Reset"
				@pointerdown.stop="artillery.resetWind()"
			/>
		</div>
	</FoxDialog>
</template>

<style lang="scss">
	.WindSettings__dialog {
		top: auto;
		right: auto;
	}

	.Wind__information {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 1rem;
		padding: 1rem;
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
	import FoxDialog from '@/components/FoxDialog.vue';
	import DirectionInput from '@/components/inputs/DirectionInput/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import NumberInput from '@/components/inputs/NumberInput.vue';
	import { artillery, syncedRoom } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import { getUnitSpecs } from '@/lib/unit';
	import { computed } from 'vue';

	const visible = defineModel('visible', { type: Boolean, required: true });

	const windMultiplier = computed(() => {
		const windOffsets = Object.keys(artillery.sharedState.currentState.value.unitMap)
			.map(
				(unitId) =>
					getUnitSpecs(artillery.sharedState.currentState.value.unitMap, unitId)
						?.WIND_OFFSET
			)
			.filter((windOffset) => windOffset != null);
		if (windOffsets.length > 0)
			return windOffsets.reduce((a, b) => a + b, 0) / windOffsets.length;

		return null;
	});
</script>
