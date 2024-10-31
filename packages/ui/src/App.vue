<template>
	<div
		v-show="!calibrating"
		ref="containerElement"
		class="App__container"
		:class="{ App__transparent: isTransparent }"
		@touchstart.prevent
		@pointerdown.stop="($event.target as HTMLDivElement).focus()"
		@pointermove="onPointerMove"
		@contextmenu.prevent="onContextMenu"
		tabindex="-1"
	>
		<Grid />

		<Viewport />

		<OverlayHud @calibrate-grid="() => calibrateGrid()" />

		<svg>
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
		font-size: 2vmin;

		color: var(--color-primary);
		outline: none;

		&:not(.App__transparent) {
			background-color: var(--color-primary-contrast);
		}
	}
</style>

<script setup lang="ts">
	import { computed, nextTick, onMounted, ref, watch } from 'vue';
	import Grid from '@/components/Grid.vue';
	import OverlayHud from '@/components/OverlayHud/OverlayHud.vue';
	import Viewport from '@/components/Viewport/Viewport.vue';
	import { artillery } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import { Vector } from '@/lib/vector';
	import { useUnitGroup } from '@/mixins/unit-group';
	import { useViewPortControl } from '@/mixins/viewport-control';

	const containerElement = ref<null | HTMLDivElement>(null);

	const unitGroupIds = computed(() => Object.keys(artillery.unitMap.value));
	const unitGroup = useUnitGroup(artillery.unitMap, unitGroupIds);

	const { calibrating, calibrateGrid } = useViewPortControl({
		containerElement,
		viewport: artillery.viewport,
		lockPan: computed(() => {
			if (!settings.value.automaticCameraTargeting) return null;
			if (unitGroup.units.value.length === 0)
				return Vector.fromCartesianVector({ x: 0, y: 0 });
			return unitGroup.averageVector.value;
		}),
		lockZoom: computed(() => {
			if (!settings.value.automaticCameraZoom) return null;
			if (unitGroup.units.value.length <= 1 || unitGroup.maxOffset.value <= 0)
				return 1;
			return 0.8 / (unitGroup.maxOffset.value / 100);
		}),
	});

	const onPointerMove = (event: PointerEvent) => {
		artillery.cursor.value.cartesianVector = {
			x: event.clientX - artillery.viewport.value.viewportSize.x / 2,
			y: event.clientY - artillery.viewport.value.viewportSize.y / 2,
		};
	};

	const onContextMenu = (event: MouseEvent) => {
		if (artillery.unitSelector.value != null) {
			event.preventDefault();
			event.stopPropagation();
			artillery.unitSelector.value.selectUnit(null);
		}
	};

	const isTransparent =
		new URL(location.href).searchParams.get('overlay') != null;

	onMounted(() => {
		containerElement.value?.focus();
	});
	watch(
		() => calibrating.value,
		(calibrating) => {
			if (!calibrating) {
				nextTick(() => containerElement.value?.focus());
			}
		}
	);
</script>
