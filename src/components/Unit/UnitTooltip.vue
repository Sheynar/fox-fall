<template>
	<div
		ref="tooltipElement"
		class="UnitTooltip__container"
		@pointerdown.stop
		@touchstart.stop
	>
		<div class="UnitTooltip__table">
			<div class="UnitTooltip__row">
				<span>Type:</span>
				<select :disabled="props.readonly" v-model="unit.type">
					<option :value="UnitType.Artillery">Artillery</option>
					<option :value="UnitType.Spotter">Spotter</option>
					<option :value="UnitType.Target">Target</option>
				</select>
			</div>
			<div class="UnitTooltip__row">
				<span>Name:</span>
				<input type="text" :readonly="props.readonly" v-model="unit.label" />
			</div>
			<template v-if="parent">
				<div class="UnitTooltip__row">
					<span class="UnitTooltip__span"
						>{{ parent.label }} -> {{ unit.label }}</span
					>
				</div>
				<div class="UnitTooltip__row">
					<span>Distance:</span>
					<NumberInput
						:model-value="Math.round(unit.vector.distance)"
						@update:model-value="unit.vector.distance = $event"
					/>
				</div>
				<div class="UnitTooltip__row">
					<span>Azimuth:</span>
					<NumberInput
						:model-value="
							Number(wrapDegrees(unit.vector.azimuth + 180).toFixed(1))
						"
						@update:model-value="unit.vector.azimuth = wrapDegrees($event - 180)"
					/>
				</div>
				<span class="UnitTooltip__span"
					>{{ unit.label }} -> {{ parent.label }}</span
				>
				<div class="UnitTooltip__row">
					<span>Distance:</span>
					<NumberInput
						:model-value="Math.round(unit.vector.distance)"
						@update:model-value="unit.vector.distance = $event"
					/>
				</div>
				<div class="UnitTooltip__row">
					<span>Azimuth:</span>
					<NumberInput
						:model-value="Number(unit.vector.azimuth.toFixed(1))"
						@update:model-value="unit.vector.azimuth = wrapDegrees($event)"
					/>
				</div>
			</template>
		</div>
		<div class="UnitTooltip__actions">
			<button
				class="UnitTooltip__action"
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
				class="UnitTooltip__action"
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
				class="UnitTooltip__action"
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
		<div class="UnitTooltip__actions">
			<button
				class="UnitTooltip__action"
				:disabled="props.readonly"
				@click.stop="emit('delete')"
				title="Delete"
			>
				<TrashIcon />
			</button>
			<button
				class="UnitTooltip__action"
				@click.stop="unit.pinned = !unit.pinned"
				title="Pin"
			>
				<Component :is="unit.pinned ? PinIcon : PinOutlineIcon" />
			</button>
		</div>
	</div>
</template>

<style lang="scss">
	.UnitTooltip__container {
		position: fixed;
		top: 1em;
		right: 1em;

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

		.UnitTooltip__table {
			display: grid;
			grid-template-columns: repeat(2, max-content);
			grid-auto-rows: min-content;

			gap: 0 0.5em;

			text-align: end;

			.UnitTooltip__row {
				grid-column: 1 / -1;

				display: grid;
				grid-template-columns: subgrid;
				grid-template-rows: subgrid;
			}

			.UnitTooltip__span {
				grid-column: 1 / -1;
			}
		}

		.UnitTooltip__actions {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;

			gap: 0.5em;

			.UnitTooltip__action {
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
	import { computed, ref } from 'vue';
	import ArtilleryIcon from '@/components/icons/ArtilleryIcon.vue';
	import PinIcon from '@/components/icons/PinIcon.vue';
	import PinOutlineIcon from '@/components/icons/PinOutlineIcon.vue';
	import TargetIcon from '@/components/icons/TargetIcon.vue';
	import TrashIcon from '@/components/icons/TrashIcon.vue';
	import SpotterIcon from '@/components/icons/SpotterIcon.vue';
	import NumberInput from '@/components/NumberInput.vue';
	import { injectUnit, injectUnitMap } from '@/contexts/unit';
	import { wrapDegrees } from '@/lib/angle';
	import { UnitType } from '@/lib/unit';

	const tooltipElement = ref<HTMLElement | null>(null);

	const props = defineProps<{
		readonly?: boolean;
	}>();

	const unit = injectUnit();
	const unitMap = injectUnitMap();
	const parent = computed(() =>
		unit.value.parentId != null ? unitMap.value[unit.value.parentId] : undefined
	);

	const emit = defineEmits<{
		(
			event: 'create-child',
			payload: { unitType: UnitType; pointerEvent: PointerEvent }
		): void;
		(event: 'delete'): void;
	}>();
</script>
