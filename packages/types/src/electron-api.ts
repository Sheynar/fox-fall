import type { KeyboardCommand } from "./keyboard-config";

export enum ElectronApiCommand {
	GetRunningVersion = "get-running-version",
	ToggleOverlay = "toggle-overlay",
	GetOverlayOpen = "get-overlay-open",
	OverlayToggled = "overlay-toggled",
	SendToggleSize = "send-toggle-size",
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
	onOverlayToggled: (callback: (open: boolean) => void) => Promise<void>;
	/** Sends a message to the parent Electron process to update the size of the toggle button. This will determine the size of the window when the overlay is toggled off */
	sendToggleSize: (size: { x: number; y: number }) => Promise<void>;

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
