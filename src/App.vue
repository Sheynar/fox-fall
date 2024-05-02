<template>
	<div
		ref="containerElement"
		class="App__container"
		@touchstart.prevent
		@pointermove="onPointerMove"
		@contextmenu.prevent
	>
		<Backdrop />
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
		<div class="App__units">
			<UnitProvider
				v-for="unitId in Object.keys(unitMap).filter(
					(unitId) => unitMap[unitId]
				)"
				:key="unitId"
				:unit="unitMap[unitId]"
			>
				<UnitComponent
					:create-event="unitCreateEvents.get(unitMap[unitId])"
					@updated="updateUnit(unitId)"
				/>
			</UnitProvider>
		</div>

		<FiringArcs />

		<UnitProvider v-if="selectedUnit" :unit="unitMap[selectedUnit]">
			<UnitTooltip
				@create-child="
					addUnit($event.unitType, $event.pointerEvent, undefined, selectedUnit)
				"
				@delete="removeUnit(selectedUnit)"
				@updated="updateUnit(selectedUnit)"
				@update-wind="editWind(selectedUnit)"
			/>
		</UnitProvider>

		<Wind class="App__wind" @reset="resetWind()" />

		<div class="App__banner" v-if="unitSelector != null">
			{{ unitSelector.prompt ?? 'Click on a unit to select it' }}
		</div>

		<Controls
			class="App__controls"
			@create-unit="addUnit($event.unitType, $event.pointerEvent)"
			@show-sync="showSync()"
			@show-help="showHelp()"
		/>
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

	.App__wind {
		position: absolute;
		left: 0.5em;
		bottom: 0.5em;
		z-index: 1000;
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
	import Controls from '@/components/Controls.vue';
	import FiringArcs from '@/components/FiringArcs/FiringArcs.vue';
	import UnitComponent from '@/components/Unit/Unit.vue';
	import UnitLink from '@/components/UnitLink.vue';
	import UnitTooltip from '@/components/Unit/UnitTooltip.vue';
	import Wind from '@/components/Wind.vue';
	import UnitProvider from '@/contexts/unit/UnitProvider.vue';
	import { Vector } from '@/lib/vector';
	import { useArtillery } from '@/mixins/artillery';
	import { useServerConnection } from '@/mixins/server-connection';
	import { useSyncedRoom } from '@/mixins/synced-room';
	import { useViewPortControl } from '@/mixins/viewport-control';

	(<any>window).Vector = Vector;

	const containerElement = ref<null | HTMLDivElement>(null);

	const {
		addUnit,
		removeUnit,
		editWind,
		resetWind,

		cursor,
		wind,
		selectedUnit,
		unitMap,
		unitSelector,
		unitCreateEvents,
		viewport,
	} = useArtillery({
		onUnitUpdated: (unitId: string) => updateUnit(unitId),
		onWindUpdated: () => updateWind(),
	});

	useViewPortControl({
		containerElement,
		viewport,
		selectedUnit,
	});

	const onPointerMove = (event: PointerEvent) => {
		cursor.value.cartesianVector = {
			x: event.clientX,
			y: event.clientY,
		};
	};

	const showHelp = () => {
		alert(
			`Controls:\nLeft click: select unit\nLeft click drag: move unit / pan camera\nRight click drag / shift + left click drag: rotate camera\nScroll: zoom camera (hold CTRL to zoom 10x faster)\n\nDrag from unit's create buttons to insert a new child units\n\nShow firing arcs by selecting an artillery unit or a target.\nAlternatively pin/hover an artillery unit and a target`
		);
	};

	const serverIp = ref<string | null>(null);
	const serverCode = ref<string | null>(null);
	const serverUrl = computed(() =>
		serverIp.value && serverCode.value
			? `ws://${serverIp.value}:81/?code=${encodeURIComponent(serverCode.value)}`
			: null
	);

	const serverConnection = useServerConnection(serverUrl);
	const { updateUnit, updateWind } = useSyncedRoom(
		unitMap,
		wind,
		serverConnection.webSocket
	);

	const showSync = () => {
		const newServerIp = prompt(
			'Enter server adress:',
			new URL(window.location.href).searchParams.get('serverAddress') ||
				window.location.hostname
		);
		if (!newServerIp) return;
		const newServerCode = prompt(
			'Enter sync code:',
			new URL(window.location.href).searchParams.get('code') || undefined
		);
		if (!newServerCode) return;
		serverIp.value = newServerIp;
		serverCode.value = newServerCode;
	};

	const loadSyncFromUrl = () => {
		const url = new URL(window.location.href);
		const newServerIp = url.searchParams.get('serverAddress') || url.hostname;
		const newServerCode = url.searchParams.get('code');
		if (!newServerIp || !newServerCode) return;
		serverIp.value = newServerIp;
		serverCode.value = newServerCode;
	};
	loadSyncFromUrl();
</script>
