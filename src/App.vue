<template>
	<div
		class="App__container"
		:style="{
			'--viewport-x': viewport.position.x,
			'--viewport-y': viewport.position.y,
			'--viewport-deg': viewport.rotation,
			'--viewport-zoom': viewport.zoom,
		}"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerUp"
		@wheel="onWheel"
	>
		<Backdrop />
		<div class="App__arrows">
			<LocationLink
				v-for="location in locations.filter((location) =>
					locationParents.has(location)
				)"
				:key="location.id"
				:location-from="locationParents.get(location)!"
				:location-to="location"
			/>
		</div>
		<div class="App__locations">
			<LocationProvider
				v-for="(location, index) in locations"
				:location="location"
			>
				<LocationComponent
					:readonly="index === 0"
					:create-event="locationCreateEvents.get(location)"
					@create-child="
						addLocation(
							$event,
							undefined,
							computed(() => location)
						)
					"
					@delete="removeLocation(index)"
				/>
			</LocationProvider>
		</div>
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

		transform: translate(
				calc(var(--viewport-x) * 1px),
				calc(var(--viewport-y) * 1px)
			)
			scale(var(--viewport-zoom))
			rotate(calc(var(--viewport-deg) * 1deg));
	}

	.App__arrows {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;

		transform: translate(
				calc(var(--viewport-x) * 1px),
				calc(var(--viewport-y) * 1px)
			)
			scale(var(--viewport-zoom))
			rotate(calc(var(--viewport-deg) * 1deg));
	}
</style>

<script setup lang="ts">
	import { type Ref, ref, computed } from 'vue';
	import Backdrop from '@/components/Backdrop.vue';
	import LocationComponent from '@/components/Location.vue';
	import LocationLink from '@/components/LocationLink.vue';
	import LocationProvider from '@/contexts/location/LocationProvider.vue';
	import { provideViewport } from '@/contexts/viewport';
	import { toRadians, wrapDegrees } from '@/lib/angle';
	import { type Location, createLocation } from '@/lib/location';
	import { Vector } from '@/lib/vector';
	import { Viewport } from '@/lib/viewport';

	const viewport = ref(
		new Viewport(
			Vector.fromCartesianVector({
				x: document.body.clientWidth / 2,
				y: document.body.clientHeight / 2,
			}),
			270,
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
		const movingData = moving.value;
		if (!movingData) return;
		event.stopPropagation();

		if (movingData.dragType === DragType.Rotate) {
			// Rotate viewport
			const azimuthOffset =
				((event.clientX - movingData.startEvent.clientX) * 720) /
				window.document.body.clientWidth;

			viewport.value.rotation =
				movingData.startViewport.rotation + azimuthOffset;

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

		const newZoom = Math.max(0.1, viewport.value.zoom - event.deltaY / 1000);

		viewport.value.position.cartesianVector = {
			x:
				viewport.value.position.x * newZoom / viewport.value.zoom + event.clientX * (1 - newZoom / viewport.value.zoom),
			y:
				viewport.value.position.y * newZoom / viewport.value.zoom + event.clientY * (1 - newZoom / viewport.value.zoom),
		};

		viewport.value.zoom = newZoom;
	};

	const locations = ref<Location[]>([]);
	const locationParents = new WeakMap<Location, Location>();
	const locationChildren = new WeakMap<Location, Set<Location>>();

	const locationCreateEvents = new WeakMap<Location, PointerEvent>();
	const addLocation = (
		event?: PointerEvent,
		vector: Ref<Vector> = ref(
			Vector.fromAngularVector({
				azimuth: wrapDegrees(-viewport.value.rotation - 90),
				distance: 50,
			})
		),
		parentLocation?: Ref<Location>
	) => {
		const newLocation = createLocation(vector, parentLocation);

		if (event) {
			newLocation.value.vector = viewport.value.toViewportVector(
				Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				}).scale(viewport.value.zoom)
			).scale(1 / viewport.value.zoom);
			if (parentLocation) {
				newLocation.value.vector = newLocation.value.vector.addVector(
					parentLocation.value.resolvedVector.scale(-1)
				);
			}
			locationCreateEvents.set(newLocation.value, event);
		}

		locations.value.push(newLocation.value);
		if (parentLocation) {
			locationParents.set(newLocation.value, parentLocation.value);
			const siblings = locationChildren.get(parentLocation.value) ?? new Set();
			siblings.add(newLocation.value);
			locationChildren.set(parentLocation.value, siblings);
		}

		return newLocation;
	};

	const removeLocation = (index: number) => {
		const location = locations.value[index];
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
		locations.value.splice(index, 1);
	};

	addLocation(undefined, ref(Vector.fromCartesianVector({ x: 0, y: 0 })));
</script>
