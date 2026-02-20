// CLOSE YOUR EYES AND THINK HAPPY THOUGHTS

export function localLinksOpenInWindow() {
	const nativeWindowOpen = window.open;
	window.open = function(_url, target, features) {
		if (_url != null) {
			const url = new URL(_url, window.location.origin);
			if (url.origin === location.origin) {
				window.location.href = url.href;
				throw new Error('Local link opened in window');
			}
		}
		return nativeWindowOpen.call(window, _url, target, features);
	};
}
