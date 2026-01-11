import { injectIntelInstance } from '@/lib/intel-instance';
import type { BasicIntelDocument, IntelDocument, IntelDocumentTag } from '@packages/data/dist/intel';
import { onScopeDispose, ref } from 'vue';

export type UseDocumentsOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
};
export function useDocuments(options: UseDocumentsOptions) {
	const documents = ref<{ [id: BasicIntelDocument['id']]: BasicIntelDocument }>(
		{}
	);

	async function addDocument(
		documentX: number,
		documentY: number,
		uiSize: number,
		documentName: string,
		documentContent: string
	) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/document`,
			{
				method: 'POST',
				body: JSON.stringify({
					documentX,
					documentY,
					uiSize,
					documentName,
					documentContent,
				}),
			}
		);
		if (!response.ok) {
			throw new Error('Failed to add document. ' + (await response.text()));
		}
		const data: { id: BasicIntelDocument['id'] } = await response.json();

		// Optimistically update the documents list
		documents.value[data.id] = {
			id: data.id,
			instance_id: options.intelInstance.instanceId.value,
			document_x: documentX,
			document_y: documentY,
			ui_size: uiSize,
			document_name: documentName,
			timestamp: 0,
			deleted: false,
		};

		return data.id;
	}

	let lastLoadedTimestamp = 0;
	async function loadSince(timestamp: number, timeout: number = 10000) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/document/since?timestamp=${timestamp}&timeout=${timeout}&skipDeleted=${Object.keys(documents.value).length === 0}`,
			{
				method: 'GET',
			}
		);
		if (!response.ok) {
			throw new Error('Failed to load regions. ' + (await response.text()));
		}
		const data: {
			documents: BasicIntelDocument[];
			timestamp: number;
		} = await response.json();
		lastLoadedTimestamp = data.timestamp;
		for (const document of data.documents) {
			if (document.deleted) {
				delete documents.value[document.id];
			} else {
				documents.value[document.id] = document;
			}
		}
	}

	let scopeDestroyed = false;
	onScopeDispose(() => {
		scopeDestroyed = true;
	});

	async function loop(backoff: number = 1_000, isFirst: boolean = false) {
		if (scopeDestroyed) return;
		await loadSince(lastLoadedTimestamp, isFirst ? 0 : undefined)
			.then(() => {
				if (scopeDestroyed) return;
				loop();
			})
			.catch((err) => {
				console.error(err);
				if (scopeDestroyed) return;
				setTimeout(() => loop(Math.min(backoff * 2, 60_000)), backoff);
			});
	}
	const ready = loop(undefined, true);

	return {
		addDocument,
		documents,
		ready,
	};
}

export type UseDocumentOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
	document: BasicIntelDocument;
};
export function useDocument(options: UseDocumentOptions) {
	const document = ref<IntelDocument | null>(null);

	let lastLoadedTimestamp = 0;
	async function loadSince(timestamp: number, timeout: number = 10000) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/document/${encodeURIComponent(options.document.id)}/since?timestamp=${timestamp}&timeout=${timeout}`,
			{
				method: 'GET',
			}
		);
		if (!response.ok) {
			throw new Error('Failed to load document. ' + (await response.text()));
		}
		const data: { document: IntelDocument; timestamp: number } =
			await response.json();
		document.value = data.document;
		lastLoadedTimestamp = data.timestamp;
	}

	let scopeDestroyed = false;
	onScopeDispose(() => {
		scopeDestroyed = true;
	});

	async function loop(backoff: number = 1_000, isFirst: boolean = false) {
		if (scopeDestroyed) return;
		await loadSince(lastLoadedTimestamp, isFirst ? 0 : undefined)
			.then(() => {
				if (scopeDestroyed) return;
				loop();
			})
			.catch(async (err) => {
				console.error(err);
				if (scopeDestroyed) return;
				await new Promise((resolve) => setTimeout(resolve, backoff));
				return loop(Math.min(backoff * 2, 60_000));
			});
	}
	const ready = loop(undefined, true);

	return {
		document,
		ready,
	};
}

export type UseDocumentTagsOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
	documentId: number;
};
export function useDocumentTags(options: UseDocumentTagsOptions) {
	const tags = ref<{ [id: IntelDocumentTag['id']]: IntelDocumentTag }>({});

	let lastLoadedTimestamp = 0;
	async function loadSince(timestamp: number, timeout: number = 10000) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/document/${encodeURIComponent(options.documentId)}/tags/since?timestamp=${timestamp}&timeout=${timeout}`,
			{
				method: 'GET',
			}
		);
		if (!response.ok) {
			throw new Error(
				'Failed to load document tags. ' + (await response.text())
			);
		}
		const data: { tags: IntelDocumentTag[]; timestamp: number } = await response.json();
		for (const tag of data.tags) {
			if (tag.deleted) {
				delete tags.value[tag.id];
			} else {
				tags.value[tag.id] = tag;
			}
		}
		lastLoadedTimestamp = data.timestamp;
	}

	let scopeDestroyed = false;
	onScopeDispose(() => {
		scopeDestroyed = true;
	});

	const ready = ref(false);
	async function loop(backoff: number = 1_000, isFirst: boolean = false) {
		if (scopeDestroyed) return;
		await loadSince(lastLoadedTimestamp, isFirst ? 0 : undefined)
			.then(() => {
				if (scopeDestroyed) return;
				ready.value = true;
				loop();
			})
			.catch(async (err) => {
				console.error(err);
				if (scopeDestroyed) return;
				await new Promise((resolve) => setTimeout(resolve, backoff));
				return loop(Math.min(backoff * 2, 60_000));
			});
	}
	const readyPromise = loop(undefined, true);

	return {
		tags,
		ready,
		readyPromise,
	};
}
