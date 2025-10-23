import {
	KeyboardCommand,
	type KeyboardConfig,
} from "@packages/data/dist/keyboard-config.js";
import {
	initialise as initKeyboardShortcutsModule,
	keystrokes,
} from "@packages/keyboard-shortcuts/dist/index.js";
import { app, webContents } from "electron";
import fs from "node:fs";
import path from "node:path";
import { toggleOverlay } from "./window/index.mjs";
import { ElectronApiCommand } from "@packages/data/dist/electron-api.js";

const userDataFolder = app.getPath("userData");

let paused = false;

const defaultConfig: KeyboardConfig = {};

let keyboardConfig: KeyboardConfig = { ...defaultConfig };
const keyboardRunCommands: Partial<Record<KeyboardCommand, () => unknown>> = {};

const loadConfig = () => {
	try {
		if (
			!fs.existsSync(path.join(userDataFolder, "keyboard-shortcuts-uio.json"))
		) {
			keyboardConfig = { ...defaultConfig };
			return;
		}
		const config = JSON.parse(
			fs.readFileSync(
				path.join(userDataFolder, "keyboard-shortcuts-uio.json"),
				"utf8"
			)
		);
		keyboardConfig = { ...defaultConfig, ...config };
	} catch (e) {
		console.log("Failed to load keyboard shortcuts config");
		console.error(e);
	}
};
const saveConfig = () => {
	fs.writeFileSync(
		path.join(userDataFolder, "keyboard-shortcuts-uio.json"),
		JSON.stringify(keyboardConfig)
	);
};

export const pauseKeyboardShortcuts = () => {
	paused = true;
};

export const resumeKeyboardShortcuts = () => {
	paused = false;
};

export const getKeyboardShortcut = (command: KeyboardCommand) => {
	return keyboardConfig[command];
};

export const runCommand = async (command: KeyboardCommand) => {
	if (paused) return;
	switch (command) {
		case KeyboardCommand.ToggleOverlay:
			toggleOverlay();
			break;
	}

	for (const webContent of webContents.getAllWebContents()) {
		webContent.send(ElectronApiCommand.KeyboardShortcutPressed, command);
	}
};

export const updateKeyboardShortcut = (
	command: KeyboardCommand,
	accelerator?: string[],
	skipSaving = false
) => {
	if (keyboardConfig[command] && keyboardRunCommands[command]) {
		keystrokes.unbindKeyCombo(
			keyboardConfig[command].join(" > "),
			keyboardRunCommands[command]
		);
	}

	keyboardConfig[command] = accelerator;

	if (accelerator) {
		if (keyboardRunCommands[command] == null) {
			keyboardRunCommands[command] = async () => {
				await new Promise<void>((resolve) => setTimeout(resolve, 10));
				await runCommand(command);
			};
		}
		keystrokes.bindKeyCombo(
			accelerator.join(" > "),
			keyboardRunCommands[command]
		);
	}

	if (!skipSaving) saveConfig();
};

export const initialise = () => {
	try {
		initKeyboardShortcutsModule();
		loadConfig();
		for (const [command, accelerator] of Object.entries(keyboardConfig)) {
			updateKeyboardShortcut(command as KeyboardCommand, accelerator, true);
		}
	} catch (e) {
		console.log("Failed to initialise keyboard shortcuts");
		console.error(e);
	}
};
