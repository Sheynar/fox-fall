import { HEX_SIZE } from '@packages/data/dist/artillery/map';
import { Vector } from '@packages/data/dist/artillery/vector';
import { watch, Ref, onScopeDispose } from 'vue';
import {
	HEX_MAPS,
	MapSource,
} from '@packages/frontend-libs/dist/assets/images/hex-maps';
import { Hex, HEX_POSITIONS } from '@packages/frontend-libs/dist/hexMap';

export type HexMapOptions = {
	mapSource: MapSource;
	zoom: Ref<number>;
	position: Ref<Vector>;
	width: Ref<number>;
	height: Ref<number>;
	backdropCanvas?: HTMLCanvasElement;
	foregroundCanvas?: HTMLCanvasElement;
	onDispose?: () => void;
};
export function useHexMap(options: HexMapOptions) {
	const backdropCanvas =
		options.backdropCanvas ?? document.createElement('canvas');
	const backdropContext = backdropCanvas.getContext('2d')!;
	if (!backdropContext) {
		throw new Error('Failed to get backdrop context');
	}

	const foregroundCanvas =
		options.foregroundCanvas ?? document.createElement('canvas');
	const foregroundContext = foregroundCanvas.getContext('2d')!;
	if (!foregroundContext) {
		throw new Error('Failed to get foreground context');
	}

	let frameRequest: ReturnType<typeof requestAnimationFrame> | null = null;
	const cancelFrame = () => {
		if (frameRequest != null) {
			cancelAnimationFrame(frameRequest);
			frameRequest = null;
		}
	};
	const requestFrame = () => {
		cancelFrame();
		frameRequest = requestAnimationFrame(render);
	};

	watch(options.width, (newWidth) => {
		backdropCanvas.width = newWidth;
		foregroundCanvas.width = newWidth;
	}, { immediate: true });

	watch(options.height, (newHeight) => {
		backdropCanvas.height = newHeight;
		foregroundCanvas.height = newHeight;
	}, { immediate: true });

	let hexImages: Partial<Record<Hex, HTMLCanvasElement>> = {};
	watch(
		() => options.mapSource,
		async (newMapSource) => {
			const newHexImages: Partial<Record<Hex, HTMLCanvasElement>> = {};
			const newHexMap = await (newMapSource && HEX_MAPS[newMapSource] || HEX_MAPS[MapSource.Vanilla])();
			for (const [hex, imageSrc] of Object.entries(newHexMap) as [
				Hex,
				string,
			][]) {
				const hexImage = new Image();
				hexImage.src = imageSrc;
				hexImage.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = HEX_SIZE.width;
					canvas.height = HEX_SIZE.height;
					const context = canvas.getContext('2d');
					if (!context) return;
					context.drawImage(hexImage, 0, 0, HEX_SIZE.width, HEX_SIZE.height);
					newHexImages[hex] = canvas;
				};
			}
			if (newMapSource === options.mapSource) {
				hexImages = newHexImages;
			}
		},
		{ immediate: true }
	);

	function render() {
		if (isDisposed) return;
		cancelFrame();

		try {
			backdropContext.clearRect(0, 0, options.width.value, options.height.value);
			foregroundContext.clearRect(0, 0, options.width.value, options.height.value);

			const centerHexPosition = Vector.fromCartesianVector({
				x:
					options.position.value.x -
					(HEX_SIZE.width * options.zoom.value) / 2 +
					options.width.value / 2,
				y:
					options.position.value.y -
					(HEX_SIZE.height * options.zoom.value) / 2 +
					options.height.value / 2,
			});
			const drawHexLabels =
				options.width.value / options.zoom.value > HEX_SIZE.width * 1.5 &&
				options.height.value / options.zoom.value > HEX_SIZE.height * 1.5;

			const forEachHex = (
				callback: (hex: Hex, x: number, y: number, hexPosition: Vector) => void
			) => {
				for (let [y, row] of HEX_POSITIONS.entries()) {
					y -= Math.floor(HEX_POSITIONS.length / 2);
					for (let [x, hex] of row.entries()) {
						x -= Math.floor(row.length / 2);
						if (!hex) continue;

						const hexPosition = Vector.fromCartesianVector({
							x:
								centerHexPosition.x +
								x * HEX_SIZE.width * options.zoom.value * 1.5 +
								(y % 2 === 0 ? 0 : HEX_SIZE.width * options.zoom.value * 0.75),
							y:
								centerHexPosition.y +
								(y * HEX_SIZE.height * options.zoom.value) / 2,
						});
						callback(hex, x, y, hexPosition);
					}
				}
			};

			forEachHex((hex, _x, _y, hexPosition) => {
				if (!hexImages[hex]) return;
				backdropContext!.drawImage(
					hexImages[hex],
					hexPosition.x,
					hexPosition.y,
					HEX_SIZE.width * options.zoom.value,
					HEX_SIZE.height * options.zoom.value
				);
			});

			if (drawHexLabels) {
				forEachHex((hex, _x, _y, hexPosition) => {
					foregroundContext!.fillStyle = 'white';
					foregroundContext!.strokeStyle = 'black';
					foregroundContext!.font = `bold ${Math.max(15, 200 * options.zoom.value)}px sans-serif`;
					const textMetrics = foregroundContext!.measureText(hex);
					foregroundContext!.fillText(
						hex,
						hexPosition.x +
							(HEX_SIZE.width * options.zoom.value) / 2 -
							textMetrics.width / 2,
						hexPosition.y +
							(HEX_SIZE.height * options.zoom.value) / 2 +
							(textMetrics.fontBoundingBoxAscent +
								textMetrics.fontBoundingBoxDescent) /
								2
					);
					foregroundContext!.strokeText(
						hex,
						hexPosition.x +
							(HEX_SIZE.width * options.zoom.value) / 2 -
							textMetrics.width / 2,
						hexPosition.y +
							(HEX_SIZE.height * options.zoom.value) / 2 +
							(textMetrics.fontBoundingBoxAscent +
								textMetrics.fontBoundingBoxDescent) /
								2
					);
				});
			}
		} finally {
			requestFrame();
		}
	}

	function start() {
		if (isDisposed) return;
		requestFrame();
	}

	function stop() {
		cancelFrame();
	}

	let isDisposed = false;
	onScopeDispose(() => {
		isDisposed = true;
		options.onDispose?.();
	});

	return {
		backdropCanvas,
		foregroundCanvas,
		start,
		stop,
	};
}
