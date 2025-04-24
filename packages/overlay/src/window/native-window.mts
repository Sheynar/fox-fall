import type { BrowserWindow } from "electron";
import koffi from "koffi";
import EventEmitter from "node:events";
import { debounceImmediate } from "../helpers.mjs";

const user32 = koffi.load("user32.dll");

const EVENT_SYSTEM_FOREGROUND = 0x0003;
const EVENT_SYSTEM_MOVESIZEEND = 0x000b;
const EVENT_SYSTEM_MINIMIZEEND = 0x0017;
const EVENT_OBJECT_DESTROY = 0x8001;
const EVENT_OBJECT_SHOW = 0x8002;
const EVENT_OBJECT_HIDE = 0x8003;
const EVENT_OBJECT_LOCATIONCHANGE = 0x800b;
const EVENT_OBJECT_NAMECHANGE = 0x800c;

const SIZE_EVENTS = [
	EVENT_SYSTEM_MOVESIZEEND,
	EVENT_SYSTEM_MINIMIZEEND,
	EVENT_OBJECT_DESTROY,
	EVENT_OBJECT_SHOW,
	EVENT_OBJECT_HIDE,
	EVENT_OBJECT_LOCATIONCHANGE,
];

const WINEVENT_OUTOFCONTEXT = 0x0000;

type HWND_Pointer = {
	readonly __type: unique symbol;
};
type HWND_Value = BigInt;
type HWND = HWND_Pointer | HWND_Value;

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

