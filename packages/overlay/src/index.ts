import { app, BrowserWindow } from 'electron';
import '../server.js';
import { initialise as initialiseWindow, showManager } from './window';

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const initialise = async () => {
	await app.whenReady();
	initialiseWindow();
	showManager();
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