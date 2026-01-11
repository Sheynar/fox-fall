import EventEmitter from 'node:events';
import { computed, EffectScope, effectScope, onScopeDispose, watch } from 'vue';

export class ReferenceCache<T> extends EventEmitter<{
	delete: [key: string, value: T];
}> {
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
			this.emit('delete', key, this.cache.get(key)!.value);
			this.cache.delete(key);
		}
	}
}

export function wrapMixin<M extends (...args: any[]) => any>(
	mixin: M,
	getKey: (...args: Parameters<M>) => string
): M {
	type CacheEntry = { scope: EffectScope; value: ReturnType<M> };
	const cache = new ReferenceCache<CacheEntry>();

	cache.on('delete', (_key, value) => {
		value.scope.stop();
	});

	return function wrappedMixin(...args: Parameters<M>) {
		const key = computed(() => getKey(...args));

		const output: CacheEntry = cache.addReference(key.value, () => {
			const scope = effectScope(true);
			const value = scope.run(() => mixin(...args))! as ReturnType<M>;
			return { scope, value };
		});

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

		return output.value;
	} as M;
}
