import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronApi", {
	toggleOverlay: () => {
		ipcRenderer.send("toggle-overlay");
	},

	getOverlayOpen: async () => {
		const output = new Promise<boolean>((resolve, reject) => {
			ipcRenderer.once("query-overlay-reply", (_event, open: boolean) => resolve(open));
			setTimeout(() => reject(new Error("Timeout")), 1000);
		})
		ipcRenderer.send("query-overlay");
		return output;
	},

	onOverlayToggled: (callback: (open: boolean) => void) => {
		ipcRenderer.on("overlay-toggled", (_event, open: boolean) => {
			callback(open);
		});
	},

	sendToggleSize: (size: { x: number, y: number }) => {
		ipcRenderer.send("toggle-size", size);
	},
});
