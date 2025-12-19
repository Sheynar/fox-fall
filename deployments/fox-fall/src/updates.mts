import { UpdateConfig } from "@packages/data/dist/update-config.js";
import { app, dialog, Notification } from "electron";
import electronUpdater from "electron-updater";
import log from "electron-log";
import fs from "node:fs";
import path from "node:path";

const userDataFolder = app.getPath("userData");

const { autoUpdater } = electronUpdater;

const defaultConfig: UpdateConfig = {
	disableUpdates: false,
	automaticUpdates: false,
};
let updateConfig: UpdateConfig = { ...defaultConfig };

const loadConfig = () => {
	try {
		if (!fs.existsSync(path.join(userDataFolder, "update-config.json"))) {
			updateConfig = { ...defaultConfig };
			return;
		}
		const config = JSON.parse(
			fs.readFileSync(path.join(userDataFolder, "update-config.json"), "utf8")
		);
		updateConfig = { ...defaultConfig, ...config };
	} catch (e) {
		console.log("Failed to load update config");
		console.error(e);
	}
};
const saveConfig = () => {
	fs.writeFileSync(
		path.join(userDataFolder, "update-config.json"),
		JSON.stringify(updateConfig)
	);
};

export function getUpdateConfig() {
	loadConfig();
	return updateConfig;
};
export function setUpdateConfig(config: UpdateConfig) {
	const wasDisabled = updateConfig.disableUpdates;
	updateConfig = { ...updateConfig, ...config };
	saveConfig();
	if (updateTimeout != null) {
		clearTimeout(updateTimeout);
		updateTimeout = null;
	}
	if (updateConfig.disableUpdates) return;

	if (wasDisabled) {
		runUpdate();
	} else if (updateConfig.updateInterval != null) {
		updateTimeout = setTimeout(runUpdate, updateConfig.updateInterval);
	}
};

const getUpdateAvailable = async () => {
	try {
		const updateReady = new Promise<void>((resolve, reject) => {
			autoUpdater.once("update-available", () => resolve());
			autoUpdater.once("error", (err) => reject(err));
			autoUpdater.once("update-not-available", () =>
				reject(new Error("No update available"))
			);
			setTimeout(() => reject(new Error("Timeout")), 10000);
		});

		autoUpdater.checkForUpdates();
		await updateReady;
		return true;
	} catch (e) {
		return false;
	}
};

const promptShouldUpdate = async () => {
	const dialogReturn = await dialog.showMessageBox({
		type: "info",
		buttons: ["Update", "Later"],
		title: `FoxFall Application Update`,
		message: `A new version of FoxFall is available. Would you like to update?`,
	});

	return dialogReturn.response === 0;
};

const downloadUpdate = async () => {
	const downloadingNotification = new Notification({
		title: "FoxFall Update",
		body: "Downloading update...",
		timeoutType: "never",
		silent: true,
	});
	downloadingNotification.show();

	try {
		await autoUpdater.downloadUpdate();
	} finally {
		downloadingNotification.close();
	}
};

const promptShouldRestart = async () => {
	const dialogReturn = await dialog.showMessageBox({
		type: "info",
		buttons: ["Restart", "Later"],
		title: `FoxFall Application Update`,
		message:
			"A new version has been downloaded. Restart the application to apply the updates.",
	});

	return dialogReturn.response === 0;
};

let updateTimeout: ReturnType<typeof setTimeout> | null = null;
const _runUpdate = async () => {
	loadConfig();
	if (updateConfig.disableUpdates) return;
	log.transports.file.level = "debug";
	autoUpdater.logger = log;
	autoUpdater.autoDownload = false;

	const updateAvailable = await getUpdateAvailable();
	if (!updateAvailable) return;

	const shouldUpdate =
		updateConfig.automaticUpdates || (await promptShouldUpdate());
	if (!shouldUpdate) return;

	await downloadUpdate();

	const shouldRestart = await promptShouldRestart();
	if (!shouldRestart) return;

	autoUpdater.quitAndInstall();
};

let updateRunning: ReturnType<typeof _runUpdate> | null = null;
export async function runUpdate() {
	if (updateRunning) return updateRunning;
	if (updateTimeout != null) {
		clearTimeout(updateTimeout);
		updateTimeout = null;
	}

	try {
		updateRunning = _runUpdate();
		return await updateRunning;
	} finally {
		updateRunning = null;
		if (
			updateConfig.updateInterval != null &&
			updateConfig.updateInterval > 0
		) {
			updateTimeout = setTimeout(runUpdate, updateConfig.updateInterval);
		}
	}
};
