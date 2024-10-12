import { provideServerConnection } from '@/contexts/server-connection';
import { type Ref, computed, onScopeDispose, ref, watch } from 'vue';

const RECONNECT_INTERVAL = 10_000;

export enum ServerConnectionState {
	disconnected = 'Disconnected',
	connecting = 'Connecting',
	connected = 'Connected',
}

export const useServerConnection = (url: Ref<string | null | undefined> = ref()) => {
	const serverIp = ref<string | null>(null);
	const serverCode = ref<string | null>(null);

	const loadParamsFromUrl = () => {
		const url = new URL(window.location.href);
		const newServerIp = url.searchParams.get('serverAddress') || url.hostname;
		const newServerCode = url.searchParams.get('code');
		if (!newServerIp || !newServerCode) return;
		serverIp.value = newServerIp;
		serverCode.value = newServerCode;
	};
	loadParamsFromUrl();

	const serverUrl = computed(() => {
		if (url.value) return url.value;
		return serverIp.value && serverCode.value
		? `ws://${serverIp.value}:81/?code=${encodeURIComponent(serverCode.value)}`
		: null;
	});

	const webSocket = ref<WebSocket>();
	const ready = ref(Promise.resolve());
	const destroyed = ref(false);
	const connectionState = ref(ServerConnectionState.disconnected);

	const disconnect = () => {
		if (!webSocket.value) return;
		webSocket.value.close();
		webSocket.value = undefined;
	};

	const connect = async () => {
		if (webSocket.value) disconnect();
		if (destroyed.value || !serverUrl.value) return;
		connectionState.value = ServerConnectionState.connecting;

		const newSocket = (webSocket.value = new WebSocket(serverUrl.value));
		await new Promise<void>((resolve, reject) => {
			newSocket.addEventListener('open', () => resolve(), { once: true });
			newSocket.addEventListener(
				'error',
				(_event) => {
					connectionState.value = ServerConnectionState.disconnected;
					reject(new Error('Failed to connect'));
				},
				{ once: true }
			);
		});
	};

	const reconnect = async () => {
		if (destroyed.value) return;
		ready.value = Promise.resolve()
			.then(
				() =>
					new Promise<void>((resolve) => {
						setTimeout(() => resolve(), RECONNECT_INTERVAL);
					})
			)
			.then(() => connect())
			.catch(() => reconnect());

		await ready.value;
	};

	const onConnect = () => {
		connectionState.value = ServerConnectionState.connected;
	};

	const onDisconnect = () => {
		connectionState.value = ServerConnectionState.disconnected;
		reconnect();
	};

	watch(webSocket, (newSocket, oldSocket) => {
		if (oldSocket) {
			oldSocket.removeEventListener('open', onConnect);
			oldSocket.removeEventListener('close', onDisconnect);
		}
		if (newSocket) {
			newSocket.addEventListener('open', onConnect);
			newSocket.addEventListener('close', onDisconnect);
		}
	});

	const stop = () => {
		destroyed.value = true;
		disconnect();
	};

	watch(serverUrl, () => connect(), { immediate: true });
	onScopeDispose(stop);

	const output = {
		stop,
		ready,
		connectionState,
		reconnect,

		webSocket,
	};

	provideServerConnection(output);

	return output;
};
