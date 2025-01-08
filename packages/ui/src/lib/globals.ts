import { runGlobal } from '@/lib/globalScope';
import { useArtillery } from '@/mixins/artillery';
import { useServerConnection } from '@/mixins/server-connection';
import { useSyncedRoom } from '@/mixins/synced-room';
import { until } from '@vueuse/core';

const { artillery, serverConnection, syncedRoom } = runGlobal(() => {
	const artillery = useArtillery({
		onUnitUpdated: (unitId: string) => syncedRoom.updateUnit(unitId),
		onWindUpdated: () => syncedRoom.updateWind(),
	});

	const serverConnection = useServerConnection();
	const syncedRoom = useSyncedRoom(
		artillery.readyToFire,
		artillery.unitMap,
		artillery.wind,
		serverConnection.webSocket
	);

	until(syncedRoom.isReady).toBe(true).then(() => artillery.resetViewport());

	return {
		artillery,
		serverConnection,
		syncedRoom,
	};
});

export { artillery, serverConnection, syncedRoom };
