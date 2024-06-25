<template>
	<PrimeDialog
		v-model:visible="visible"
		:header="'Unit: ' + unitLabel"
		:style="{ minWidth: '30rem' }"
		position="bottomright"
		@pointerdown.stop
		@wheel.stop
		@show="customPosition = false"
		@dragend="customPosition = true"
	>
		<div class="UnitSettings__container" @pointerdown.stop @touchstart.stop>
			<div class="UnitSettings__table">
				<div class="UnitSettings__row">
					<span>Type:</span>
					<PrimeSelect
						class="UnitSettings__select"
						v-model="selectedUnitType"
						:disabled="props.readonly"
						:options="unitTypeOptions"
						optionLabel="label"
					/>
				</div>
				<div class="UnitSettings__row">
					<span>Positioned from:</span>
					<SelectOneUnit
						class="UnitSettings__select"
						:black-list="{ id: [unit.id] }"
						:model-value="unit.parentId"
						:disabled="props.readonly"
						@update:model-value="emit('set-unit-source', $event)"
					/>
				</div>
				<div class="UnitSettings__row">
					<label>Name:</label>
					<PrimeInputText
						:readonly="props.readonly"
						v-model="unit.label"
						@input="emit('updated')"
					/>
				</div>
				<template v-if="parent">
					<div class="UnitSettings__row">
						<span class="UnitSettings__span">
							{{ parentLabel }} -> {{ unitLabel }}
						</span>
					</div>
					<div class="UnitSettings__row">
						<span>Distance:</span>
						<DistanceInput
							:model-value="unit.vector.distance"
							auto-focus
							@update:model-value="
								unit.vector.distance = $event;
								emit('updated');
							"
						/>
					</div>
					<div class="UnitSettings__row">
						<span>Azimuth:</span>
						<DirectionInput
							:model-value="wrapDegrees(unit.vector.azimuth + 180)"
							@update:model-value="
								unit.vector.azimuth = wrapDegrees($event - 180);
								emit('updated');
							"
						/>
					</div>
					<span class="UnitSettings__span">
						{{ unitLabel }} -> {{ parentLabel }}
					</span>
					<div class="UnitSettings__row">
						<span>Distance:</span>
						<DistanceInput
							:model-value="unit.vector.distance"
							@update:model-value="
								unit.vector.distance = $event;
								emit('updated');
							"
						/>
					</div>
					<div class="UnitSettings__row">
						<span>Azimuth:</span>
						<DirectionInput
							:model-value="wrapDegrees(unit.vector.azimuth)"
							@update:model-value="
								unit.vector.azimuth = wrapDegrees($event);
								emit('updated');
							"
						/>
					</div>
				</template>
			</div>
			<div class="UnitSettings__actions">
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="emit('create-child', UnitType.Artillery)"
					severity="secondary"
					title="Create artillery"
				>
					<ArtilleryIcon />
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="emit('create-child', UnitType.Spotter)"
					severity="secondary"
					title="Create spotter"
				>
					<SpotterIcon />
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="emit('create-child', UnitType.Target)"
					severity="secondary"
					title="Create target"
				>
					<TargetIcon />
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="
						emit('create-child', UnitType.LandingZone);
						visible = false;
					"
					severity="secondary"
					title="Create landing zone"
				>
					<ExplosionIcon />
				</PrimeButton>
			</div>
			<div class="UnitSettings__actions">
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="canDrag = !canDrag"
					:severity="canDrag ? 'success' : 'danger'"
					title="Can drag"
				>
					<DragIcon />
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="
						pinnedUnits.has(unit.id)
							? pinnedUnits.delete(unit.id)
							: pinnedUnits.add(unit.id)
					"
					severity="secondary"
					title="Pin"
				>
					<Component
						:is="pinnedUnits.has(unit.id) ? PinIcon : PinOutlineIcon"
					/>
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					:disabled="props.readonly"
					@click.stop="emit('remove')"
					severity="danger"
					title="Delete"
				>
					<TrashIcon />
				</PrimeButton>
			</div>
			<div
				class="UnitSettings__actions"
				v-if="unit.type === UnitType.LandingZone"
			>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="emit('update-wind')"
					title="Update wind"
				>
					<WindIcon />
				</PrimeButton>
			</div>
		</div>
	</PrimeDialog>
