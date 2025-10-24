<template>
	<div
		class="OverlayFiringSolution__container"
		:class="{
			OverlayFiringSolution__danger:
				artilleryUnits.length > 1 || targetUnits.length > 1,
		}"
		v-if="artillery.selectedFiringVector.value"
		@pointerdown.prevent
	>
		<div class="OverlayFiringSolution__row">
			<span>Distance:</span
			><span>{{ Math.round(artillery.selectedFiringVector.value.distance) }}m</span>
		</div>
		<div class="OverlayFiringSolution__row">
			<span>Azimuth:</span><span>{{ artillery.selectedFiringVector.value.azimuth.toFixed(1) }}°</span>
		</div>
	</div>
</template>

<style lang="scss">
	.OverlayFiringSolution__container {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: repeat(2, auto);
		padding: 0.25em;
		line-height: 100%;

		min-width: 8em;

		background: var(--p-button-secondary-background);
		border: 1px solid var(--p-button-secondary-color);
		border-radius: calc(0.15 * var(--button-size));

		&.OverlayFiringSolution__danger {
			border-color: var(--p-button-danger-border-color);
		}
	}

	.OverlayFiringSolution__row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 0.5em;
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { UnitType } from '@packages/data/dist/artillery/unit';
	import { artillery } from '@/lib/globals';

	const artilleryUnits = computed(() => {
		return Object.values(artillery.sharedState.currentState.value.unitMap).filter(
			(unit) => unit != null && unit.type === UnitType.Artillery
		);
	});

	const targetUnits = computed(() => {
		return Object.values(artillery.sharedState.currentState.value.unitMap).filter(
			(unit) => unit != null && unit.type === UnitType.Target
		);
	});
</script>
