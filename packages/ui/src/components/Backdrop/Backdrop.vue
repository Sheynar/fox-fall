<template>
	<!-- <Map v-if="settings.showMap" /> -->
	<Grid :cells-x="5" :cells-y="5" />

	<CompassIcon
		class="Backdrop__compass"
		:style="{
			'--viewport-deg': viewport.rotation,
		}"
		alt="Reset rotation"
		@pointerdown.stop="onCompassClicked()"
	/>

	<div class="Backdrop__debug-info">
		<div>
			cursor: x{{ Math.round(resolvedCursor.x) }}m y{{
				Math.round(resolvedCursor.y)
			}}m
		</div>
		<div>
			position: x{{ Math.round(position.x) }}m y{{ Math.round(position.y) }}m
		</div>
		<div>rotation: {{ wrapDegrees(90 - viewport.rotation).toFixed(1) }}°</div>
		<div>zoom: {{ Math.round(viewport.zoom * 100) }}%</div>
	</div>
</template>

<style lang="scss">
	.Backdrop__compass {
		position: absolute;
		top: 1em;
		right: 1em;

		width: 10em;
		height: 10em;
		border-radius: 50%;

		transform: rotate(calc(var(--viewport-deg) * 1deg - 90deg));
		transform-origin: 50% 50%;

		cursor: pointer;
		user-select: none;
		filter: url(#outline);
	}

	.Backdrop__debug-info {
		position: absolute;
		bottom: 1em;
		left: 1em;

		user-select: none;
		filter: url(#outline);
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import CompassIcon from '@/components/icons/CompassIcon.vue';
	// import Map from './Map/Map.vue';
	import Grid from './Grid.vue';
	import { injectCursor } from '@/contexts/cursor';
	import { injectUnitMap } from '@/contexts/unit';
	import { injectViewport } from '@/contexts/viewport';
	import { wrapDegrees } from '@/lib/angle';
	// import { settings } from '@/lib/settings';
	import { getUnitResolvedVector } from '@/lib/unit';
	import { Vector } from '@/lib/vector';

	const cursor = injectCursor();
	const viewport = injectViewport();
	const unitMap = injectUnitMap();

	const resolvedCursor = computed(() => {
		return viewport.value.toViewportVector(cursor.value);
	});

	const position = computed(() => viewport.value.getFocusedPosition());

	const onCompassClicked = async () => {
		viewport.value.withSmoothing(async () => {
			viewport.value.rotation = viewport.value.rotation > 270 ? 360 + 90 : 90;

			const unitVectors = Object.values(unitMap.value).map((unit) => {
				return getUnitResolvedVector(unitMap.value, unit.id);
			});

			const center = unitVectors
				.reduce(
					(sum, vector) => {
						return sum.addVector(vector);
					},
					Vector.fromCartesianVector({ x: 0, y: 0 })
				)
				.scale(1 / (unitVectors.length || 1));

			if (unitVectors.length > 1) {
				const maxOffset = Math.max(
					0,
					...unitVectors.map((vector) => {
						return Math.abs(vector.addVector(center.scale(-1)).distance);
					})
				);

				viewport.value.zoomTo(0.8 / (maxOffset / 100));
			} else {
				viewport.value.zoomTo(1);
			}

			viewport.value.panToCentered(center);
		});
	};
</script>
