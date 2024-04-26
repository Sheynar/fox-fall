import { type Ref, ref } from 'vue';
import { generateId } from '@/lib/id';
import { getName } from '@/lib/names';
import type { Vector } from '@/lib/vector';

export enum UnitType {
	Artillery,
	Spotter,
	Target,
}

export type Unit = {
	id: string;
	label: string;
	pinned: boolean;
	type: UnitType;
	vector: Vector;
	parentId?: string;
};

export type UnitMap = {
	[unitId: string]: Unit;
};

export const createUnit = (
	type: UnitType,
	vector: Ref<Vector>,
	parentId?: string
): Ref<Unit> => {
	return ref({
		id: generateId(),
		label: getName(),
		pinned: false,
		type,
		vector,
		parentId,
	});
};

export const getUnitResolvedVector = (
	unitMap: UnitMap,
	unitId: string
): Vector => {
	const unit = unitMap[unitId];

	if (unit == null) {
		throw new Error('No unit found');
	}

	if (unit.parentId != null)
		return unit.vector.addVector(getUnitResolvedVector(unitMap, unit.parentId));

	return unit.vector;
};
