<template>
	<div
		class="Unit__container"
		:class="{
			Unit__moving: !!moving,
			Unit__readonly: props.readonly,
			Unit__highlighted:
				pinnedUnits.has(unit.id) ||
				highlightedUnits.has(unit.id) ||
				open,
		}"
		:style="{
			'--unit-x': screenPosition.x,
			'--unit-y': screenPosition.y,
			'--viewport-zoom': viewport.resolvedZoom,
		}"
		@mouseover="isHovered = true"
		@mouseleave="isHovered = false"
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
						: unit.type === UnitType.Target
							? TargetIcon
							: ExplosionIcon
			"
			ref="iconElement"
			class="Unit__icon"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
		/>
	</div>

	<UnitTooltip
		v-model:visible="open"
		v-model:can-drag="canDrag"
		@create-child="emit('create-child', $event)"
		@remove="emit('remove')"
		@updated="emit('updated')"
		@update-wind="emit('update-wind')"
	/>
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
		&.Unit__highlighted {
			.Unit__icon {
				background: var(--color-primary-contrast);

				outline: 0.1em solid var(--color-selected);
			}
		}

		&:not(:focus-within):not(.Unit__moving) {
			z-index: initial;
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
		top: 100%;
		transform: translateX(-50%);

		pointer-events: none;
		user-select: none;
		white-space: nowrap;
	}

	.Unit__icon {
		box-sizing: border-box;
		width: 5em;
		height: 5em;
		border-radius: 50%;
		padding: 0.5em;
	}
</style>

<script setup lang="ts">
	import {
		computed,
		onScopeDispose,
		ref,
		shallowRef,
		watch,
	} from 'vue';
	import ArtilleryIcon from '@/components/icons/ArtilleryIcon.vue';
	import SpotterIcon from '@/components/icons/SpotterIcon.vue';
	import TargetIcon from '@/components/icons/TargetIcon.vue';
	import ExplosionIcon from '@/components/icons/ExplosionIcon.vue';
	import UnitTooltip from '@/components/Unit/UnitTooltip.vue';
	import { injectHighlightedUnits } from '@/contexts/highlighted-units';
	import { injectPinnedUnits } from '@/contexts/pinned-units';
	import { injectSelectedUnits } from '@/contexts/selected-unit';
	import { injectUnit, injectUnitMap } from '@/contexts/unit';
	import { injectUnitSelector } from '@/contexts/unit-selector';
	import { injectViewport } from '@/contexts/viewport';
	import { UnitType, getUnitResolvedVector } from '@/lib/unit';
	import { Vector } from '@/lib/vector';

	const iconElement = shallowRef<InstanceType<typeof ArtilleryIcon>>(null!);

	const props = defineProps<{
		readonly?: boolean;
	}>();

	const emit = defineEmits<{
		(
			event: 'create-child',
			payload: UnitType
		): void;
		(event: 'updated'): void;
		(event: 'remove'): void;
		(event: 'update-wind'): void;
	}>();

	const unitMap = injectUnitMap();
	const unit = injectUnit();
	const unitSelector = injectUnitSelector();
	const viewport = injectViewport();
	const pinnedUnits = injectPinnedUnits();
	const highlightedUnits = injectHighlightedUnits();
	const selectedUnits = injectSelectedUnits();

	const isHovered = ref(false);
	const canDrag = ref(false);
	const open = computed({
		get: () => selectedUnits.value.includes(unit.value.id),
		set: (value) => {
			if (value === selectedUnits.value.includes(unit.value.id)) {
				return;
			}
			if (value) {
				selectedUnits.value.push(unit.value.id);
			} else {
				selectedUnits.value.splice(selectedUnits.value.indexOf(unit.value.id), 1);
			}
		},
	});

	watch(
		() => isHovered.value,
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
		const selectedIndex = selectedUnits.value.indexOf(unit.value.id);
		if (selectedIndex > -1) {
			selectedUnits.value.splice(selectedIndex, 1);
		}
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
		event.preventDefault();

		if (unitSelector.value != null) {
			unitSelector.value.selectUnit(unit.value.id);
			return;
		}

		if (!canDrag.value) {
			open.value = !open.value;
			return;
		}

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

		const distanceMoved = Vector.fromCartesianVector({
			x: event.clientX - moving.value.startEvent.clientX,
			y: event.clientY - moving.value.startEvent.clientY,
		});
		if (distanceMoved.distance <= 5) {
			open.value = !open.value;
		}

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

		emit('updated');
	};
</script>
