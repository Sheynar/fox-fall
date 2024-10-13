import { app, BrowserWindow } from 'electron';
import { initialise as initialiseMainWindow } from './windows/main';
import { initialise as initialiseManagerWindow, showManager } from './windows/manager';

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const initialise = async () => {
	await app.whenReady();
	initialiseMainWindow();
	initialiseManagerWindow();
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