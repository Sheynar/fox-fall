import { inject, provide, type Ref } from 'vue';
import type { Unit } from '@/lib/unit';

export const selectedUnitSymbol = Symbol('selectedUnit');
export type SelectedUnit = Unit['id'] | null;

export const provideSelectedUnit = (selectedUnit: Ref<SelectedUnit>) => {
	provide(selectedUnitSymbol, selectedUnit);
};

export const injectSelectedUnitOptional = (): Ref<SelectedUnit> | undefined => {
	const unit = inject<Ref<SelectedUnit>>(selectedUnitSymbol);

	return unit;
};

export const injectSelectedUnit = (): Ref<SelectedUnit> => {
	const selectedUnit = injectSelectedUnitOptional();

	if (selectedUnit == null) {
		throw new Error('No selected unit provided');
	}

	return selectedUnit;
};
