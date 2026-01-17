import {
	getWarDetails,
	getWarMaps,
	getMapData,
	Shard,
	WarDetails,
	WarMaps,
	MapData,
} from '@packages/foxhole-api';
import { wrapMixin } from '@packages/frontend-libs/src/reference-cache';
import { ref, Ref, watch } from 'vue';

export type UseWarDataOptions = {
	shard: Ref<Shard>;
};
function _useWarData(options: UseWarDataOptions) {
	const warDetails = ref<WarDetails | null>(null);
	const warMaps = ref<WarMaps | null>(null);
	const staticMapData = ref<Record<string, MapData>>({});
	const dynamicMapData = ref<Record<string, MapData>>({});

	async function fetchInfo() {
		const [details, maps] = await Promise.all([
			getWarDetails(options.shard.value),
			getWarMaps(options.shard.value),
		]);

		const [staticMapDataList, dynamicMapDataList] = await Promise.all([
			Promise.all(
				maps.map(
					async (map) =>
						[map, await getMapData(options.shard.value, map, false)] as const
				)
			),
			Promise.all(
				maps.map(
					async (map) =>
						[map, await getMapData(options.shard.value, map, true)] as const
				)
			),
		]);

		return {
			details,
			maps,
			staticMapDataList,
			dynamicMapDataList,
		};
	}

	let loadPromise: Promise<any> = Promise.resolve(null);
	async function load() {
		const promise = (loadPromise = fetchInfo());
		const { details, maps, staticMapDataList, dynamicMapDataList } =
			await promise;
		if (promise !== loadPromise) return;
		const newStaticMapData: typeof staticMapData.value = {};
		const newDynamicMapData: typeof dynamicMapData.value = {};
		for (const [mapName, mapData] of staticMapDataList) {
			newStaticMapData[mapName] = mapData;
		}
		for (const [mapName, mapData] of dynamicMapDataList) {
			newDynamicMapData[mapName] = mapData;
		}
		warDetails.value = details;
		warMaps.value = maps;
		staticMapData.value = newStaticMapData;
		dynamicMapData.value = newDynamicMapData;
	}

	watch(options.shard, () => {
		load();
	});

	const ready = ref(false);
	const readyPromise = load().then(() => {
		ready.value = true;
	});
	return {
		ready,
		readyPromise,
		warDetails,
		warMaps,
		staticMapData,
		dynamicMapData,
	};
}

export const useWarData = wrapMixin(_useWarData, (options) => `${options.shard.value}`);