</template>

<style lang="scss">
	.UnitSettings__container {
		display: flex;
		flex-direction: column;
		align-items: stretch;

		padding: 1em;
		gap: 0.5em;

		input {
			font-size: inherit;
		}

		.UnitSettings__table {
			display: grid;
			grid-template-columns: max-content 1fr;
			grid-auto-rows: min-content;
			align-items: center;

			gap: 0.5em;

			text-align: end;

			.UnitSettings__row {
				grid-column: 1 / -1;

				display: grid;
				grid-template-columns: subgrid;
				grid-template-rows: subgrid;
				align-items: inherit;
			}

			.UnitSettings__span {
				grid-column: 1 / -1;
				text-align: center;
			}

			.UnitSettings__select {
				text-align: initial;
			}
		}

		.UnitSettings__actions {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;

			gap: 0.5em;

			.UnitSettings__action {
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
	import PrimeButton from 'primevue/button';
	import PrimeDialog from 'primevue/dialog';
	import PrimeInputText from 'primevue/inputtext';
	import PrimeSelect from 'primevue/select';
	import { computed } from 'vue';
	import ArtilleryIcon from '@/components/icons/ArtilleryIcon.vue';
	import DragIcon from '@/components/icons/DragIcon.vue';
	import ExplosionIcon from '@/components/icons/ExplosionIcon.vue';
	import PinIcon from '@/components/icons/PinIcon.vue';
	import PinOutlineIcon from '@/components/icons/PinOutlineIcon.vue';
	import TargetIcon from '@/components/icons/TargetIcon.vue';
	import TrashIcon from '@/components/icons/TrashIcon.vue';
	import SpotterIcon from '@/components/icons/SpotterIcon.vue';
	import WindIcon from '@/components/icons/WindIcon.vue';
	import DirectionInput from '@/components/inputs/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import SelectOneUnit from '@/components/inputs/select-unit/SelectOneUnit.vue';
	import { injectPinnedUnits } from '@/contexts/pinned-units';
	import { injectUnit, injectUnitMap } from '@/contexts/unit';
	import { wrapDegrees } from '@/lib/angle';
	import { getUnitLabel, UnitType } from '@/lib/unit';

	const visible = defineModel('visible', { type: Boolean, required: true });
	const customPosition = defineModel('customPosition', {
		type: Boolean,
		required: true,
	});
	const canDrag = defineModel('canDrag', { type: Boolean, required: true });

	const props = defineProps<{
		readonly?: boolean;
	}>();

	const unit = injectUnit();
	const unitMap = injectUnitMap();
	const pinnedUnits = injectPinnedUnits();

	const unitLabel = computed(() => getUnitLabel(unitMap.value, unit.value.id));

	const unitTypeOptions = computed(() => {
		return [
			UnitType.Artillery,
			UnitType.Spotter,
			UnitType.Target,
			UnitType.LandingZone,
		].map((type) => ({
			label: UnitType[type],
			value: type,
		}));
	});
	const selectedUnitType = computed({
		get: () =>
			unitTypeOptions.value.find((option) => option.value === unit.value.type),
		set: (option) => {
			unit.value.type = option?.value ?? UnitType.Artillery;
			emit('updated');
		},
	});

	const parent = computed(() =>
		unit.value.parentId != null ? unitMap.value[unit.value.parentId] : undefined
	);
	const parentLabel = computed(() =>
		parent.value == null
			? 'Unknown'
			: getUnitLabel(unitMap.value, parent.value.id)
	);

	const emit = defineEmits<{
		(event: 'create-child', payload: UnitType): void;
		(event: 'remove'): void;
		(event: 'set-unit-source', payload: string | undefined): void;
		(event: 'set-unit-type', payload: UnitType): void;
		(event: 'updated'): void;
		(event: 'update-wind'): void;
	}>();
</script>
