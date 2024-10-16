import { BrowserWindow, screen, ipcMain, app } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { toggleMain, isMainVisible } from "../main";

let managerWindow: BrowserWindow | null = null;

export const initialise = () => {
	const display = screen.getPrimaryDisplay();
	const lowerBound = Math.min(display.bounds.width, display.bounds.height);
	const windowSize = Math.floor(lowerBound / 20);

	managerWindow = new BrowserWindow({
		frame: false,
		autoHideMenuBar: true,
		// transparent: true,
		width: windowSize,
		height: windowSize,
		x: display.bounds.width - Math.ceil(windowSize * 1.1),
		y: display.bounds.height - Math.ceil(windowSize * 1.1),
		movable: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "./preload.js"),
		},
		// focusable: false,
	});

	const url = pathToFileURL(path.join(__dirname, "../../../index.html"));

	managerWindow.setAlwaysOnTop(true, "screen-saver");
	managerWindow.loadURL(url.href);
	setInterval(() => managerWindow!.moveTop(), 1000);

	ipcMain.on("toggle-overlay", () => {
		toggleMain();
		if (managerWindow != null) {
			managerWindow.moveTop();
		}
	});

	managerWindow.on("close", () => {
		app.quit();
	});
};

export const showManager = () => {
	managerWindow?.show();
};

export const hideManager = () => {
	managerWindow?.hide();
};

export const toggleManager = () => {
	if (managerWindow?.isVisible()) {
		hideManager();
	} else {
		showManager();
	}
};
