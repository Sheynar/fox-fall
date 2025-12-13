<template>
	<div
		class="OverlayWindMeasurement__container"
		v-if="artillery.sharedState.currentState.value.wind.distance"
	>
		<div class="OverlayWindMeasurement__row">
			<span>Wind tier:</span
			><span>{{ Math.round(artillery.sharedState.currentState.value.wind.distance * 100) / 100 }}</span>
		</div>
		<div class="OverlayWindMeasurement__row">
			<span>Azimuth:</span
			><span>{{ artillery.sharedState.currentState.value.wind.azimuth.toFixed(1) }}°</span>
		</div>
	</div>
</template>

<style lang="scss">
	.OverlayWindMeasurement__container {
		display: grid;
		grid-template-columns: auto;
		grid-template-rows: repeat(2, auto);
		padding: 0.25em;
		line-height: 100%;

		min-width: 8em;

		background: var(--p-button-secondary-background);
		border: 1px solid var(--p-button-secondary-color);
		border-radius: calc(0.15 * var(--button-size));

		&.OverlayWindMeasurement__danger {
			border-color: var(--p-button-danger-border-color);
		}
	}

	.OverlayWindMeasurement__row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 0.5em;
	}
</style>

<script setup lang="ts">
	import { artillery } from '@/lib/globals';
</script>
