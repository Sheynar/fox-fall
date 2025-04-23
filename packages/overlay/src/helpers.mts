export const debounceImmediate = <F extends (...args: any[]) => any>(func: F, wait: number) => {
	let timeout: ReturnType<typeof setTimeout>;
	let lastRun = 0;
	return ((...args: any[]) => {
		if (timeout) {
			clearTimeout(timeout);
		}
		const now = Date.now();
		if (now - lastRun < wait) {
			timeout = setTimeout(() => func(...args), wait);
		} else {
			lastRun = now;
			func(...args);
		}
	}) as F;
};
