import { ref } from 'vue';
import type { DataConnection } from 'peerjs';
import { getPeer } from '@/lib/peer';

export const usePeerToPeer = (onMessage: (data: unknown) => unknown) => {
	const peerPromise = getPeer();
	const connections = ref<Record<string, DataConnection>>({});

	peerPromise.then((peer) => {
		peer.on('connection', (connection) => {
			connections.value[connection.peer] = connection;
			connection.on('data', onMessage);

			connection.once('close', () => {
				connection.off('data', onMessage);
				delete connections.value[connection.peer];
			});
		});
	});

	const broadcast = async (data: any) => {
		const promises = Object.values(connections.value).map(
			async (connection) => {
				await connection.send(data);
			}
		);

		await Promise.all(promises);
	};

	return {
		ready: peerPromise.then<void>(() => {}),

		connections,
		broadcast,
	};
};
