import { inject, provide, type Ref } from 'vue';
import type { Viewport } from '@/lib/viewport';

export const viewportSymbol = Symbol('viewport');

export const provideViewport = (viewport: Ref<Viewport>) => {
	provide(viewportSymbol, viewport);
};

export const injectViewportOptional = (): Ref<Viewport> | undefined => {
	const viewport = inject<Ref<Viewport>>(viewportSymbol);

	return viewport;
};

export const injectViewport = (): Ref<Viewport> => {
	const viewport = injectViewportOptional();

	if (viewport == null) {
		throw new Error('No viewport provided');
	}

	return viewport;
};
