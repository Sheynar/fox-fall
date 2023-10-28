<template>
	<div
		class="App__container"
		:style="{
			'--viewport-x': viewport.position.x,
			'--viewport-y': viewport.position.y,
			'--viewport-deg': viewport.rotation,
			'--viewport-zoom': viewport.resolvedZoom,
		}"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerUp"
		@wheel="onWheel"
	>
		<Backdrop />
		<div class="App__arrows">
			<LocationLink
				v-for="locationId in Object.keys(locationMap).filter(
					(locationId) => locationMap[locationId].parentId != null
				)"
				:key="locationId"
				:location-id-from="locationMap[locationId].parentId!"
				:location-id-to="locationId"
			/>
		</div>
		<div class="App__locations">
			<LocationProvider
				v-for="locationId in Object.keys(locationMap)"
				:location="locationMap[locationId]"
			>
				<LocationComponent
					:create-event="locationCreateEvents.get(locationMap[locationId])"
					@create-child="
						addLocation(
							$event.locationType,
							$event.pointerEvent,
							undefined,
							locationId
						)
					"
					@delete="removeLocation(locationId)"
				/>
			</LocationProvider>
		</div>
		<div class="App__firing-arcs">
			<FiringArc
				v-for="firingArc in firingArcs"
				:key="firingArc.to.id"
				:location-id-from="firingArc.from.id"
				:location-id-to="firingArc.to.id"
			/>
		</div>
		<Controls
			class="App__controls"
			@create-location="addLocation($event.locationType, $event.pointerEvent)"
			@show-help="showHelp()"
		/>
	</div>
</template>

<style lang="scss">
	.App__container {
		position: fixed;
		inset: 0;
	}

	.App__locations {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;
	}

	.App__arrows,
	.App__firing-arcs {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;
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
	import FiringArc from '@/components/FiringArc.vue';
	import LocationComponent from '@/components/Location.vue';
	import LocationLink from '@/components/LocationLink.vue';
	import { provideLocationMap } from '@/contexts/location';
	import LocationProvider from '@/contexts/location/LocationProvider.vue';
	import { provideCursor } from '@/contexts/cursor';
	import { provideViewport } from '@/contexts/viewport';
	import { toRadians, wrapDegrees } from '@/lib/angle';
	import {
		type Location,
		type LocationMap,
		createLocation,
		LocationType,
		getLocationResolvedVector,
	} from '@/lib/location';
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
		if (event.button !== 1) return;
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

	const locationMap = ref<LocationMap>({});
	const locationParents = new WeakMap<Location, Location>();
	const locationChildren = new WeakMap<Location, Set<Location>>();

	provideLocationMap(locationMap);

	const locationCreateEvents = new WeakMap<Location, PointerEvent>();
	const addLocation = (
		type: LocationType,
		event?: PointerEvent,
		vector: Ref<Vector> = ref(
			Vector.fromAngularVector({
				azimuth: wrapDegrees(-viewport.value.rotation - 90),
				distance: 50,
			})
		),
		parentLocationId?: string
	) => {
		const parentLocation = parentLocationId
			? locationMap.value[parentLocationId]
			: undefined;
		const newLocation = createLocation(type, vector, parentLocationId);

		if (event) {
			newLocation.value.vector = viewport.value.toViewportVector(
				Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				})
			);
			if (parentLocation) {
				newLocation.value.vector = newLocation.value.vector.addVector(
					getLocationResolvedVector(locationMap.value, parentLocation.id).scale(
						-1
					)
				);
			}
			locationCreateEvents.set(newLocation.value, event);
		}

		locationMap.value[newLocation.value.id] = newLocation.value;
		if (parentLocation) {
			locationParents.set(newLocation.value, parentLocation);
			const siblings = locationChildren.get(parentLocation) ?? new Set();
			siblings.add(newLocation.value);
			locationChildren.set(parentLocation, siblings);
		}

		return newLocation;
	};

	const removeLocation = (locationId: string) => {
		const location = locationMap.value[locationId];
		const children = locationChildren.get(location);
		if (children != null && children.size > 0) {
			return;
		}
		const parent = locationParents.get(location);
		if (parent != null) {
			const siblings = locationChildren.get(parent);
			if (siblings != null) {
				siblings.delete(location);
			}
		}
		delete locationMap.value[locationId];
	};

	const getClosestParentOfType = (
		locationType: LocationType,
		locationId: string
	): Location | undefined => {
		const location = locationMap.value[locationId];

		if (location.parentId == null) return undefined;

		const parentLocation = locationMap.value[location.parentId];
		if (parentLocation.type === locationType) return parentLocation;
		return getClosestParentOfType(locationType, parentLocation.id);
	};
	const firingArcs = computed(() => {
		const output: { from: Location; to: Location }[] = [];
		for (const locationId of Object.keys(locationMap.value)) {
			const location = locationMap.value[locationId];
			if (location.type !== LocationType.Target) continue;
			const parentArtillery = getClosestParentOfType(
				LocationType.Artillery,
				locationId
			);
			if (parentArtillery == null) continue;
			output.push({ from: parentArtillery, to: locationMap.value[locationId] });
		}
		return output;
	});

	const showHelp = () => {
		alert(`Controls:\nLeft click: move location\nMiddle click: pan camera\nCtrl + middle click: rotate camera\nScroll: zoom camera (hold CTRL to zoom 10x faster)\n\nMouse over / click a location to edit its location details\n\nDrag from location's create button to insert a new child location`);
	};

	addLocation(
		LocationType.Artillery,
		undefined,
		ref(Vector.fromCartesianVector({ x: 0, y: 0 }))
	);
</script>
