import { contextBridge, ipcRenderer } from "electron";
import {
	ElectronApiCommand,
	type ElectronApi,
} from "@packages/data/dist/electron-api.js";
import type { KeyboardCommand } from "@packages/data/dist/keyboard-config.js";
import { UpdateConfig } from "@packages/data/dist/update-config.js";

const electronApi: ElectronApi = {
	async getRunningVersion() {
		return await ipcRenderer.invoke(ElectronApiCommand.GetRunningVersion);
	},

	async focusOverlay() {
		return await ipcRenderer.invoke(ElectronApiCommand.FocusOverlay);
	},

	async blurOverlay() {
		return await ipcRenderer.invoke(ElectronApiCommand.BlurOverlay);
	},

	async toggleOverlay() {
		return await ipcRenderer.invoke(ElectronApiCommand.ToggleOverlay);
	},

	async getOverlayOpen() {
		return await ipcRenderer.invoke(ElectronApiCommand.GetOverlayOpen);
	},

	// TODO: Add a way to remove the listener
	onOverlayToggled(callback: (open: boolean) => void) {
		const listener = (_event, open: boolean) => {
			callback(open);
		};

		ipcRenderer.on(ElectronApiCommand.OverlayToggled, listener);

		return () => {
			ipcRenderer.off(ElectronApiCommand.OverlayToggled, listener);
		};
	},

	async enableMouse() {
		return await ipcRenderer.invoke(ElectronApiCommand.EnableMouse);
	},

	async disableMouse() {
		return await ipcRenderer.invoke(ElectronApiCommand.DisableMouse);
	},

	async getDisplaySize() {
		return await ipcRenderer.invoke(ElectronApiCommand.GetDisplaySize);
	},

	async getUpdateConfig() {
		return await ipcRenderer.invoke(ElectronApiCommand.GetUpdateConfig);
	},

	async setUpdateConfig(config: UpdateConfig) {
		return await ipcRenderer.invoke(ElectronApiCommand.SetUpdateConfig, config);
	},

	async pauseKeyboardShortcuts() {
		return await ipcRenderer.invoke(ElectronApiCommand.PauseKeyboardShortcuts);
	},

	async resumeKeyboardShortcuts() {
		return await ipcRenderer.invoke(ElectronApiCommand.ResumeKeyboardShortcuts);
	},

	async updateKeyboardShortcut(
		command: KeyboardCommand,
		accelerator: string[]
	) {
		return await ipcRenderer.invoke(ElectronApiCommand.UpdateKeyboardShortcut, command, accelerator);
	},

	async getKeyboardShortcut(command: KeyboardCommand) {
		return await ipcRenderer.invoke(ElectronApiCommand.GetKeyboardShortcut, command);
	},

	onKeyboardShortcutPressed(callback) {
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
