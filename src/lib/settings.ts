import { ref } from 'vue';

export const settings = ref({
	automaticCameraTargeting: true,
	automaticCameraZoom: true,
	useNatoAlphabet: true,
	mainUnit: undefined as string | undefined,
	pointsOfInterest: [] as string[],
	unitIconScale: 1,
	unitSettingsScale: 1,
	showMap: false,
});

export const saveSettings = () => {
	localStorage.setItem('settings', JSON.stringify(settings.value));
};

export const loadSettings = () => {
	const savedSettings = localStorage.getItem('settings');
	if (savedSettings != null) {
		Object.assign(settings.value, JSON.parse(savedSettings));
	}
};
loadSettings();
