import { inject, provide, type Ref } from 'vue';
import type { Unit } from '@/lib/unit';

export const selectedUnitsSymbol = Symbol('selectedUnits');
export type SelectedUnits = Unit['id'][];

export const provideSelectedUnits = (selectedUnits: Ref<SelectedUnits>) => {
	provide(selectedUnitsSymbol, selectedUnits);
};

export const injectSelectedUnitsOptional = (): Ref<SelectedUnits> | undefined => {
	const unit = inject<Ref<SelectedUnits>>(selectedUnitsSymbol);

	return unit;
};

export const injectSelectedUnits = (): Ref<SelectedUnits> => {
	const selectedUnits = injectSelectedUnitsOptional();

	if (selectedUnits == null) {
		throw new Error('No selected unit provided');
	}

	return selectedUnits;
};
