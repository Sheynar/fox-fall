import { ref } from 'vue';
import { runGlobal } from '@/lib/globalScope';
import { useArtillery } from '@/mixins/artillery';
import { useServerConnection } from '@/mixins/server-connection';
import { useSyncedRoom } from '@/mixins/synced-room';
import { until } from '@vueuse/core';

const { artillery, interfaceVisibility, serverConnection, syncedRoom } = runGlobal(() => {

	const artillery = useArtillery({
		onUnitUpdated: (unitId: string) => syncedRoom.updateUnit(unitId),
		onWindUpdated: () => syncedRoom.updateWind(),
	});

	const interfaceVisibility = ref({
		syncSettings: false,
		settings: false,
	});

	const serverConnection = useServerConnection();
	const syncedRoom = useSyncedRoom(
		artillery.sharedState,
		serverConnection.webSocket
	);

	until(syncedRoom.isReady).toBe(true).then(() => artillery.resetViewport());

	return {
		artillery,
		interfaceVisibility,
		serverConnection,
		syncedRoom,
	};
});

export { interfaceVisibility, artillery, serverConnection, syncedRoom };
