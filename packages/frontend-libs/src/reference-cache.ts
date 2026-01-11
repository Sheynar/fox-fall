import { computed, onScopeDispose, watch } from 'vue';

export class ReferenceCache<T> {
	private cache = new Map<string, { refCount: number; value: T }>();

	getReferenceCount(key: string) {
		const entry = this.cache.get(key);
		if (entry == null) {
			return 0;
		}
		return entry.refCount;
	}

	addReference(key: string, factory: () => T) {
		const entry = this.cache.get(key);
		if (entry == null) {
			const value = factory();
			this.cache.set(key, { refCount: 1, value });
			return value;
		}
		entry.refCount++;
		return entry.value;
	}

	removeReference(key: string) {
		const entry = this.cache.get(key);
		if (entry == null) {
			return;
		}
		entry.refCount--;
		if (entry.refCount === 0) {
			this.cache.delete(key);
		}
	}

	clear() {
		this.cache.clear();
	}
}

export function wrapMixin<M extends (...args: any[]) => any>(
	mixin: M,
	getKey: (...args: Parameters<M>) => string
): M {
	const cache = new ReferenceCache<ReturnType<M>>();

	return function wrappedMixin(...args: Parameters<M>) {
		const key = computed(() => getKey(...args));

		const output = cache.addReference(key.value, () => mixin(...args));

		onScopeDispose(() => {
			cache.removeReference(key.value);
		});

		watch(
			key,
			(newKey, oldKey) => {
				if (oldKey != null) {
					cache.removeReference(oldKey);
				}
				if (newKey != null) {
					cache.addReference(newKey, () => output);
				}
			},
			{ flush: 'sync' }
		);

		return output;
	} as M;
}
