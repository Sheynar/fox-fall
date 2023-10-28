<template>
	<svg
		class="LocationLink__container"
		xmlns="http://www.w3.org/2000/svg"
		preserve-aspect-ratio="none"
	>
		<defs>
			<marker
				id="arrowhead"
				markerWidth="10"
				markerHeight="7"
				refX="10"
				refY="3.5"
				orient="auto"
			>
				<polygon points="0 0, 10 3.5, 0 7" />
			</marker>
		</defs>
		<line
			:x1="locationScreenPositionFrom.x"
			:y1="locationScreenPositionFrom.y"
			:x2="locationScreenPositionTo.x"
			:y2="locationScreenPositionTo.y"
			marker-end="url(#arrowhead)"
		/>
	</svg>
</template>

<style lang="scss">
	.LocationLink__container {
		position: absolute;
		left: 0;
		top: 0;
		/*
		width: 0;
		height: 0;
		*/

		overflow: visible;

		stroke: currentColor;
		stroke-width: 1px;
		fill: currentColor;
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { injectLocationMap } from '@/contexts/location';
	import { injectViewport } from '@/contexts/viewport';
	import { getLocationResolvedVector } from '@/lib/location';

	const props = defineProps<{
		locationIdFrom: string;
		locationIdTo: string;
	}>();

	const viewport = injectViewport();
	const locationMap = injectLocationMap();

	const locationScreenPositionFrom = computed(() => viewport.value.fromViewportVector(getLocationResolvedVector(locationMap.value, props.locationIdFrom)));
	const locationScreenPositionTo = computed(() => viewport.value.fromViewportVector(getLocationResolvedVector(locationMap.value, props.locationIdTo)));
</script>
