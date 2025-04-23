import type { BrowserWindow } from "electron";
import koffi from "koffi";
import { debounceImmediate } from "../helpers.mjs";

const user32 = koffi.load("user32.dll");

const EVENT_SYSTEM_FOREGROUND = 0x0003;
const EVENT_SYSTEM_MINIMIZEEND = 0x0017;
// const EVENT_OBJECT_FOCUS = 0x8005;
const EVENT_OBJECT_LOCATIONCHANGE = 0x800b;
const WINEVENT_OUTOFCONTEXT = 0x0000;

const GetForegroundWindow = user32.func("GetForegroundWindow", "void*", []);

const FindWindowW = user32.func("FindWindowW", "void*", [
	koffi.types.str16, // lpClassName
	koffi.types.str16, // lpWindowName
]);

const GetWindowTextW = user32.func("GetWindowTextW", "int32", [
	"void*", // hwnd
	koffi.out(koffi.types.str16), // lpString
	"int32", // nMaxCount
]);

const GetWindowThreadProcessId = user32.func(
	"GetWindowThreadProcessId",
	"uint32",
	[
		"void*", // hwnd
		koffi.out("uint32*"), // lpdwProcessId
	]
);

const RECT = koffi.struct("tagRECT", {
	left: "int32",
	top: "int32",
	right: "int32",
	bottom: "int32",
});

type RECT_TYPE = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

const GetWindowRect = user32.func("GetWindowRect", "bool", [
	"void*", // hwnd
	koffi.out(koffi.pointer(RECT)), // lpRect
]);

const GetClientRect = user32.func("GetClientRect", "bool", [
	"void*", // hwnd
	koffi.out(koffi.pointer(RECT)), // lpRect
]);

const POINT = koffi.struct("POINT", {
	x: "int32",
	y: "int32",
});

type POINT_TYPE = {
	x: number;
	y: number;
};

const ClientToScreen = user32.func("ClientToScreen", "bool", [
	"void*", // hwnd
	koffi.inout(koffi.pointer(POINT)), // lpPoint
]);

enum WINDOW_SHOW_COMMAND {
	SW_HIDE = 0,
	SW_SHOWNORMAL = 1,
	SW_SHOWMINIMIZED = 2,
	SW_SHOWMAXIMIZED = 3,
	SW_SHOWNOACTIVATE = 4,
	SW_SHOW = 5,
	SW_MINIMIZE = 6,
	SW_SHOWMINNOACTIVE = 7,
	SW_SHOWNA = 8,
	SW_RESTORE = 9,
	SW_SHOWDEFAULT = 10,
	SW_FORCEMINIMIZE = 11,
}

const WINDOW_PLACEMENT = koffi.struct("WINDOWPLACEMENT", {
	length: "uint32",
	flags: "uint32",
	showCmd: "int32",
	ptMinPosition: POINT,
	ptMaxPosition: POINT,
	rcNormalPosition: RECT,
	rcDevice: RECT,
});

type WINDOW_PLACEMENT_TYPE = {
	length: number;
	flags: number;
	showCmd: number;
	ptMinPosition: POINT_TYPE;
	ptMaxPosition: POINT_TYPE;
	rcNormalPosition: RECT_TYPE;
	rcDevice: RECT_TYPE;
};

const GetWindowPlacement = user32.func("GetWindowPlacement", "bool", [
	"void*", // hwnd
	koffi.out(koffi.pointer(WINDOW_PLACEMENT)), // lpwndpl
]);

const ShowWindow = user32.func("ShowWindow", "bool", [
	"void*", // hwnd
	"int32", // nCmdShow
]);

const SetWindowPos = user32.func("SetWindowPos", "int32", [
	"void*", // hwnd
	"void*", // hWndInsertAfter
	"int32", // X
	"int32", // Y
	"int32", // cx
	"int32", // cy
	"uint32", // uFlags
]);

const EnumWindowsProc = koffi.proto(`
	bool EnumWindowsProc(
		void* hwnd,
		void* lParam
	)
`);

const EnumWindows = user32.func("EnumWindows", "bool", [
	koffi.pointer(EnumWindowsProc), // lpEnumFunc
	"void*", // lParam
]);

const WinEventProc = koffi.proto(`
	void Wineventproc(
		void* hWinEventHook,
		uint32 event,
		void* hwnd,
		int32 idObject,
		int32 idChild,
		uint32 idEventThread,
		uint32 dwmsEventTime
	)
`);

const SetWinEventHook = user32.func("SetWinEventHook", "void*", [
	"uint32", // eventMin
	"uint32", // eventMax
	"void*", // hmodWinEventProc
	koffi.pointer(WinEventProc), // lpfnWinEventProc (our callback)
	"uint32", // idProcess
	"uint32", // idThread
	"uint32", // dwFlags
]);

