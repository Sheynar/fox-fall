import electronUpdater from "electron-updater";
import log from "electron-log";

const { autoUpdater } = electronUpdater;

export class AppUpdater {
	constructor() {
		log.transports.file.level = "debug";
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}
