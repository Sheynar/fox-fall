import { artillery } from '@/lib/globals';
import { computed } from 'vue';

export const useFocusedUnitIds = () => {

	return computed(() =>
		Array.from(
			new Set([
				...artillery.highlightedUnits.value,
				...artillery.pinnedUnits.value,
				...artillery.selectedUnits.value,
			])
		)
	);
};
