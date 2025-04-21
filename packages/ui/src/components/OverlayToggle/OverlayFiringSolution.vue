<template>
	<div
		class="OverlayFiringSolution__container"
		:class="{
			OverlayFiringSolution__danger:
				artilleryUnits.length > 1 || targetUnits.length > 1,
		}"
		v-if="firingVector"
	>
		<div class="OverlayFiringSolution__row">
			<span>Distance:</span
			><span>{{ Math.round(firingVector.distance) }}m</span>
		</div>
		<div class="OverlayFiringSolution__row">
			<span>Azimuth:</span><span>{{ firingVector.azimuth.toFixed(1) }}°</span>
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
	import { artillery } from '@/lib/globals';
	import { UnitType } from '@/lib/unit';
	import { usePrimaryUnitsByType } from '@/mixins/focused-units';
	import { computed } from 'vue';

	const artilleryUnits = computed(() => {
		return Object.values(artillery.unitMap.value).filter(
			(unit) => unit != null && unit.type === UnitType.Artillery
		);
	});

	const targetUnits = computed(() => {
		return Object.values(artillery.unitMap.value).filter(
			(unit) => unit != null && unit.type === UnitType.Target
		);
	});

	const primaryUnitsByType = usePrimaryUnitsByType();

	const firingVector = computed(() => {
		if (
			primaryUnitsByType.value[UnitType.Artillery] == null ||
			primaryUnitsByType.value[UnitType.Target] == null
		)
			return undefined;
		return artillery.getFiringVector(
			primaryUnitsByType.value[UnitType.Artillery].id,
			primaryUnitsByType.value[UnitType.Target].id
		);
	});
</script>
