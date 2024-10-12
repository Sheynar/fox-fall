import { inject, provide, type Ref } from 'vue';

export const readyToFireSymbol = Symbol('readyToFire');

export const provideReadyToFire = (readyToFire: Ref<boolean>) => {
	provide(readyToFireSymbol, readyToFire);
	(<any>window).readyToFire = readyToFire;
};

export const injectReadyToFireOptional = (): Ref<boolean> | undefined => {
	const readyToFire = inject<Ref<boolean>>(readyToFireSymbol);

	return readyToFire;
};

export const injectReadyToFire = (): Ref<boolean> => {
	const readyToFire = injectReadyToFireOptional();

	if (readyToFire == null) {
		throw new Error('No readyToFire provided');
	}

	return readyToFire;
};
