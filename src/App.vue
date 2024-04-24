<template>
	<div
		class="App__container"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerUp"
		@wheel="onWheel"
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
				v-for="unitId in Object.keys(unitMap)"
				:key="unitId"
				:unit="unitMap[unitId]"
			>
				<UnitComponent
					:create-event="unitCreateEvents.get(unitMap[unitId])"
					@create-child="
						addUnit($event.unitType, $event.pointerEvent, undefined, unitId)
					"
					@delete="removeUnit(unitId)"
				/>
			</UnitProvider>
		</div>

		<FiringArcs />

		<Controls
			class="App__controls"
			@create-unit="addUnit($event.unitType, $event.pointerEvent)"
			@show-help="showHelp()"
		/>
	</div>
</template>

<style lang="scss">
	.App__container {
		position: fixed;
		inset: 0;
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
	import { type Ref, ref, computed } from 'vue';
	import Backdrop from '@/components/Backdrop.vue';
	import Controls from '@/components/Controls.vue';
	import FiringArcs from '@/components/FiringArcs/FiringArcs.vue';
	import UnitComponent from '@/components/Unit.vue';
	import UnitLink from '@/components/UnitLink.vue';
	import { type HighlightedUnits, provideHighlightedUnits } from '@/contexts/highlighted-units';
	import { provideUnitMap } from '@/contexts/unit';
	import UnitProvider from '@/contexts/unit/UnitProvider.vue';
	import { provideCursor } from '@/contexts/cursor';
	import { provideViewport } from '@/contexts/viewport';
	import { toRadians, wrapDegrees } from '@/lib/angle';
	import {
		type Unit,
		type UnitMap,
		createUnit,
		UnitType,
		getUnitResolvedVector,
	} from '@/lib/unit';
	import { Vector } from '@/lib/vector';
	import { Viewport } from '@/lib/viewport';

	const cursor = ref(Vector.fromCartesianVector({ x: 0, y: 0 }));
	provideCursor(cursor);

	const viewport = ref(
		new Viewport(
			Vector.fromCartesianVector({
				x: document.body.clientWidth / 2,
				y: document.body.clientHeight / 2,
			}),
			0,
			1
		)
	);
	provideViewport(viewport);

	enum DragType {
		Translate,
		Rotate,
	}

	const moving = ref<null | {
		startViewport: Viewport;
		startEvent: PointerEvent;
		dragType: DragType;
	}>(null);
	const onPointerDown = (event: PointerEvent) => {
		if (event.button !== 0) return;
		event.stopPropagation();

		moving.value = {
			startViewport: viewport.value.clone(),
			startEvent: event,
			dragType: event.shiftKey ? DragType.Rotate : DragType.Translate,
		};
		(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
	};

	const onPointerUp = (event: PointerEvent) => {
		if (!moving.value) return;
		event.stopPropagation();

		moving.value = null;
		(event.currentTarget as HTMLDivElement).releasePointerCapture(
			event.pointerId
		);
	};

	const onPointerMove = (event: PointerEvent) => {
		cursor.value.cartesianVector = {
			x: event.clientX,
			y: event.clientY,
		};

		const movingData = moving.value;
		if (!movingData) return;
		event.stopPropagation();

		if (movingData.dragType === DragType.Rotate) {
			// Rotate viewport
			const azimuthOffset =
				((event.clientX - movingData.startEvent.clientX) * 720) /
				window.document.body.clientWidth;

			viewport.value.rotation = wrapDegrees(
				Number((movingData.startViewport.rotation + azimuthOffset).toFixed(1))
			);

			const viewportOffset = {
				x: document.body.clientWidth / 2,
				y: document.body.clientHeight / 2,
			};

			viewport.value.position.cartesianVector = {
				x:
					viewportOffset.x +
					(movingData.startViewport.position.x - viewportOffset.x) *
						Math.cos(toRadians(azimuthOffset)) -
					(movingData.startViewport.position.y - viewportOffset.y) *
						Math.sin(toRadians(azimuthOffset)),
				y:
					viewportOffset.y +
					(movingData.startViewport.position.y - viewportOffset.y) *
						Math.cos(toRadians(azimuthOffset)) +
					(movingData.startViewport.position.x - viewportOffset.x) *
						Math.sin(toRadians(azimuthOffset)),
			};
		} else {
			// Translate viewport
			const delta = {
				x: event.clientX - movingData.startEvent.clientX,
				y: event.clientY - movingData.startEvent.clientY,
			};

			viewport.value.position.cartesianVector = {
				x: movingData.startViewport.position.x + delta.x,
				y: movingData.startViewport.position.y + delta.y,
			};
		}
	};

	const onWheel = (event: WheelEvent) => {
		event.stopPropagation();
		event.preventDefault();
		const zoomOffset =
			(event.deltaY > 0 ? 0.1 : -0.1) * (event.ctrlKey ? 10 : 1);

		const globalCursorPosition = Vector.fromCartesianVector({
			x: event.clientX,
			y: event.clientY,
		});
		const localCursorPosition =
			viewport.value.toViewportVector(globalCursorPosition);

		viewport.value.zoom = Math.max(0.1, viewport.value.zoom - zoomOffset);

		const cursorDelta = viewport.value
			.fromViewportVector(localCursorPosition)
			.addVector(globalCursorPosition.scale(-1));

		viewport.value.position = viewport.value.position.addVector(
			cursorDelta.scale(-1)
		);
	};

	const unitMap = ref<UnitMap>({});
	const highlightedUnits = ref<HighlightedUnits>(new Set());
	const unitParents = new WeakMap<Unit, Unit>();
	const unitChildren = new WeakMap<Unit, Set<Unit>>();

	provideHighlightedUnits(highlightedUnits);
	provideUnitMap(unitMap);

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
		const parent = unitParents.get(unit);
		if (parent != null) {
			const siblings = unitChildren.get(parent);
			if (siblings != null) {
				siblings.delete(unit);
			}
		}
		delete unitMap.value[unitId];
	};

	const getClosestParentOfType = (
		unitType: UnitType,
		unitId: string
	): Unit | undefined => {
		const unit = unitMap.value[unitId];

		if (unit.parentId == null) return undefined;

		const parentUnit = unitMap.value[unit.parentId];
		if (parentUnit.type === unitType) return parentUnit;
		return getClosestParentOfType(unitType, parentUnit.id);
	};

	const showHelp = () => {
		alert(
			`Controls:\nLeft click: move unit / pan camera\nShift + left click: rotate camera\nScroll: zoom camera (hold CTRL to zoom 10x faster)\n\nMouse over / click a unit to edit its unit details\n\nDrag from spotter's create button to insert a new child unit\n\nPin an artillery or target to show firing arcs`
		);
	};

	addUnit(
		UnitType.Spotter,
		undefined,
		ref(Vector.fromCartesianVector({ x: 0, y: 0 }))
	);
</script>
