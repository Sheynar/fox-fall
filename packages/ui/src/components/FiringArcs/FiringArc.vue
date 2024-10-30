<template>
	<Teleport :to="props.lineContainer">
		<svg
			class="FiringArc__svg"
			xmlns="http://www.w3.org/2000/svg"
			preserve-aspect-ratio="none"
		>
			<path
				:d="`M ${unitScreenPositionFrom.x} ${
					unitScreenPositionFrom.y
				} C ${unitScreenPositionFrom.x} ${midpointScreenPosition.y + offset}, ${
					unitScreenPositionTo.x
				} ${midpointScreenPosition.y + offset}, ${unitScreenPositionTo.x} ${
					unitScreenPositionTo.y
				}`"
			/>
		</svg>
	</Teleport>
	<Teleport :to="props.labelContainer">
		<div
			class="FiringArc__label"
			:style="{
				'--label-x': midpointScreenPosition.x,
				'--label-y': midpointScreenPosition.y + offset * 0.75,
			}"
		>
			<div class="FiringArc__label-row">
				<span class="FiringArc__span">
					{{ getUnitLabel(unitMap, unitIdFrom) }} ->
					{{ getUnitLabel(unitMap, unitIdTo) }}
				</span>
			</div>
			<div class="FiringArc__label-row">
				<span>distance:</span>
				<span>{{ Math.round(firingVectorWithWind.distance) }}m</span>
			</div>
			<div class="FiringArc__label-row">
				<span>azimuth:</span
				><span>{{ firingVectorWithWind.azimuth.toFixed(1) }}°</span>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	@keyframes FiringArc__dash {
		from {
			stroke-dashoffset: var(--_line-segment-size);
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	.FiringArc__svg {
		position: absolute;
		left: 0;
		top: 0;
		/*
		width: 0;
		height: 0;
		*/

		overflow: visible;

		--_line-dash-size: 2em;
		--_line-gap-size: 0.5em;
		--_line-segment-size: calc(var(--_line-dash-size) + var(--_line-gap-size));

		stroke: currentColor;
		stroke-width: 0.2em;
		stroke-dasharray: var(--_line-dash-size) var(--_line-gap-size);
		animation: FiringArc__dash 1s linear infinite;
		fill: transparent;
		filter: url(#outline);
	}

	.FiringArc__label {
		position: absolute;
		left: 0;
		top: 0;
		transform: translate(
			calc(var(--label-x) * 1px - 50%),
			calc(var(--label-y) * 1px - 50%)
		);
		transform-origin: 50% 50%;

		padding: 0.5em;
		gap: 0.5em;

		display: grid;
		grid-template-columns: repeat(2, max-content);
		grid-auto-rows: min-content;

		background: var(--color-primary-contrast);
		border: 1px solid;

		pointer-events: none;
		user-select: none;

		.FiringArc__label-row {
			grid-column: 1 / -1;

			display: grid;
			grid-template-columns: subgrid;
			grid-template-rows: subgrid;
			justify-items: end;
		}

		.FiringArc__span {
			grid-column: 1 / -1;
		}
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { injectUnitMap } from '@/contexts/unit';
	import { injectViewport } from '@/contexts/viewport';
	import { injectWind } from '@/contexts/wind';
	import { getUnitLabel, getUnitResolvedVector } from '@/lib/unit';

	const props = defineProps<{
		lineContainer: HTMLElement;
		labelContainer: HTMLElement;

		unitIdFrom: string;
		unitIdTo: string;
	}>();

	const unitMap = injectUnitMap();
	const viewport = injectViewport();
	const wind = injectWind();

	const resolvedVectorFrom = computed(() =>
		getUnitResolvedVector(unitMap.value, props.unitIdFrom)
	);
	const resolvedVectorTo = computed(() =>
		getUnitResolvedVector(unitMap.value, props.unitIdTo)
	);
	const firingVector = computed(() =>
		resolvedVectorTo.value.getRelativeOffset(resolvedVectorFrom.value)
	);
	const firingVectorWithWind = computed(() =>
		firingVector.value.addVector(wind.value.scale(-1))
	);

	const unitScreenPositionFrom = computed(() =>
		viewport.value.toScreenPosition(resolvedVectorFrom.value)
	);
	const unitScreenPositionTo = computed(() =>
		viewport.value.toScreenPosition(resolvedVectorTo.value)
	);
	const midpointScreenPosition = computed(() =>
		unitScreenPositionFrom.value
			.addVector(unitScreenPositionTo.value)
			.scale(0.5)
	);

	const offset = computed(
		() =>
			unitScreenPositionTo.value
				.addVector(unitScreenPositionFrom.value.scale(-1))
				.scale(0.5).distance * -1
	);
</script>
