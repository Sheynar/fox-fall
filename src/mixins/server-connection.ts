import { type Ref, onScopeDispose, ref, watch } from 'vue';

const RECONNECT_INTERVAL = 1000;

export const useServerConnection = (url: Ref<string | null | undefined>) => {
	const webSocket = ref<WebSocket>();
	const ready = ref(Promise.resolve());
	const destroyed = ref(false);

	const disconnect = () => {
		if (!webSocket.value) return;
		webSocket.value.close();
		webSocket.value = undefined;
	};

	const connect = async () => {
		if (webSocket.value) disconnect();
		if (destroyed.value || !url.value) return;

		const newSocket = webSocket.value = new WebSocket(url.value);
		await new Promise<void>((resolve, reject) => {
			newSocket.addEventListener('open', () => resolve(), { once: true });
			newSocket.addEventListener('error', (_event) => reject(new Error('Failed to connect')), { once: true });
		});
	};

	const reconnect = async () => {
		if (destroyed.value) return;
		ready.value = Promise.resolve()
		  .then(() => new Promise<void>((resolve) => {
			  setTimeout(() => resolve(), RECONNECT_INTERVAL);
		  }))
			.then(() => connect())
			.catch(() => reconnect());

		await ready.value;
	};

	watch(webSocket, (newSocket, oldSocket) => {
		if (oldSocket) {
			oldSocket.removeEventListener('close', reconnect);
		}
		if (newSocket) {
			newSocket.addEventListener('close', reconnect);
		}
	});

	const stop = () => {
		destroyed.value = true;
		disconnect();
	};

	watch(url, () => reconnect(), { immediate: true });
	onScopeDispose(stop);

	return {
		stop,
		ready,
		reconnect,

		webSocket,
	};
};
