import { inject, provide, type Ref } from 'vue';
import { type Unit } from '@packages/data/dist/artillery/unit';

export const unitSymbol = Symbol('unit');

export const provideUnit = (unit: Ref<Unit>) => {
	provide(unitSymbol, unit);
};

export const injectUnitOptional = (): Ref<Unit> | undefined => {
	const unit = inject<Ref<Unit>>(unitSymbol);

	return unit;
};

export const injectUnit = (): Ref<Unit> => {
	const unit = injectUnitOptional();

	if (unit == null) {
		throw new Error('No unit provided');
	}

	return unit;
};
