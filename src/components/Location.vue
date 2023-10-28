<template>
	<div
		class="Location__container"
		:class="{
			Location__moving: !!moving,
			Location__readonly: props.readonly,
			Location__pinned: location.pinned,
		}"
		:style="{
			'--location-x': screenPosition.x,
			'--location-y': screenPosition.y,
		}"
		tabIndex="{-1}"
	>
		<div class="Location__label" v-if="location.label">{{ location.label }}</div>
		<Component
			:is="
				location.type === LocationType.Artillery
					? ArtilleryIcon
					: location.type === LocationType.Spotter
					? SpotterIcon
					: TargetIcon
			"
			ref="iconElement"
			class="Location__icon"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
			@pointercancel="onPointerUp"
			@pointerleave="onPointerUp"
		/>
		<div class="Location__tooltip">
			<div class="Location__table">
				<div class="Location__row">
					<span>type:</span>
					<span>{{ location.type === LocationType.Artillery ? 'Artillery' : location.type === LocationType.Spotter ? 'Spotter' : 'Target' }}</span>
				</div>
				<div class="Location__row">
					<span>label:</span>
					<input
						type="text"
						:readonly="props.readonly"
						v-model="location.label"
					/>
				</div>
				<div class="Location__row">
					<span>distance:</span>
					<input
						type="number"
						step="0.1"
						:readonly="props.readonly"
						:value="Math.round(location.vector.distance)"
						@input="
							location.vector.distance = Number(
								($event.target as HTMLInputElement).value
							)
						"
					/>
				</div>
				<div class="Location__row">
					<span>azimuth to:</span>
					<input
						type="number"
						step="0.1"
						:readonly="props.readonly"
						:value="location.vector.azimuth.toFixed(1)"
						@input="
							location.vector.azimuth = wrapDegrees(
								Number(($event.target as HTMLInputElement).value)
							)
						"
					/>
				</div>
				<div class="Location__row">
					<span>azimuth from:</span>
					<input
						type="number"
						step="0.1"
						:readonly="props.readonly"
						:value="wrapDegrees(location.vector.azimuth + 180).toFixed(1)"
						@input="
							location.vector.azimuth = wrapDegrees(
								Number(($event.target as HTMLInputElement).value) - 180
							)
						"
					/>
				</div>
				<!-- <div class="Location__row">
					<span>x:</span>
					<input
						type="number"
						:readonly="props.readonly"
						:value="Math.round(location.vector.x)"
						@input="
							location.vector.x = Number(
								($event.target as HTMLInputElement).value
							)
						"
					/>
				</div>
				<div class="Location__row">
					<span>y:</span>
					<input
						type="number"
						:readonly="props.readonly"
						:value="Math.round(location.vector.y)"
						@input="
							location.vector.y = Number(
								($event.target as HTMLInputElement).value
							)
						"
					/>
				</div> -->
			</div>
			<div class="Location__actions">
				<button
					v-if="
						location.type === LocationType.Artillery ||
						location.type === LocationType.Spotter
					"
					class="Location__action"
					@pointerdown.stop="
						emit('create-child', {
							locationType: LocationType.Spotter,
							pointerEvent: $event,
						})
					"
					title="Create spotter"
				>
					<SpotterIcon />
				</button>
				<button
					v-if="location.type === LocationType.Spotter"
					class="Location__action"
					@pointerdown.stop="
						emit('create-child', {
							locationType: LocationType.Target,
							pointerEvent: $event,
						})
					"
					title="Create target"
				>
					<TargetIcon />
				</button>
				<button
					class="Location__action"
					:disabled="props.readonly"
					@click.stop="emit('delete')"
					title="Delete"
				>
					<TrashIcon />
				</button>
				<button
					class="Location__action"
					@click.stop="location.pinned = !location.pinned"
					title="Pin"
				>
					<Component :is="location.pinned ? PinIcon : PinOutlineIcon" />
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.Location__container {
		position: absolute;
		left: calc(var(--location-x) * 1px);
		top: calc(var(--location-y) * 1px);
		z-index: 1000;

		transform: translate(-50%, -50%);
		transform-origin: 50% 50%;

		&:hover,
		&:focus-within,
		&.Location__moving,
		&.Location__pinned {
			.Location__icon {
				background: var(--color-primary-contrast);

				outline: 0.1em solid var(--color-selected);
			}
		}

		&.Location__moving {
			.Location__tooltip {
				opacity: 0.5;
			}
		}

		&:not(:hover):not(:focus-within):not(.Location__moving):not(
				.Location__pinned
			) {
			z-index: initial;
			.Location__tooltip {
				visibility: hidden;
				pointer-events: none;
			}
		}

		&:not(.Location__readonly) {
			.Location__icon {
				user-select: none;
				cursor: pointer;
			}
		}
	}

	.Location__label {
		position: absolute;
		left: 50%;
		bottom: 100%;
		transform: translateX(-50%);

		pointer-events: none;
		white-space: nowrap;
	}

	.Location__icon {
		box-sizing: border-box;
		width: 5em;
		height: 5em;
		border-radius: 10%;
	}

	.Location__tooltip {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);

		display: flex;
		flex-direction: column;
		align-items: stretch;

		padding: 1em;
		gap: 0.5em;
		border: 1px solid;

		background: black;

		input {
			font-size: inherit;
		}

		.Location__table {
			display: grid;
			grid-template-columns: repeat(2, max-content);
			grid-auto-rows: min-content;

			gap: 0 0.5em;

			text-align: end;

			.Location__row {
				grid-column: 1 / -1;

				display: grid;
				grid-template-columns: subgrid;
				grid-template-rows: subgrid;
			}
		}

		.Location__actions {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;

			gap: 0.5em;

			.Location__action {
				flex: 1 0 auto;

				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;

				color: inherit;
				font-size: inherit;

				.Location__icon {
					width: 1em;
					height: 1em;
					background: currentColor;
					mask: var(--icon-url) no-repeat center;
				}
			}
		}
	}
