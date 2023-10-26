<template>
	<div
		class="Location__container"
		:class="{
			Location__moving: !!moving,
			Location__readonly: props.readonly,
			Location__pinned: location.pinned,
		}"
		:style="{
			'--location-x': location.resolvedVector.x,
			'--location-y': location.resolvedVector.y,
		}"
		tabIndex="{-1}"
	>
		<div
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
					<span>final distance:</span>
					<span>{{ location.resolvedVector.distance.toFixed(1) }}</span>
				</div>
				<div class="Location__row">
					<span>final azimuth:</span>
					<span>{{ location.resolvedVector.azimuth.toFixed(1) }}</span>
				</div>
				<div class="Location__row">
					<span>distance:</span>
					<input
						type="number"
						:readonly="props.readonly"
						:value="Number(location.vector.distance.toFixed(1))"
						@pointerdown.stop
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
						:readonly="props.readonly"
						:value="Number(location.vector.azimuth.toFixed(1))"
						@pointerdown.stop
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
						:readonly="props.readonly"
						:value="
							Number(wrapDegrees(location.vector.azimuth + 180).toFixed(1))
						"
						@pointerdown.stop
						@input="
							location.vector.azimuth = wrapDegrees(
								Number(($event.target as HTMLInputElement).value) - 180
							)
						"
					/>
				</div>
				<div class="Location__row">
					<span>x:</span>
					<input
						type="number"
						:readonly="props.readonly"
						:value="Math.round(location.vector.x)"
						@pointerdown.stop
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
						@pointerdown.stop
						@input="
							location.vector.y = Number(
								($event.target as HTMLInputElement).value
							)
						"
					/>
				</div>
			</div>
			<div class="Location__actions">
				<button
					class="Location__action"
					@pointerdown.stop="emit('create-child', $event)"
				>
					+
				</button>
				<button
					class="Location__action"
					:disabled="props.readonly"
					@click.stop="emit('delete')"
				>
					-
				</button>
				<button
					class="Location__action"
					@click.stop="location.pinned = !location.pinned"
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

		transform: translate(-50%, -50%) scale(calc(1 / var(--viewport-zoom))) rotate(calc(var(--viewport-deg) * -1deg));
		transform-origin: 50% 50%;

		&:hover,
		&:focus-within,
		&.Location__moving,
		&.Location__pinned {
			padding: 0.5em;

			.Location__icon {
				border: 0.1em solid #90f;
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

	.Location__icon {
		box-sizing: border-box;
		width: 1em;
		height: 1em;
		border-radius: 50%;
		background: #fff;
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
		font-size: 2vmin;

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
	import { onMounted, ref, shallowRef } from 'vue';
	import PinIcon from '@/components/icons/PinIcon.vue';
	import PinOutlineIcon from '@/components/icons/PinOutlineIcon.vue';
	import { injectLocation } from '@/contexts/location';
	import { injectViewport } from '@/contexts/viewport';
	import { wrapDegrees } from '@/lib/angle';
	import { Vector } from '@/lib/vector';

	const iconElement = shallowRef<HTMLDivElement>(null!);

	const props = withDefaults(
		defineProps<{ readonly?: boolean; createEvent?: PointerEvent }>(),
		{
			readonly: false,
		}
	);

	const emit = defineEmits<{
		(event: 'create-child', triggerEvent: PointerEvent): void;
		(event: 'delete'): void;
	}>();

	const location = injectLocation();
	const viewport = injectViewport();

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
		iconElement.value.setPointerCapture(event.pointerId);
	};

	const onPointerUp = (event: PointerEvent) => {
		if (!moving.value) return;
		event.stopPropagation();

		moving.value = null;
		iconElement.value.releasePointerCapture(event.pointerId);
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
		}
	};

	onMounted(() => {
		if (props.createEvent != null) {
			onPointerDown(props.createEvent);
		}
	});
</script>