const CloseWindow = user32.func("CloseWindow", "bool", [
	"void*", // hwnd
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

const SetParent = user32.func("SetParent", "void*", [
	"void*", // hWnd
	"void*", // hWndInsertAfter
]);

const SetWindowLongPtr = user32.func("SetWindowLongPtrW", "int32", [
	"void*", // hWnd
	"int32", // nIndex
	"void*", // dwNewLong
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

export function titleMatches(
	testTitle: string | null,
	desiredTitle: string,
	strictMatch: boolean
): boolean {
	if (!testTitle) return false;
	if (strictMatch) {
		return testTitle.trim() === desiredTitle.trim();
	}
	return testTitle.includes(desiredTitle);
}

export function getWindowTitle(hwnd: HWND): string | null {
	let buf = new Uint16Array(512);
	const len = GetWindowTextW(hwnd, buf, buf.length);
	const title = koffi.decode(buf, "wchar_t", len) || (null as string | null);
	return title;
}

export function getWindowThread(hwnd: HWND): number {
	return GetWindowThreadProcessId(hwnd, [0]);
}

export function getWindowPlacement(hwnd: HWND): WINDOW_PLACEMENT_TYPE {
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

export enum WINDOW_Z_POSITION {
	HWND_BOTTOM = 1,
	HWND_TOP = 0,
	HWND_TOPMOST = -1,
	HWND_NOTOPMOST = -2,
}

export enum WINDOW_POSITION_FLAGS {
	SWP_ASYNCWINDOWPOS = 0x4000,
	SWP_DEFERERASE = 0x2000,
	SWP_DRAWFRAME = 0x0020,
	SWP_FRAMECHANGED = 0x0020,
	SWP_HIDEWINDOW = 0x0080,
	SWP_NOACTIVATE = 0x0010,
	SWP_NOMOVE = 0x0002,
	SWP_NOOWNERZORDER = 0x0200,
	SWP_NOREDRAW = 0x0008,
	SWP_NOREPOSITION = 0x0200,
	SWP_NOSENDCHANGING = 0x0400,
	SWP_NOSIZE = 0x0001,
	SWP_NOZORDER = 0x0004,
	SWP_SHOWWINDOW = 0x0040,
}

export function setWindowPos(
	hwnd: HWND,
	onTopOf: HWND | WINDOW_Z_POSITION,
	x: number,
	y: number,
	width: number,
	height: number,
	flags: number
): boolean {
	return !!SetWindowPos(hwnd, onTopOf, x, y, width, height, flags);
}

export function setWindowParent(hwnd: HWND, parent: HWND) {
	return SetParent(hwnd, parent) as HWND;
}

export function setWindowLongPointer(
	hwnd: HWND,
	nIndex: number,
	dwNewLong: HWND | 0
) {
	return SetWindowLongPtr(hwnd, nIndex, dwNewLong) as HWND;
}

export function enumWindows(callback: (hwnd: HWND) => boolean) {
	EnumWindows((hwnd: HWND, lParam: number) => {
		return callback(hwnd);
	}, 0);
}

export function findWindow(
	windowTitle: string,
	strictMatch: boolean
): HWND | null {
	let hwnd: HWND | null = null;
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

export function onWindowPositionChange(callback: (hwnd: HWND) => void) {
	const winEventProc = koffi.register(
		(
			hWinEventHook: number,
			event: number,
			hwnd: HWND,
			idObject: number,
			idChild: number,
			idEventThread: number,
			dwmsEventTime: number
		) => {
			if (SIZE_EVENTS.includes(event) && hwnd && idObject === 0) {
				callback(hwnd);
			}
		},
		"Wineventproc*"
	);

	const hook = SetWinEventHook(
		Math.min(...SIZE_EVENTS),
		Math.max(...SIZE_EVENTS),
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

export function onWindowNameChange(
	callback: (hwnd: HWND, newName: string | null) => void
) {
	const winEventProc = koffi.register(
		(
			hWinEventHook: number,
			event: number,
			hwnd: HWND,
			idObject: number,
			idChild: number,
			idEventThread: number,
			dwmsEventTime: number
		) => {
			if (event === EVENT_OBJECT_NAMECHANGE && hwnd && idObject === 0) {
				const newName = getWindowTitle(hwnd);
				callback(hwnd, newName);
			}
		},
		"Wineventproc*"
	);

	const hook = SetWinEventHook(
		EVENT_OBJECT_NAMECHANGE,
		EVENT_OBJECT_NAMECHANGE,
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

export function onWindowFocusChange(callback: (hwnd: HWND) => void) {
	const winEventProc = koffi.register(
		(
			hWinEventHook: number,
			event: number,
			hwnd: HWND,
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

export function getWindowClientRect(hwnd: HWND): RECT_TYPE | null {
	let rect: RECT_TYPE = {
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
	};
	const success = !!GetClientRect(hwnd, rect);
	if (!success) return null;
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
	callback: (hwnd: HWND, position: RECT_TYPE | null) => void
) {
	let hwnd: HWND_Value | null = null;

	const onPositionUpdated = (h: HWND) => {
		const newHwnd = koffi.address(h);
		if (hwnd == null) {
			const title = getWindowTitle(h);
			if (!titleMatches(title, windowTitle, strictMatch)) return;
			hwnd = newHwnd;
		}

		if (hwnd != null && newHwnd !== hwnd) {
			return;
		}
		const position = getWindowClientRect(h);
		if (!position) hwnd = null;
		callback(h, position);
	};

	const unmonitor = onWindowPositionChange(onPositionUpdated);

	Promise.resolve().then(() => {
		const foundHwnd = findWindow(windowTitle, strictMatch);
		if (foundHwnd) {
			hwnd = koffi.address(foundHwnd);
			const position = getWindowClientRect(hwnd);
			callback(hwnd, position);
		}
	});

	return {
		update: () => {
			if (!hwnd) return;
			onPositionUpdated(hwnd);
		},
		reset: (newWindowTitle: string = windowTitle, newStrictMatch: boolean = strictMatch) => {
			hwnd = null;
			windowTitle = newWindowTitle;
			strictMatch = newStrictMatch;
		},
		destroy: () => {
			unmonitor();
		},
	};
}

export function getWindowPosition(hwnd: HWND): RECT_TYPE {
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
	callback: (hwnd: HWND, position: RECT_TYPE) => void
) {
	let hwnd: HWND_Value | null = null;
	const foundHwnd = findWindow(windowTitle, strictMatch);
	if (foundHwnd) {
		hwnd = koffi.address(foundHwnd);
		const position = getWindowPosition(hwnd);
		callback(hwnd, position);
	}

	const unmonitor = onWindowPositionChange((h) => {
		const newHwnd = koffi.address(h);
		if (hwnd == null) {
			const title = getWindowTitle(h);
			if (!titleMatches(title, windowTitle, strictMatch)) return;
			hwnd = newHwnd;
		}

		if (hwnd != null && newHwnd !== hwnd) {
			return;
		}
		const position = getWindowPosition(h);
		callback(h, position);
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

export function getHasFocusedWindow(
	windowTitle: string,
	strictMatch: boolean
): boolean | null {
	const focusedWindow: HWND | null = GetForegroundWindow();
	if (!focusedWindow) return null;
	const title = getWindowTitle(focusedWindow);
	if (!title) return null;
	return titleMatches(title, windowTitle, strictMatch);
}

export function getBrowserWindowHandle(
	browserWindow: BrowserWindow
): HWND_Value {
	return BigInt(browserWindow.getNativeWindowHandle().readInt32LE());
}

export function setWindowAsOverlay(
	overlayWindow: BrowserWindow,
	backdropWindowTitle: string,
	strictMatch: boolean,
	minUpdateFrequency: number = 10,
	maxUpdateFrequency: number = 1_000
) {
	const events = new EventEmitter<{
		attached: [];
		detached: [];
		positionChanged: [];
		destroyed: [];
	}>();

	let lastBackdropPosition = null as {
		hwnd: HWND;
		position: RECT_TYPE;
	} | null;

	const _update = () => {
		const overlayHWND = getBrowserWindowHandle(overlayWindow);

		if (!lastBackdropPosition) {
			const overlayPlacement = getWindowPlacement(overlayHWND);
			if (overlayPlacement.showCmd !== WINDOW_SHOW_COMMAND.SW_SHOWMINIMIZED) {
				ShowWindow(overlayHWND, WINDOW_SHOW_COMMAND.SW_HIDE);
				setWindowLongPointer(overlayHWND, -8 /* GWLP_HWNDPARENT */, 0);
			}
			return;
		}
		const { hwnd, position } = lastBackdropPosition;

		setWindowLongPointer(overlayHWND, -8 /* GWLP_HWNDPARENT */, hwnd);
		ShowWindow(overlayHWND, WINDOW_SHOW_COMMAND.SW_SHOWNOACTIVATE);
		const success = setWindowPos(
			overlayHWND,
			hwnd,
			position.left,
			position.top,
			position.right - position.left,
			position.bottom - position.top,
			WINDOW_POSITION_FLAGS.SWP_NOACTIVATE |
				WINDOW_POSITION_FLAGS.SWP_SHOWWINDOW
		);
		if (!success) {
			reset();
		} else {
			events.emit("positionChanged");
		}
	};

	let updateTimeout: ReturnType<typeof setTimeout> | null = null;
	const update = debounceImmediate(() => {
		if (updateTimeout) {
			clearTimeout(updateTimeout);
			updateTimeout = null;
		}
		try {
			_update();
		} finally {
			updateTimeout = setTimeout(update, maxUpdateFrequency);
		}
	}, minUpdateFrequency);

	const reset = (newBackdropWindowTitle: string = backdropWindowTitle, newStrictMatch: boolean = strictMatch) => {
		const wasLinked = lastBackdropPosition != null;

		lastBackdropPosition = null;
		backdropWindowTitle = newBackdropWindowTitle;
		strictMatch = newStrictMatch;

		if (wasLinked) {
			events.emit("detached");
		}

		windowMonitor.reset(newBackdropWindowTitle, newStrictMatch);
		update();
	};

	const windowMonitor = monitorWindowClientRect(
		backdropWindowTitle,
		strictMatch,
		(hwnd, position) => {
			const wasLinked = lastBackdropPosition != null;

			if (position != null) {
				lastBackdropPosition = {
					hwnd,
					position,
				};
			} else {
				lastBackdropPosition = null;
			}

			const isLinked = lastBackdropPosition != null;
			if (wasLinked !== isLinked) {
				events.emit(isLinked ? "attached" : "detached");
			}
			update();
		}
	);

	overlayWindow.on("focus", update);
	overlayWindow.on("blur", update);
	update();

	return {
		isLinked: () => lastBackdropPosition != null,
		events,
		destroy: () => {
			windowMonitor.destroy();
			overlayWindow.off("focus", update);
			overlayWindow.off("blur", update);
			reset();
			events.emit("destroyed");
			events.removeAllListeners();
		},
	};
}
