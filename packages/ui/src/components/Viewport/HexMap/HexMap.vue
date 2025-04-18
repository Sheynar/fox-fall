<template>
	<PositionedElement :layer="LAYER.BACKDROP" :x="0" :y="0">
		<div
			class="HexMap__outer"
			:style="{
				'--hex-size': `${artillery.viewport.value.resolvedZoom * 2197}px`,
				'--viewport-rotation': `${artillery.viewport.value.rotation}deg`,
				opacity: settings.screenshotOpacity,
			}"
		>
			<div class="HexMap__container">
				<div
					class="HexMap__row"
					:class="{
						'HexMap__row--even': y % 2 === 0,
						'HexMap__row--odd': y % 2 !== 0,
					}"
					v-for="(row, y) in HEX_POSITIONS"
					:key="y"
				>
					<div
						class="HexMap__hex"
						:class="{ 'HexMap__hex--blank': !hex }"
						v-for="(hex, x) in row"
						:key="x"
					>
						<img class="HexMap__hex-image" v-if="hex" :src="HEX_ASSETS[hex]" />
						<div
							class="HexMap__hex-label"
							v-show="artillery.viewport.value.zoom <= 0.1"
						>
							{{ hex }}
						</div>
					</div>
				</div>
				<div class="HexMap__row"></div>
			</div>
		</div>
	</PositionedElement>
</template>

<style lang="scss">
	.HexMap__outer {
		display: grid;
		pointer-events: none;
	}

	.HexMap__container {
		display: grid;
		grid-template-columns: max-content;
		grid-auto-rows: max-content;
		grid-auto-flow: row;

		transform-origin: 50% 50%;
		transform-box: fill-box;
		transform: translate(-50%, -50%);
	}

	.HexMap__row {
		display: grid;
		grid-template-rows: max-content;
		grid-auto-columns: max-content;
		grid-auto-flow: column;
		gap: calc(var(--hex-size) / 2);
		height: calc(var(--hex-size) * 0.866 / 2);
	}

	.HexMap__row--odd {
		transform: translateX(calc(var(--hex-size) * 0.75));
	}

	.HexMap__hex {
		position: relative;
		width: var(--hex-size);
		height: calc(var(--hex-size) * 0.866);
		flex: 0 0 auto;
		overflow: hidden;
	}

	.HexMap__hex--blank {
		visibility: hidden;
	}

	.HexMap__hex-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		filter: url(#outline-inset);
	}

	.HexMap__hex-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform-origin: 50% 50%;
		transform: translate(-50%, -50%) rotate(calc(var(--viewport-rotation) * -1));
		text-align: center;
		font-size: 12px;
		font-weight: bold;
		color: #fff;
		filter: url(#outline);
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';
	import { HEX_MAPS } from '@/assets/images/hex-maps';
	import PositionedElement from '@/components/Viewport/PositionedElement.vue';
	import { HEX_POSITIONS } from '@/lib/constants/hexMap';
	import { LAYER } from '@/lib/constants/ui';
	import { artillery } from '@/lib/globals';
	import { MapSource, settings } from '@/lib/settings';

	const HEX_ASSETS = computed(() => HEX_MAPS[settings.value.mapSource] ?? HEX_MAPS[MapSource.Vanilla]);
</script>
