import { type Ref, ref } from 'vue';
import type { Vector } from '@/lib/vector';

export enum LocationType {
	Artillery,
	Spotter,
	Target,
}

export type Location = {
	id: string;
	label: string;
	pinned: boolean;
	type: LocationType;
	vector: Vector;
	parentId?: string;
};

export type LocationMap = {
	[locationId: string]: Location;
};

export const createLocation = (
	type: LocationType,
	vector: Ref<Vector>,
	parentId?: string
): Ref<Location> => {
	return ref({
		id: Math.random().toString(36).substring(7),
		label: '',
		pinned: false,
		type,
		vector,
		parentId,
	});
};

export const getLocationResolvedVector = (
	locationMap: LocationMap,
	locationId: string,
): Vector => {
	const location = locationMap[locationId];

	if (location == null) {
		throw new Error('No location found');
	}

	if (location.parentId != null)
		return location.vector.addVector(
			getLocationResolvedVector(locationMap, location.parentId)
		);

	return location.vector;
};
