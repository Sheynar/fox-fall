import {
	KeyboardCommand,
	type KeyboardConfig,
} from "@packages/types/dist/keyboard-config.js";
import { app, globalShortcut } from "electron";
import fs from "node:fs";
import path from "node:path";
import { toggleOverlay } from "./window/index.mjs";

const userDataFolder = app.getPath("userData");

let paused = false;

const defaultConfig: KeyboardConfig = {};

let keyboardConfig: KeyboardConfig = { ...defaultConfig };

const loadConfig = () => {
	try {
		if (!fs.existsSync(path.join(userDataFolder, "keyboard-shortcuts.json"))) {
			keyboardConfig = { ...defaultConfig };
			return;
		}
		const config = JSON.parse(
			fs.readFileSync(
				path.join(userDataFolder, "keyboard-shortcuts.json"),
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
		path.join(userDataFolder, "keyboard-shortcuts.json"),
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
};

export const updateKeyboardShortcut = (
	command: KeyboardCommand,
	accelerator?: string
) => {
	if (keyboardConfig[command]) {
		globalShortcut.unregister(keyboardConfig[command]);
	}
	keyboardConfig[command] = accelerator;
	if (accelerator) {
		globalShortcut.register(accelerator, async () => {
			await runCommand(command);
		});
	}

	saveConfig();
};

export const initialise = () => {
	loadConfig();
	for (const [command, accelerator] of Object.entries(keyboardConfig)) {
		if (!accelerator) continue;
		globalShortcut.register(accelerator, async () => {
			await runCommand(command as KeyboardCommand);
		});
	}
};
