import { keyDefinitionByUIo } from "@packages/data/dist/keyboard-config.js";
import { Keystrokes } from "@rwh/keystrokes";
import { uIOhook, UiohookKey, UiohookKeyboardEvent } from "uiohook-napi";

const invertedUiohookKey: Record<number, string> = {};
for (const [key, code] of Object.entries(UiohookKey)) {
	invertedUiohookKey[code] = key;
}

const uIoToBrowser = (
	e: UiohookKeyboardEvent
): {
	key: string;
	aliases?: string[];
	preventDefault: () => void;
	composedPath: () => EventTarget[];
} | void => {
	const keyDefinition = keyDefinitionByUIo[e.keycode];
	if (keyDefinition == null) return;
	return {
		key: keyDefinition.key,
		aliases: [`!${e.keycode}`, `@${keyDefinition.code}`],
		preventDefault: () => {},
		composedPath: () => [],
	};
};

export const keystrokes = new Keystrokes({
	onKeyPressed: (handler) => {
		const handlerWrapper = (e: UiohookKeyboardEvent) => {
			const browserKey = uIoToBrowser(e);
			if (browserKey) handler(browserKey);
		};

		uIOhook.on("keydown", handlerWrapper);
		return () => uIOhook.off("keydown", handlerWrapper);
	},
	onKeyReleased: (handler) => {
		const handlerWrapper = (e: UiohookKeyboardEvent) => {
			const browserKey = uIoToBrowser(e);
			if (browserKey) handler(browserKey);
		};

		uIOhook.on("keyup", handlerWrapper);
		return () => uIOhook.off("keyup", handlerWrapper);
	},
});

export const initialise = () => {
	uIOhook.start();
};
