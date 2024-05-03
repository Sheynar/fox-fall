import { inject, provide } from 'vue';
import type { useServerConnection } from '@/mixins/server-connection';

export const serverConnectionSymbol = Symbol('serverConnection');
export type ServerConnection = ReturnType<typeof useServerConnection>;

export const provideServerConnection = (serverConnection: ServerConnection) => {
	provide(serverConnectionSymbol, serverConnection);
	(<any>window).serverConnection = serverConnection;
};

export const injectServerConnectionOptional = (): ServerConnection | undefined => {
	const serverConnection = inject<ServerConnection>(serverConnectionSymbol);

	return serverConnection;
};

export const injectServerConnection = (): ServerConnection => {
	const serverConnection = injectServerConnectionOptional();

	if (serverConnection == null) {
		throw new Error('No server connection provided');
	}

	return serverConnection;
};
