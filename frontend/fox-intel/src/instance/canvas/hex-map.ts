import { HEX_SIZE } from '@packages/data/dist/artillery/map';
import { Vector } from '@packages/data/dist/artillery/vector';
import { watch, Ref, onScopeDispose, computed } from 'vue';
import {
	Hex,
	HEX_POSITIONS,
	KNOWN_MAP_NAMES,
} from '@packages/data/dist/hexMap';
import {
	HEX_MAPS,
	MapSource,
} from '@packages/frontend-libs/dist/assets/images/hex-maps';
import { MAP_ICONS } from '@packages/frontend-libs/dist/assets/images/map-icons';
import { useWarData } from '@/lib/war-data';
import { MapIconType, MapMarkerType, Shard } from '@packages/foxhole-api';

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
	// TODO : get shard from instance
	const warData = useWarData({ shard: computed(() => Shard.Able) });

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

	watch(
		options.width,
		(newWidth) => {
			backdropCanvas.width = newWidth;
			foregroundCanvas.width = newWidth;
		},
		{ immediate: true }
	);

	watch(
		options.height,
		(newHeight) => {
			backdropCanvas.height = newHeight;
			foregroundCanvas.height = newHeight;
		},
		{ immediate: true }
	);

	let hexImages: Partial<Record<Hex, HTMLCanvasElement>> = {};
	watch(
		() => options.mapSource,
		async (newMapSource) => {
			const newHexImages: Partial<Record<Hex, HTMLCanvasElement>> = {};
			const newHexMap = await (
				(newMapSource && HEX_MAPS[newMapSource]) ||
				HEX_MAPS[MapSource.Vanilla]
			)();
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

	const mapIcons: Partial<Record<MapIconType, HTMLCanvasElement>> = {};
	for (const [_iconType, icon] of Object.entries(MAP_ICONS)) {
		const iconType = Number(_iconType) as MapIconType;
		if (!icon) continue;
		const iconImage = new Image();
		iconImage.src = icon;
		iconImage.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = iconImage.width;
			canvas.height = iconImage.height;
			const context = canvas.getContext('2d');
			if (!context) return;
			context.drawImage(iconImage, 0, 0, iconImage.width, iconImage.height);
			mapIcons[iconType] = canvas;
		};
	}

	function render() {
		if (isDisposed) return;
		cancelFrame();

		try {
			backdropContext.clearRect(
				0,
				0,
				options.width.value,
				options.height.value
			);
			foregroundContext.clearRect(
				0,
				0,
				options.width.value,
				options.height.value
			);

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

			const drawRegionLabels =
				options.width.value / options.zoom.value < HEX_SIZE.width * 1.5 ||
				options.height.value / options.zoom.value < HEX_SIZE.height * 1.5;

			const drawMinorLabels =
				options.width.value / options.zoom.value < HEX_SIZE.width * 0.5 ||
				options.height.value / options.zoom.value < HEX_SIZE.height * 0.5;

			const hexLabelFontSize = Math.max(15, 200 * options.zoom.value);
			const regionFontSize = hexLabelFontSize / 5;
			const minorFontSize = regionFontSize / 2;

			function drawText(
				text: string,
				x: number,
				y: number,
				fontSize: number,
				foreground = 'black',
				background = 'white'
			) {
				foregroundContext!.fillStyle = background;
				foregroundContext!.strokeStyle = foreground;
				foregroundContext!.font = `bold ${fontSize}px sans-serif`;
				foregroundContext.textBaseline = 'middle';
				const textMetrics = foregroundContext!.measureText(text);
				foregroundContext!.fillText(text, x - textMetrics.width / 2, y);
				foregroundContext!.strokeText(text, x - textMetrics.width / 2, y);
			}

			function forEachHex(
				callback: (hex: Hex, x: number, y: number, hexPosition: Vector) => void
			) {
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
			}

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

			if (!drawHexLabels) {
				forEachHex((hex, _x, _y, hexPosition) => {
					const mapData = warData.dynamicMapData.value[KNOWN_MAP_NAMES[hex]];
					if (!mapData) return;
					for (const mapItem of mapData.mapItems) {
						const icon = mapIcons[mapItem.iconType];
						if (!icon) continue;
						foregroundContext!.drawImage(
							icon,
							hexPosition.x + mapItem.x * HEX_SIZE.width * options.zoom.value - icon.width / 2,
							hexPosition.y + mapItem.y * HEX_SIZE.height * options.zoom.value - icon.height / 2,
							icon.width,
							icon.height
						);
					}
				});
			}

			if (drawMinorLabels) {
				forEachHex((hex, _x, _y, hexPosition) => {
					const mapData = warData.staticMapData.value[KNOWN_MAP_NAMES[hex]];
					if (!mapData) return;
					for (const textItem of mapData.mapTextItems) {
						if (textItem.mapMarkerType !== MapMarkerType.Minor) continue;
						drawText(
							textItem.text,
							hexPosition.x + textItem.x * HEX_SIZE.width * options.zoom.value,
							hexPosition.y + textItem.y * HEX_SIZE.height * options.zoom.value,
							minorFontSize
						);
					}
				});
			}

			if (drawRegionLabels) {
				forEachHex((hex, _x, _y, hexPosition) => {
					const mapData = warData.staticMapData.value[KNOWN_MAP_NAMES[hex]];
					if (!mapData) return;
					for (const textItem of mapData.mapTextItems) {
						if (textItem.mapMarkerType !== MapMarkerType.Region) continue;
						drawText(
							textItem.text,
							hexPosition.x + textItem.x * HEX_SIZE.width * options.zoom.value,
							hexPosition.y + textItem.y * HEX_SIZE.height * options.zoom.value,
							regionFontSize
						);
					}
				});
			}

			if (drawHexLabels) {
				forEachHex((hex, _x, _y, hexPosition) => {
					drawText(
						hex,
						hexPosition.x + (HEX_SIZE.width * options.zoom.value) / 2,
						hexPosition.y + (HEX_SIZE.height * options.zoom.value) / 2,
						hexLabelFontSize
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
