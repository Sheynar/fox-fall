<template>
	<TagInput v-if="ready" :model-value="Object.values(tags).map((tag) => tag.tag)" @add:tag="addTag" @remove:tag="removeTag" />
</template>

<script setup lang="ts">
	import TagInput from '@packages/frontend-libs/dist/inputs/TagInput.vue';
	import { useDocumentTags } from './mixins';
	import { injectIntelInstance } from '@/lib/intel-instance';

	const props = defineProps<{
		documentId: number;
	}>();

	const intelInstance = injectIntelInstance();

	const { tags, ready } = useDocumentTags({
		intelInstance,
		documentId: props.documentId,
	});

	async function addTag(tag: string) {
		const response = await intelInstance.authenticatedFetch(`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.documentId)}/tag/${encodeURIComponent(tag)}`, {
			method: 'POST',
		});
		if (!response.ok) {
			throw new Error('Failed to update document tags. ' + (await response.text()));
		}
	}

	async function removeTag(tag: string) {
		const response = await intelInstance.authenticatedFetch(`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.documentId)}/tag/${encodeURIComponent(tag)}`, {
			method: 'DELETE',
		});
		if (!response.ok) {
			throw new Error('Failed to remove document tag. ' + (await response.text()));
		}
	}
</script>
