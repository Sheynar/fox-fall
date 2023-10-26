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
			:x1="props.locationFrom.resolvedVector.x"
			:y1="props.locationFrom.resolvedVector.y"
			:x2="props.locationTo.resolvedVector.x"
			:y2="props.locationTo.resolvedVector.y"
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
		stroke-width: calc(1px / var(--viewport-zoom));
		fill: currentColor;
	}
</style>

<script setup lang="ts">
	import type { Location } from '@/lib/location';

	const props = defineProps<{
		locationFrom: Location;
		locationTo: Location;
	}>();
</script>
