export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | number | undefined;
  let lastArgs: Parameters<T> | undefined;
	const onCompleteFunctions = new Set<(out: ReturnType<T>) => void>();

  return function(this: ThisParameterType<T>, ...args: Parameters<T>): Promise<ReturnType<T>> {
    // Store the arguments of the most recent call
    lastArgs = args;
    const context = this;

    // A function that executes the debounced function using the last stored arguments
    const later = function() {
      // Clear the timeout to prevent a double call
      timeoutId = undefined;
      if (lastArgs) {
        const output: ReturnType<T> = func.apply(context, lastArgs);
				for (const onComplete of onCompleteFunctions) {
					onComplete(output);
					onCompleteFunctions.delete(onComplete);
				}
        lastArgs = undefined; // Clear the stored arguments after execution
      }
    };

    // Clear any existing timeout
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
			timeoutId = undefined;
    }

    // Set a new timeout to execute the 'later' function after the wait period
    timeoutId = setTimeout(later, wait);

		return new Promise((resolve) => {
			onCompleteFunctions.add(resolve);
		});
  };
}