const UnhookWinEvent = user32.func("UnhookWinEvent", "bool", [
	"void*", // hWinEventHook
]);

export function titleMatches(testTitle: string | null, desiredTitle: string, strictMatch: boolean): boolean {
	if (!testTitle) return false;
	if (strictMatch) {
		return testTitle.trim() === desiredTitle.trim();
	}
	return testTitle.includes(desiredTitle);
}

export function getWindowTitle(hwnd: number): string | null {
	let buf = new Uint16Array(512);
	const len = GetWindowTextW(hwnd, buf, buf.length);
	const title = koffi.decode(buf, "wchar_t", len) || (null as string | null);
	return title;
}

export function getWindowThread(hwnd: number): number {
	return GetWindowThreadProcessId(hwnd, [0]);
}

export function getWindowPlacement(hwnd: number): WINDOW_PLACEMENT_TYPE {
	let placement: WINDOW_PLACEMENT_TYPE = {
		length: koffi.sizeof(WINDOW_PLACEMENT),
		flags: 0,
		showCmd: 0,
		ptMinPosition: { x: 0, y: 0 },
		ptMaxPosition: { x: 0, y: 0 },
		rcNormalPosition: { left: 0, top: 0, right: 0, bottom: 0 },
		rcDevice: { left: 0, top: 0, right: 0, bottom: 0 },
	};
	GetWindowPlacement(hwnd, placement);
	return placement;
}

export function setWindowPos(
	hwnd: number,
	x: number,
	y: number,
	width: number,
	height: number,
	flags: number,
	onTopOf: number = 0
) {
	return SetWindowPos(hwnd, onTopOf, x, y, width, height, flags);
}

export function enumWindows(callback: (hwnd: number) => boolean) {
	EnumWindows((hwnd: number, lParam: number) => {
		return callback(hwnd);
	}, 0);
}

export function findWindow(windowTitle: string, strictMatch: boolean): number | null {
	let hwnd: number | null = null;
	enumWindows((h) => {
		const title = getWindowTitle(h);
		if (titleMatches(title, windowTitle, strictMatch)) {
			hwnd = h;
			return false;
		}
		return true;
	});
	return hwnd;
}

export function onWindowPositionChange(callback: (hwnd: number) => void) {
	const winEventProc = koffi.register(
		(
			hWinEventHook: number,
			event: number,
			hwnd: number,
			idObject: number,
			idChild: number,
			idEventThread: number,
			dwmsEventTime: number
		) => {
			if (event === EVENT_OBJECT_LOCATIONCHANGE && hwnd && idObject === 0) {
				callback(hwnd);
			}
		},
		"Wineventproc*"
	);

	const hook = SetWinEventHook(
		EVENT_OBJECT_LOCATIONCHANGE,
		EVENT_OBJECT_LOCATIONCHANGE,
		0,
		winEventProc,
		0,
		0,
		WINEVENT_OUTOFCONTEXT
	);

	if (!hook) {
		throw new Error("Failed to set event hook");
	}

	return () => {
		UnhookWinEvent(hook);
	};
}

export function onWindowFocusChange(callback: (hwnd: number) => void) {
	const winEventProc = koffi.register(
		(
			hWinEventHook: number,
			event: number,
			hwnd: number,
			idObject: number,
			idChild: number,
			idEventThread: number,
			dwmsEventTime: number
		) => {
			if (
				(event === EVENT_SYSTEM_FOREGROUND ||
					event === EVENT_SYSTEM_MINIMIZEEND) &&
				hwnd &&
				idObject === 0
			) {
				callback(hwnd);
			}
		},
		"Wineventproc*"
	);

	const hook = SetWinEventHook(
		EVENT_SYSTEM_FOREGROUND,
		EVENT_SYSTEM_MINIMIZEEND,
		0,
		winEventProc,
		0,
		0,
		WINEVENT_OUTOFCONTEXT
	);

	if (!hook) {
		throw new Error("Failed to set event hook");
	}

	return () => {
		UnhookWinEvent(hook);
	};
}

export function getWindowClientRect(hwnd: number): RECT_TYPE {
	let rect: RECT_TYPE = {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
	};
	GetClientRect(hwnd, rect);
	const topLeft: POINT_TYPE = {
		x: rect.left,
		y: rect.top,
	};
	ClientToScreen(hwnd, topLeft);
	const bottomRight: POINT_TYPE = {
		x: rect.right,
		y: rect.bottom,
	};
	ClientToScreen(hwnd, bottomRight);

	return {
		left: topLeft.x,
		top: topLeft.y,
		right: bottomRight.x,
		bottom: bottomRight.y,
	};
}

