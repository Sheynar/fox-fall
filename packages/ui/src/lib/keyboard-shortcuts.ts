import { ref } from 'vue';

export enum KeyboardCommand {
	SelectNextUnit = 'Select next unit',
	SelectPrevUnit = 'Select previous unit',
	DeleteSelectedUnit = 'Delete selected unit',
}

export const keyboardShortcuts = ref({
	[KeyboardCommand.SelectNextUnit]: 'CommandOrControl+Tab',
	[KeyboardCommand.SelectPrevUnit]: 'CommandOrControl+Shift+Tab',
	[KeyboardCommand.DeleteSelectedUnit]: 'CommandOrControl+Delete',
} satisfies Partial<Record<KeyboardCommand, string>>);

export const saveKeyboardShortcuts = () => {
	localStorage.setItem('keyboard-shortcuts', JSON.stringify(keyboardShortcuts.value));
};

export const loadKeyboardShortcuts = () => {
	const savedSettings = localStorage.getItem('keyboard-shortcuts');
	if (savedSettings != null) {
		Object.assign(keyboardShortcuts.value, JSON.parse(savedSettings));
	}
	console.log(JSON.parse(JSON.stringify(keyboardShortcuts.value)));
};
loadKeyboardShortcuts();
