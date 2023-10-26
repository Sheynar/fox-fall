import { inject, provide, type Ref } from 'vue';
import type { Location } from '@/lib/location';

export const locationSymbol = Symbol('location');

export const provideLocation = (location: Ref<Location>) => {
	provide(locationSymbol, location);
};

export const injectLocationOptional = (): Ref<Location> | undefined => {
	const location = inject<Ref<Location>>(locationSymbol);

	return location;
};

export const injectLocation = (): Ref<Location> => {
	const location = injectLocationOptional();

	if (location == null) {
		throw new Error('No location provided');
	}

	return location;
};
