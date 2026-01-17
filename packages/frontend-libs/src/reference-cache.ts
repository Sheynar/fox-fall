import { ReferenceCache } from '@packages/data/dist/reference-cache';
import { computed, EffectScope, effectScope, onScopeDispose, watch } from 'vue';

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
