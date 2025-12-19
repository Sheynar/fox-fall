import { UnitType } from '@packages/data/dist/artillery/unit';
import { artillery } from '@/lib/globals';
import { getUnitLabel, getAvailableUnitTypes, getUnitIcon } from '@/lib/unit';
import { computed, markRaw } from 'vue';

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
export function useSelectUnitOptions(options: Options = {}) {
	const selectUnitOptions = computed(() => {
		const output: Map<string, { label: string; searchKeys?: string[]; icon?: any; }> = new Map();

		for (const unitType of getAvailableUnitTypes()) {
			if (options.whiteList?.type != null && !options.whiteList.type.includes(unitType)) continue;
			if (options.blackList?.type != null && options.blackList.type.includes(unitType)) continue;

			for (const unit of Object.values(artillery.sharedState.currentState.value.unitMap)) {
				if (unit.type !== unitType) continue;
				if (options.whiteList?.id != null && !options.whiteList.id.includes(unit.id)) continue;
				if (options.blackList?.id != null && options.blackList.id.includes(unit.id)) continue;

				output.set(unit.id, {
					label: getUnitLabel(artillery.sharedState.currentState.value.unitMap, unit.id),
					searchKeys: [UnitType[unitType]],
					icon: markRaw(getUnitIcon(artillery.sharedState.currentState.value.unitMap, unit.id)),
				});

			}
		}

		return output;
	});

	return selectUnitOptions;
};
