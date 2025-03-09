import { type Ref, ref } from 'vue';
import {
	AMMO_TYPE,
	ARTILLERY_BY_SHELL,
	ArtilleryPlatform,
	SPOTTING_TYPE,
	type Platform,
} from '@/lib/constants/data';
import { generateId } from '@/lib/id';
import { natoAlphabet } from '@/lib/names';
import { settings, UserMode } from '@/lib/settings';
import { Vector } from '@/lib/vector';

export enum UnitType {
	Artillery = 0,
	Spotter = 1,
	Location = 2,
	Target = 3,
	LandingZone = 4,
}

export const unitTypeOrder = [
	UnitType.Artillery,
	UnitType.Spotter,
	UnitType.Location,
	UnitType.Target,
	UnitType.LandingZone,
];

export const getAvailableUnitTypes = (): UnitType[] => {
	if (settings.value.userMode === UserMode.Basic) {
		return [UnitType.Artillery, UnitType.Target, UnitType.LandingZone];
	} else {
		return [
			UnitType.Artillery,
			UnitType.Spotter,
			UnitType.Location,
			UnitType.Target,
			UnitType.LandingZone,
		];
	}
};

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

export const getUnitDefaultLabel = (
	unitMap: UnitMap,
	unitId: string
): string => {
	const unitNumber = Object.keys(unitMap).indexOf(unitId);
	const natoName = settings.value.useNatoAlphabet
		? natoAlphabet[unitNumber]
		: undefined;
	return natoName || String(unitNumber + 1);
};

export const getUnitLabel = (unitMap: UnitMap, unitId: string): string => {
	const unit = unitMap[unitId];

	if (unit == null) {
		return 'Unknown';
	}

	return unit.label || getUnitDefaultLabel(unitMap, unitId);
};

const _getUnitSpecs = (
	unitMap: UnitMap,
	unitId: string
): ArtilleryPlatform | null => {
	const ammoType =
		(settings.value.userMode === UserMode.Advanced
			? unitMap[unitId].ammunition
			: undefined) ?? settings.value.globalAmmo;
	if (ammoType == null) {
		return null;
	}

	const platform =
		(settings.value.userMode === UserMode.Advanced
			? unitMap[unitId].platform
			: undefined) ?? settings.value.globalPlatform;
	if (platform == null) {
		return null;
	}

	return ARTILLERY_BY_SHELL[ammoType].PLATFORM[platform] ?? null;
};

const _getGlobalSpecs = (): ArtilleryPlatform | null => {
	if (settings.value.globalAmmo == null || settings.value.globalPlatform == null) {
		return null;
	}

	return ARTILLERY_BY_SHELL[settings.value.globalAmmo]?.PLATFORM[
		settings.value.globalPlatform
	] ?? null;
};

export const getUnitSpecs = (unitMap: UnitMap, unitId: string): ArtilleryPlatform | null => {
	const unit = unitMap[unitId];

	if (unit.type !== UnitType.Artillery) {
		return null;
	}

	if (settings.value.userMode === UserMode.Advanced) {
		return _getUnitSpecs(unitMap, unitId) ?? _getGlobalSpecs();
	}

	return _getGlobalSpecs();
};
