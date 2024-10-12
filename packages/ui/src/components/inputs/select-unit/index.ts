import { computed } from 'vue';
import { injectUnitMap } from '@/contexts/unit';
import { type Unit, UnitType, unitTypeOrder, getUnitLabel } from '@/lib/unit';

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
	const unitMap = injectUnitMap();

	const selectUnitOptions = computed(() => {
		const selectUnitOptions: {
			label: string;
			units: { id: string; label: string }[];
		}[] = [];

		for (const unitType of unitTypeOrder) {
			if (options.whiteList?.type != null && !options.whiteList.type.includes(unitType)) continue;
			if (options.blackList?.type != null && options.blackList.type.includes(unitType)) continue;

			const units: Unit[] = [];
			for (const unit of Object.values(unitMap.value)) {
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
						label: getUnitLabel(unitMap.value, unit.id),
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
