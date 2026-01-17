export type CacheDetails = {
	maxAge?: number;
	etag?: string;
}
export function parseCache(response: Response): CacheDetails {
	const output: CacheDetails = {};

	const cacheControl = response.headers.get('Cache-Control');
	const cacheDirectives = (cacheControl ?? '')
		.split(',')
		.filter(directive => directive.trim() !== '')
		.map(directive => {
			const [key, ...values] = directive.trim().toLowerCase().split('=');
			return { key, value: values.join('=') };
		});

	for (const cacheDirective of cacheDirectives) {
		switch (cacheDirective.key) {
			case 'max-age':
				const parsedMaxAge = parseInt(cacheDirective.value);
				if (!isNaN(parsedMaxAge)) output.maxAge = parsedMaxAge;
				break;
			default:
				break;
		}
	}

	if (response.headers.has('ETag')) {
		output.etag = response.headers.get('ETag')!;
	}

	return output;
}

export type CacheableResponse<T> = CacheDetails & {
	data?: T;
}

export type RetrySettings = {
	retryDelay?: number;
	backoffMultiplier?: number;
	maxDelay?: number;
}

export function monitor<T>(_update: (etag?: string) => Promise<CacheableResponse<T>>, callback: (data: T) => void, retrySettings?: RetrySettings): () => void {
	let destroyed = false;
	let etag: string | undefined;
	const backoffMultiplier = retrySettings?.backoffMultiplier ?? 2;
	const maxDelay = retrySettings?.maxDelay ?? 10_000;

	async function update(retryDelay: number = retrySettings?.retryDelay ?? 1_000) {
		if (destroyed) return;
		try {
			const updated = await _update(etag);
			etag = updated.etag;
			if (updated.data) {
				try {
					callback(updated.data);
				} catch(error) {
					console.log('Error in monitoring callback');
					console.error(error);
				}
			}
			const refreshDelay = updated.maxAge ? updated.maxAge * 1000 : retryDelay;
			queueUpdate(refreshDelay, Math.min(retryDelay * backoffMultiplier, maxDelay));
		} catch(error) {
			queueUpdate(retryDelay, Math.min(retryDelay * backoffMultiplier, maxDelay));
		}
	}

	let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
	function cancelUpdate() {
		if (timeoutHandle != null) {
			clearTimeout(timeoutHandle);
			timeoutHandle = null;
		}
	}
	function queueUpdate(timeout: number, retryDelay?: number) {
		cancelUpdate();
		timeoutHandle = setTimeout(() => update(retryDelay), timeout);
	}

	update();

	return function destroy() {
		destroyed = true;
		cancelUpdate();
	};
}
