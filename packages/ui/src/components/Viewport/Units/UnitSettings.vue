<template>
	<PrimeDialog
		append-to=".App__container"
		class="UnitSettings__dialog"
		v-model:visible="visible"
		:header="'Unit: ' + unitLabel"
		:style="{
			minWidth: '30rem',
			'--ui-scale': settings.unitSettingsScale,
			animation: 'none',
			transition: 'none',
		}"
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
					<IconSelect
						class="UnitSettings__select"
						v-model="selectedUnitType"
						:disabled="props.readonly"
						:options="unitTypeOptions"
						optionLabel="label"
					/>
				</div>
				<div
					class="UnitSettings__row"
					v-if="
						unit.type === UnitType.Artillery || unit.type === UnitType.Target
					"
				>
					<span>Ammunition:</span>
					<IconSelect
						class="UnitSettings__select"
						filter
						showClear
						v-model="selectedAmmoType"
						placeholder="Select ammo type"
						:disabled="props.readonly"
						:options="ammoOptions"
						optionLabel="label"
					/>
				</div>
				<div
					class="UnitSettings__row"
					v-if="
						(unit.type === UnitType.Artillery ||
							unit.type === UnitType.Target) &&
						unit.ammunition != null
					"
				>
					<span>Platform:</span>
					<IconSelect
						class="UnitSettings__select"
						filter
						showClear
						v-model="selectedPlatform"
						placeholder="Select artillery platform"
						:disabled="props.readonly"
						:options="platformOptions"
						optionLabel="label"
					/>
				</div>
				<div
					class="UnitSettings__row"
					v-if="unit.type === UnitType.Spotter || unit.type === UnitType.Target"
				>
					<span>Spotting type:</span>
					<IconSelect
						class="UnitSettings__select"
						filter
						showClear
						v-model="selectedSpottingType"
						placeholder="Select spotter type"
						:disabled="props.readonly"
						:options="spottingTypeOptions"
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
							autofocus
							:model-value="unit.vector.distance"
							@update:model-value="
								unit.vector.distance = $event;
								emit('updated');
							"
							:min="1"
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
					<template v-if="settings.showXYOffsets">
						<div class="UnitSettings__row">
							<span>X:</span>
							<DistanceInput
								:model-value="unit.vector.x"
								@update:model-value="
									unit.vector.x = $event;
									emit('updated');
								"
							/>
						</div>
						<div class="UnitSettings__row">
							<span>Y:</span>
							<DistanceInput
								:model-value="unit.vector.y"
								@update:model-value="
									unit.vector.y = $event;
									emit('updated');
								"
							/>
						</div>
					</template>
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
							:min="1"
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
					<template v-if="settings.showXYOffsets">
						<div class="UnitSettings__row">
							<span>X:</span>
							<DistanceInput
								:model-value="-unit.vector.x"
								@update:model-value="
									unit.vector.x = -$event;
									emit('updated');
								"
							/>
						</div>
						<div class="UnitSettings__row">
							<span>Y:</span>
							<DistanceInput
								:model-value="-unit.vector.y"
								@update:model-value="
									unit.vector.y = -$event;
									emit('updated');
								"
							/>
						</div>
					</template>
				</template>
			</div>
			<div class="UnitSettings__actions">
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="onUnitTypeClicked($event, UnitType.Artillery)"
					severity="secondary"
					title="Create artillery"
				>
					<Component :is="UNIT_ICON_BY_TYPE[UnitType.Artillery]" />
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="onUnitTypeClicked($event, UnitType.Spotter)"
					severity="secondary"
					title="Create spotter"
				>
					<Component :is="UNIT_ICON_BY_TYPE[UnitType.Spotter]" />
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="onUnitTypeClicked($event, UnitType.Location)"
					severity="secondary"
					title="Create location"
				>
					<Component :is="UNIT_ICON_BY_TYPE[UnitType.Location]" />
				</PrimeButton>
			</div>
			<div class="UnitSettings__actions">
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="onUnitTypeClicked($event, UnitType.Target)"
					severity="secondary"
					title="Create target"
				>
					<Component :is="UNIT_ICON_BY_TYPE[UnitType.Target]" />
				</PrimeButton>
				<PrimeButton
					class="UnitSettings__action"
					@click.stop="onUnitTypeClicked($event, UnitType.LandingZone)"
					severity="secondary"
					title="Create landing zone"
				>
					<Component :is="UNIT_ICON_BY_TYPE[UnitType.LandingZone]" />
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
						artillery.pinnedUnits.value.has(unit.id)
							? artillery.pinnedUnits.value.delete(unit.id)
							: artillery.pinnedUnits.value.add(unit.id)
					"
					severity="secondary"
					title="Pin"
				>
					<Component
						:is="
							artillery.pinnedUnits.value.has(unit.id)
								? PinIcon
								: PinOutlineIcon
						"
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
	.UnitSettings__dialog {
		font-size: calc(1em * var(--ui-scale));
		.p-dialog-title {
			font-size: 2em;
		}
		.p-button-icon-only.p-button-rounded {
			height: 2em;
			width: 2em;
		}
	}

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
			font-size: 125%;

			gap: 0.5em;

			.UnitSettings__action {
				flex: 1 0 auto;

				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				padding: 0.75em;

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
	import { computed } from 'vue';
	import DragIcon from '@/components/icons/DragIcon.vue';
	import PinIcon from '@/components/icons/PinIcon.vue';
	import PinOutlineIcon from '@/components/icons/PinOutlineIcon.vue';
	import TrashIcon from '@/components/icons/TrashIcon.vue';
	import WindIcon from '@/components/icons/WindIcon.vue';
	import IconSelect from '@/components/inputs/IconSelect.vue';
	import DirectionInput from '@/components/inputs/DirectionInput/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import SelectOneUnit from '@/components/inputs/select-unit/SelectOneUnit.vue';
	import { injectUnit } from '@/contexts/unit';
	import { wrapDegrees } from '@/lib/angle';
	import {
		AMMO_TYPE,
		ARTILLERY_BY_SHELL,
		Platform,
		SPOTTING_BY_TYPE,
		SPOTTING_TYPE,
	} from '@/lib/constants/data';
	import { UNIT_ICON_BY_TYPE } from '@/lib/constants/unit';
	import { artillery } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import { getUnitLabel, UnitType, unitTypeOrder } from '@/lib/unit';

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

	const unitLabel = computed(() =>
		getUnitLabel(artillery.unitMap.value, unit.value.id)
	);

	const unitTypeOptions = computed(() => {
		return unitTypeOrder.map((type) => ({
			label: UnitType[type],
			icon: UNIT_ICON_BY_TYPE[type],
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

	const ammoOptions = computed(() => {
		return (Object.keys(ARTILLERY_BY_SHELL) as AMMO_TYPE[])
			.sort()
			.map((shell) => ({
				label: shell,
				icon: ARTILLERY_BY_SHELL[shell].ICON,
				value: shell,
			}));
	});
	const selectedAmmoType = computed({
		get: () =>
			ammoOptions.value.find(
				(option) => option.value === unit.value.ammunition
			),
		set: (option) => {
			unit.value.ammunition = option?.value;
			unit.value.platform = undefined;
			emit('updated');
		},
	});

	const platformOptions = computed(() => {
		if (
			unit.value.ammunition == null ||
			ARTILLERY_BY_SHELL[unit.value.ammunition] == null
		)
			return [];
		return (
			Object.keys(
				ARTILLERY_BY_SHELL[unit.value.ammunition].PLATFORM
			) as Platform<AMMO_TYPE>[]
		)
			.sort()
			.map((platform) => ({
				label: platform,
				icon: ARTILLERY_BY_SHELL[unit.value.ammunition!].PLATFORM[platform]
					?.ICON,
				value: platform,
			}));
	});
	const selectedPlatform = computed({
		get: () =>
			platformOptions.value.find(
				(option) => option.value === unit.value.platform
			),
		set: (option) => {
			unit.value.platform = option?.value;
			emit('updated');
		},
	});

	const spottingTypeOptions = computed(() => {
		return (Object.keys(SPOTTING_BY_TYPE) as SPOTTING_TYPE[]).map((type) => ({
			label: type,
			icon: SPOTTING_BY_TYPE[type].ICON,
			value: type,
		}));
	});
	const selectedSpottingType = computed({
		get: () =>
			spottingTypeOptions.value.find(
				(option) => option.value === unit.value.spottingType
			),
		set: (option) => {
			unit.value.spottingType = option?.value;
			emit('updated');
		},
	});

	const parent = computed(() =>
		unit.value.parentId != null
			? artillery.unitMap.value[unit.value.parentId]
			: undefined
	);
	const parentLabel = computed(() =>
		parent.value == null
			? 'Unknown'
			: getUnitLabel(artillery.unitMap.value, parent.value.id)
	);

	const onUnitTypeClicked = (e: MouseEvent, type: UnitType) => {
		if (e.ctrlKey) {
			unit.value.type = type;
			emit('updated');
		} else {
			emit('create-child', type);
		}
	};

	const emit = defineEmits<{
		(event: 'create-child', payload: UnitType): void;
		(event: 'remove'): void;
		(event: 'set-unit-source', payload: string | undefined): void;
		(event: 'set-unit-type', payload: UnitType): void;
		(event: 'updated'): void;
		(event: 'update-wind'): void;
	}>();
</script>
