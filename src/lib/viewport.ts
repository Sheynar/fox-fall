import { ComputedRef, computed } from "vue";
import { useWindowSize } from '@vueuse/core';
import { toRadians, wrapDegrees } from "@/lib/angle";
import { globalScope } from "@/lib/globalScope";
import { Vector } from "@/lib/vector";

let distanceScale: ComputedRef<number>;
let viewportOffset: ComputedRef<{ x: number; y: number; }>;

globalScope.run(() => {
	const { height, width } = useWindowSize();
	distanceScale = computed(() => {
		return Math.min(height.value, width.value) / 250;
	});

	viewportOffset = computed(() => {
		return {
			x: width.value / 2,
			y: height.value / 2,
		};
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

	rotateBy(rotationDelta: number, center: Vector = Vector.fromCartesianVector({ x: viewportOffset.value.x, y: viewportOffset.value.y })): void {
		this.rotation = wrapDegrees(this.rotation + rotationDelta);

		this.position.cartesianVector = {
			x:
				center.x +
				(this.position.x - center.x) *
					Math.cos(toRadians(rotationDelta)) -
				(this.position.y - center.y) *
					Math.sin(toRadians(rotationDelta)),
			y:
				center.y +
				(this.position.y - center.y) *
					Math.cos(toRadians(rotationDelta)) +
				(this.position.x - center.x) *
					Math.sin(toRadians(rotationDelta)),
		};
	}

	rotateTo(newRotation: number): void {
		return this.rotateBy(newRotation - this.rotation);
	}

	clone(): Viewport {
		return new Viewport(this.position.clone(), this.rotation, this.zoom);
	}
};

export { distanceScale };