import { ref } from 'vue';
import { isOverlay } from './constants';

export const settings = ref({
	lockPan: false,
	lockRotate: isOverlay,
	lockZoom: false,

	useNatoAlphabet: true,
	toggleButtonScale: 1,
	unitIconScale: 1,
	unitSettingsScale: 1,
	gridDashLength: 3,
	gridDashGap: 2,
	gridLineWidth: 0.5,
	screenshotOpacity: 1,
	showXYOffsets: false,
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
