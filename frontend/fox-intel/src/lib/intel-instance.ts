import { computed, inject, provide, Ref, shallowRef, watch } from 'vue';
import { useDiscordAccess } from './discord';

export type UseIntelInstanceOptions = {
	intelInstanceId: Ref<string>;
};
export function useIntelInstance(options: UseIntelInstanceOptions) {
	const discordAccess = useDiscordAccess();

	const session = shallowRef<{
		sessionId: string;
		issuedAt: number;
		expiresAt: number;
	} | null>(null);
	watch(
		[options.intelInstanceId, discordAccess.code],
		() => {
			session.value = null;
		},
		{ immediate: true, flush: 'sync', deep: true }
	);

	let getSessionIdPromise: Promise<string> = Promise.resolve('');
	async function getSessionId() {
		return (getSessionIdPromise = getSessionIdPromise
			.catch(() => {})
			.then(async () => {
				if (
					session.value != null &&
					session.value.expiresAt > Date.now() + 10_000
				) {
					return session.value.sessionId;
				}
				const response = await fetch(
					`/api/v1/instance/${options.intelInstanceId.value}`,
					{
						headers: {
							'X-Discord-Access-Code': discordAccess.code.value,
							'X-Discord-Redirect-Uri': discordAccess.redirectUri.value,
						},
					}
				);
				if (!response.ok) {
					throw new Error('Failed to get session. ' + (await response.text()));
				}
				const data: { sessionId: string; issuedAt: number; expiresAt: number } =
					await response.json();
				session.value = data;
				return data.sessionId;
			}));
	}

	async function authenticatedFetch(url: string, options: RequestInit) {
		const sessionId = await getSessionId();
		const response = await fetch(url, {
			...options,
			headers: {
				...(options.headers ?? {}),
				'X-Session-Id': sessionId,
			},
		});

		if (response.status === 401) {
			session.value = null;
			return authenticatedFetch(url, options);
		}

		return response;
	}

	return {
		instanceId: computed(() => options.intelInstanceId.value),
		session,
		authenticatedFetch,
	};
}

const intelInstanceSymbol = 'INTEL_INSTANCE';
export function provideIntelInstance(
	intelInstance: ReturnType<typeof useIntelInstance>
) {
	provide(intelInstanceSymbol, intelInstance);
}

export function injectIntelInstance() {
	const intelInstance = inject<ReturnType<typeof useIntelInstance>>(intelInstanceSymbol);
	if (!intelInstance) {
		throw new Error('Intel instance not found');
	}
	return intelInstance;
}
