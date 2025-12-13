<template>
	<RadialMenu
		:options="options"
		@submit="emit('submit', $event)"
		@cancel="emit('cancel')"
	/>
</template>

<script setup lang="ts">
	import { Unit, UnitType } from '@packages/data/dist/artillery/unit';
	import {
		AMMO_TYPE,
		ARTILLERY_BY_SHELL,
		Platform,
		SPOTTING_TYPE,
	} from '@packages/data/dist/artillery/unit/constants';
	import { computed } from 'vue';
	import RadialMenu, {
		type Option,
		type Options,
	} from '@/components/inputs/RadialMenu.vue';
	import { ICONS } from '@/lib/constants/icons';
	import { UNIT_ICON_BY_TYPE } from '@/lib/constants/unit';
	import { getAvailableUnitTypes, getUnitIcon, getUnitLabel } from '@/lib/unit';
	import { artillery } from '@/lib/globals';

	export type Payload = Pick<
		Unit,
		'type' | 'ammunition' | 'platform' | 'spottingType' | 'targetId'
	>;

	const emit = defineEmits<{
		(e: 'cancel'): void;
		(e: 'submit', payload: { value: Payload; path: any[] }): void;
	}>();

	const options = computed<Options<Payload>>(() => {
		const output: Options<Payload> = new Map();

		for (const [index, unitType] of getAvailableUnitTypes().entries()) {
			const unitTypeOption: Option<Payload> = {
				label: UnitType[unitType],
				icon: UNIT_ICON_BY_TYPE[unitType],
				order: index,
			};

			if (unitType === UnitType.Artillery) {
				const unitTypeSubOptions: Options<Payload> = new Map();
				for (const [index, ammoType] of (
					Object.keys(ARTILLERY_BY_SHELL) as AMMO_TYPE[]
				)
					.sort()
					.entries()) {
					const ammoTypeOption: Option<Payload> = {
						label: ammoType,
						icon: ICONS[ammoType],
						order: index,
					};

					const ammoTypeSubOptions: Options<Payload> = new Map();
					for (const [index, platform] of (
						Object.keys(
							ARTILLERY_BY_SHELL[ammoType].PLATFORM
						) as Platform<AMMO_TYPE>[]
					)
						.sort()
						.entries()) {
						const platformOption: Option<Payload> = {
							label: platform,
							icon: ICONS[platform],
							order: index,
						};

						ammoTypeSubOptions.set(
							{ type: unitType, ammunition: ammoType, platform },
							platformOption
						);
					}
					if (ammoTypeSubOptions.size > 0) {
						ammoTypeOption.subOptions = ammoTypeSubOptions;
					}

					unitTypeSubOptions.set(
						{ type: unitType, ammunition: ammoType },
						ammoTypeOption
					);
				}

				if (unitTypeSubOptions.size > 0) {
					unitTypeOption.subOptions = unitTypeSubOptions;
				}
			}

			if (unitType === UnitType.Spotter) {
				const unitTypeSubOptions: Options<Payload> = new Map();
				for (const [index, spottingType] of Object.values(SPOTTING_TYPE)
					.sort()
					.entries()) {
					const spottingTypeOption: Option<Payload> = {
						label: spottingType,
						icon: ICONS[spottingType],
						order: index,
					};

					unitTypeSubOptions.set(
						{ type: unitType, spottingType },
						spottingTypeOption
					);
				}

				unitTypeSubOptions.set(
					{ type: unitType },
					{
						label: 'None',
						icon: UNIT_ICON_BY_TYPE[unitType],
						order: 0,
					}
				);

				if (unitTypeSubOptions.size > 0) {
					unitTypeOption.subOptions = unitTypeSubOptions;
				}
			}

			if (unitType === UnitType.LandingZone) {
				const unitTypeSubOptions: Options<Payload> = new Map();

				for (const unitId of Object.keys(
					artillery.sharedState.currentState.value.unitMap
				)) {
					const unit = artillery.sharedState.currentState.value.unitMap[unitId];

					if (unit.type !== UnitType.Target) continue;

					const unitOption: Option<Payload> = {
						label: `Firing at ${getUnitLabel(artillery.sharedState.currentState.value.unitMap, unitId)}`,
						icon: getUnitIcon(
							artillery.sharedState.currentState.value.unitMap,
							unitId
						),
						order: index,
					};

					unitTypeSubOptions.set(
						{ type: unitType, targetId: unitId },
						unitOption
					);
				}

				if (unitTypeSubOptions.size > 0) {
					unitTypeOption.subOptions = unitTypeSubOptions;
				}
			}

			output.set({ type: unitType }, unitTypeOption);
		}

		return output;
	});
</script>
