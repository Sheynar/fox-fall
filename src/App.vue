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

		<Wind class="App__wind" />

		<div class="App__banner" v-if="unitSelector != null"> {{ unitSelector.prompt ?? 'Click on a unit to select it' }} </div>

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
	import { type Ref, ref, getCurrentScope } from 'vue';
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

	let updateUnit = (unitId: string): void => {};
	let updateWind = (): void => {};

	const {
		addUnit,
		removeUnit,
		editWind,

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

	const scope = getCurrentScope()!;
	const webSocket = ref<WebSocket | null>(null);
	const setupSync = (serverIp: string, code: string) => {
		scope.run(() => {
			const serverUrl = `ws://${serverIp}:81/?code=${encodeURIComponent(code)}`;
			const serverConnection = useServerConnection(serverUrl ?? '');
			if (webSocket.value) webSocket.value.close();
			webSocket.value = serverConnection.webSocket;
			const { updateUnit: syncUnit, updateWind: syncWind } = useSyncedRoom(
				unitMap,
				wind,
				webSocket as Ref<WebSocket>
			);
			updateUnit = syncUnit;
			updateWind = syncWind;
		});
	};

	const showSync = () => {
		const serverIp = prompt(
			'Enter server adress:',
			new URL(window.location.href).searchParams.get('serverAddress') ||
				window.location.hostname
		);
		if (!serverIp) return;
		const code = prompt(
			'Enter sync code:',
			new URL(window.location.href).searchParams.get('code') || undefined
		);
		if (!code) return;
		setupSync(serverIp, code);
	};

	const loadSyncFromUrl = () => {
		const url = new URL(window.location.href);
		const ipAddress = url.searchParams.get('serverAddress') || url.hostname;
		const code = url.searchParams.get('code');
		if (!ipAddress || !code) return;
		setupSync(ipAddress, code);
	};
	loadSyncFromUrl();
</script>
