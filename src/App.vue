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
			/>
		</UnitProvider>

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
	import { provideCursor } from '@/contexts/cursor';
	import {
		type HighlightedUnits,
		provideHighlightedUnits,
	} from '@/contexts/highlighted-units';
	import {
		providePinnedUnits,
		type PinnedUnits,
	} from '@/contexts/pinned-units';
	import { provideUnitMap } from '@/contexts/unit';
	import { provideSelectedUnit } from '@/contexts/selected-unit';
	import UnitProvider from '@/contexts/unit/UnitProvider.vue';
	import { provideViewport } from '@/contexts/viewport';
	import { wrapDegrees } from '@/lib/angle';
	import {
		type Unit,
		type UnitMap,
		createUnit,
		UnitType,
		getUnitResolvedVector,
	} from '@/lib/unit';
	import { Vector } from '@/lib/vector';
	import { Viewport } from '@/lib/viewport';
	import { useServerConnection } from '@/mixins/server-connection';
	import { useSyncedUnitMap } from '@/mixins/synced-unit-map';
	import { useViewPortControl } from '@/mixins/viewport-control';

	(<any>window).Vector = Vector;

	const containerElement = ref<null | HTMLDivElement>(null);

	const cursor = ref(Vector.fromCartesianVector({ x: 0, y: 0 }));
	const unitMap = ref<UnitMap>({});
	const selectedUnit = ref<Unit['id'] | null>(null);
	const pinnedUnits = ref<PinnedUnits>(new Set());
	const highlightedUnits = ref<HighlightedUnits>(new Set());
	const unitParents = new WeakMap<Unit, Unit>();
	const unitChildren = new WeakMap<Unit, Set<Unit>>();

	provideCursor(cursor);
	provideSelectedUnit(selectedUnit);
	providePinnedUnits(pinnedUnits);
	provideHighlightedUnits(highlightedUnits);
	provideUnitMap(unitMap);

	const viewport = ref(
		new Viewport(
			Vector.fromCartesianVector({
				x: document.body.clientWidth / 2,
				y: document.body.clientHeight / 2,
			}),
			90,
			1
		)
	);
	useViewPortControl({
		containerElement,
		viewport,
		selectedUnit,
	});
	provideViewport(viewport);

	const onPointerMove = (event: PointerEvent) => {
		cursor.value.cartesianVector = {
			x: event.clientX,
			y: event.clientY,
		};
	};

	const unitCreateEvents = new WeakMap<Unit, PointerEvent>();
	const addUnit = (
		type: UnitType,
		event?: PointerEvent,
		vector: Ref<Vector> = ref(
			Vector.fromAngularVector({
				azimuth: wrapDegrees(-viewport.value.rotation - 90),
				distance: 50,
			})
		),
		parentUnitId?: string
	) => {
		const parentUnit = parentUnitId ? unitMap.value[parentUnitId] : undefined;
		const newUnit = createUnit(type, vector, parentUnitId);

		if (event) {
			newUnit.value.vector = viewport.value.toViewportVector(
				Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				})
			);
			if (parentUnit) {
				newUnit.value.vector = newUnit.value.vector.addVector(
					getUnitResolvedVector(unitMap.value, parentUnit.id).scale(-1)
				);
			}
			unitCreateEvents.set(newUnit.value, event);
		}

		unitMap.value[newUnit.value.id] = newUnit.value;
		if (parentUnit) {
			unitParents.set(newUnit.value, parentUnit);
			const siblings = unitChildren.get(parentUnit) ?? new Set();
			siblings.add(newUnit.value);
			unitChildren.set(parentUnit, siblings);
		}

		return newUnit;
	};

	const removeUnit = (unitId: string) => {
		const unit = unitMap.value[unitId];
		const children = unitChildren.get(unit);
		if (children != null && children.size > 0) {
			return;
		}
		delete unitMap.value[unitId];
		updateUnit(unitId);
	};

	const showHelp = () => {
		alert(
			`Controls:\nLeft click: select unit\nLeft click drag: move unit / pan camera\nRight click drag / shift + left click drag: rotate camera\nScroll: zoom camera (hold CTRL to zoom 10x faster)\n\nDrag from unit's create buttons to insert a new child units\n\nShow firing arcs by selecting an artillery unit or a target.\nAlternatively pin/hover an artillery unit and a target`
		);
	};

	addUnit(
		UnitType.Artillery,
		undefined,
		ref(Vector.fromCartesianVector({ x: 0, y: 0 }))
	);

	const unitUpdateMethods: ((unitId: string) => unknown)[] = [];
	const updateUnit = (unitId: string) => {
		unitUpdateMethods.forEach((method) => method(unitId));
	};

	const scope = getCurrentScope()!;
	const webSocket = ref<WebSocket | null>(null);
	const setupSync = (serverIp: string, code: string) => {
		scope.run(() => {
			const serverUrl = `ws://${serverIp}:81/?code=${encodeURIComponent(code)}`;
			const serverConnection = useServerConnection(serverUrl ?? '');
			if (webSocket.value) webSocket.value.close();
			webSocket.value = serverConnection.webSocket;
			const { update: updateUnit } = useSyncedUnitMap(
				unitMap,
				webSocket as Ref<WebSocket>
			);
			unitUpdateMethods.push(updateUnit);
		});
	};

	const showSync = () => {
		const serverIp = prompt('Enter server adress:', new URL(window.location.href).searchParams.get('serverAddress') || window.location.hostname);
		if (!serverIp) return;
		const code = prompt('Enter sync code:', 'yourmom');
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
