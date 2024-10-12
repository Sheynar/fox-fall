<template>
	<div
		ref="containerElement"
		class="App__container"
		:class="{ App__transparent: isTransparent}"
		@touchstart.prevent
		@pointermove="onPointerMove"
		@contextmenu.prevent
	>
		<Backdrop />
		<div
			class="App__viewport"
			:style="{
				'--viewport-x': viewport.position.x,
				'--viewport-y': viewport.position.y,

				'--viewport-deg': viewport.rotation,
				'--viewport-zoom': viewport.resolvedZoom,
			}"
		>
			<div class="App__units">
				<UnitProvider
					v-for="unitId in Object.keys(unitMap).filter(
						(unitId) => unitMap[unitId]
					)"
					:key="unitId"
					:unit="unitMap[unitId]"
				>
					<UnitComponent
						@create-child="addUnit($event, undefined, undefined, unitId)"
						@updated="updateUnit(unitId)"
						@remove="removeUnit(unitId)"
						@set-unit-source="setUnitSource(unitId, $event)"
						@update-wind="editWind(unitId)"
					/>
				</UnitProvider>
			</div>
			<div class="App__arrows">
				<UnitLink
					v-for="unitId in Object.keys(unitMap).filter(
						(unitId) => unitMap[unitId].parentId != null
					)"
					:key="unitId"
					:unit-id-from="unitMap[unitId].parentId!"
					:unit-id-to="unitId"
				/>
			</div>
		</div>

		<FiringArcs />

		<div class="App__banner" v-if="unitSelector != null">
			{{ unitSelector.prompt ?? 'Click on a unit to select it' }}
		</div>

		<Dock
			:ready-to-fire="readyToFire"
			@update:ready-to-fire="
				readyToFire = $event;
				updateReadyToFire();
			"
			@open-gunner-interface="() => openGunnerInterface()"
			@show-add-unit="addUnit(UnitType.Location, undefined, undefined)"
			@show-help="showHelp()"
			@show-sync="promptSync()"
			@toggle-settings="() => (settingsVisible = !settingsVisible)"
			@toggle-wind-settings="() => (windSettingsVisible = !windSettingsVisible)"
		/>

		<Settings v-model:visible="settingsVisible" />

		<WindSettings
			v-model:visible="windSettingsVisible"
			@reset="resetWind()"
			@update="updateWind()"
		/>

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

		&:not(.App__transparent) {
			background-color: var(--color-primary-contrast);
		}
	}

	.App__units {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;
	}

	.App__arrows {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;

		pointer-events: none;
	}

	.App__banner {
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

	.App__controls {
		position: absolute;
		right: 0.5em;
		bottom: 0.5em;
		z-index: 1000;
	}
</style>

<script setup lang="ts">
	import { computed, ref } from 'vue';
	import Backdrop from '@/components/Backdrop.vue';
	import Dock from '@/components/Dock.vue';
	import FiringArcs from '@/components/FiringArcs/FiringArcs.vue';
	import Settings from '@/components/Settings.vue';
	import UnitComponent from '@/components/Unit/Unit.vue';
	import UnitLink from '@/components/UnitLink.vue';
	import UnitProvider from '@/contexts/unit/UnitProvider.vue';
	import WindSettings from '@/components/WindSettings.vue';
	import { promptSync } from '@/lib/prompts/sync';
	import { settings } from '@/lib/settings';
	import { Vector } from '@/lib/vector';
	import { UnitType } from '@/lib/unit';
	import { useArtillery } from '@/mixins/artillery';
	import { useServerConnection } from '@/mixins/server-connection';
	import { useSyncedRoom } from '@/mixins/synced-room';
	import { useUnitGroup } from '@/mixins/unit-group';
	import { useViewPortControl } from '@/mixins/viewport-control';

	const containerElement = ref<null | HTMLDivElement>(null);

	const {
		addUnit,
		removeUnit,
		setUnitSource,
		editWind,
		resetWind,

		cursor,
		wind,
		readyToFire,
		unitMap,
		unitSelector,
		viewport,
	} = useArtillery({
		onUnitUpdated: (unitId: string) => updateUnit(unitId),
		onWindUpdated: () => updateWind(),
	});

	const unitGroupIds = computed(() => {
		const output = [...settings.value.pointsOfInterest];
		if (
			settings.value.mainUnit != null &&
			!output.includes(settings.value.mainUnit)
		) {
			output.push(settings.value.mainUnit);
		}

		if (output.length === 0) {
			return Object.keys(unitMap.value);
		}

		return output;
	});
	const unitGroup = useUnitGroup(unitMap, unitGroupIds);

	useViewPortControl({
		containerElement,
		viewport,
		lockPosition: computed(() => {
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
		cursor.value.cartesianVector = {
			x: event.clientX,
			y: event.clientY,
		};
	};

	const showHelp = () => {
		alert(
			`Controls:\nLeft click: select unit\nLeft click drag: move unit / pan camera\nRight click drag / shift + left click drag: rotate camera\nScroll: zoom camera (hold CTRL to zoom 5x faster or shift to zoom 10x slower)\n\nClick unit's create buttons to insert a new child units\nCTRL + click unit's create buttons to change the unit type\n\nShow firing arcs by selecting an artillery unit or a target.\nAlternatively pin/hover an artillery unit and a target\n`
		);
	};

	const serverConnection = useServerConnection();
	const { updateReadyToFire, updateUnit, updateWind } = useSyncedRoom(
		readyToFire,
		unitMap,
		wind,
		serverConnection.webSocket
	);

	const settingsVisible = ref(false);
	const windSettingsVisible = ref(false);

	const openGunnerInterface = () => {
		window.location.pathname = window.location.pathname + 'gunner/';
	};

	const isTransparent = new URL(location.href).searchParams.get('overlay') != null;
</script>
