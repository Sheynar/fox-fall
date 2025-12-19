import { ref } from 'vue';

export enum KeyboardCommand {
	SelectNextUnit = 'Select next unit',
	SelectPrevUnit = 'Select previous unit',
	DeleteSelectedUnit = 'Delete selected unit',
	Undo = 'Undo',
}

export const keyboardShortcuts = ref({
	[KeyboardCommand.SelectNextUnit]: 'CommandOrControl+Tab',
	[KeyboardCommand.SelectPrevUnit]: 'CommandOrControl+Shift+Tab',
	[KeyboardCommand.DeleteSelectedUnit]: 'CommandOrControl+Delete',
	[KeyboardCommand.Undo]: 'CommandOrControl+Z',
} satisfies Partial<Record<KeyboardCommand, string>>);

export function saveKeyboardShortcuts() {
	localStorage.setItem('keyboard-shortcuts', JSON.stringify(keyboardShortcuts.value));
};

export function loadKeyboardShortcuts() {
	const savedSettings = localStorage.getItem('keyboard-shortcuts');
	if (savedSettings != null) {
		Object.assign(keyboardShortcuts.value, JSON.parse(savedSettings));
	}
	console.log(JSON.parse(JSON.stringify(keyboardShortcuts.value)));
};
loadKeyboardShortcuts();
