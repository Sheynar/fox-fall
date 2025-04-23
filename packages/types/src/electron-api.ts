import type { KeyboardCommand } from "./keyboard-config";
import type { UpdateConfig } from "./update-config";

export enum ElectronApiCommand {
	GetRunningVersion = "get-running-version",
	ToggleOverlay = "toggle-overlay",
	GetOverlayOpen = "get-overlay-open",
	OverlayToggled = "overlay-toggled",
	EnableMouse = "enable-mouse",
	DisableMouse = "disable-mouse",
	GetDisplaySize = "get-display-size",
	GetUpdateConfig = "get-update-config",
	SetUpdateConfig = "set-update-config",
	PauseKeyboardShortcuts = "pause-keyboard-shortcuts",
	ResumeKeyboardShortcuts = "resume-keyboard-shortcuts",
	UpdateKeyboardShortcut = "update-keyboard-shortcut",
	GetKeyboardShortcut = "get-keyboard-shortcut",
	KeyboardShortcutPressed = "keyboard-shortcut-pressed",
}

export type ElectronApi = {
	/** Fetches the semver version string of the running overlay application */
	getRunningVersion: () => Promise<string>;
	/** Toggles the display between a full overlay covering the entire screen and a single button in the bottom right */
	toggleOverlay: () => Promise<void>;
	/** Returns whether the overlay is currently open */
	getOverlayOpen: () => Promise<boolean>;
	/** Register a callback to be called when the overlay is toggled */
	onOverlayToggled: (callback: (open: boolean) => void) => () => void;
	/** Sends a message to the parent Electron process to start capturing mouse events */
	enableMouse: () => Promise<void>;
	/** Sends a message to the parent Electron process to stop capturing mouse events */
	disableMouse: () => Promise<void>;

	/** Returns the size of the display */
	getDisplaySize: () => Promise<{ width: number; height: number }>;

	/** Returns the current update config */
	getUpdateConfig: () => Promise<UpdateConfig>;
	/** Sets the update config */
	setUpdateConfig: (config: UpdateConfig) => Promise<void>;

	/** Pauses the keyboard shortcuts from being activated */
	pauseKeyboardShortcuts: () => Promise<void>;
	/** Resumes the keyboard shortcuts so they can be activated */
	resumeKeyboardShortcuts: () => Promise<void>;
	/** Sends a message to the parent Electron process to update the keyboard shortcut for a command */
	updateKeyboardShortcut: (
		command: KeyboardCommand,
		accelerator?: string[]
	) => Promise<void>;

	/** Gets the current keyboard shortcut for a command */
	getKeyboardShortcut: (command: KeyboardCommand) => Promise<string[]>;

	onKeyboardShortcutPressed: (
		callback: (command: KeyboardCommand) => unknown
	) => () => void;
};
