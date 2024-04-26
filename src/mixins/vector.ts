import { type Ref, computed } from 'vue';
import { Vector } from '@/lib/vector';

export const useVectorSum = (
	vectorA: Ref<Vector>,
	vectorB: Ref<Vector>
): Ref<Vector> => {
	return computed(() => {
		return vectorA.value.addVector(vectorB.value);
	});
};

export const useVectorDifference = (
	vectorA: Ref<Vector>,
	vectorB: Ref<Vector>
): Ref<Vector> => {
	return computed(() => {
		return vectorA.value.getRelativeOffset(vectorB.value);
	});
};

export const useVectorMidpoint = (
	vectorA: Ref<Vector>,
	vectorB: Ref<Vector>
): Ref<Vector> => {
	return computed(() => {
		return vectorA.value.addVector(vectorB.value).scale(0.5);
	});
};
