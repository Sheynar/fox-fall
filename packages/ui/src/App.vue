<template>
	<BitmapDisplay
		v-show="
			artillery.overlayOpen.value &&
			!artillery.viewportControl.calibrating.value &&
			!artillery.viewportControl.screenShotting.value
		"
		class="App__screen-canvas"
		:style="{
			opacity: settings.screenshotOpacity,
		}"
		:image="artillery.viewportControl.screenShot.value"
	/>

	<div
		:ref="(el) => (artillery.containerElement.value = el as HTMLDivElement)"
		class="App__container"
		:class="{
			App__transparent: isOverlay && settings.transparentOverlay,
			App__hidden: !artillery.overlayOpen.value && !settings.overlayAlwaysVisible,
			App__screenshot: artillery.viewportControl.screenShotting.value,
		}"
		@touchstart.prevent
		@pointerdown.stop="($event.target as HTMLDivElement).focus()"
		@pointermove="onPointerMove"
		@contextmenu.prevent="onContextMenu"
		tabindex="-1"
	>
		<template
			v-if="
				!artillery.viewportControl.calibrating.value &&
				!artillery.viewportControl.screenShotting.value
			"
		>
			<Grid v-if="settings.backdropMode === BackdropMode.Grid" @contextMenu="onContextMenu" />

			<Viewport />

			<OverlayHud />

			<ContextMenu
				ref="contextMenu"
				:model="contextMenuOptions"
				@hide="() => (contextMenuPosition = null)"
			>
				<template #item="{ item, props }">
					<a
						class="p-contextmenu-item-link"
						tabindex="-1"
						v-bind="props.action"
					>
						<Component v-if="item.icon" :is="item.icon" />
						<span class="p-contextmenu-item-label">{{ item.label }}</span>
						<i
							v-if="item.items"
							class="pi pi-angle-right p-icon p-contextmenu-submenu-icon"
						></i>
					</a>
				</template>
			</ContextMenu>
		</template>

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
				<filter id="outline-inset">
					<feFlood flood-color="black" result="inside-color" />
					<feComposite in2="SourceAlpha" operator="in" result="inside-stroke" />
					<!--fill-area-->
					<feMorphology in="SourceAlpha" operator="erode" radius="1" />
					<feComposite in="SourceGraphic" operator="in" result="fill-area" />

					<feMerge>
						<feMergeNode in="inside-stroke" />
						<feMergeNode in="fill-area" />
					</feMerge>
				</filter>
			</defs>
		</svg>
	</div>

	<OverlayToggle v-model:overlayOpen="artillery.overlayOpen.value" />
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
	}
	.App__screen-canvas {
		contain: content;
		position: fixed;
		left: 0;
		top: 0;
		width: 100dvw;
		height: 100dvh;
	}
</style>

<script setup lang="ts">
	import ContextMenu from 'primevue/contextmenu';
	import type { MenuItem } from 'primevue/menuitem';
	import { computed, ref, shallowRef } from 'vue';
	import { UnitType } from '@packages/data/dist/artillery/unit';
	import { Vector } from '@packages/data/dist/artillery/vector';
	import BitmapDisplay from '@/components/BitmapDisplay.vue';
	import Grid from '@/components/Grid.vue';
	import OverlayHud from '@/components/OverlayHud/OverlayHud.vue';
	import OverlayToggle from '@/components/OverlayToggle/OverlayToggle.vue';
	import Viewport from '@/components/Viewport/Viewport.vue';
	import { isOverlay } from '@/lib/constants';
	import { UNIT_ICON_BY_TYPE } from '@/lib/constants/unit';
	import { artillery } from '@/lib/globals';
	import { BackdropMode, settings, UserMode } from '@/lib/settings';
	import { getAvailableUnitTypes, getUnitResolvedVector } from '@/lib/unit';

	const contextMenu = shallowRef<null | InstanceType<typeof ContextMenu>>(null);

	const onPointerMove = (event: PointerEvent) => {
		artillery.cursor.value.cartesianVector = {
			x: event.clientX - artillery.viewport.value.viewportSize.x / 2,
			y: event.clientY - artillery.viewport.value.viewportSize.y / 2,
		};
	};

	const contextMenuPosition = ref<Vector | null>(null);
	const onContextMenu = (event: MouseEvent) => {
		if (artillery.unitSelector.value != null) {
			event.preventDefault();
			event.stopPropagation();
			artillery.unitSelector.value.selectUnit(null);
		} else if (!artillery.viewportControl.canRotate.value) {
			contextMenuPosition.value = artillery.cursor.value.clone();
			contextMenu.value?.show(event);
		}
	};
	const contextMenuOptions = computed(() => {
		const standaloneOnly = settings.value.userMode === UserMode.Basic || artillery.selectedUnit.value == null;

		const availableUnitTypes = getAvailableUnitTypes();

		const output: MenuItem[] = [
			{
				label:
					!standaloneOnly
						? 'Add standalone unit'
						: 'Add unit',
				items: availableUnitTypes.map((unitType) => ({
					label: `${UnitType[unitType]}`,
					icon: UNIT_ICON_BY_TYPE[unitType],
					command: () => {
						artillery.addUnit(
							unitType,
							undefined,
							ref(
								artillery.viewport.value.toWorldPosition(
									contextMenuPosition.value!
								)
							)
						);
					},
				})),
			},
		];

		if (!standaloneOnly) {
			output.push({
				label: 'Add linked unit',
				items: [
					UnitType.Artillery,
					UnitType.Spotter,
					UnitType.Location,
					UnitType.Target,
					UnitType.LandingZone,
				].map((unitType) => ({
					label: `${UnitType[unitType]}`,
					command: () => {
						artillery.addUnit(
							unitType,
							undefined,
							ref(
								artillery.viewport.value
									.toWorldPosition(contextMenuPosition.value!)
									.addVector(
										getUnitResolvedVector(
											artillery.unitMap.value,
											artillery.selectedUnit.value!
										).scale(-1)
									)
							),
							artillery.selectedUnit.value!
						);
					},
				})),
			});
		}

		return output;
	});
</script>
