import { app, BrowserWindow } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';

const createWindow = () => {
	const win = new BrowserWindow({
		frame: false,
		autoHideMenuBar: true,
		transparent: true,
		alwaysOnTop: true,
		fullscreen: true,
	});

	const url = pathToFileURL(path.join(__dirname, '../www/index.html'));
	url.searchParams.append('overlay', 'true');

	win.loadURL(url.href);
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const initialise = async () => {
	await app.whenReady();
	createWindow();
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
};

Promise.resolve().then(() => initialise()).catch((e) => {
	console.log('Failed to start app');
	console.error(e);
	app.quit();
});