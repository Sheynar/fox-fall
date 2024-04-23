import { inject, provide, type Ref } from 'vue';
import type { Unit, UnitMap } from '@/lib/unit';

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


export const unitMapSymbol = Symbol('unitMap');

export const provideUnitMap = (unitMap: Ref<UnitMap>) => {
	provide(unitMapSymbol, unitMap);
};

export const injectUnitMapOptional = (): Ref<UnitMap> | undefined => {
	const unitMap = inject<Ref<UnitMap>>(unitMapSymbol);

	return unitMap;
};

export const injectUnitMap = (): Ref<UnitMap> => {
	const unitMap = injectUnitMapOptional();

	if (unitMap == null) {
		throw new Error('No unitMap provided');
	}

	return unitMap;
};
