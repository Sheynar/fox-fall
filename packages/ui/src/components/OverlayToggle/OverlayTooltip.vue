<template>
	<div
		class="OverlayTooltip__container"
		:class="{
			OverlayTooltip__danger:
				artilleryUnits.length > 1 || targetUnits.length > 1,
		}"
		v-if="firingVector"
	>
		<div class="OverlayTooltip__row">
			<span>distance:</span
			><span>{{ Math.round(firingVector.distance) }}m</span>
		</div>
		<div class="OverlayTooltip__row">
			<span>azimuth:</span><span>{{ firingVector.azimuth.toFixed(1) }}°</span>
		</div>
	</div>
</template>

<style lang="scss">
	.OverlayTooltip__container {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: repeat(2, auto);
		padding: 0.25em;
		line-height: 100%;

		min-width: 8em;

		background: var(--p-button-secondary-background);
		border: 1px solid var(--p-button-secondary-color);
		border-radius: calc(0.15 * var(--button-size));

		&.OverlayTooltip__danger {
			border-color: var(--p-button-danger-border-color);
		}
	}

	.OverlayTooltip__row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 0.5em;
	}
</style>

<script setup lang="ts">
	import { artillery } from '@/lib/globals';
	import { getUnitResolvedVector, getUnitSpecs, UnitType } from '@/lib/unit';
	import { useFocusedUnitIds } from '@/mixins/focused-units';
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

	const focusedUnitIds = useFocusedUnitIds();

	const selectedArtilleryUnit = computed(() => {
		if (artilleryUnits.value.length === 0) return null;
		if (artilleryUnits.value.length === 1) return artilleryUnits.value[0];
		const highlightedArtilleryUnit = artilleryUnits.value.find((unit) =>
			focusedUnitIds.value.includes(unit.id)
		);
		if (highlightedArtilleryUnit != null) return highlightedArtilleryUnit;
		return artilleryUnits.value[0];
	});

	const selectedTargetUnit = computed(() => {
		if (targetUnits.value.length === 0) return null;
		if (targetUnits.value.length === 1) return targetUnits.value[0];
		const highlightedTargetUnit = targetUnits.value.find((unit) =>
			focusedUnitIds.value.includes(unit.id)
		);
		if (highlightedTargetUnit != null) return highlightedTargetUnit;
		return targetUnits.value[0];
	});

	const firingVector = computed(() => {
		if (selectedArtilleryUnit.value == null || selectedTargetUnit.value == null)
			return undefined;
		const resolvedArtillery = getUnitResolvedVector(
			artillery.unitMap.value,
			selectedArtilleryUnit.value.id
		);
		const resolvedTarget = getUnitResolvedVector(
			artillery.unitMap.value,
			selectedTargetUnit.value.id
		);
		const firingVector = resolvedArtillery.getRelativeOffset(resolvedTarget);
		let firingVectorWithWind = firingVector.clone();
		const specs = getUnitSpecs(artillery.unitMap.value, selectedArtilleryUnit.value.id);
		if (specs) {
			firingVectorWithWind = firingVectorWithWind.addVector(artillery.wind.value.scale(-specs.WIND_OFFSET));
		}
		return firingVectorWithWind;
	});
</script>
