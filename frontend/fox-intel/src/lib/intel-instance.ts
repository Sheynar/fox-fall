import { computed, Ref, shallowRef, watch } from "vue";

export type UseIntelInstanceOptions = {
	intelInstance: Ref<{ id: string; password: string }>;
};
export function useIntelInstance(options: UseIntelInstanceOptions) {
	const session = shallowRef<{
		sessionId: string;
		issuedAt: number;
		expiresAt: number;
	} | null>(null);
	watch(
		options.intelInstance,
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
				const response = await fetch('/api/v1/instance', {
					method: 'POST',
					body: JSON.stringify(options.intelInstance.value),
				});
				if (!response.ok) {
					throw new Error(
						'Failed to create instance. ' + (await response.text())
					);
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
		instanceId: computed(() => options.intelInstance.value.id),
		session,
		authenticatedFetch,
	};
}
