import { Vector } from "./vector"

export class Viewport {
	constructor(
		public position: Vector,
		public rotation: number,
		public zoom: number
	) { }

	toViewportVector(vector: Vector): Vector {
		const transformed = vector.scale(1 / this.zoom).addVector(this.position.scale(-1));
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
		return rotated.addVector(this.position).scale(this.zoom);
	}

	clone(): Viewport {
		return new Viewport(this.position.clone(), this.rotation, this.zoom);
	}
};
