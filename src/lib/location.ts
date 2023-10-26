import { type Ref, computed, ref } from "vue";
import type { Vector } from "@/lib/vector";

export type Location = {
	id: string;
	pinned: boolean;
	vector: Vector;
	resolvedVector: Vector;
};

export const createLocation = (vector: Ref<Vector>, parentLocation?: Ref<Location>): Ref<Location> => {
	return ref({
		id: Math.random().toString(36).substring(7),
		pinned: false,
		vector,
		resolvedVector: computed(() => {
			let out = vector.value;
			const parentVector = parentLocation?.value.resolvedVector;
			if (parentVector != null) {
				out = out.addVector(parentVector);
			}
			return out;
		}),
	});
};