import { app, BrowserWindow, dialog, Menu, Tray } from "electron";
import path from "node:path";

const isMainInstance = app.requestSingleInstanceLock();

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
// Menu.setApplicationMenu(null);

const initialise = async () => {
	await app.whenReady();

	if (!isMainInstance) {
		await dialog.showMessageBox({
			type: "info",
			buttons: ["Close"],
			title: `FoxFall multiple instances`,
			message: `An instance of FoxFall is already running. Please check your system tray for the application.`,
		});
		app.quit();
		return;
	}

	await import("../server.js");

	const { runUpdate: initialiseUpdates } = await import("./updates.mjs");
	initialiseUpdates();

	const { initialise: initialiseWindow } = await import("./window/index.mjs");
	const { overlayManager } = await initialiseWindow();

	const tray = new Tray(path.resolve(__dirname, "../icon.ico"));
	tray.setToolTip("FoxFall Overlay");
	const menu = Menu.buildFromTemplate([
		{
			label: "Attached",
			toolTip:
				"Whether the overlay is attached to a Foxhole window (any window with the title 'War')",
			type: "checkbox",
			checked: overlayManager.isLinked(),
			enabled: false,
		},
		{
			label: "Quit",
			type: "normal",
			click: () => {
				app.quit();
			},
		},
	]);
	tray.setContextMenu(menu);

	overlayManager.events.on("attached", () => {
		menu.items[0].checked = true;
	});
	overlayManager.events.on("detached", () => {
		menu.items[0].checked = false;
	});

	const { initialise: initialiseKeyboardShortcuts } = await import(
		"./keyboard-shortcuts.mjs"
	);
	initialiseKeyboardShortcuts();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			initialiseWindow();
		}
	});
};

Promise.resolve()
	.then(() => initialise())
	.catch((e) => {
		console.log("Failed to start app");
		console.error(e);
		app.quit();
	});
