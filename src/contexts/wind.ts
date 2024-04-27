import { inject, provide, type Ref } from 'vue';
import type { Vector } from '@/lib/vector';

export const windSymbol = Symbol('wind');

export const provideWind = (wind: Ref<Vector>) => {
	provide(windSymbol, wind);
	(<any>window).wind = wind;
};

export const injectWindOptional = (): Ref<Vector> | undefined => {
	const wind = inject<Ref<Vector>>(windSymbol);

	return wind;
};

export const injectWind = (): Ref<Vector> => {
	const wind = injectWindOptional();

	if (wind == null) {
		throw new Error('No wind provided');
	}

	return wind;
};
