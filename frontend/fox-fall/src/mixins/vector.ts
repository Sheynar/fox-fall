import { type Ref, computed } from 'vue';
import { Vector } from '@packages/data/dist/artillery/vector';

export function useVectorSum(
	vectorA: Ref<Vector>,
	vectorB: Ref<Vector>
): Ref<Vector> {
	return computed(() => {
		return vectorA.value.addVector(vectorB.value);
	});
};

export function useVectorDifference(
	vectorA: Ref<Vector>,
	vectorB: Ref<Vector>
): Ref<Vector> {
	return computed(() => {
		return vectorA.value.getRelativeOffset(vectorB.value);
	});
};

export function useVectorMidpoint(
	vectorA: Ref<Vector>,
	vectorB: Ref<Vector>
): Ref<Vector> {
	return computed(() => {
		return vectorA.value.addVector(vectorB.value).scale(0.5);
	});
};
