import { ElectronApiCommand } from "@packages/data/dist/electron-api.js";
import type { KeyboardCommand } from "@packages/data/dist/keyboard-config.js";
import type { UpdateConfig } from "@packages/data/dist/update-config.js";
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
import { setWindowAsOverlay } from "./native-window.mjs";
import packageJson from "../../package.json" with { type: "json" };

const __dirname = import.meta.dirname;
const display = screen.getPrimaryDisplay();

let managerWindow: BrowserWindow | null = null;
let overlayManager: ReturnType<typeof setWindowAsOverlay> | null = null;

let overlayOpen = false;
export function toggleOverlay(newState = !overlayOpen) {
	if (overlayOpen === newState) return;
	overlayOpen = newState;

	if (managerWindow == null) return;
	if (overlayOpen) {
		overlayManager?.setFocus("overlay");
	} else {
		overlayManager?.setFocus("backdrop");
	}

	managerWindow.webContents.send(
		ElectronApiCommand.OverlayToggled,
		overlayOpen
	);
};

export async function initialise() {
	managerWindow = new BrowserWindow({
		frame: false,
		autoHideMenuBar: true,
		transparent: true,
		fullscreen: false,
		fullscreenable: false,
		movable: false,
		resizable: false,
		webPreferences: {
			backgroundThrottling: false,
			preload: path.join(__dirname, "./preload.mjs"),
			nodeIntegration: true,
		},
		skipTaskbar: true,
		// focusable: false,
	});

	managerWindow.webContents.session.setDisplayMediaRequestHandler(
		(request, callback) => {
			(async function handleDisplayMediaRequest() {
				const sources = await desktopCapturer.getSources({ types: ["screen"] });
				callback({
					video: sources[0],
				});
			})();
		}
	);

	ipcMain.handle(ElectronApiCommand.GetRunningVersion, function getRunningVersion() {
		return packageJson.version;
	});
	ipcMain.handle(ElectronApiCommand.FocusOverlay, function focusOverlay() {
		overlayManager?.setFocus("overlay");
	});
	ipcMain.handle(ElectronApiCommand.BlurOverlay, function blurOverlay() {
		overlayManager?.setFocus("backdrop");
	});
	ipcMain.handle(ElectronApiCommand.ToggleOverlay, () => {
		toggleOverlay();
	});
	ipcMain.handle(ElectronApiCommand.GetOverlayOpen, function getOverlayOpen() {
		return overlayOpen;
	});
	ipcMain.handle(ElectronApiCommand.EnableMouse, function enableMouse(event) {
		if (!managerWindow) return;
		managerWindow.setIgnoreMouseEvents(false, { forward: true });
	});
	ipcMain.handle(ElectronApiCommand.DisableMouse, function disableMouse() {
		if (!managerWindow) return;
		managerWindow.setIgnoreMouseEvents(true, { forward: true });
	});
	ipcMain.handle(ElectronApiCommand.GetDisplaySize, function getDisplaySize() {
		return {
			width: display.bounds.width,
			height: display.bounds.height,
		};
	});
	ipcMain.handle(ElectronApiCommand.GetUpdateConfig, function getUpdateConfig() {
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

	const url = pathToFileURL(path.join(__dirname, "../../www/index.html"));

	managerWindow.loadURL(url.href);

	managerWindow.setIgnoreMouseEvents(true, { forward: true });
	overlayManager = setWindowAsOverlay(managerWindow, "War", true);

	managerWindow.on("close", function onManagerWindowClose() {
		app.quit();
	});

	return {
		managerWindow,
		overlayManager,
	};
};