</style>

<script setup lang="ts">
	import { computed, onMounted, ref, shallowRef } from 'vue';
	import ArtilleryIcon from '@/components/icons/ArtilleryIcon.vue';
	import SpotterIcon from '@/components/icons/SpotterIcon.vue';
	import PinIcon from '@/components/icons/PinIcon.vue';
	import PinOutlineIcon from '@/components/icons/PinOutlineIcon.vue';
	import TargetIcon from '@/components/icons/TargetIcon.vue';
	import TrashIcon from '@/components/icons/TrashIcon.vue';
	import { injectLocation, injectLocationMap } from '@/contexts/location';
	import { injectViewport } from '@/contexts/viewport';
	import { wrapDegrees } from '@/lib/angle';
	import { LocationType, getLocationResolvedVector } from '@/lib/location';
	import { Vector } from '@/lib/vector';

	const iconElement = shallowRef<InstanceType<typeof ArtilleryIcon>>(null!);

	const props = withDefaults(
		defineProps<{ readonly?: boolean; createEvent?: PointerEvent }>(),
		{
			readonly: false,
		}
	);

	const emit = defineEmits<{
		(
			event: 'create-child',
			payload: { locationType: LocationType; pointerEvent: PointerEvent }
		): void;
		(event: 'delete'): void;
	}>();

	const locationMap = injectLocationMap();
	const location = injectLocation();
	const viewport = injectViewport();

	const resolvedVector = computed(() =>
		getLocationResolvedVector(locationMap.value, location.value.id)
	);

	const screenPosition = computed(() =>
		viewport.value.fromViewportVector(resolvedVector.value)
	);

	type MovingData = {
		startEvent: PointerEvent;
		startCursorViewport: Vector;
		startLocationPosition: Vector;
	};
	const moving = ref<null | MovingData>(null);

	const onPointerDown = (event: PointerEvent) => {
		if (props.readonly || event.button !== 0) return;
		event.stopPropagation();

		moving.value = {
			startEvent: event,
			startCursorViewport: viewport.value.toViewportVector(
				Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				})
			),
			startLocationPosition: location.value.vector.clone(),
		};
		iconElement.value.$el.setPointerCapture(event.pointerId);
	};

	const onPointerUp = (event: PointerEvent) => {
		if (!moving.value) return;
		event.stopPropagation();

		moving.value = null;
		iconElement.value.$el.releasePointerCapture(event.pointerId);
	};

	const onPointerMove = (event: PointerEvent) => {
		if (props.readonly) return;
		const movingData = moving.value;
		if (!movingData) return;
		event.stopPropagation();

		const currentCursorViewport = viewport.value.toViewportVector(
			Vector.fromCartesianVector({
				x: event.clientX,
				y: event.clientY,
			})
		);

		location.value.vector.cartesianVector = {
			x:
				movingData.startLocationPosition.x +
				currentCursorViewport.x -
				movingData.startCursorViewport.x,
			y:
				movingData.startLocationPosition.y +
				currentCursorViewport.y -
				movingData.startCursorViewport.y,
		};

		// Round values
		location.value.vector.angularVector = {
			distance: Math.round(location.value.vector.distance),
			azimuth: Number(location.value.vector.azimuth.toFixed(1)),
		};
	};

	onMounted(() => {
		if (props.createEvent != null) {
			onPointerDown(props.createEvent);
		}
	});
</script>
