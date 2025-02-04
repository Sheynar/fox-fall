import type { ElectronApi } from '@packages/types/dist/electron-api';

declare global {
	interface Window {
		electronApi?: ElectronApi;
	}
}
