async function _initStore() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		// Open (or create) the database
		const request = indexedDB.open('MyBlobStore', 1);

		request.onupgradeneeded = function (_event) {
			const db = this.result;
			// Create an object store to hold our Blobs (if it doesn't exist)
			db.createObjectStore('Blobs', { keyPath: 'id' });
		};

		request.onsuccess = function (_event) {
			const db = this.result;
			resolve(db);
		};

		request.onerror = function (_event) {
			reject(new Error('Database error: ' + this.error));
		};
	});
}

let store: Promise<IDBDatabase> | null = null;
export async function initStore() {
	if (store == null) {
		store = _initStore();
	}
	return store;
}

export async function storeBlob(blob: Blob, key: string) {
	const db = await initStore();
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(['Blobs'], 'readwrite');
		const store = transaction.objectStore('Blobs');

		// Put the Blob data into the store
		const putRequest = store.put({ id: key, data: blob });

		putRequest.onsuccess = function () {
			resolve();
		};

		putRequest.onerror = function (_event) {
			reject(new Error('Error storing blob: ' + this.error));
		};

		// Close the database once the transaction is complete
		// transaction.oncomplete = () => db.close();
		transaction.onerror = function (_event) {
			reject(new Error('Database error: ' + this.error));
		};
	});
}

export async function deleteBlob(key: string) {
	const db = await initStore();
	return new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(['Blobs'], 'readwrite');
		const store = transaction.objectStore('Blobs');
		const deleteRequest = store.delete(key);

		deleteRequest.onsuccess = function () {
			resolve();
		};

		deleteRequest.onerror = function (_event) {
			reject(new Error('Error deleting blob: ' + this.error));
		};

		// transaction.oncomplete = () => db.close();
		transaction.onerror = function (_event) {
			reject(new Error('Database error: ' + this.error));
		};
	});
}

export async function retrieveBlob(key: string) {
	const db = await initStore();
	return new Promise<Blob | null>((resolve, reject) => {
		const transaction = db.transaction(['Blobs'], 'readonly');
		const store = transaction.objectStore('Blobs');
		const getRequest = store.get(key);

		getRequest.onsuccess = function (_event) {
			// The result is an object containing our data, e.g., { id: '...', data: Blob }
			const result = this.result;
			if (result) {
				resolve(result.data);
			} else {
				resolve(null); // Key not found
			}
		};

		getRequest.onerror = function (_event) {
			reject(new Error('Error retrieving blob: ' + this.error));
		};

		// transaction.oncomplete = () => db.close();
	});
}
