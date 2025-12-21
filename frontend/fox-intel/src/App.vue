<template>
	<div
		class="App__container"
		@touchstart.prevent
		tabindex="-1"
		ref="containerElement"
	>
		<Viewport>
			<PositionedElement :layer="1" :x="0" :y="0">
				<HexMap :mapSource="MapSource.ImprovedMapModRustardKnightEdit">
					<template #hex>
						<Marker
							class="App__marker"
							:canvasWidth="HEX_SIZE.width"
							:canvasHeight="HEX_SIZE.height"
							:size="markerSize"
							:color="markerColor"
							:type="markerType"
							:disabled="markerDisabled"
						/>
					</template>
				</HexMap>
			</PositionedElement>
		</Viewport>

		<Hud />

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

	.App__marker {
		z-index: 1000;
		pointer-events: initial;
		clip-path: polygon(0 50%, 25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%);
	}
</style>

<script setup lang="ts">
	import { Vector } from '@packages/data/dist/artillery/vector';
	import { HEX_SIZE } from '@packages/data/dist/artillery/map';
	import { MapSource } from '@packages/frontend-libs/dist/assets/images/hex-maps';
	import Marker from '@packages/frontend-libs/dist/marker/Marker.vue';
	import {
		provideViewport,
		Viewport as ViewportClass,
	} from '@packages/frontend-libs/dist/viewport/viewport';
	import Viewport from '@packages/frontend-libs/dist/viewport/Viewport.vue';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import { useViewportControl } from '@packages/frontend-libs/dist/viewport/viewport-control';
	import HexMap from '@packages/frontend-libs/dist/HexMap/HexMap.vue';
	import { ref } from 'vue';
	import {
		markerSize,
		markerColor,
		markerType,
		markerDisabled,
	} from './lib/globals';
	import MarkerControls from './MarkerControls.vue';

	const containerElement = ref<HTMLDivElement | null>(null);

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

	useViewportControl({
		containerElement,
		viewport,
	});

	provideViewport(viewport);
</script>
