import { effectScope } from 'vue';

export const globalScope = effectScope(true);

export const runGlobal = <R>(callback: () => R): R => {
	return globalScope.run(callback) as R;
};
