import { inject, provide, type Ref } from 'vue';
import type { Location, LocationMap } from '@/lib/location';

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


export const locationMapSymbol = Symbol('locationMap');

export const provideLocationMap = (locationMap: Ref<LocationMap>) => {
	provide(locationMapSymbol, locationMap);
};

export const injectLocationMapOptional = (): Ref<LocationMap> | undefined => {
	const locationMap = inject<Ref<LocationMap>>(locationMapSymbol);

	return locationMap;
};

export const injectLocationMap = (): Ref<LocationMap> => {
	const locationMap = injectLocationMapOptional();

	if (locationMap == null) {
		throw new Error('No locationMap provided');
	}

	return locationMap;
};
