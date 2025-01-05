import { globalShortcut } from 'electron';
import { toggleOverlay } from './window';

export const initialise = () => {
	globalShortcut.register('CmdOrCtrl+num4', () => {
		toggleOverlay();
	});
};