import { type Unit, UnitType } from '@packages/data/dist/artillery/unit';
import { artillery } from '@/lib/globals';
import { computed } from 'vue';

export const useFocusedUnitIds = () => {
	return computed(() => {
		const focusedUnits = [...artillery.highlightedUnits.value];

		if (artillery.selectedUnit.value != null) {
			focusedUnits.push(artillery.selectedUnit.value);
		}

		focusedUnits.push(...artillery.pinnedUnits.value);

		const artilleryUnitIds = Object.keys(artillery.unitMap.value).filter(
			(unitId) => artillery.unitMap.value[unitId].type === UnitType.Artillery
		);
		if (
			artilleryUnitIds.length === 1 &&
			!focusedUnits.includes(artilleryUnitIds[0])
		) {
			focusedUnits.push(artilleryUnitIds[0]);
		}

		return Array.from(new Set(focusedUnits));
	});
};

export const useUnitsByType = () => {
	return computed(() => {
		const output: Record<UnitType, Unit[]> = {
			[UnitType.Artillery]: [],
			[UnitType.LandingZone]: [],
			[UnitType.Location]: [],
			[UnitType.Spotter]: [],
			[UnitType.Target]: [],
		};

		for (const unit of Object.values(artillery.unitMap.value)) {
			output[unit.type].push(unit);
		}

		return output;
	});
};

export const usePrimaryUnitsByType = () => {
	const unitsByType = useUnitsByType();
	const focusedUnitIds = useFocusedUnitIds();

	return computed(() => {
		const output: Partial<Record<UnitType, Unit>> = {};

		for (const unitType of Object.keys(unitsByType.value).map(Number) as UnitType[]) {
			const units = unitsByType.value[unitType];
			if (units.length === 0) continue;
			if (units.length === 1) {
				output[unitType] = units[0];
				continue;
			}
			const highlightedUnit = units.find((unit) =>
				focusedUnitIds.value.includes(unit.id)
			);
			if (highlightedUnit != null) {
				output[unitType] = highlightedUnit;
				continue;
			}
			output[unitType] = units[0];
		}

		return output;
	});
};
