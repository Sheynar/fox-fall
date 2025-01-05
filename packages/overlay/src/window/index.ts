import { app, BrowserWindow, desktopCapturer, ipcMain, screen } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

const display = screen.getPrimaryDisplay();

const lowerBound = Math.min(display.bounds.width, display.bounds.height);
const size = Math.floor(lowerBound / 20);
const position = {
	x: display.bounds.width - size,
	y: display.bounds.height - size,
};

let managerWindow: BrowserWindow | null = null;

let overlayOpen = true;
export const toggleOverlay = () => {
	overlayOpen = !overlayOpen;
	if (managerWindow == null) return;

	if (overlayOpen) {
		managerWindow.setShape([managerWindow.getBounds()]);
	} else {
		managerWindow.setShape([
			{
				x: position.x,
				y: position.y,
				width: size,
				height: size,
			},
		]);

		managerWindow.blur();
	}

	managerWindow.setAlwaysOnTop(true, "screen-saver");

	managerWindow.webContents.send("overlay-toggled", overlayOpen);
};

export const initialise = () => {
	managerWindow = new BrowserWindow({
		frame: false,
		autoHideMenuBar: true,
		transparent: true,
		fullscreen: true,
		movable: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "./preload.js"),
		},
		// focusable: false,
	});

	managerWindow.webContents.session.setDisplayMediaRequestHandler(
		(request, callback) => {
			(async () => {
				const sources = await desktopCapturer.getSources({ types: ["screen"] });
				callback({
					video: sources[0],
				});
			})();
		}
	);

	ipcMain.on("toggle-overlay", (event) => {
		toggleOverlay();
	});
	ipcMain.on("query-overlay", (event) => {
		event.reply("query-overlay-reply", overlayOpen);
	});
	toggleOverlay();

	const url = pathToFileURL(path.join(__dirname, "../../www/index.html"));
	url.searchParams.append("overlay", "true");
	url.searchParams.append("size", `${size}px`);

	managerWindow.setAlwaysOnTop(true, "screen-saver");
	managerWindow.loadURL(url.href);
	// setInterval(() => managerWindow!.moveTop(), 1000);

	managerWindow.on("close", () => {
		app.quit();
	});
};

export const showManager = () => {
	managerWindow?.showInactive();
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
