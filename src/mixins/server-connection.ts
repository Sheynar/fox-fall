import { onScopeDispose } from 'vue';

export const useServerConnection = (url: string) => {
	const webSocket = new WebSocket(url);

	const ready = new Promise<void>((resolve, reject) => {
		webSocket.addEventListener('open', () => resolve(), { once: true });
		webSocket.addEventListener('error', (_event) => reject(new Error('Failed to connect')), { once: true });
	});

	onScopeDispose(() => {
		webSocket.close();
	});

	return {
		ready,

		webSocket,
	};
};
