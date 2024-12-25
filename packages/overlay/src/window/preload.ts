import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronApi", {
	toggleOverlay: () => {
		ipcRenderer.send("toggle-overlay");
	},

	onOverlayToggled: (callback: (open: boolean) => void) => {
		ipcRenderer.on("overlay-toggled", (_event, open: boolean) => {
			callback(open);
		});
	},
});
