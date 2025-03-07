import { artillery } from '@/lib/globals';
import { UnitType } from '@/lib/unit';
import { computed } from 'vue';

export const useFocusedUnitIds = () => {
	return computed(() => {
		const focusedUnits = [
			...artillery.highlightedUnits.value,
		];

		if (artillery.selectedUnit.value != null) {
			focusedUnits.push(artillery.selectedUnit.value);
		}

		focusedUnits.push(...artillery.pinnedUnits.value);

		const artilleryUnitIds = Object.keys(artillery.unitMap.value).filter((unitId) => artillery.unitMap.value[unitId].type === UnitType.Artillery);
		if (artilleryUnitIds.length === 1 && !focusedUnits.includes(artilleryUnitIds[0])) {
			focusedUnits.push(artilleryUnitIds[0]);
		}

		return Array.from(new Set(focusedUnits));
	});
};
