import type { DataConnection, Peer } from 'peerjs';
import { TypedEventTarget } from 'typescript-event-target';
import { markRaw, onScopeDispose, ref, shallowRef } from 'vue';
import { getPeer } from '@/lib/peer';

export const usePeerToPeer = (peerPromise = getPeer()) => {
	const stopped = ref(false);
	const peer = shallowRef<Peer | null>(null);
	const connections = ref<Record<string, DataConnection>>({});
	const peerEventEmitter = new TypedEventTarget<{
		connection: CustomEvent<DataConnection>;
		disconnect: CustomEvent<DataConnection>;
		message: CustomEvent<unknown>;
	}>();

	const onMessage = (data: unknown) => {
		console.log('Received message', data);
		peerEventEmitter.dispatchTypedEvent(
			'message',
			new CustomEvent('message', { detail: data })
		);
	};

	const addConnection = (connection: DataConnection) => {
		console.log('New connection', connection.peer);
		connections.value[connection.peer] = markRaw(connection);
		connection.addListener('data', onMessage);

		connection.once('close', () => {
			connection.off('data', onMessage);
			delete connections.value[connection.peer];

			peerEventEmitter.dispatchTypedEvent(
				'disconnect',
				new CustomEvent('disconnect', { detail: connection })
			);
		});

		peerEventEmitter.dispatchTypedEvent(
			'connection',
			new CustomEvent('connection', { detail: connection })
		);
	};

	const broadcast = async (data: any) => {
		const promises = Object.values(connections.value).map(
			async (connection) => {
				await connection.send(data);
			}
		);

		await Promise.all(promises);
	};

	peerPromise.then((newPeer) => {
		console.log('Peer ready', newPeer);
		peer.value = markRaw(newPeer);
		if (stopped.value) return;
		newPeer.on('connection', (connection) => {
			connection.once('open', () => addConnection(connection));
		});
	});

	onScopeDispose(() => {
		for (const connection of Object.values(connections.value)) {
			connection.close();
		}
		if (peer.value) {
			peer.value.off('connection', addConnection);
		}
	});

	return {
		ready: peerPromise.then<void>(() => {}),

		peer,
		connections,
		events: peerEventEmitter,

		addConnection,
		broadcast,
	};
};
