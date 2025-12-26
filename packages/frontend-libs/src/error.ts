const errorHandlers = new Set<(error: unknown) => void>();
export function addErrorHandler(handler: (error: unknown) => void) {
	errorHandlers.add(handler);
	return () => errorHandlers.delete(handler);
}

export function handleError(error: unknown) {
	for (const handler of errorHandlers) {
		try {
			handler(error);
		} catch (error) {
			alert(`Error handler failed ${error}`);
		}
	}
}

export function withHandling(callback: () => void) {
	try {
		callback();
	} catch (error) {
		handleError(error);
	}
}

export async function withHandlingAsync<T>(callback: () => Promise<T>) {
	try {
		return await callback();
	} catch (error) {
		handleError(error);
	}
}