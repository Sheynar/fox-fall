import { app, BrowserWindow, desktopCapturer, ipcMain, screen } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

const display = screen.getPrimaryDisplay();

let size = {
	x: 0,
	y: 0,
};

let managerWindow: BrowserWindow | null = null;

let overlayOpen = true;
export const updateShape = () => {
	if (managerWindow == null) return;

	if (overlayOpen) {
		managerWindow.setShape([managerWindow.getBounds()]);
		managerWindow.show();
	} else {
		managerWindow.setShape([
			{
				x: display.bounds.width - size.x,
				y: display.bounds.height - size.y,
				width: size.x,
				height: size.y,
			},
		]);

		managerWindow.minimize();
		setTimeout(() => managerWindow!.showInactive(), 100)
	}

	managerWindow.setAlwaysOnTop(true, "screen-saver");
};
export const toggleOverlay = () => {
	overlayOpen = !overlayOpen;
	updateShape();

	if (managerWindow == null) return;
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
	ipcMain.on("toggle-size", (event, newSize: { x: number; y: number }) => {
		size = newSize;
		if (!overlayOpen) {
			updateShape();
		}
	});
	toggleOverlay();

	const url = pathToFileURL(path.join(__dirname, "../../www/index.html"));

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
