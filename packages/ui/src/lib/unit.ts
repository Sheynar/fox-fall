import { type Ref, ref } from 'vue';
import { generateId } from '@/lib/id';
import { natoAlphabet } from '@/lib/names';
import { settings } from '@/lib/settings';
import { Vector } from '@/lib/vector';
import { AMMO_TYPE, SPOTTING_TYPE, type Platform } from './constants/data';

export enum UnitType {
	Artillery,
	Spotter,
	Location,
	Target,
	LandingZone,
}

export const unitTypeOrder = [
	UnitType.Artillery,
	UnitType.Spotter,
	UnitType.Location,
	UnitType.Target,
	UnitType.LandingZone,
];

export type Unit = {
	id: string;
	label?: string;
	type: UnitType;
	vector: Vector;
	parentId?: string;
	ammunition?: AMMO_TYPE;
	platform?: Platform<AMMO_TYPE>;
	spottingType?: SPOTTING_TYPE;
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
		return Vector.fromCartesianVector({ x: 0, y: 0 });
	}

	if (unit.parentId != null)
		return unit.vector.addVector(getUnitResolvedVector(unitMap, unit.parentId));

	return unit.vector;
};

export const getUnitDefaultLabel = (unitMap: UnitMap, unitId: string): string => {
	const unitNumber = Object.keys(unitMap).indexOf(unitId);
	const natoName = settings.value.useNatoAlphabet ? natoAlphabet[unitNumber] : undefined;
	return natoName || String(unitNumber + 1);
};

export const getUnitLabel = (unitMap: UnitMap, unitId: string): string => {
	const unit = unitMap[unitId];

	if (unit == null) {
		return 'Unknown';
	}

	return unit.label || getUnitDefaultLabel(unitMap, unitId);
};
