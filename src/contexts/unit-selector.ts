import { inject, provide, type Ref } from 'vue';

export const unitSelectorSymbol = Symbol('unitSelector');
export type UnitSelector = {
	selectUnit: (unitId: string) => unknown,
	prompt?: string,
} | null;

export const provideUnitSelector = (unitSelector: Ref<UnitSelector>) => {
	provide(unitSelectorSymbol, unitSelector);
	(<any>window).unitSelector = unitSelector;
};

export const injectUnitSelectorOptional = (): Ref<UnitSelector> | undefined => {
	const unitSelector = inject<Ref<UnitSelector>>(unitSelectorSymbol);

	return unitSelector;
};

export const injectUnitSelector = (): Ref<UnitSelector> => {
	const unitSelector = injectUnitSelectorOptional();

	if (unitSelector == null) {
		throw new Error('No unit selector provided');
	}

	return unitSelector;
};
