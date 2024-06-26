<template>
	<svg
		class="UnitLink__container"
		xmlns="http://www.w3.org/2000/svg"
		preserve-aspect-ratio="none"
	>
		<defs>
			<filter id="outline">
				<feMorphology
					in="SourceGraphic"
					result="DILATED"
					operator="dilate"
					radius="1"
				/>
				<feColorMatrix
					in="DILATED"
					result="OUTLINED"
					type="matrix"
					values="
						-1 0  0  0 0
						0  -1 0  0 0
						0  0  -1 0 0
						0  0  0  1 0
					"
				/>

				<feMerge>
					<feMergeNode in="OUTLINED" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
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
			:x1="lineScreenPositionFrom.x"
			:y1="lineScreenPositionFrom.y"
			:x2="lineScreenPositionTo.x"
			:y2="lineScreenPositionTo.y"
			marker-end="url(#arrowhead)"
		/>
	</svg>
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
		filter: url(#outline);
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { injectUnitMap } from '@/contexts/unit';
	import { injectViewport } from '@/contexts/viewport';
	import { getUnitResolvedVector } from '@/lib/unit';

	const props = defineProps<{
		unitIdFrom: string;
		unitIdTo: string;
	}>();

	const viewport = injectViewport();
	const unitMap = injectUnitMap();

	const unitPositionFrom = computed(() =>
		getUnitResolvedVector(unitMap.value, props.unitIdFrom)
	);
	const unitPositionTo = computed(() =>
		getUnitResolvedVector(unitMap.value, props.unitIdTo)
	);

	const lineRelativePosition = computed(() =>
		unitPositionTo.value.addVector(unitPositionFrom.value.scale(-1))
	);
	const linePositionFrom = computed(() => unitPositionFrom.value);
	const linePositionTo = computed(() => unitPositionTo.value);

	const lineScreenPositionFrom = computed(() =>
		viewport.value
			.fromViewportVector(linePositionFrom.value)
			.addVector(viewport.value.fromViewportOffset(lineRelativePosition.value).normalize().scale(25))
	);
	const lineScreenPositionTo = computed(() =>
		viewport.value
			.fromViewportVector(linePositionTo.value)
			.addVector(viewport.value.fromViewportOffset(lineRelativePosition.value).normalize().scale(-25))
	);
</script>
