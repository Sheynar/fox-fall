import { inject, provide, type Ref } from 'vue';
import type { Unit } from '@/lib/unit';

export const highlightedUnitsSymbol = Symbol('highlightedUnits');
export type HighlightedUnits = Set<Unit['id']>;

export const provideHighlightedUnits = (
	highlightedUnits: Ref<HighlightedUnits>
) => {
	provide(highlightedUnitsSymbol, highlightedUnits);
};

export const injectHighlightedUnitsOptional = ():
	| Ref<HighlightedUnits>
	| undefined => {
	const unit = inject<Ref<HighlightedUnits>>(highlightedUnitsSymbol);

	return unit;
};

export const injectHighlightedUnits = (): Ref<HighlightedUnits> => {
	const highlightedUnits = injectHighlightedUnitsOptional();

	if (highlightedUnits == null) {
		throw new Error('No highlighted units provided');
	}

	return highlightedUnits;
};
