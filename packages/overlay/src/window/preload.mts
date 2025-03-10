import { contextBridge, ipcRenderer } from "electron";
import { ElectronApiCommand, type ElectronApi } from "@packages/types/dist/electron-api.js";
import type { KeyboardCommand } from "@packages/types/dist/keyboard-config.js";

const electronApi: ElectronApi = {
	getRunningVersion: async () => {
		const output = new Promise<string>((resolve, reject) => {
			ipcRenderer.once(ElectronApiCommand.RunningVersionReply, (_event, version: string) => resolve(version));
			setTimeout(() => reject(new Error("Timeout")), 1000);
		})
		ipcRenderer.send(ElectronApiCommand.GetRunningVersion);
		return output;
	},

	toggleOverlay: async () => {
		ipcRenderer.send(ElectronApiCommand.ToggleOverlay);
	},

	getOverlayOpen: async () => {
		const output = new Promise<boolean>((resolve, reject) => {
			ipcRenderer.once(ElectronApiCommand.OverlayOpenReply, (_event, open: boolean) => resolve(open));
			setTimeout(() => reject(new Error("Timeout")), 1000);
		})
		ipcRenderer.send(ElectronApiCommand.GetOverlayOpen);
		return output;
	},

	onOverlayToggled: async (callback: (open: boolean) => void) => {
		ipcRenderer.on(ElectronApiCommand.OverlayToggled, (_event, open: boolean) => {
			callback(open);
		});
	},

	sendToggleSize: async (size: { x: number, y: number }) => {
		ipcRenderer.send(ElectronApiCommand.SendToggleSize, size);
	},

	pauseKeyboardShortcuts: async () => {
		ipcRenderer.send(ElectronApiCommand.PauseKeyboardShortcuts);
	},

	resumeKeyboardShortcuts: async () => {
		ipcRenderer.send(ElectronApiCommand.ResumeKeyboardShortcuts);
	},

	updateKeyboardShortcut: async (command: KeyboardCommand, accelerator: string) => {
		ipcRenderer.send(ElectronApiCommand.UpdateKeyboardShortcut, command, accelerator);
	},

	getKeyboardShortcut: async (command: KeyboardCommand) => {
		const output = new Promise<string>((resolve, reject) => {
			ipcRenderer.once(ElectronApiCommand.KeyboardShortcutReply, (_event, accelerator: string) => resolve(accelerator));
			setTimeout(() => reject(new Error("Timeout")), 1000);
		})
		ipcRenderer.send(ElectronApiCommand.GetKeyboardShortcut, command);
		return output;
	},
};

contextBridge.exposeInMainWorld("electronApi", electronApi);
