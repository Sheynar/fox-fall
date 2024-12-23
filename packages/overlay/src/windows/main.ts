import { BrowserWindow } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

let mainWindow: BrowserWindow | null = null;

export const initialise = () => {
	mainWindow = new BrowserWindow({
		frame: false,
		autoHideMenuBar: true,
		transparent: true,
		fullscreen: true,
		// focusable: false,
		closable: false,
		movable: false,
		resizable: false,
		show: false,
	});

	const url = pathToFileURL(path.join(__dirname, "../../www/index.html"));
	url.searchParams.append("overlay", "true");

	mainWindow.setAlwaysOnTop(true, "pop-up-menu");
	mainWindow.loadURL(url.href);
};

export const showMain = () => {
	if (mainWindow == null || mainWindow.isDestroyed()) return initialise();
	mainWindow?.show();
	mainWindow?.setFullScreen(false);
	mainWindow?.setFullScreen(true);
};

export const hideMain = () => {
	mainWindow?.minimize();
	mainWindow?.hide();
};

export const isMainVisible = () => {
	return !mainWindow?.isDestroyed() && mainWindow?.isVisible();
};

export const toggleMain = () => {
	if (isMainVisible()) {
		hideMain();
		return false;
	} else {
		showMain();
	}
};
