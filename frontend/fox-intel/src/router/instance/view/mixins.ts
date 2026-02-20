import type { BasicIntelDocument, IntelDocument, IntelDocumentTag } from '@packages/data/dist/intel';
import { wrapMixin } from '@packages/frontend-libs/src/reference-cache';
import { useScopePerObjectKey } from '@packages/frontend-libs/dist/scope';
import { onScopeDispose, ref, watch } from 'vue';
import { injectIntelInstance } from '@/lib/intel-instance';

export type UseDocumentsOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
};
function _useDocuments(options: UseDocumentsOptions) {
	const documents = ref<{ [id: BasicIntelDocument['id']]: BasicIntelDocument }>(
		{}
	);

	async function addDocument(
		documentX: number,
		documentY: number,
		uiSize: number,
		documentName: string,
		documentContent: string,
		documentColor: string
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
					documentColor,
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
			document_color: documentColor,
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
export const useDocuments = wrapMixin(_useDocuments, (options) => `${options.intelInstance.instanceId.value}-documents`);

export function _useDocumentsByTag(options: UseDocumentsOptions) {
	const { ready, documents, addDocument } = useDocuments(options);
	const documentsByTag = ref<{ [tag: string]: { [id: BasicIntelDocument['id']]: BasicIntelDocument } }>(
		{}
	);
	const untaggedDocuments = ref<{ [id: BasicIntelDocument['id']]: BasicIntelDocument }>({});

	useScopePerObjectKey(documents, (id) => {
		const { tagsByName } = useDocumentTags({
			intelInstance: options.intelInstance,
			documentId: id,
		});

		watch([() => documents.value[id], tagsByName], ([newDocument, newTags], [_, oldTags]) => {
			for (const tag of Object.keys(oldTags ?? {})) {
				if (newTags[tag] || !documentsByTag.value[tag]) continue;
				delete documentsByTag.value[tag][id];
				if (Object.keys(documentsByTag.value[tag]).length === 0) {
					delete documentsByTag.value[tag];
				}
			}

			if (Object.keys(newTags).length === 0) {
				untaggedDocuments.value[id] = newDocument;
			} else {
				delete untaggedDocuments.value[id];
				for (const tag of Object.keys(newTags)) {
					if (documentsByTag.value[tag] == null) {
						documentsByTag.value[tag] = {};
					}
					documentsByTag.value[tag][id] = newDocument;
				}
			}
		}, { flush: 'sync', immediate: true });

		onScopeDispose(() => {
			for (const tag of Object.keys(documentsByTag.value)) {
				delete documentsByTag.value[tag][id];
				if (Object.keys(documentsByTag.value[tag]).length === 0) {
					delete documentsByTag.value[tag];
				}
			}
			delete untaggedDocuments.value[id];
		});
	}, 'sync');

	return {
		addDocument,
		documentsByTag,
		untaggedDocuments,
		ready,
	};
}

export const useDocumentsByTag = wrapMixin(_useDocumentsByTag, (options) => `${options.intelInstance.instanceId.value}-documents-by-tag`);

export type UseDocumentOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
	documentId: number;
};
function _useDocument(options: UseDocumentOptions) {
	const document = ref<IntelDocument | null>(null);

	let lastLoadedTimestamp = 0;
	async function loadSince(timestamp: number, timeout: number = 10000) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/document/id/${encodeURIComponent(options.documentId)}/since?timestamp=${timestamp}&timeout=${timeout}`,
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
export const useDocument = wrapMixin(_useDocument, (options) => `${options.intelInstance.instanceId.value}-document-${options.documentId}`);

export type UseDocumentTagsOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
	documentId: number;
};
export function _useDocumentTags(options: UseDocumentTagsOptions) {
	const tags = ref<{ [id: IntelDocumentTag['id']]: IntelDocumentTag }>({});
	const tagsByName = ref<{ [name: string]: IntelDocumentTag }>({});

	let lastLoadedTimestamp = 0;
	async function loadSince(timestamp: number, timeout: number = 10000) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/document/id/${encodeURIComponent(options.documentId)}/tags/since?timestamp=${timestamp}&timeout=${timeout}`,
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
		const newTags = {...tags.value};
		const newTagsByName = {...tagsByName.value};
		for (const tag of data.tags) {
			if (tag.deleted) {
				delete newTags[tag.id];
				delete newTagsByName[tag.tag];
			} else {
				newTags[tag.id] = tag;
				newTagsByName[tag.tag] = tag;
			}
		}
		tags.value = newTags;
		tagsByName.value = newTagsByName;
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
		tagsByName,
		ready,
		readyPromise,
	};
}
export const useDocumentTags = wrapMixin(_useDocumentTags, (options) => `${options.intelInstance.instanceId.value}-document-${options.documentId}-tags`);