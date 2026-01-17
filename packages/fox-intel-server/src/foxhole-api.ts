import { wrapFunction } from '@packages/data/dist/reference-cache.js';
import { monitorMapData, monitorWarDetails, monitorWarMaps, type WarDetails, type WarMaps, type Shard, type WarMapData } from '@packages/foxhole-api';
import { EventEmitter } from 'node:events';

export type WarMapDataMap = Record<string, { static: WarMapData | null, dynamic: WarMapData | null }>;

function _monitorWar(shard: Shard) {
	console.log('start war monitoring', shard);
	const emitter = new EventEmitter<{
		warDetails: [WarDetails, WarDetails | null],
		warMaps: [WarMaps, WarMaps | null],
		warMapDetails: [string, boolean, WarMapData, WarMapData | null],
	}>();

	const currentData = {
		warDetails: null as WarDetails | null,
		warMaps: null as WarMaps | null,
		warMapDetailsMap: {} as WarMapDataMap,
	}

	const stopWarDetails = monitorWarDetails(shard, (newWarDetails) => {
		const prevWarDetails = currentData.warDetails;
		currentData.warDetails = newWarDetails;
		emitter.emit('warDetails', newWarDetails, prevWarDetails);
	});

	const mapDetailWatchers = new Map<string, { stop: () => void }>();
	const stopWarMaps = monitorWarMaps(shard, (newWarMaps) => {
		const prevWarMaps = currentData.warMaps;
		currentData.warMaps = newWarMaps;
		emitter.emit('warMaps', newWarMaps, prevWarMaps);

		for (const [mapName, watcher] of mapDetailWatchers.entries()) {
			if (newWarMaps.includes(mapName)) continue;
			watcher.stop();
			mapDetailWatchers.delete(mapName);
		}

		for (const mapName of newWarMaps) {
			if (mapDetailWatchers.has(mapName)) continue;

			const stopWatcherList: (() => void)[] = [];

			for (const isDynamicData of [false, true]) {
				const stopWatcher = monitorMapData(shard, mapName, isDynamicData, (newStaticData) => {
					const prevStaticData = currentData.warMapDetailsMap[mapName]?.[isDynamicData ? 'dynamic' : 'static'];
					if (!currentData.warMapDetailsMap[mapName]) {
						currentData.warMapDetailsMap[mapName] = { static: null, dynamic: null };
					}
					currentData.warMapDetailsMap[mapName][isDynamicData ? 'dynamic' : 'static'] = newStaticData;

					emitter.emit('warMapDetails', mapName, isDynamicData, newStaticData, prevStaticData);
				});

				stopWatcherList.push(stopWatcher);
			}

			mapDetailWatchers.set(mapName, {
				stop: () => {
					for (const stopWatcher of stopWatcherList) {
						stopWatcher();
					}
				},
			});
		}
	});

	return {
		emitter,
		currentData,
		stop: () => {
			console.log('stop war monitoring', shard);
			stopWarDetails();
			stopWarMaps();
			for (const { stop } of mapDetailWatchers.values()) {
				stop();
			}
		},
	};
}

export const monitorWar = wrapFunction(_monitorWar, (shard) => shard);
