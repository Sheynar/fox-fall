<template>
	<div
		class="App__container"
		@touchstart.prevent
		tabindex="-1"
		ref="containerElement"
	>
		<Viewport>
			<PositionedElement v-if="false" :layer="1" :x="0" :y="0">
				<HexMap :mapSource="MapSource.ImprovedMapModRustardKnightEdit" />
			</PositionedElement>
		</Viewport>

		<canvas ref="canvasElement" :width="width" :height="height" />

		<MarkerControls />

		<svg>
			<defs>
				<filter id="outline-black">
					<feMorphology
						in="SourceGraphic"
						result="DILATED"
						operator="dilate"
						radius="2"
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
				<filter id="outline-white">
					<feMorphology
						in="SourceGraphic"
						result="DILATED"
						operator="dilate"
						radius="2"
					/>
					<feColorMatrix
						in="DILATED"
						result="OUTLINED"
						type="matrix"
						values="
						1 1 1 0 0
						1 1 1 0 0
						1 1 1 0 0
						0 0 0 1 0
					"
					/>

					<feMerge>
						<feMergeNode in="OUTLINED" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<filter id="outline-black-inset">
					<feFlood flood-color="black" result="inside-color" />
					<feComposite in2="SourceAlpha" operator="in" result="inside-stroke" />
					<!--fill-area-->
					<feMorphology in="SourceAlpha" operator="erode" radius="2" />
					<feComposite in="SourceGraphic" operator="in" result="fill-area" />

					<feMerge>
						<feMergeNode in="inside-stroke" />
						<feMergeNode in="fill-area" />
					</feMerge>
				</filter>
				<filter id="outline-white-inset">
					<feFlood flood-color="white" result="inside-color" />
					<feComposite in2="SourceAlpha" operator="in" result="inside-stroke" />
					<!--fill-area-->
					<feMorphology in="SourceAlpha" operator="erode" radius="2" />
					<feComposite in="SourceGraphic" operator="in" result="fill-area" />

					<feMerge>
						<feMergeNode in="inside-stroke" />
						<feMergeNode in="fill-area" />
					</feMerge>
				</filter>
			</defs>
		</svg>
	</div>
</template>

<style lang="scss">
	.App__container {
		contain: content;
		position: fixed;
		left: 0;
		top: 0;
		width: 100dvw;
		height: 100dvh;
		cursor: initial;

		color: var(--color-primary);
		outline: none;

		will-change: transform;
		transform: translateZ(0);

		&:not(.App__transparent) {
			background-color: var(--color-primary-contrast);
		}

		&.App__hidden {
			filter: opacity(0);
			pointer-events: none;
		}

		&.App__screenshot {
			cursor: none;
		}

		&.App__calibrating,
		&.App__screenshot {
			opacity: 0;
			pointer-events: none;
		}
	}

	.App__hexMapCanvas {
		pointer-events: none;
	}

	.App__markerCanvas {
		pointer-events: initial;
	}

	.App__hexMapCanvas,
	.App__markerCanvas {
		position: fixed;
		inset: 0;
		width: 100dvw;
		height: 100dvh;
	}
</style>

<script setup lang="ts">
	import { Vector } from '@packages/data/dist/artillery/vector';
	import { MapSource } from '@packages/frontend-libs/dist/assets/images/hex-maps';
	import {
		provideViewport,
		Viewport as ViewportClass,
	} from '@packages/frontend-libs/dist/viewport/viewport';
	import Viewport from '@packages/frontend-libs/dist/viewport/Viewport.vue';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import { useViewportControl } from '@packages/frontend-libs/dist/viewport/viewport-control';
	import HexMap from '@packages/frontend-libs/dist/HexMap/HexMap.vue';
	import { computed, onMounted, onUnmounted, ref } from 'vue';
	import {
		markerSize,
		markerColor,
		markerType,
		markerDisabled,
	} from './lib/globals';
	import MarkerControls from './MarkerControls.vue';
	import { useHexMap } from './rendering/hex-map';
	import { useMarker } from './rendering/marker';
	import { useElementBounding } from '@vueuse/core';
	import { MAP_SIZE } from '@packages/data/dist/artillery/map';

	const containerElement = ref<HTMLDivElement | null>(null);
	const canvasElement = ref<HTMLCanvasElement | null>(null);

	const { width, height } = useElementBounding(containerElement);

	const viewport = ref(
		new ViewportClass(
			Vector.fromCartesianVector({
				x: 0,
				y: 0,
			}),
			0,
			1
		)
	);

	const { moving } = useViewportControl({
		containerElement,
		viewport,
		lockRotate: ref(true),
		disableMouseControls: computed(() => activeMarker.value != null),
	});

	provideViewport(viewport);

	const {
		backdropCanvas: hexMapCanvasElement,
		foregroundCanvas: hexMapForegroundCanvasElement,
		start: startHexMap,
		stop: stopHexMap,
	} = useHexMap({
		mapSource: MapSource.ImprovedMapModRustardKnightEdit,
		position: computed(() => viewport.value.position),
		zoom: computed(() => viewport.value.resolvedZoom),
		width,
		height,
	});

	const {
		start: startMarker,
		stop: stopMarker,
		canvasElement: markerCanvasElement,
		activeMarker,
	} = useMarker({
		eventElement: canvasElement,
		zoom: computed(() => viewport.value.resolvedZoom),
		position: computed(() => viewport.value.position),
		width,
		height,
		maxWidth: MAP_SIZE.width,
		maxHeight: MAP_SIZE.height,
		markerType,
		markerColor,
		markerSize,
		markerDisabled: computed(
			() => markerDisabled.value || moving.value != null
		),
		markerId: 'marker-export',
	});

	const context = computed(() => canvasElement.value?.getContext('2d'));
	let frameRequest: ReturnType<typeof requestAnimationFrame> | null = null;
	const cancelFrame = () => {
		if (frameRequest != null) {
			cancelAnimationFrame(frameRequest);
			frameRequest = null;
		}
	};
	const requestFrame = () => {
		cancelFrame();
		frameRequest = requestAnimationFrame(render);
	};
	const render = () => {
		cancelFrame();
		try {
			if (!context.value) return;
			context.value.clearRect(0, 0, width.value, height.value);
			context.value.drawImage(
				hexMapCanvasElement,
				0,
				0,
				width.value,
				height.value
			);
			context.value.drawImage(
				markerCanvasElement,
				0,
				0,
				width.value,
				height.value
			);
			context.value.drawImage(
				hexMapForegroundCanvasElement,
				0,
				0,
				width.value,
				height.value
			);
		} finally {
			requestFrame();
		}
	};

	onMounted(() => {
		if (!canvasElement.value) return;
		startHexMap();
		startMarker();
		requestFrame();
	});

	onUnmounted(() => {
		stopHexMap();
		stopMarker();
		cancelFrame();
	});
</script>
