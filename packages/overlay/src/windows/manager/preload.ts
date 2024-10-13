import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronApi", {
	toggleOverlay: () => {
		ipcRenderer.send("toggle-overlay");
	},
});