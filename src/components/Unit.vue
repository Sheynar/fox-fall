<template>
	<div
		ref="containerElement"
		class="Unit__container"
		:class="{
			Unit__moving: !!moving,
			Unit__readonly: props.readonly,
			Unit__pinned: unit.pinned,
		}"
		:style="{
			'--unit-x': screenPosition.x,
			'--unit-y': screenPosition.y,
			'--viewport-zoom': viewport.resolvedZoom,
		}"
		tabIndex="-1"
	>
		<div class="Unit__label" v-if="unit.label">
			{{ unit.label }}
		</div>
		<Component
			:is="
				unit.type === UnitType.Artillery
					? ArtilleryIcon
					: unit.type === UnitType.Spotter
						? SpotterIcon
						: TargetIcon
			"
			ref="iconElement"
			class="Unit__icon"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
			@pointercancel="onPointerUp"
			@pointerleave="onPointerUp"
		/>
		<div class="Unit__tooltip" @pointerdown.stop>
			<div class="Unit__table">
				<div class="Unit__row">
					<span>type:</span>
					<select :disabled="props.readonly" v-model="unit.type">
						<option :value="UnitType.Artillery">Artillery</option>
						<option :value="UnitType.Spotter">Spotter</option>
						<option :value="UnitType.Target">Target</option>
					</select>
				</div>
				<div class="Unit__row">
					<span>label:</span>
					<input type="text" :readonly="props.readonly" v-model="unit.label" />
				</div>
				<div class="Unit__row">
					<span>distance:</span>
					<NumberInput
						:model-value="Math.round(unit.vector.distance)"
						@update:model-value="unit.vector.distance = $event"
					/>
				</div>
				<div class="Unit__row">
					<span>azimuth to:</span>
					<NumberInput
						:model-value="Number(unit.vector.azimuth.toFixed(1))"
						@update:model-value="unit.vector.azimuth = wrapDegrees($event)"
					/>
				</div>
				<div class="Unit__row">
					<span>azimuth from:</span>
					<NumberInput
						:model-value="
							Number(wrapDegrees(unit.vector.azimuth + 180).toFixed(1))
						"
						@update:model-value="unit.vector.azimuth = wrapDegrees($event)"
					/>
				</div>
			</div>
			<div class="Unit__actions">
				<button
					class="Unit__action"
					@pointerdown.stop="
						emit('create-child', {
							unitType: UnitType.Artillery,
							pointerEvent: $event,
						})
					"
					title="Create Artillery"
				>
					<ArtilleryIcon />
				</button>
				<button
					class="Unit__action"
					@pointerdown.stop="
						emit('create-child', {
							unitType: UnitType.Spotter,
							pointerEvent: $event,
						})
					"
					title="Create spotter"
				>
					<SpotterIcon />
				</button>
				<button
					class="Unit__action"
					@pointerdown.stop="
						emit('create-child', {
							unitType: UnitType.Target,
							pointerEvent: $event,
						})
					"
					title="Create target"
				>
					<TargetIcon />
				</button>
			</div>
			<div class="Unit__actions">
				<button
					class="Unit__action"
					:disabled="props.readonly"
					@click.stop="emit('delete')"
					title="Delete"
				>
					<TrashIcon />
				</button>
				<button
					class="Unit__action"
					@click.stop="unit.pinned = !unit.pinned"
					title="Pin"
				>
					<Component :is="unit.pinned ? PinIcon : PinOutlineIcon" />
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
	.Unit__container {
		position: absolute;
		left: calc(var(--unit-x) * 1px);
		top: calc(var(--unit-y) * 1px);
		z-index: 1000;

		--_unit-scale: calc(var(--viewport-zoom) / 10);
		transform: translate(-50%, -50%) scale(var(--_unit-scale));
		transform-origin: 50% 50%;

		&:hover,
		&:focus-within,
		&.Unit__moving,
		&.Unit__pinned {
			.Unit__icon {
				background: var(--color-primary-contrast);

				outline: 0.1em solid var(--color-selected);
			}
		}

		&.Unit__moving {
			.Unit__tooltip {
				opacity: 0.5;
			}
		}

		&:not(:focus-within):not(.Unit__moving) {
			z-index: initial;
			.Unit__tooltip {
				visibility: hidden;
				pointer-events: none;
			}
		}

		&:not(.Unit__readonly) {
			.Unit__icon {
				user-select: none;
				cursor: pointer;
			}
		}
	}

	.Unit__label {
		position: absolute;
		left: 50%;
		bottom: 100%;
		transform: translateX(-50%);

		pointer-events: none;
		white-space: nowrap;
	}

	.Unit__icon {
		box-sizing: border-box;
		width: 5em;
		height: 5em;
		border-radius: 50%;
		padding: 0.5em;
	}

	.Unit__tooltip {
		position: absolute;
		left: 50%;
		transform: translateX(-50%) scale(calc(1 / var(--_unit-scale)));
		transform-origin: 50% 0%;

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

		.Unit__table {
			display: grid;
			grid-template-columns: repeat(2, max-content);
			grid-auto-rows: min-content;

			gap: 0 0.5em;

			text-align: end;

			.Unit__row {
				grid-column: 1 / -1;

				display: grid;
				grid-template-columns: subgrid;
				grid-template-rows: subgrid;
			}
		}

		.Unit__actions {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;

			gap: 0.5em;

			.Unit__action {
				flex: 1 0 auto;

				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;

				color: inherit;
				font-size: inherit;

				.Unit__icon {
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
	import { useEventListener } from '@vueuse/core';
	import {
		computed,
		onMounted,
		onScopeDispose,
		ref,
		shallowRef,
		watch,
	} from 'vue';
	import ArtilleryIcon from '@/components/icons/ArtilleryIcon.vue';
	import SpotterIcon from '@/components/icons/SpotterIcon.vue';
	import PinIcon from '@/components/icons/PinIcon.vue';
	import PinOutlineIcon from '@/components/icons/PinOutlineIcon.vue';
	import TargetIcon from '@/components/icons/TargetIcon.vue';
	import TrashIcon from '@/components/icons/TrashIcon.vue';
	import { injectHighlightedUnits } from '@/contexts/highlighted-units';
	import { injectUnit, injectUnitMap } from '@/contexts/unit';
	import { injectViewport } from '@/contexts/viewport';
	import { wrapDegrees } from '@/lib/angle';
	import { UnitType, getUnitResolvedVector } from '@/lib/unit';
	import { Vector } from '@/lib/vector';
	import NumberInput from './NumberInput.vue';

	const containerElement = ref<HTMLElement | null>(null);
	const iconElement = shallowRef<InstanceType<typeof ArtilleryIcon>>(null!);

	const props = defineProps<{
		readonly?: boolean;
		createEvent?: PointerEvent;
	}>();

	const emit = defineEmits<{
		(
			event: 'create-child',
			payload: { unitType: UnitType; pointerEvent: PointerEvent }
		): void;
		(event: 'delete'): void;
	}>();

	const unitMap = injectUnitMap();
	const unit = injectUnit();
	const viewport = injectViewport();
	const highlightedUnits = injectHighlightedUnits();

	const clickHighlighted = ref(false);

	watch(
		() => clickHighlighted.value || unit.value.pinned,
		(isHighlighted) => {
			if (isHighlighted) {
				highlightedUnits.value.add(unit.value.id);
			} else {
				highlightedUnits.value.delete(unit.value.id);
			}
		}
	);
	onScopeDispose(() => {
		highlightedUnits.value.delete(unit.value.id);
	});

	useEventListener(containerElement, 'mouseover', () => {
		clickHighlighted.value = true;
	});
	useEventListener(containerElement, 'mouseleave', () => {
		clickHighlighted.value = false;
	});

	const resolvedVector = computed(() =>
		getUnitResolvedVector(unitMap.value, unit.value.id)
	);

	const screenPosition = computed(() =>
		viewport.value.fromViewportVector(resolvedVector.value)
	);

	type MovingData = {
		startEvent: PointerEvent;
		startCursorViewport: Vector;
		startUnitPosition: Vector;
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
			startUnitPosition: unit.value.vector.clone(),
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

		unit.value.vector.cartesianVector = {
			x:
				movingData.startUnitPosition.x +
				currentCursorViewport.x -
				movingData.startCursorViewport.x,
			y:
				movingData.startUnitPosition.y +
				currentCursorViewport.y -
				movingData.startCursorViewport.y,
		};

		// Round values
		unit.value.vector.angularVector = {
			distance: Math.round(unit.value.vector.distance),
			azimuth: Number(unit.value.vector.azimuth.toFixed(1)),
		};
	};

	onMounted(() => {
		if (props.createEvent != null) {
			onPointerDown(props.createEvent);
		}
	});
</script>
