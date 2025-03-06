import { artillery } from '@/lib/globals';
import { UnitType } from '@/lib/unit';
import { computed } from 'vue';

export const useFocusedUnitIds = () => {
	return computed(() => {
		const focusedUnitsSet = new Set([
			...artillery.highlightedUnits.value,
			...artillery.pinnedUnits.value,
		]);

		if (artillery.selectedUnit.value != null)
			focusedUnitsSet.add(artillery.selectedUnit.value);

		const artilleryUnitIds = Object.keys(artillery.unitMap.value).filter((unitId) => artillery.unitMap.value[unitId].type === UnitType.Artillery);
		if (artilleryUnitIds.length === 1 && !focusedUnitsSet.has(artilleryUnitIds[0])) {
			focusedUnitsSet.add(artilleryUnitIds[0]);
		}

		return Array.from(focusedUnitsSet);
	});
};