export function monitorWindowClientRect(
	windowTitle: string,
	strictMatch: boolean,
	callback: (
		hwnd: number,
		position: RECT_TYPE,
		placement: WINDOW_PLACEMENT_TYPE
	) => void
) {
	let hwnd = findWindow(windowTitle, strictMatch);
	if (hwnd) {
		const position = getWindowClientRect(hwnd);
		const placement = getWindowPlacement(hwnd);
		callback(hwnd, position, placement);
	}

	const unmonitor = onWindowPositionChange((h) => {
		const title = getWindowTitle(h);
		if (!titleMatches(title, windowTitle, strictMatch)) return;
		hwnd = h;
		const position = getWindowClientRect(h);
		const placement = getWindowPlacement(h);
		callback(h, position, placement);
	});

	return unmonitor;
}

export function getWindowPosition(hwnd: number): RECT_TYPE {
	let rect: RECT_TYPE = {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
	};
	GetWindowRect(hwnd, rect);
	return rect;
}

export function monitorWindowPosition(
	windowTitle: string,
	strictMatch: boolean,
	callback: (
		hwnd: number,
		position: RECT_TYPE,
		placement: WINDOW_PLACEMENT_TYPE
	) => void
) {
	let hwnd = findWindow(windowTitle, strictMatch);
	if (hwnd) {
		const position = getWindowPosition(hwnd);
		const placement = getWindowPlacement(hwnd);
		callback(hwnd, position, placement);
	}

	const unmonitor = onWindowPositionChange((h) => {
		const title = getWindowTitle(h);
		if (!titleMatches(title, windowTitle, strictMatch)) return;
		hwnd = h;
		const position = getWindowPosition(h);
		const placement = getWindowPlacement(h);
		callback(h, position, placement);
	});

	return unmonitor;
}

export function monitorWindowFocus(
	windowTitle: string,
	strictMatch: boolean,
	callback: (focused: boolean) => void
) {
	let wasFocused: boolean | null = null;
	const unmonitor = onWindowFocusChange((h) => {
		const isFocused = getHasFocusedWindow(windowTitle, strictMatch);
		if (isFocused === null) return;
		if (isFocused !== wasFocused) {
			wasFocused = isFocused;
			callback(isFocused);
		}
	});

	return unmonitor;
}

export function getHasFocusedWindow(windowTitle: string, strictMatch: boolean): boolean | null {
	const focusedWindow = GetForegroundWindow();
	if (!focusedWindow) return null;
	const title = getWindowTitle(focusedWindow);
	if (!title) return null;
	return titleMatches(title, windowTitle, strictMatch);
}

export function setWindowAsOverlay(
	overlayWindow: BrowserWindow,
	backdropWindowTitle: string,
	strictMatch: boolean,
	updateDelay: number = 10
) {
	let lastBackdropPosition = null as {
		hwnd: number;
		position: RECT_TYPE;
		placement: WINDOW_PLACEMENT_TYPE;
	} | null;

	let lastBackdropFocused = null as boolean | null;

	const update = debounceImmediate(() => {
		if (!lastBackdropPosition) {
			if (!overlayWindow.isMinimized()) {
				overlayWindow.minimize();
			}
			return;
		}
		const { position, placement } = lastBackdropPosition;

		if (placement.showCmd === WINDOW_SHOW_COMMAND.SW_SHOWMINIMIZED) {
			if (!overlayWindow.isMinimized()) {
				overlayWindow.minimize();
			}
			return;
		}

		if (lastBackdropFocused) {
			if (overlayWindow.isMinimized()) {
				overlayWindow.showInactive();
			}
			if (!overlayWindow.isAlwaysOnTop()) {
				overlayWindow.setAlwaysOnTop(true, "screen-saver");
			}
		} else if (lastBackdropFocused) {
			if (!overlayWindow.isMinimized()) {
				overlayWindow.minimize();
			}
			if (overlayWindow.isAlwaysOnTop()) {
				overlayWindow.setAlwaysOnTop(false);
			}
		}

		overlayWindow.setContentBounds(
			{
				x: position.left,
				y: position.top,
				width: position.right - position.left,
				height: position.bottom - position.top,
			},
			false
		);
		overlayWindow.setAlwaysOnTop(true, "screen-saver");
	}, updateDelay);

	const unmonitorBackdropPosition = monitorWindowClientRect(
		backdropWindowTitle,
		strictMatch,
		(hwnd, position, placement) => {
			lastBackdropPosition = {
				hwnd,
				position,
				placement,
			};
			update();
		}
	);

	const unmonitorFocus = monitorWindowFocus(backdropWindowTitle, strictMatch, (focused) => {
		lastBackdropFocused = focused || (lastBackdropFocused && overlayWindow.isFocused());
		update();
	});

	overlayWindow.on("focus", update);
	overlayWindow.on("blur", update);

	update();

	return () => {
		unmonitorBackdropPosition();
		unmonitorFocus();
		overlayWindow.off("focus", update);
		overlayWindow.off("blur", update);
	};
}
