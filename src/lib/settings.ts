import { ref } from 'vue';

export const settings = ref({
	automaticCameraTargeting: true,
	automaticCameraZoom: true,
	useNatoAlphabet: true,
	mainUnit: undefined as string | undefined,
	pointsOfInterest: [] as string[],
});