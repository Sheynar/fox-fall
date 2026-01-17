import type {
	WarDetails,
	WarMaps,
	WarMapData,
} from '@packages/foxhole-api';
import { wrapMixin } from '@packages/frontend-libs/src/reference-cache';
import { ref, Ref, watch } from 'vue';

export type UseWarDataOptions = {
	instanceId: Ref<string>;
};
function _useWarData(options: UseWarDataOptions) {
	const warDetails = ref<WarDetails | null>(null);
	const warMaps = ref<WarMaps | null>(null);
	const staticMapData = ref<Record<string, WarMapData>>({});
	const dynamicMapData = ref<Record<string, WarMapData>>({});

	let sse: EventSource | null = null;
	watch(options.instanceId, (newInstanceId) => {
		if (sse) {
			sse.close();
		}

		warDetails.value = null;
		warMaps.value = null;
		staticMapData.value = {};
		dynamicMapData.value = {};

		sse = new EventSource(`/api/v1/war/sse/${newInstanceId}`);
		sse.addEventListener('warDetails', (event) => {
			warDetails.value = JSON.parse(event.data);
		});
		sse.addEventListener('warMaps', (event) => {
			warMaps.value = JSON.parse(event.data);
		});
		sse.addEventListener('warMapData', (event) => {
			const { mapName, isDynamicData, warMapData } = JSON.parse(event.data);
			if (isDynamicData) {
				dynamicMapData.value[mapName] = warMapData;
			} else {
				staticMapData.value[mapName] = warMapData;
			}
		});
	}, { immediate: true });

	return {
		warDetails,
		warMaps,
		staticMapData,
		dynamicMapData,
	};
}

export const useWarData = wrapMixin(_useWarData, (options) => `${options.instanceId.value}`);
