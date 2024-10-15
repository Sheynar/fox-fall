import { ref } from 'vue';

export const settings = ref({
	automaticCameraTargeting: false,
	automaticCameraZoom: false,
	useNatoAlphabet: true,
	unitIconScale: 1,
	unitSettingsScale: 1,
	gridDashLength: 3,
	gridDashGap: 2,
	gridLineWidth: 0.5,
	sync: null as {
		serverAddress: string,
		code: string,
	} | null,
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
