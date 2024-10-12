import { inject, provide, type Ref } from 'vue';
import type { Vector } from '@/lib/vector';

export const cursorSymbol = Symbol('cursor');

export const provideCursor = (cursor: Ref<Vector>) => {
	provide(cursorSymbol, cursor);
	(<any>window).cursor = cursor;
};

export const injectCursorOptional = (): Ref<Vector> | undefined => {
	const cursor = inject<Ref<Vector>>(cursorSymbol);

	return cursor;
};

export const injectCursor = (): Ref<Vector> => {
	const cursor = injectCursorOptional();

	if (cursor == null) {
		throw new Error('No cursor provided');
	}

	return cursor;
};
