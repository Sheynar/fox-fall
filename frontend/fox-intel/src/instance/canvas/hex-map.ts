import { HEX_SIZE } from '@packages/data/dist/artillery/map';
import { Vector } from '@packages/data/dist/artillery/vector';
import {
	Hex,
	HEX_POSITIONS,
	KNOWN_MAP_NAMES,
} from '@packages/data/dist/hexMap';
import {
	MapIconType,
	MapMarkerType,
	Team,
	TEAM_COLOR,
} from '@packages/foxhole-api';
import {
	HEX_MAPS,
	MapSource,
} from '@packages/frontend-libs/dist/assets/images/hex-maps';
import { MAP_ICONS } from '@packages/frontend-libs/dist/assets/images/map-icons';
import { useScopePerSetEntry } from '@packages/frontend-libs/dist/scope';
import { Delaunay } from 'd3-delaunay';
import { watch, Ref, onScopeDispose, watchEffect, computed } from 'vue';
import { useWarData } from '@/lib/war-data';

export type HexMapOptions = {
	instanceId: Ref<string>;
	mapSource: MapSource;
	zoom: Ref<number>;
	position: Ref<Vector>;
	width: Ref<number>;
	height: Ref<number>;
	backdropCanvas?: OffscreenCanvas;
	foregroundCanvas?: OffscreenCanvas;
	elementFilters?: {
		map?: Ref<boolean>;
		mapZone?: Ref<boolean>;
		mapIcon?: Ref<boolean>;
		hexLabel?: Ref<boolean>;
		regionLabel?: Ref<boolean>;
		minorLabel?: Ref<boolean>;
	};
	onDispose?: () => void;
};
export function useHexMap(options: HexMapOptions) {
	const warData = useWarData({ instanceId: options.instanceId });

	const backdropCanvas =
		options.backdropCanvas ??
		new OffscreenCanvas(options.width.value, options.height.value);
	const backdropContext = backdropCanvas.getContext('2d')!;
	if (!backdropContext) {
		throw new Error('Failed to get backdrop context');
	}

	const foregroundCanvas =
		options.foregroundCanvas ??
		new OffscreenCanvas(options.width.value, options.height.value);
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

	let hexImages: Partial<Record<Hex, OffscreenCanvas>> = {};
	watchEffect(
		async () => {
			const newHexImages: Partial<Record<Hex, OffscreenCanvas>> = {};
			const newHexMap = await (
				(options.mapSource && HEX_MAPS[options.mapSource]) ||
				HEX_MAPS[MapSource.Vanilla]
			)();
			for (const [hex, imageSrc] of Object.entries(newHexMap) as [
				Hex,
				string,
			][]) {
				const hexImage = new Image();
				hexImage.src = imageSrc;
				hexImage.onload = () => {
					const canvas = new OffscreenCanvas(HEX_SIZE.width, HEX_SIZE.height);
					const context = canvas.getContext('2d');
					if (!context) return;
					context.drawImage(hexImage, 0, 0, HEX_SIZE.width, HEX_SIZE.height);
					newHexImages[hex] = canvas;
				};
			}
			if (options.mapSource === options.mapSource) {
				hexImages = newHexImages;
			}
		}
	);

	const mapIcons: Partial<
		Record<Team, Partial<Record<MapIconType, HTMLCanvasElement>>>
	> = {};
	for (const [_iconType, icon] of Object.entries(MAP_ICONS)) {
		const iconType = Number(_iconType) as MapIconType;
		if (!icon) continue;
		const iconImage = new Image();
		iconImage.src = icon;
		iconImage.onload = () => {
			for (const team of Object.values(Team)) {
				const canvas = document.createElement('canvas');
				canvas.width = iconImage.width;
				canvas.height = iconImage.height;
				const context = canvas.getContext('2d');
				if (!context) return;
				context.filter = `url(#team-icon-${team})`;
				context.drawImage(iconImage, 0, 0, iconImage.width, iconImage.height);

				if (!mapIcons[team]) {
					mapIcons[team] = {};
				}

				mapIcons[team]![iconType] = canvas;
			}
		};
	}

	const mapZones = new Map<Hex, OffscreenCanvas>();
	useScopePerSetEntry(computed(() => new Set(Object.keys(KNOWN_MAP_NAMES) as Hex[])), (hex) => {
		watch(() => warData.dynamicMapData.value[KNOWN_MAP_NAMES[hex]], (newMapData) => {
			if (!newMapData) return;
			const regionItems = newMapData.mapItems.filter(
				(item) =>
					item.iconType === MapIconType.RelicBase1 ||
					item.iconType === MapIconType.TownBase1 ||
					item.iconType === MapIconType.TownBase2 ||
					item.iconType === MapIconType.TownBase3
			);

			const voronoi = Delaunay.from(
				regionItems.map(
					(item) =>
						[item.x * HEX_SIZE.width, item.y * HEX_SIZE.height] as [
							number,
							number,
						]
				)
			).voronoi([0, 0, HEX_SIZE.width, HEX_SIZE.height]);

			const hexZonesCanvas = new OffscreenCanvas(
				HEX_SIZE.width,
				HEX_SIZE.height
			);
			const hexZonesContext = hexZonesCanvas.getContext('2d')!;
			if (!hexZonesContext) {
				throw new Error('Failed to get hex zones context');
			}
			hexZonesContext.clearRect(0, 0, HEX_SIZE.width, HEX_SIZE.height);
			hexZonesContext.beginPath();
			hexZonesContext.moveTo(HEX_SIZE.width / 4, 0);
			hexZonesContext.lineTo((HEX_SIZE.width * 3) / 4, 0);
			hexZonesContext.lineTo(HEX_SIZE.width, HEX_SIZE.height / 2);
			hexZonesContext.lineTo((HEX_SIZE.width * 3) / 4, HEX_SIZE.height);
			hexZonesContext.lineTo(HEX_SIZE.width / 4, HEX_SIZE.height);
			hexZonesContext.lineTo(0, HEX_SIZE.height / 2);
			hexZonesContext.clip();

			hexZonesContext.strokeStyle = `#000000`;
			hexZonesContext.lineWidth = 1;
			hexZonesContext.beginPath();
			hexZonesContext.moveTo(HEX_SIZE.width / 4, 0);
			hexZonesContext.lineTo((HEX_SIZE.width * 3) / 4, 0);
			hexZonesContext.lineTo(HEX_SIZE.width, HEX_SIZE.height / 2);
			hexZonesContext.lineTo((HEX_SIZE.width * 3) / 4, HEX_SIZE.height);
			hexZonesContext.lineTo(HEX_SIZE.width / 4, HEX_SIZE.height);
			hexZonesContext.lineTo(0, HEX_SIZE.height / 2);
			hexZonesContext.closePath();
			hexZonesContext.stroke();

			for (const [index, regionItem] of regionItems.entries()) {
				const color = TEAM_COLOR[regionItem.teamId];
				hexZonesContext.fillStyle = `hsla(from ${color.hex} h s 60% / 0.3)`;
				hexZonesContext.strokeStyle = `hsla(from ${color.hex} h s l / 0.5)`;
				hexZonesContext.lineWidth = 1;
				hexZonesContext.beginPath();
				voronoi.renderCell(index, hexZonesContext);
				hexZonesContext.fill();
				hexZonesContext.stroke();
			}

			mapZones.set(hex, hexZonesCanvas);
		}, { immediate: true });
	}, 'pre');

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

			const drawHexLabels =
				options.width.value / options.zoom.value > HEX_SIZE.width * 1.5 &&
				options.height.value / options.zoom.value > HEX_SIZE.height * 1.5;

			const drawRegionLabels =
				options.width.value / options.zoom.value < HEX_SIZE.width * 1.5 ||
				options.height.value / options.zoom.value < HEX_SIZE.height * 1.5;

			const drawIcons =
				options.width.value / options.zoom.value < HEX_SIZE.width * 1.2 ||
				options.height.value / options.zoom.value < HEX_SIZE.height * 1.2;

			const drawMinorLabels =
				options.width.value / options.zoom.value < HEX_SIZE.width * 0.5 ||
				options.height.value / options.zoom.value < HEX_SIZE.height * 0.5;

			const hexLabelFontSize = Math.min(36, 200 * options.zoom.value);
			const regionFontSize = hexLabelFontSize / 1.5;
			const minorFontSize = regionFontSize / 1.5;

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

			if (options.elementFilters?.map?.value ?? true) {
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
			}

			if (drawIcons && (options.elementFilters?.mapIcon?.value ?? true)) {
				forEachHex((hex, _x, _y, hexPosition) => {
					const mapData = warData.dynamicMapData.value[KNOWN_MAP_NAMES[hex]];
					if (!mapData) return;
					for (const mapItem of mapData.mapItems) {
						const icon = mapIcons[mapItem.teamId]?.[mapItem.iconType];
						if (!icon) continue;
						foregroundContext!.drawImage(
							icon,
							hexPosition.x +
								mapItem.x * HEX_SIZE.width * options.zoom.value -
								icon.width / 2 / 1.5,
							hexPosition.y +
								mapItem.y * HEX_SIZE.height * options.zoom.value -
								icon.height / 2 / 1.5,
							icon.width / 1.5,
							icon.height / 1.5
						);
					}
				});
			}

			if (options.elementFilters?.mapZone?.value ?? true) {
				forEachHex((hex, _x, _y, hexPosition) => {
					const mapZone = mapZones.get(hex);
					if (!mapZone) return;
					foregroundContext!.drawImage(
						mapZone,
						hexPosition.x,
						hexPosition.y,
						HEX_SIZE.width * options.zoom.value,
						HEX_SIZE.height * options.zoom.value
					);
				});
			}

			if (
				drawMinorLabels &&
				(options.elementFilters?.minorLabel?.value ?? true)
			) {
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

			if (
				drawRegionLabels &&
				(options.elementFilters?.regionLabel?.value ?? true)
			) {
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

			if (drawHexLabels && (options.elementFilters?.hexLabel?.value ?? true)) {
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
