<template>
	<div class="Hud__container" :style="{ 'z-index': LAYER.HUD }">
		<div class="Hud__banner" v-if="artillery.unitSelector.value != null">
			{{
				artillery.unitSelector.value.prompt ?? 'Click on a unit to select it'
			}}
		</div>

		<CompassIcon
			class="Hud__compass"
			:style="{
				'--viewport-deg': artillery.viewport.value.rotation,
				opacity: settings.compassOpacity,
				'pointer-events': settings.compassOpacity > 0 ? 'auto' : 'none',
			}"
			alt="Reset rotation"
			:model-value="-artillery.viewport.value.rotation"
			@pointerdown.stop="onCompassClicked()"
		/>

		<div class="Hud__viewport-controls">
			<PrimeButton
				class="Dock__button"
				raised
				:severity="settings.lockPan ? 'danger' : 'secondary'"
				@pointerdown.stop="settings.lockPan = !settings.lockPan"
				v-prime-tooltip.left="'Lock pan'"
			>
				<DragIcon />
			</PrimeButton>
			<PrimeButton
				class="Dock__button"
				raised
				:severity="settings.lockRotate ? 'danger' : 'secondary'"
				@pointerdown.stop="settings.lockRotate = !settings.lockRotate"
				v-prime-tooltip.left="'Lock rotation'"
			>
				<RotateIcon />
			</PrimeButton>
			<PrimeButton
				class="Dock__button"
				raised
				:severity="settings.lockZoom ? 'danger' : 'secondary'"
				@pointerdown.stop="settings.lockZoom = !settings.lockZoom"
				v-prime-tooltip.left="'Lock zoom'"
			>
				<ZoomIcon />
			</PrimeButton>
		</div>

		<div class="Hud__debug-info">
			<div>
				cursor: x{{ Math.round(resolvedCursor.x) }}m y{{
					Math.round(resolvedCursor.y)
				}}m
			</div>
			<div>
				position: x{{ Math.round(position.x) }}m y{{ Math.round(position.y) }}m
			</div>
			<div>
				rotation:
				{{ wrapDegrees(artillery.viewport.value.rotation).toFixed(1) }}°
			</div>
			<div>zoom: {{ Math.round(artillery.viewport.value.zoom * 100) }}%</div>
		</div>

		<Dock />
	</div>
</template>

<style lang="scss">
	.Hud__container {
		display: contents;
	}

	.Hud__banner {
		position: fixed;
		top: 1em;
		left: 50%;
		transform: translateX(-50%);

		padding: 1em;
		border: 1px solid;

		background: black;
		opacity: 0.5;

		pointer-events: none;
	}

	.Hud__compass {
		position: fixed;
		top: 1em;
		right: 1em;

		width: 10em;
		height: 10em;
		border-radius: 50%;

		transform: rotate(calc(var(--viewport-deg) * 1deg));
		transform-origin: 50% 50%;

		cursor: pointer;
		user-select: none;
		filter: url(#outline);
	}

	.Hud__viewport-controls {
		position: fixed;
		top: 1em;
		right: 12em;

		display: flex;
		flex-direction: column;
		gap: 0.5em;
		filter: url(#outline);
	}

	.Hud__debug-info {
		position: fixed;
		bottom: 1em;
		left: 1em;

		user-select: none;
		filter: url(#outline);
	}
</style>

<script setup lang="ts">
	import PrimeButton from 'primevue/button';
	import vPrimeTooltip from 'primevue/tooltip';
	import { computed } from 'vue';
	import Dock from '@/components/OverlayHud/Dock.vue';
	import CompassIcon from '@/components/icons/CompassIcon.vue';
	import DragIcon from '@/components/icons/DragIcon.vue';
	import RotateIcon from '@/components/icons/RotateIcon.vue';
	import ZoomIcon from '@/components/icons/ZoomIcon.vue';
	import { wrapDegrees } from '@/lib/angle';
	import { LAYER } from '@/lib/constants/ui';
	import { artillery } from '@/lib/globals';
	import { settings } from '@/lib/settings';

	const resolvedCursor = computed(() => {
		return artillery.viewport.value.toWorldPosition(artillery.cursor.value);
	});

	const position = computed(() =>
		artillery.viewport.value
			.toWorldOffset(artillery.viewport.value.position)
			.scale(-1)
	);

	const onCompassClicked = async () => {
		await artillery.viewport.value.withSmoothing(async () => {
			artillery.resetViewport();
		});
	};
</script>
