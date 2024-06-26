import { computed, type Ref } from 'vue';
import { getUnitResolvedVector, type UnitMap } from '@/lib/unit';
import { Vector } from '@/lib/vector';

export const useUnitGroup = (unitMap: Ref<UnitMap>, unitIds: Ref<string[]>) => {
	const units = computed(() => unitIds.value.map((id) => unitMap.value[id]));

	const unitVectors = computed(() => {
		return units.value.map((unit) =>
			getUnitResolvedVector(unitMap.value, unit.id)
		);
	});

	const averageVector = computed(() => {
		return unitVectors.value
			.reduce(
				(sum, vector) => {
					return sum.addVector(vector);
				},
				Vector.fromCartesianVector({ x: 0, y: 0 })
			)
			.scale(1 / unitVectors.value.length);
	});

	const maxOffset = computed(() => {
		return Math.max(
			0,
			...unitVectors.value.map((vector) => {
				return Math.abs(
					vector.addVector(averageVector.value.scale(-1)).distance
				);
			})
		);
	});

	(<any>window).unitGroup = {
		units,
		unitVectors,
		averageVector,
		maxOffset,
	};

	return {
		units,
		averageVector,
		maxOffset,
	};
};
