import { app, BrowserWindow } from 'electron';
import '../server.js';

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const initialise = async () => {
	await app.whenReady();
	const { initialise: initialiseWindow, showManager } = await import('./window');
	initialiseWindow();
	showManager();

	const { initialise: initialiseKeyboardShortcuts } = await import('./keyboard-shortcuts');
	initialiseKeyboardShortcuts();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			showManager();
		}
	});
};

Promise.resolve().then(() => initialise()).catch((e) => {
	console.log('Failed to start app');
	console.error(e);
	app.quit();
});