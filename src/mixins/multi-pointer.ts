import { type Ref, ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import { wrapDegrees } from '@/lib/angle';
import { Vector } from '@/lib/vector';

export type PointerMap = {
	[pointerId: string]: {
		pointerDownEvent: PointerEvent;
		startPointerPosition: Vector;
		pointerPosition: Vector;
		released: boolean;
	};
};

export type DragStatus = {
	pointers: PointerMap;
	transform: Vector;
	transformDelta: Vector;
	rotation: number;
	rotationDelta: number;
	zoom: number;
	zoomDelta: number;
	startPosition: Vector;
	currentPosition: Vector;
};

export type MultiPointerDragOptions = {
	element: Ref<HTMLElement | null>;
	onBeforePointerDown?: (e: PointerEvent) => boolean;
	onDragStart?: (e: PointerEvent) => void;
	onUpdate?: (dragStatus: DragStatus) => void;
	onDragEnd?: (e: PointerEvent) => void;
};
export const useMultiPointerDrag = (options: MultiPointerDragOptions) => {
	const currentDrag = ref<{
		pointers: PointerMap;
		lastStatus?: DragStatus;
	} | null>(null);

	const processDragMove = () => {
		if (!currentDrag.value) return;

		const pointers = Object.values(currentDrag.value.pointers);

		const centerPointStart = pointers
			.reduce(
				(acc, pointer) => acc.addVector(pointer.startPointerPosition),
				Vector.fromCartesianVector({ x: 0, y: 0 })
			)
			.scale(1 / pointers.length);
		const centerPointEnd = pointers
			.reduce(
				(acc, pointer) => acc.addVector(pointer.pointerPosition),
				Vector.fromCartesianVector({ x: 0, y: 0 })
			)
			.scale(1 / pointers.length);

		const transforms = pointers.map((pointer) => {
			return pointer.pointerPosition.addVector(
				pointer.startPointerPosition.scale(-1)
			);
		});
		const transform = transforms
			.reduce((acc, delta) => acc.addVector(delta))
			.scale(1 / transforms.length);

		const rotations = pointers.map((pointer) => {
			const startFromCenter = pointer.startPointerPosition.addVector(
				centerPointStart.scale(-1)
			);
			const endFromCenter = pointer.pointerPosition.addVector(
				centerPointEnd.scale(-1)
			);
			return endFromCenter.azimuth - startFromCenter.azimuth;
		});
		let rotation =
			wrapDegrees(rotations.reduce((acc, delta) => acc + delta)) /
			rotations.length;
		let rotationDelta =
			currentDrag.value.lastStatus != null
				? rotation - currentDrag.value.lastStatus.rotation
				: rotation;
		// this is disgusting but necessary
		if (Math.abs(rotationDelta) > 160) {
			rotation += rotationDelta > 0 ? -180 : 180;
			rotationDelta += rotationDelta > 0 ? -180 : 180;
		}

		const zooms = pointers.map((pointer) => {
			const startFromCenter = pointer.startPointerPosition.addVector(
				centerPointStart.scale(-1)
			);
			const endFromCenter = pointer.pointerPosition.addVector(
				centerPointEnd.scale(-1)
			);

			return (endFromCenter.distance - startFromCenter.distance) / 100;
		});
		const zoom = zooms.reduce((acc, delta) => acc + delta, 0);

		const newStatus: DragStatus = {
			pointers: currentDrag.value.pointers,
			transform,
			transformDelta:
				currentDrag.value.lastStatus != null
					? transform.addVector(
							currentDrag.value.lastStatus.transform.scale(-1)
						)
					: transform,
			rotation,
			rotationDelta,
			zoom,
			zoomDelta:
				currentDrag.value.lastStatus != null
					? zoom - currentDrag.value.lastStatus.zoom || 0
					: 0,
			startPosition: centerPointStart,
			currentPosition: centerPointEnd,
		};

		options.onUpdate?.(newStatus);
		currentDrag.value.lastStatus = newStatus;
	};

	const onPointerDown = (event: PointerEvent) => {
		if (
			options.onBeforePointerDown != null &&
			!options.onBeforePointerDown(event)
		)
			return;
		event.stopPropagation();
		event.preventDefault();

		if (!currentDrag.value) {
			currentDrag.value = {
				pointers: {},
			};
			options.onDragStart?.(event);
		}

		const position = Vector.fromCartesianVector({
			x: event.clientX,
			y: event.clientY,
		});

		if (currentDrag.value.pointers[event.pointerId]) {
			currentDrag.value.pointers[event.pointerId].pointerPosition = position;
			currentDrag.value.pointers[event.pointerId].released = false;
		} else {
			currentDrag.value.pointers[event.pointerId] = {
				pointerDownEvent: event,
				startPointerPosition: position,
				pointerPosition: position.clone(),
				released: false,
			};
		}

		options.element.value!.setPointerCapture(event.pointerId);
	};

	const onPointerUp = (event: PointerEvent) => {
		if (!currentDrag.value) return;
		event.stopPropagation();
		event.preventDefault();

		currentDrag.value.pointers[event.pointerId].released = true;
		if (
			Object.values(currentDrag.value.pointers).every(
				(pointer) => pointer.released
			)
		) {
			options.onDragEnd?.(event);
			currentDrag.value = null;
		}
		options.element.value!.releasePointerCapture(event.pointerId);
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!currentDrag.value) return;
		event.stopPropagation();
		event.preventDefault();

		currentDrag.value.pointers[event.pointerId].pointerPosition =
			Vector.fromCartesianVector({
				x: event.clientX,
				y: event.clientY,
			});

		processDragMove();
	};

	useEventListener(options.element, 'pointerdown', onPointerDown);
	useEventListener(options.element, 'pointerup', onPointerUp);
	useEventListener(options.element, 'pointermove', onPointerMove);

	return {
		currentDrag,
	};
};
