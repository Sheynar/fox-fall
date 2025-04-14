import { ElectronApiCommand } from "@packages/types/dist/electron-api.js";
import type { KeyboardCommand } from "@packages/types/dist/keyboard-config.js";
import type { UpdateConfig } from "@packages/types/dist/update-config.js";
import { app, BrowserWindow, desktopCapturer, ipcMain, screen } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
	getKeyboardShortcut,
	pauseKeyboardShortcuts,
	resumeKeyboardShortcuts,
	updateKeyboardShortcut,
} from "../keyboard-shortcuts.mjs";
import { getUpdateConfig, setUpdateConfig } from "../updates.mjs";
import packageJson from "../../package.json" with { type: "json" };

const __dirname = import.meta.dirname;
const display = screen.getPrimaryDisplay();

const defaultSize =
	Math.min(display.bounds.width, display.bounds.height) * 0.05;
let size = {
	x: defaultSize,
	y: defaultSize,
};

let managerWindow: BrowserWindow | null = null;

let overlayOpen = false;
export const updateShape = () => {
	if (managerWindow == null) return;

	if (overlayOpen) {
		managerWindow.setContentBounds(
			{
				x: 0,
				y: 0,
				width: display.bounds.width,
				height: display.bounds.height,
			},
			false
		);
	} else {
		managerWindow.setContentBounds(
			{
				x: display.bounds.width - size.x,
				y: display.bounds.height - size.y,
				width: size.x,
				height: size.y,
			},
			false
		);
	}

	managerWindow.setAlwaysOnTop(true, "screen-saver");
};
export const toggleOverlay = (newState = !overlayOpen) => {
	if (overlayOpen === newState) return;
	overlayOpen = newState;
	updateShape();

	if (managerWindow == null) return;

	if (overlayOpen) {
		managerWindow.minimize();
		managerWindow.restore();
	} else {
		managerWindow.minimize();
		setTimeout(() => {
			managerWindow!.showInactive();
		}, 100);
	}

	managerWindow.webContents.send(
		ElectronApiCommand.OverlayToggled,
		overlayOpen
	);
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
			preload: path.join(__dirname, "./preload.mjs"),
			nodeIntegration: true,
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

	ipcMain.on(
		ElectronApiCommand.GetRunningVersion,
		(event, requestId: string) => {
			event.reply(requestId, packageJson.version);
		}
	);
	ipcMain.on(ElectronApiCommand.ToggleOverlay, (event) => {
		toggleOverlay();
	});
	ipcMain.on(ElectronApiCommand.GetOverlayOpen, (event, requestId: string) => {
		event.reply(requestId, overlayOpen);
	});
	ipcMain.on(
		ElectronApiCommand.SendToggleSize,
		(event, newSize: { x: number; y: number }) => {
			size = newSize;
			if (!overlayOpen) {
				updateShape();
			}
		}
	);
	ipcMain.on(ElectronApiCommand.GetDisplaySize, (event, requestId: string) => {
		event.reply(requestId, {
			width: display.bounds.width,
			height: display.bounds.height,
		});
	});
	ipcMain.on(ElectronApiCommand.GetUpdateConfig, (event, requestId: string) => {
		event.reply(requestId, getUpdateConfig());
	});
	ipcMain.on(
		ElectronApiCommand.SetUpdateConfig,
		(event, config: UpdateConfig) => {
			setUpdateConfig(config);
		}
	);
	ipcMain.on(ElectronApiCommand.PauseKeyboardShortcuts, (event) => {
		pauseKeyboardShortcuts();
	});
	ipcMain.on(ElectronApiCommand.ResumeKeyboardShortcuts, (event) => {
		resumeKeyboardShortcuts();
	});
	ipcMain.on(
		ElectronApiCommand.UpdateKeyboardShortcut,
		(event, command: KeyboardCommand, accelerator?: string[]) => {
			updateKeyboardShortcut(command, accelerator);
		}
	);
	ipcMain.on(
		ElectronApiCommand.GetKeyboardShortcut,
		(event, requestId: string, command: KeyboardCommand) => {
			event.reply(requestId, getKeyboardShortcut(command));
		}
	);

	// setInterval(() => updateShape(), 1000);
	updateShape();
	managerWindow.restore();

	const url = pathToFileURL(path.join(__dirname, "../../www/index.html"));

	managerWindow.setAlwaysOnTop(true, "screen-saver");
	managerWindow.loadURL(url.href);

	managerWindow.on("close", () => {
		app.quit();
	});
};
