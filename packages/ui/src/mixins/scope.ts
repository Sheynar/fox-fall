import { effectScope, type EffectScope, type Ref, watch } from 'vue';

export const useScopeCollection = <K>() => {
	const mainScope = effectScope();
	const currentScopes = new Map<K, EffectScope>();

	const addScope = (key: K) => {
		if (currentScopes.has(key)) return currentScopes.get(key)!;
		const newScope = mainScope.run(() => effectScope())!;
		currentScopes.set(key, newScope);
		return newScope;
	};

	const removeScope = (key: K) => {
		if (!currentScopes.has(key)) return;
		const existingScope = currentScopes.get(key)!;
		currentScopes.delete(key);
		existingScope.stop();
	};

	const destroy = () => {
		mainScope.stop();
	};

	return {
		currentScopes,
		addScope,
		removeScope,
		destroy,
	};
};

export const useScopePerObjectKey = <K extends string | number>(
	input: Ref<Record<K, unknown>>,
	onScopeCreated: (key: K) => unknown = () => {},
	flush: 'pre' | 'post' | 'sync' = 'sync'
) => {
	const scopeCollection = useScopeCollection<K>();

	const checkKeys = (keys = Object.keys(input.value) as K[]) => {
		const newKeys = new Set(keys) as Set<K>;

		const addedKeys = [] as K[];
		const removedKeys = [] as K[];

		for (const key of scopeCollection.currentScopes.keys()) {
			if (!newKeys.has(key)) {
				removedKeys.push(key);
			}
		}

		for (const key of newKeys) {
			if (!scopeCollection.currentScopes.has(key)) {
				addedKeys.push(key);
			}
		}

		for (const key of removedKeys) {
			scopeCollection.removeScope(key);
		}

		for (const key of addedKeys) {
			const newScope = scopeCollection.addScope(key);
			newScope.run(() => onScopeCreated(key));
		}
	};

	const stop = watch(() => Object.keys(input.value) as K[], checkKeys, {
		immediate: true,
		flush,
	});

	return stop;
};

export const useScopePerSetEntry = <T>(
	input: Ref<Set<T>>,
	onScopeCreated: (entry: T) => unknown = () => {},
	flush: 'pre' | 'post' | 'sync' = 'sync'
) => {
	const scopeCollection = useScopeCollection<T>();

	const checkEntries = (entries = Array.from(input.value) as T[]) => {
		const newEntries = new Set(entries) as Set<T>;

		const addedEntries = [] as T[];
		const removedEntries = [] as T[];

		for (const entry of scopeCollection.currentScopes.keys()) {
			if (!newEntries.has(entry)) {
				removedEntries.push(entry);
			}
		}

		for (const entry of newEntries) {
			if (!scopeCollection.currentScopes.has(entry)) {
				addedEntries.push(entry);
			}
		}

		for (const entry of removedEntries) {
			scopeCollection.removeScope(entry);
		}

		for (const entry of addedEntries) {
			const newScope = scopeCollection.addScope(entry);
			newScope.run(() => onScopeCreated(entry));
		}
	};

	const stop = watch(() => Array.from(input.value) as T[], checkEntries, {
		immediate: true,
		flush,
	});

	return stop;
};

export const useScopePerMapKey = <K>(
	input: Ref<Map<K, unknown>>,
	onScopeCreated: (entry: K) => unknown = () => {},
	flush: 'pre' | 'post' | 'sync' = 'sync'
) => {
	const scopeCollection = useScopeCollection<K>();

	const checkKeys = (keys = Array.from(input.value.keys()) as K[]) => {
		const newKeys = new Set(keys) as Set<K>;

		const addedKeys = [] as K[];
		const removedKeys = [] as K[];

		for (const key of scopeCollection.currentScopes.keys()) {
			if (!newKeys.has(key)) {
				removedKeys.push(key);
			}
		}

		for (const key of newKeys) {
			if (!scopeCollection.currentScopes.has(key)) {
				addedKeys.push(key);
			}
		}

		for (const key of removedKeys) {
			scopeCollection.removeScope(key);
		}

		for (const key of addedKeys) {
			const newScope = scopeCollection.addScope(key);
			newScope.run(() => onScopeCreated(key));
		}
	};

	const stop = watch(() => Array.from(input.value.keys()) as K[], checkKeys, {
		immediate: true,
		flush,
	});

	return stop;
};
