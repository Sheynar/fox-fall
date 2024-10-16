import { injectHighlightedUnits } from '@/contexts/highlighted-units';
import { injectPinnedUnits } from '@/contexts/pinned-units';
import { injectSelectedUnits } from '@/contexts/selected-unit';
import { computed } from 'vue';

export const useFocusedUnitIds = () => {
	const selectedUnits = injectSelectedUnits();
	const highlightedUnits = injectHighlightedUnits();
	const pinnedUnits = injectPinnedUnits();

	return computed(() =>
		Array.from(
			new Set([
				...highlightedUnits.value,
				...pinnedUnits.value,
				...selectedUnits.value,
			])
		)
	);
};
