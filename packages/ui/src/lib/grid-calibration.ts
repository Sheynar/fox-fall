import { Vector } from './vector';
import { Viewport } from './viewport';

export const calibrateGrid = async (viewport: Viewport) => {
	const calibrationPane = document.createElement('div');
	calibrationPane.style.setProperty('position', 'fixed');
	calibrationPane.style.setProperty('inset', '0');
	calibrationPane.style.setProperty('width', '100vw');
	calibrationPane.style.setProperty('height', '100vh');
	calibrationPane.style.setProperty('z-index', '1000000');
	calibrationPane.style.setProperty('font-size', '4vmin');
	calibrationPane.style.setProperty('display', 'flex');
	calibrationPane.style.setProperty('align-items', 'center');
	calibrationPane.style.setProperty('justify-content', 'center');
	calibrationPane.style.setProperty('text-align', 'center');
	calibrationPane.style.setProperty('filter', "url('#outline')");
	calibrationPane.style.setProperty('cursor', 'crosshair');
	calibrationPane.style.setProperty('opacity', '0.4');

	calibrationPane.innerText =
		'Calibrating grid. \n Drag from one corner of a cell to the other';

	let resolve: () => void, reject: (e: unknown) => void;
	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	let draggingData: {
		startPosition: Vector;
		endPosition: Vector;
		indicator: HTMLDivElement;
	} | null = null;
	calibrationPane.addEventListener('pointerdown', (event) => {
		event.preventDefault();
		event.stopPropagation();

		const indicator = document.createElement('div');
		indicator.style.setProperty('position', 'absolute');
		indicator.style.setProperty('left', `${event.clientX}px`);
		indicator.style.setProperty('top', `${event.clientY}px`);
		indicator.style.setProperty('border', `1px solid #fff`);
		indicator.style.setProperty('filter', "url('#outline')");
		indicator.style.setProperty('pointer-events', 'none');
		calibrationPane.appendChild(indicator);

		draggingData = {
			startPosition: Vector.fromCartesianVector({
				x: event.clientX,
				y: event.clientY,
			}),
			endPosition: Vector.fromCartesianVector({
				x: event.clientX,
				y: event.clientY,
			}),
			indicator,
		};

		calibrationPane.setPointerCapture(event.pointerId);
		onPointerMove(event);
	});

	const onPointerMove = (event: PointerEvent) => {
		if (draggingData == null) return;
		event.preventDefault();
		event.stopPropagation();

		draggingData.endPosition = Vector.fromCartesianVector({
			x: event.clientX,
			y: event.clientY,
		});

		const startX = Math.min(draggingData.startPosition.x, draggingData.endPosition.x);
		const endX = Math.max(draggingData.startPosition.x, draggingData.endPosition.x);
		const startY = Math.min(draggingData.startPosition.y, draggingData.endPosition.y);
		const endY = Math.max(draggingData.startPosition.y, draggingData.endPosition.y);

		draggingData.indicator.style.setProperty('left', `${startX}px`);
		draggingData.indicator.style.setProperty('width', `${endX - startX}px`);
		draggingData.indicator.style.setProperty('top', `${startY}px`);
		draggingData.indicator.style.setProperty('height', `${endY - startY}px`);
	};
	calibrationPane.addEventListener('pointermove', onPointerMove);

	calibrationPane.addEventListener('pointerup', (event) => {
		if (draggingData == null) return;
		event.preventDefault();
		event.stopPropagation();

		const offset = viewport
			.toViewportOffset(draggingData.endPosition)
			.addVector(
				viewport.toViewportOffset(draggingData.startPosition).scale(-1)
			);

		viewport.withSmoothing(() => {
			viewport.rotation = viewport.rotation > 270 ? 360 + 90 : 90;
			viewport.zoomTo(
				(viewport.zoom * (Math.abs(offset.x) + Math.abs(offset.y))) / 250
			);

			const midpoint = viewport
				.toViewportVector(draggingData!.endPosition)
				.addVector(viewport.toViewportVector(draggingData!.startPosition))
				.scale(0.5);

			viewport.panBy(
				Vector.fromCartesianVector({
					x: Math.round(midpoint.x / 125) * 125 - midpoint.x,
					y: Math.round(midpoint.y / 125) * 125 - midpoint.y,
				})
			);
		});

		draggingData.indicator.remove();
		draggingData = null;

		calibrationPane.releasePointerCapture(event.pointerId);
		resolve();
	});

	document.body.appendChild(calibrationPane);

	return promise.finally(() => {
		calibrationPane.remove();
	});
};
