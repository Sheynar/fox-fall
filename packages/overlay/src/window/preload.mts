import { contextBridge, ipcRenderer } from "electron";
import {
	ElectronApiCommand,
	type ElectronApi,
} from "@packages/data/dist/electron-api.js";
import type { KeyboardCommand } from "@packages/data/dist/keyboard-config.js";
import { UpdateConfig } from "@packages/data/dist/update-config.js";

const electronApi: ElectronApi = {
	getRunningVersion: async () =>
		ipcRenderer.invoke(ElectronApiCommand.GetRunningVersion),

	focusOverlay: async () =>
		ipcRenderer.invoke(ElectronApiCommand.FocusOverlay),

	blurOverlay: async () =>
		ipcRenderer.invoke(ElectronApiCommand.BlurOverlay),

	toggleOverlay: async () =>
		ipcRenderer.invoke(ElectronApiCommand.ToggleOverlay),

	getOverlayOpen: async () =>
		ipcRenderer.invoke(ElectronApiCommand.GetOverlayOpen),

	// TODO: Add a way to remove the listener
	onOverlayToggled: (callback: (open: boolean) => void) => {
		const listener = (_event, open: boolean) => {
			callback(open);
		};

		ipcRenderer.on(ElectronApiCommand.OverlayToggled, listener);

		return () => {
			ipcRenderer.off(ElectronApiCommand.OverlayToggled, listener);
		};
	},

	enableMouse: async () =>
		ipcRenderer.invoke(ElectronApiCommand.EnableMouse),

	disableMouse: async () =>
		ipcRenderer.invoke(ElectronApiCommand.DisableMouse),

	getDisplaySize: async () =>
		ipcRenderer.invoke(ElectronApiCommand.GetDisplaySize),

	getUpdateConfig: async () =>
		ipcRenderer.invoke(ElectronApiCommand.GetUpdateConfig),

	setUpdateConfig: async (config: UpdateConfig) =>
		ipcRenderer.invoke(ElectronApiCommand.SetUpdateConfig, config),

	pauseKeyboardShortcuts: async () =>
		ipcRenderer.invoke(ElectronApiCommand.PauseKeyboardShortcuts),

	resumeKeyboardShortcuts: async () =>
		ipcRenderer.invoke(ElectronApiCommand.ResumeKeyboardShortcuts),

	updateKeyboardShortcut: async (
		command: KeyboardCommand,
		accelerator: string[]
	) =>
		ipcRenderer.invoke(
			ElectronApiCommand.UpdateKeyboardShortcut,
			command,
			accelerator
		),

	getKeyboardShortcut: async (command: KeyboardCommand) =>
		ipcRenderer.invoke(ElectronApiCommand.GetKeyboardShortcut, command),

	onKeyboardShortcutPressed: (callback) => {
		const listener = (_event, command: KeyboardCommand) => {
			callback(command);
		};

		ipcRenderer.on(ElectronApiCommand.KeyboardShortcutPressed, listener);

		return () => {
			ipcRenderer.off(ElectronApiCommand.KeyboardShortcutPressed, listener);
		};
	},
};

contextBridge.exposeInMainWorld("electronApi", electronApi);
