import { useServerConnection } from '@/mixins/server-connection';
import { runGlobal } from './globalScope';
import { useSyncedRoom } from '@/mixins/synced-room';
import { useArtillery } from '@/mixins/artillery';

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

	return {
		artillery,
		serverConnection,
		syncedRoom,
	};
});

export { artillery, serverConnection, syncedRoom };
