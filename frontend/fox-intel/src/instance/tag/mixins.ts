import type { IntelDocumentTag } from '@packages/data/dist/intel';
import { wrapMixin } from '@packages/frontend-libs/src/reference-cache';
import { onScopeDispose, ref } from 'vue';
import type { useIntelInstance } from '@/lib/intel-instance';

export type TagRecord = {
	[documentId: number]: {
		[tag: string]: IntelDocumentTag;
	};
};

export type UseTagsOptions = {
	intelInstance: ReturnType<typeof useIntelInstance>;
};
function _useTags(options: UseTagsOptions) {
	const tags = ref<TagRecord>({});

	let lastLoadedTimestamp = 0;
	async function loadSince(timestamp: number, timeout: number = 10000) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/tags/since?timestamp=${timestamp}&timeout=${timeout}`,
			{
				method: 'GET',
			}
		);
		if (!response.ok) {
			throw new Error('Failed to load tags. ' + (await response.text()));
		}
		const data: { tags: IntelDocumentTag[]; timestamp: number } =
			await response.json();
		for (const tag of data.tags) {
			if (tags.value[tag.document_id] == null) {
				tags.value[tag.document_id] = {};
			}
			const documentTags = tags.value[tag.document_id]!;
			if (tag.deleted) {
				delete documentTags[tag.tag];
				if (Object.keys(documentTags).length === 0) {
					delete tags.value[tag.document_id];
				}
			} else {
				documentTags[tag.tag] = tag;
			}
		}
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
		tags,
		ready,
	};
};
export const useTags = wrapMixin(_useTags, (options) => `${options.intelInstance.instanceId.value}-tags`);