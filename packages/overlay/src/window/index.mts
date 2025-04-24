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

let managerWindow: BrowserWindow | null = null;

let overlayOpen = false;
export const toggleOverlay = (newState = !overlayOpen) => {
	if (overlayOpen === newState) return;
	overlayOpen = newState;

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

export const initialise = async () => {
	managerWindow = new BrowserWindow({
		frame: false,
		autoHideMenuBar: true,
		transparent: true,
		fullscreen: false,
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

	ipcMain.handle(ElectronApiCommand.GetRunningVersion, () => {
		return packageJson.version;
	});
	ipcMain.handle(ElectronApiCommand.ToggleOverlay, () => {
		toggleOverlay();
	});
	ipcMain.handle(ElectronApiCommand.GetOverlayOpen, () => {
		return overlayOpen;
	});
	ipcMain.handle(ElectronApiCommand.EnableMouse, (event) => {
		if (!managerWindow) return;
		managerWindow.setIgnoreMouseEvents(false, { forward: true });
	});
	ipcMain.handle(ElectronApiCommand.DisableMouse, () => {
		if (!managerWindow) return;
		managerWindow.setIgnoreMouseEvents(true, { forward: true });
	});
	ipcMain.handle(ElectronApiCommand.GetDisplaySize, () => {
		return {
			width: display.bounds.width,
			height: display.bounds.height,
		};
	});
	ipcMain.handle(ElectronApiCommand.GetUpdateConfig, () => {
		return getUpdateConfig();
	});
	ipcMain.handle(
		ElectronApiCommand.SetUpdateConfig,
		(event, config: UpdateConfig) => {
			setUpdateConfig(config);
		}
	);
	ipcMain.handle(ElectronApiCommand.PauseKeyboardShortcuts, () => {
		pauseKeyboardShortcuts();
	});
	ipcMain.handle(ElectronApiCommand.ResumeKeyboardShortcuts, () => {
		resumeKeyboardShortcuts();
	});
	ipcMain.handle(
		ElectronApiCommand.UpdateKeyboardShortcut,
		(event, command: KeyboardCommand, accelerator?: string[]) => {
			updateKeyboardShortcut(command, accelerator);
		}
	);
	ipcMain.handle(
		ElectronApiCommand.GetKeyboardShortcut,
		(event, command: KeyboardCommand) => {
			return getKeyboardShortcut(command);
		}
	);

	managerWindow.setIgnoreMouseEvents(true, { forward: true });
	const { setWindowAsOverlay } = await import("./native-window.mjs");
	const overlayManager = setWindowAsOverlay(managerWindow, "War", true);

	const url = pathToFileURL(path.join(__dirname, "../../www/index.html"));

	// managerWindow.setAlwaysOnTop(true, "screen-saver");
	managerWindow.loadURL(url.href);

	managerWindow.on("close", () => {
		app.quit();
	});

	return {
		overlayManager,
	}
};
