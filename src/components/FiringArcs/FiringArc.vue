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
				<span class="FiringArc__span"
					>{{ unitMap[unitIdFrom].label }} ->
					{{ unitMap[unitIdTo].label }}</span
				>
			</div>
			<div class="FiringArc__label-row">
				<span>distance:</span
				><span>{{ Math.round(firingVector.distance) }}</span>
			</div>
			<div class="FiringArc__label-row">
				<span>azimuth:</span><span>{{ firingVector.azimuth.toFixed(1) }}</span>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.FiringArc__svg {
		position: absolute;
		left: 0;
		top: 0;
		/*
		width: 0;
		height: 0;
		*/

		overflow: visible;

		stroke: currentColor;
		stroke-width: 0.2em;
		fill: transparent;
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
	import { getUnitResolvedVector } from '@/lib/unit';

	const props = defineProps<{
		lineContainer: HTMLElement;
		labelContainer: HTMLElement;

		unitIdFrom: string;
		unitIdTo: string;
	}>();

	const viewport = injectViewport();
	const unitMap = injectUnitMap();

	const resolvedVectorFrom = computed(() =>
		getUnitResolvedVector(unitMap.value, props.unitIdFrom)
	);
	const resolvedVectorTo = computed(() =>
		getUnitResolvedVector(unitMap.value, props.unitIdTo)
	);
	const firingVector = computed(() =>
		resolvedVectorTo.value.getRelativeOffset(resolvedVectorFrom.value)
	);

	const unitScreenPositionFrom = computed(() =>
		viewport.value.fromViewportVector(resolvedVectorFrom.value)
	);
	const unitScreenPositionTo = computed(() =>
		viewport.value.fromViewportVector(resolvedVectorTo.value)
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
