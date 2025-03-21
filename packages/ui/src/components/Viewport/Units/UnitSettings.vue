<template>
	<PrimeDialog
		append-to=".App__container"
		class="UnitSettings__dialog"
		v-model:visible="visible"
		:header="'Unit: ' + unitLabel"
		:style="{
			minWidth: '30rem',
			'--ui-scale': settings.unitSettingsScale,
			'--toggle-button-size': toggleButtonStore.sizeY + 'px',
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
				<template v-if="settings.userMode === UserMode.Advanced">
					<div
						class="UnitSettings__row"
						v-if="unit.type === UnitType.Artillery"
					>
						<span>Ammunition:</span>
						<AmmoSelect
							class="UnitSettings__select"
							:model-value="unit.ammunition"
							@update:model-value="
								unit.ammunition = $event;
								unit.platform = undefined;
								emit('updated');
							"
							:disabled="props.readonly"
						/>
					</div>
					<div
						class="UnitSettings__row"
						v-if="unit.type === UnitType.Artillery && unit.ammunition != null"
					>
						<span>Platform:</span>
						<PlatformSelect
							class="UnitSettings__select"
							:ammo-type="unit.ammunition"
							:model-value="unit.platform"
							@update:model-value="
								unit.platform = $event;
								emit('updated');
							"
							:disabled="props.readonly"
						/>
					</div>
					<div class="UnitSettings__row" v-if="unit.type === UnitType.Spotter">
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
				</template>
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
							ref="distanceInput"
							autofocus
							:model-value="unit.vector.distance"
							@update:model-value="
								unit.vector.distance = $event;
								emit('updated');
							"
							:min="1"
							@keydown.enter="azimuthInput?.inputElement?.select()"
						/>
					</div>
					<div class="UnitSettings__row">
						<span>Azimuth:</span>
						<DirectionInput
							ref="azimuthInput"
							:model-value="wrapDegrees(unit.vector.azimuth)"
							@update:model-value="
								unit.vector.azimuth = wrapDegrees($event);
								emit('updated');
							"
							@keydown.enter="
								unit.type === UnitType.LandingZone
									? emit('update-wind')
									: distanceInput?.inputElement?.select()
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
			<template v-if="settings.userMode === UserMode.Advanced">
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
			</template>
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
		font-size: calc(1em * var(--ui-scale) * 0.4);
		margin-bottom: calc(0.75rem + var(--toggle-button-size)) !important;
		margin-right: 0.75rem !important;

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
	import { computed, markRaw, shallowRef, watchEffect } from 'vue';
	import DragIcon from '@/components/icons/DragIcon.vue';
	import PinIcon from '@/components/icons/PinIcon.vue';
	import PinOutlineIcon from '@/components/icons/PinOutlineIcon.vue';
	import TrashIcon from '@/components/icons/TrashIcon.vue';
	import WindIcon from '@/components/icons/WindIcon.vue';
	import AmmoSelect from '@/components/inputs/AmmoSelect.vue';
	import IconSelect from '@/components/inputs/IconSelect.vue';
	import DirectionInput from '@/components/inputs/DirectionInput/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import PlatformSelect from '@/components/inputs/PlatformSelect.vue';
	import SelectOneUnit from '@/components/inputs/select-unit/SelectOneUnit.vue';
	import { injectUnit } from '@/contexts/unit';
	import { wrapDegrees } from '@/lib/angle';
	import { SPOTTING_BY_TYPE, SPOTTING_TYPE } from '@/lib/constants/data';
	import { UNIT_ICON_BY_TYPE } from '@/lib/constants/unit';
	import { artillery } from '@/lib/globals';
	import { settings, UserMode } from '@/lib/settings';
	import { getAvailableUnitTypes, getUnitLabel, UnitType } from '@/lib/unit';
	import { useToggleButtonStore } from '@/stores/toggle-button';

	const distanceInput = shallowRef<InstanceType<typeof DistanceInput>>(null!);
	const azimuthInput = shallowRef<InstanceType<typeof DirectionInput>>(null!);

	watchEffect(() => {
		console.log(distanceInput.value?.inputElement);
	});

	const visible = defineModel('visible', { type: Boolean, required: true });
	const customPosition = defineModel('customPosition', {
		type: Boolean,
		required: true,
	});
	const canDrag = defineModel('canDrag', { type: Boolean, required: true });

	const props = defineProps<{
		readonly?: boolean;
	}>();

	const toggleButtonStore = useToggleButtonStore();
	const unit = injectUnit();

	const unitLabel = computed(() =>
		getUnitLabel(artillery.unitMap.value, unit.value.id)
	);

	const unitTypeOptions = computed(() => {
		return getAvailableUnitTypes().map((type) => ({
			label: UnitType[type],
			icon: markRaw(UNIT_ICON_BY_TYPE[type]),
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
