<template>
	<svg
		class="RangeFinder__container"
		:class="{
			RangeFinder__artillery: unit.type === UnitType.Artillery,
			RangeFinder__target: unit.type === UnitType.Target,
		}"
		xmlns="http://www.w3.org/2000/svg"
		preserve-aspect-ratio="none"
	>
		<path
			:d="`
				M ${screenPosition.x} ${screenPosition.y - outerRadius}
				A ${outerRadius} ${outerRadius} 0 1 0 ${screenPosition.x} ${screenPosition.y + outerRadius}
				A ${outerRadius} ${outerRadius} 0 1 0 ${screenPosition.x} ${screenPosition.y - outerRadius}
				Z
				M ${screenPosition.x} ${screenPosition.y - innerRadius}
				A ${innerRadius} ${innerRadius} 0 1 1 ${screenPosition.x} ${screenPosition.y + innerRadius}
				A ${innerRadius} ${innerRadius} 0 1 1 ${screenPosition.x} ${screenPosition.y - innerRadius}
				Z
			`"
		/>
	</svg>
</template>

<style lang="scss">
	.RangeFinder__container {
		position: absolute;
		inset: 0;
		overflow: visible;

		stroke: none;
		fill: var(--p-red-500);
		opacity: 0.15;
		filter: url(#outline);

		&.RangeFinder__target {
			fill: var(--p-green-500);
		}
	}
</style>

<script setup lang="ts">
	import { injectViewport } from '@/contexts/viewport';
	import type { ArtilleryPlatform } from '@/lib/constants/data';
	import { Unit, UnitType } from '@/lib/unit';
	import type { Vector } from '@/lib/vector';
	import { computed } from 'vue';

	const viewport = injectViewport();

	const screenPosition = computed(() =>
		viewport.value.fromViewportVector(props.position)
	);
	const innerRadius = computed(
		() => props.specs.MIN_RANGE * viewport.value.resolvedZoom
	);
	const outerRadius = computed(
		() => props.specs.MAX_RANGE * viewport.value.resolvedZoom
	);

	const props = defineProps<{
		position: Vector;
		specs: ArtilleryPlatform;
		unit: Unit;
	}>();
</script>
