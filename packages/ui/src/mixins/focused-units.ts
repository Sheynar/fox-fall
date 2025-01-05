import { artillery } from '@/lib/globals';
import { computed } from 'vue';

export const useFocusedUnitIds = () => {
	return computed(() => {
		const focusedUnitsSet = new Set([
			...artillery.highlightedUnits.value,
			...artillery.pinnedUnits.value,
		]);

		if (artillery.selectedUnit.value != null)
			focusedUnitsSet.add(artillery.selectedUnit.value);

		return Array.from(focusedUnitsSet);
	});
};
