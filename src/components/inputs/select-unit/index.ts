import { computed } from 'vue';
import { injectUnitMap } from '@/contexts/unit';
import { type Unit, UnitType, unitTypeOrder, getUnitLabel } from '@/lib/unit';

export const useSelectUnitOptions = () => {
	const unitMap = injectUnitMap();

	const selectUnitOptions = computed(() => {
		const selectUnitOptions: {
			label: string;
			units: { id: string; label: string }[];
		}[] = [];

		for (const unitType of unitTypeOrder) {
			const units: Unit[] = [];
			for (const unit of Object.values(unitMap.value)) {
				if (unit.type !== unitType) continue;
				units.push(unit);
			}
			if (units.length > 0) {
				selectUnitOptions.push({
					label: UnitType[unitType],
					units: units.map((unit) => ({
						id: unit.id,
						label: getUnitLabel(unitMap.value, unit.id),
					})),
				});
			}
		}

		return selectUnitOptions;
	});

	return {
		selectUnitOptions,

		optionLabel: 'label',
		optionGroupLabel: 'label',
		optionGroupChildren: 'units',
	};
};
