import { intelInstance } from '@/lib/globals';
import { BasicIntelDocument } from '@packages/data/dist/intel';
import { onScopeDispose, ref } from 'vue';

export function useDocuments() {
	const documents = ref<{ [id: BasicIntelDocument['id']]: BasicIntelDocument }>(
		{}
	);

	async function addDocument(documentX: number, documentY: number, uiSize: number, documentName: string, documentContent: string) {
		const response = await intelInstance.authenticatedFetch(
			`/api/v1/instance/${intelInstance.instanceId.value}/document`,
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
			instance_id: intelInstance.instanceId.value,
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
		const response = await intelInstance.authenticatedFetch(
			`/api/v1/instance/${intelInstance.instanceId.value}/document/since?timestamp=${timestamp}&timeout=${timeout}&skipDeleted=${Object.keys(documents.value).length === 0}`,
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

	async function loop(backoff: number = 1_000) {
		if (scopeDestroyed) return;
		await loadSince(lastLoadedTimestamp)
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
	const ready = loop();

	return {
		addDocument,
		documents,
		ready,
	};
}
