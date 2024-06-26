<template>
	<div
		class="Backdrop__grid"
		:style="{
			'--background-x': backgroundOffset.x,
			'--background-y': backgroundOffset.y,

			'--viewport-deg': viewport.rotation,
			'--viewport-zoom': viewport.resolvedZoom,
		}"
	/>

	<CompassIcon
		class="Backdrop__compass"
		:style="{
			'--viewport-deg': viewport.rotation,
		}"
		alt="Reset rotation"
		@pointerdown.stop="resetRotation()"
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
	.Backdrop__grid {
		position: absolute;
		left: -150vmax;
		right: -150vmax;
		top: -150vmax;
		bottom: -150vmax;

		background: linear-gradient(
				180deg,
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 0) calc(50% - 0.1em),
				rgba(0, 0, 0, 1) calc(50%),
				rgba(0, 0, 0, 0) calc(50% + 0.1em),
				rgba(0, 0, 0, 0) 100%
			),
			linear-gradient(
				90deg,
				rgba(0, 0, 0, 0) 0%,
				rgba(0, 0, 0, 0) calc(50% - 0.1em),
				rgba(0, 0, 0, 1) calc(50%),
				rgba(0, 0, 0, 0) calc(50% + 0.1em),
				rgba(0, 0, 0, 0) 100%
			);

		background-size: calc(125px / 3 * var(--viewport-zoom))
			calc(125px / 3 * var(--viewport-zoom));
		background-position: calc(var(--background-y) * 1px + 150vmax)
			calc(var(--background-x) * 1px + 150vmax);

		transform: rotate(calc(var(--viewport-deg) * 1deg));
		transform-origin: 150vmax 150vmax;
	}

	.Backdrop__compass {
		position: absolute;
		top: 1em;
		left: 1em;

		width: 10em;
		height: 10em;
		border-radius: 50%;

		transform: rotate(calc(var(--viewport-deg) * 1deg - 90deg));
		transform-origin: 50% 50%;

		cursor: pointer;
		user-select: none;
	}

	.Backdrop__debug-info {
		position: absolute;
		top: 1em;
		right: 1em;

		user-select: none;
	}
</style>

<script setup lang="ts">
	import { KAnim } from '@kaosdlanor/kanim';
	import { computed } from 'vue';
	import CompassIcon from '@/components/icons/CompassIcon.vue';
	import { injectCursor } from '@/contexts/cursor';
	import { injectViewport } from '@/contexts/viewport';
	import { toRadians, wrapDegrees } from '@/lib/angle';

	const cursor = injectCursor();
	const viewport = injectViewport();

	const resolvedCursor = computed(() => {
		return viewport.value.toViewportVector(cursor.value);
	});

	const position = computed(() => viewport.value.getFocusedPosition());

	const backgroundOffset = computed(() => ({
		x:
			-viewport.value.position.x *
				Math.sin(toRadians(viewport.value.rotation)) +
			viewport.value.position.y * Math.cos(toRadians(viewport.value.rotation)),
		y:
			viewport.value.position.y * Math.sin(toRadians(viewport.value.rotation)) +
			viewport.value.position.x * Math.cos(toRadians(viewport.value.rotation)),
	}));

	const resetRotation = async () => {
		const viewportProxy = {
			get rotation() {
				return viewport.value.rotation;
			},
			set rotation(value: number) {
				viewport.value.rotateTo(value);
			},
		};

		await KAnim.animate({
			element: viewportProxy,
			property: 'rotation',
			from: viewport.value.rotation,
			to: viewport.value.rotation > 270 ? 360 + 90 : 90,
			duration: 250,
			easing: 'easeInOutQuad',
		});
	};
</script>
