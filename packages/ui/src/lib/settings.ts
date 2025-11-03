import { ref } from 'vue';
import { isOverlay } from './constants';

export enum UserMode {
	Basic = 'basic',
	Advanced = 'advanced',
}

export enum BackdropMode {
	None = 'none',
	Map = 'map',
	Grid = 'overlay',
}

export enum MapSource {
	Vanilla = 'vanilla',
	ImprovedMapModRustardKnightEdit = 'improved-map-mod-rustard-knight-edit',
	ImprovedMapModRustardKnightEditHd = "improved-map-mod-rustard-knight-edit-hd"
}

export const settings = ref({
	lockPan: false,
	lockRotate: true,
	lockZoom: false,

	transparentOverlay: isOverlay,
	backdropMode: isOverlay ? BackdropMode.Grid : BackdropMode.Map,
	mapSource: MapSource.ImprovedMapModRustardKnightEdit,
	userMode: UserMode.Advanced,

	overlayAlwaysVisible: false,
	useNatoAlphabet: true,
	showTooltip: true,
	showWindTooltip: true,
	showWindMeters: false,
	hidePinnedHeaders: false,
	toggleButtonScale: 1,
	unitIconScale: 1,
	unitSettingsScale: 1,
	gridDashLength: 3,
	gridDashGap: 0,
	gridLineWidth: 1,
	compassOpacity: 1,
	firingArcOpacity: 0,
	screenshotOpacity: 1,
	showMinMaxSpread: true,
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
		settings.value.lockRotate = true;
		settings.value.userMode = UserMode.Advanced;
	}
	console.log('settings loaded', JSON.parse(JSON.stringify(settings.value)));
};
loadSettings();
