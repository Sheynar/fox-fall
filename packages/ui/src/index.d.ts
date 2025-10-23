import type { ElectronApi } from '@packages/data/dist/electron-api';

declare global {
	interface Window {
		electronApi?: ElectronApi;
	}
}
