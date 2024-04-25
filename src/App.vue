<template>
	<div
		ref="containerElement"
		class="App__container"
		@touchstart.prevent
		@pointermove="onPointerMove"
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
				<UnitComponent :create-event="unitCreateEvents.get(unitMap[unitId])" />
			</UnitProvider>
		</div>

		<FiringArcs />

		<UnitProvider v-if="selectedUnit" :unit="unitMap[selectedUnit]">
			<UnitTooltip
				@create-child="
					addUnit($event.unitType, $event.pointerEvent, undefined, selectedUnit)
				"
				@delete="removeUnit(selectedUnit)"
			/>
		</UnitProvider>

		<Controls
			class="App__controls"
			@create-unit="addUnit($event.unitType, $event.pointerEvent)"
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
	import { type Ref, ref } from 'vue';
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
	import { useMultiPointerDrag } from '@/mixins/multi-pointer';

	const containerElement = ref<null | HTMLDivElement>(null);

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
		dragType: DragType;
	}>(null);

	useMultiPointerDrag({
		element: containerElement,
		onBeforePointerDown: (event) => {
			selectedUnit.value = null;
			return event.button === 0;
		},
		onDragStart: (event) => {
			moving.value = {
				// startViewport: viewport.value.clone(),
				dragType: event.shiftKey ? DragType.Rotate : DragType.Translate,
			};
		},
		onUpdate: (dragStatus) => {
			if (!moving.value) return;

			if (moving.value.dragType === DragType.Rotate) {
				const rotation =
					dragStatus.rotationDelta +
					(dragStatus.transformDelta.x * 720) /
						window.document.body.clientWidth;

				viewport.value.rotateBy(rotation);
			} else {
				viewport.value.position.cartesianVector.x +=
					dragStatus.transformDelta.x;
				viewport.value.position.cartesianVector.y +=
					dragStatus.transformDelta.y;
				viewport.value.rotateBy(
					dragStatus.rotationDelta,
					dragStatus.currentPosition
				);
			}

			viewport.value.zoom = Math.max(
				0.1,
				viewport.value.zoom + dragStatus.zoomDelta
			);
		},
		onDragEnd: () => {
			moving.value = null;
		},
	});

	const onPointerMove = (event: PointerEvent) => {
		cursor.value.cartesianVector = {
			x: event.clientX,
			y: event.clientY,
		};
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
	const selectedUnit = ref<Unit['id'] | null>(null);
	const highlightedUnits = ref<HighlightedUnits>(new Set());
	const unitParents = new WeakMap<Unit, Unit>();
	const unitChildren = new WeakMap<Unit, Set<Unit>>();

	provideSelectedUnit(selectedUnit);
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
			`Controls:\nLeft click: select unit\nLeft click drag: move unit / pan camera\nShift + left click drag: rotate camera\nScroll: zoom camera (hold CTRL to zoom 10x faster)\n\nMouse over / click a unit to edit its unit details\n\nDrag from spotter's create button to insert a new child unit\n\nPin an artillery or target to show firing arcs`
		);
	};

	addUnit(
		UnitType.Artillery,
		undefined,
		ref(Vector.fromCartesianVector({ x: 0, y: 0 }))
	);
</script>
