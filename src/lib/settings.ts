import { ref } from 'vue';

export const settings = ref({
	automaticCameraTargeting: true,
	automaticCameraZoom: true,
	mainUnit: undefined as string | undefined,
	pointsOfInterest: [] as string[],
});