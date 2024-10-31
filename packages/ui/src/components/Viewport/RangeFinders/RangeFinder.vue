<template>
	<PositionedElement
		:x="props.position.x"
		:y="props.position.y"
		:layer="LAYER.RANGE_FINDERS"
	>
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
				M 0 ${-outerRadius}
				A ${outerRadius} ${outerRadius} 0 1 0 0 ${+outerRadius}
				A ${outerRadius} ${outerRadius} 0 1 0 0 ${-outerRadius}
				Z
				M 0 ${-innerRadius}
				A ${innerRadius} ${innerRadius} 0 1 1 0 ${+innerRadius}
				A ${innerRadius} ${innerRadius} 0 1 1 0 ${-innerRadius}
				Z
			`"
			/>
		</svg>
	</PositionedElement>
</template>

<style lang="scss">
	.RangeFinder__container {
		position: absolute;
		inset: 0;
		overflow: visible;

		stroke: black;
		fill: var(--p-red-500);
		opacity: 0.15;

		&.RangeFinder__target {
			fill: var(--p-green-500);
		}
	}
</style>

<script setup lang="ts">
	import type { ArtilleryPlatform } from '@/lib/constants/data';
	import { artillery } from '@/lib/globals';
	import { Unit, UnitType } from '@/lib/unit';
	import type { Vector } from '@/lib/vector';
	import { computed } from 'vue';
	import PositionedElement from '../PositionedElement.vue';
	import { LAYER } from '@/lib/constants/ui';

	const innerRadius = computed(
		() => props.specs.MIN_RANGE * artillery.viewport.value.resolvedZoom
	);
	const outerRadius = computed(
		() => props.specs.MAX_RANGE * artillery.viewport.value.resolvedZoom
	);

	const props = defineProps<{
		position: Vector;
		specs: ArtilleryPlatform;
		unit: Unit;
	}>();
</script>
