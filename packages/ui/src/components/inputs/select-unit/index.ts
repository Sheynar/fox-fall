import { type Unit, UnitType } from '@packages/data/dist/artillery/unit';
import { artillery } from '@/lib/globals';
import { getUnitLabel, getAvailableUnitTypes } from '@/lib/unit';
import { computed } from 'vue';

export type Options = {
	blackList?: {
		type?: UnitType[];
		id?: string[];
	};
	whiteList?: {
		type?: UnitType[];
		id?: string[];
	};
};
export const useSelectUnitOptions = (options: Options = {}) => {
	const selectUnitOptions = computed(() => {
		const selectUnitOptions: {
			label: string;
			units: { id: string; label: string }[];
		}[] = [];

		for (const unitType of getAvailableUnitTypes()) {
			if (options.whiteList?.type != null && !options.whiteList.type.includes(unitType)) continue;
			if (options.blackList?.type != null && options.blackList.type.includes(unitType)) continue;

			const units: Unit[] = [];
			for (const unit of Object.values(artillery.unitMap.value)) {
				if (unit.type !== unitType) continue;
				if (options.whiteList?.id != null && !options.whiteList.id.includes(unit.id)) continue;
				if (options.blackList?.id != null && options.blackList.id.includes(unit.id)) continue;

				units.push(unit);
			}
			if (units.length > 0) {
				selectUnitOptions.push({
					label: UnitType[unitType],
					units: units.map((unit) => ({
						id: unit.id,
						label: getUnitLabel(artillery.unitMap.value, unit.id),
					})),
				});
			}
		}

		return selectUnitOptions;
	});

	return {
		selectUnitOptions,

		optionLabel: 'label',
		optionGroupLabel: 'label',
		optionGroupChildren: 'units',
	};
};
