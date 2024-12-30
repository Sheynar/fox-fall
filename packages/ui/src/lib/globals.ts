import { runGlobal } from '@/lib/globalScope';
import { useArtillery } from '@/mixins/artillery';
import { useServerConnection } from '@/mixins/server-connection';
import { useSyncedRoom } from '@/mixins/synced-room';
import { useViewportControl } from '@/mixins/viewport-control';
import { ref } from 'vue';

const { artillery, containerElement, serverConnection, syncedRoom, viewportControl } = runGlobal(() => {
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

	const containerElement = ref<HTMLElement | null>(null);
	const viewportControl = useViewportControl({
		containerElement,
		viewport: artillery.viewport,
	});

	return {
		artillery,
		containerElement,
		serverConnection,
		syncedRoom,
		viewportControl,
	};
});

export { artillery, containerElement, serverConnection, syncedRoom, viewportControl };
