import { ComputedRef, computed } from 'vue';
import KAnim from '@kaosdlanor/kanim';
import { useWindowSize } from '@vueuse/core';
import { toRadians, wrapDegrees } from '@/lib/angle';
import { globalScope } from '@/lib/globalScope';
import { Vector } from '@/lib/vector';

let distanceScale: ComputedRef<number>;
let viewportOffset: ComputedRef<{ x: number; y: number }>;

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
	) {}

	get resolvedZoom(): number {
		return this.zoom * distanceScale.value;
	}
	set resolvedZoom(value: number) {
		this.zoom = value / distanceScale.value;
	}

	toViewportOffset(vector: Vector): Vector {
		const transformed = vector.scale(1 / this.resolvedZoom);
		transformed.azimuth -= this.rotation;
		return transformed;
	}

	toViewportVector(vector: Vector): Vector {
		return this.toViewportOffset(vector.addVector(this.position.scale(-1)));
	}

	fromViewportOffset(vector: Vector): Vector {
		const transformed = vector.clone();
		transformed.azimuth += this.rotation;
		return transformed.scale(this.resolvedZoom);
	}

	fromViewportVector(vector: Vector): Vector {
		return this.fromViewportOffset(vector).addVector(this.position);
	}

	rotateBy(
		rotationDelta: number,
		center: Vector = Vector.fromCartesianVector({
			x: viewportOffset.value.x,
			y: viewportOffset.value.y,
		})
	): void {
		this.rotation = wrapDegrees(this.rotation + rotationDelta);

		this.position.cartesianVector = {
			x:
				center.x +
				(this.position.x - center.x) * Math.cos(toRadians(rotationDelta)) -
				(this.position.y - center.y) * Math.sin(toRadians(rotationDelta)),
			y:
				center.y +
				(this.position.y - center.y) * Math.cos(toRadians(rotationDelta)) +
				(this.position.x - center.x) * Math.sin(toRadians(rotationDelta)),
		};
	}

	rotateTo(newRotation: number): void {
		return this.rotateBy(newRotation - this.rotation);
	}

	panBy(panDelta: Vector): void {
		this.position = this.position.addVector(
			this.fromViewportOffset(panDelta).scale(-1)
		);
	}

	panTo(newPosition: Vector): void {
		this.position = this.fromViewportOffset(newPosition).scale(-1);
	}

	getFocusedPosition(): Vector {
		return this.toViewportVector(Vector.fromCartesianVector(viewportOffset.value));
	}

	panToCentered(newPosition: Vector): void {
		this.panTo(this.fromCentered(newPosition));
	}

	toCentered(position: Vector): Vector {
		return position.addVector(
			this.toViewportOffset(
				Vector.fromCartesianVector(viewportOffset.value)
			)
		);
	}

	fromCentered(position: Vector): Vector {
		return position.addVector(
			this.toViewportOffset(
				Vector.fromCartesianVector(viewportOffset.value).scale(-1)
			)
		);
	}

	zoomBy(
		zoomDelta: number,
		globalPinPosition: Vector = this.fromViewportVector(
			this.getFocusedPosition()
		)
	): void {
		const viewportPinPosition = this.toViewportVector(globalPinPosition);

		this.zoom = Math.max(0.1, this.zoom + zoomDelta);

		const cursorDelta = this.fromViewportVector(viewportPinPosition).addVector(
			globalPinPosition.scale(-1)
		);

		this.position = this.position.addVector(cursorDelta.scale(-1));
	}

	zoomTo(newZoom: number, globalPinPosition?: Vector): void {
		return this.zoomBy(newZoom - this.zoom, globalPinPosition);
	}

	async withSmoothing(callback: () => void): Promise<void> {
		const currentPosition = this.position.clone();
		const currentZoom = this.zoom;
		const currentRotation = this.rotation;

		callback();

		const newPosition = this.position.clone();
		const newZoom = this.zoom;
		const newRotation = this.rotation;

		await Promise.all([
			KAnim.animate({
				element: this.position,
				property: 'x',
				from: currentPosition.x,
				to: newPosition.x,
				duration: 250,
				easing: 'easeInOutQuad',
			}),
			KAnim.animate({
				element: this.position,
				property: 'y',
				from: currentPosition.y,
				to: newPosition.y,
				duration: 250,
				easing: 'easeInOutQuad',
			}),
			KAnim.animate({
				element: this,
				property: 'zoom',
				from: currentZoom,
				to: newZoom,
				duration: 250,
				easing: 'easeInOutQuad',
			}),
			KAnim.animate({
				element: this,
				property: 'rotation',
				from: currentRotation,
				to: newRotation,
				duration: 250,
				easing: 'easeInOutQuad',
			}),
		]);
	}

	clone(): Viewport {
		return new Viewport(this.position.clone(), this.rotation, this.zoom);
	}
}

export { distanceScale };
