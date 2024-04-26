import { inject, provide, type Ref } from 'vue';
import type { Unit } from '@/lib/unit';

export const pinnedUnitsSymbol = Symbol('pinnedUnits');
export type PinnedUnits = Set<Unit['id']>;

export const providePinnedUnits = (
	pinnedUnits: Ref<PinnedUnits>
) => {
	provide(pinnedUnitsSymbol, pinnedUnits);
};

export const injectPinnedUnitsOptional = ():
	| Ref<PinnedUnits>
	| undefined => {
	const unit = inject<Ref<PinnedUnits>>(pinnedUnitsSymbol);

	return unit;
};

export const injectPinnedUnits = (): Ref<PinnedUnits> => {
	const pinnedUnits = injectPinnedUnitsOptional();

	if (pinnedUnits == null) {
		throw new Error('No pinned units provided');
	}

	return pinnedUnits;
};
