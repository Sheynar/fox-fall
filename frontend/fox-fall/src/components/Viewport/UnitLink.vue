<template>
	<PositionedElement
		:layer="LAYER.LINKS"
		:x="unitPositionFrom.x"
		:y="unitPositionFrom.y"
		cancel-viewport-zoom
	>
		<svg
			class="UnitLink__container"
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
				:x1="0"
				:y1="0"
				:x2="lineVector.x"
				:y2="lineVector.y"
				marker-end="url(#arrowhead)"
			/>
		</svg>
	</PositionedElement>
</template>

<style lang="scss">
	.UnitLink__container {
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
		filter: url(#outline-black);
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import { artillery } from '@/lib/globals';
	import { getUnitResolvedVector } from '@/lib/unit';
	import { LAYER } from '@/lib/constants/ui';

	const props = defineProps<{
		unitIdFrom: string;
		unitIdTo: string;
	}>();

	const unitPositionFrom = computed(() =>
		getUnitResolvedVector(artillery.sharedState.currentState.value.unitMap, props.unitIdFrom)
	);
	const unitPositionTo = computed(() =>
		getUnitResolvedVector(artillery.sharedState.currentState.value.unitMap, props.unitIdTo)
	);

	const lineVector = computed(() =>
		unitPositionTo.value
			.addVector(unitPositionFrom.value.scale(-1))
			.scale(artillery.viewport.value.resolvedZoom)
	);
</script>
