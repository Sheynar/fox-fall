<template>
	<svg
		class="FiringArc__svg"
		xmlns="http://www.w3.org/2000/svg"
		preserve-aspect-ratio="none"
	>
		<path
			:d="`M ${locationScreenPositionFrom.x} ${
				locationScreenPositionFrom.y
			} C ${locationScreenPositionFrom.x} ${
				locationScreenPositionFrom.y + offset
			}, ${midpointScreenPosition.x} ${midpointScreenPosition.y + offset}, ${
				midpointScreenPosition.x
			} ${midpointScreenPosition.y + offset}`"
		/>
		<path
			:d="`M ${midpointScreenPosition.x} ${
				midpointScreenPosition.y + offset
			} C ${midpointScreenPosition.x} ${midpointScreenPosition.y + offset}, ${
				locationScreenPositionTo.x
			} ${locationScreenPositionTo.y + offset}, ${locationScreenPositionTo.x} ${
				locationScreenPositionTo.y
			}`"
		/>
	</svg>
	<div
		class="FiringArc__label"
		:style="{ '--label-x': midpointScreenPosition.x, '--label-y': midpointScreenPosition.y + offset }"
	>
		<div>azimuth: {{ firingVector.azimuth.toFixed(1) }}</div>
		<div>distance: {{ Math.round(firingVector.distance) }}</div>
	</div>
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
		transform: translate(calc(var(--label-x) * 1px - 50%), calc(var(--label-y) * 1px - 50%));
		transform-origin: 50% 50%;

		background: #222;
		border: 1px solid;

		pointer-events: none;
		user-select: none;
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { injectLocationMap } from '@/contexts/location';
	import { injectViewport } from '@/contexts/viewport';
	import { getLocationResolvedVector } from '@/lib/location';

	const offset = computed(() => -40 * viewport.value.resolvedZoom);

	const props = defineProps<{
		locationIdFrom: string;
		locationIdTo: string;
	}>();

	const viewport = injectViewport();
	const locationMap = injectLocationMap();

	const resolvedVectorFrom = computed(() =>
		getLocationResolvedVector(locationMap.value, props.locationIdFrom)
	);
	const resolvedVectorTo = computed(() =>
		getLocationResolvedVector(locationMap.value, props.locationIdTo)
	);
	const firingVector = computed(() =>
		resolvedVectorTo.value.getRelativeOffset(resolvedVectorFrom.value)
	);

	const locationScreenPositionFrom = computed(() =>
		viewport.value.fromViewportVector(resolvedVectorFrom.value)
	);
	const locationScreenPositionTo = computed(() =>
		viewport.value.fromViewportVector(resolvedVectorTo.value)
	);
	const midpointScreenPosition = computed(() =>
		locationScreenPositionFrom.value
			.addVector(locationScreenPositionTo.value)
			.scale(0.5)
	);
</script>
