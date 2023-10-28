import { ComputedRef, computed } from "vue";
import { useWindowSize } from '@vueuse/core';
import { globalScope } from "@/lib/globalScope";
import { Vector } from "@/lib/vector";

let distanceScale: ComputedRef<number>;

globalScope.run(() => {
	const { height, width } = useWindowSize();
	distanceScale = computed(() => {
		return Math.min(height.value, width.value) / 250;
	});
});

export class Viewport {
	constructor(
		public position: Vector,
		public rotation: number,
		public zoom: number
	) { }

	get resolvedZoom(): number {
		return this.zoom * distanceScale.value;
	}
	set resolvedZoom(value: number) {
		this.zoom = value / distanceScale.value;
	}

	toViewportVector(vector: Vector): Vector {
		const transformed = vector.addVector(this.position.scale(-1)).scale(1 / this.resolvedZoom);
		return Vector.fromAngularVector({
			distance: transformed.distance,
			azimuth: transformed.azimuth - this.rotation,
		});
	}

	fromViewportVector(vector: Vector): Vector {
		const rotated = Vector.fromAngularVector({
			distance: vector.distance,
			azimuth: vector.azimuth + this.rotation,
		});
		return rotated.scale(this.resolvedZoom).addVector(this.position);
	}

	clone(): Viewport {
		return new Viewport(this.position.clone(), this.rotation, this.zoom);
	}
};

export { distanceScale };