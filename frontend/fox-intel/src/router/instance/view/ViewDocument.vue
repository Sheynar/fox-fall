<template>
	<DocumentEditor
		:key="props.documentId"
		:document-id="props.documentId"
		:instance-id="props.instanceId"
		@close="withHandlingAsync(() => closeDocument())" />
</template>

<script setup lang="ts">
	import { withHandlingAsync } from '@packages/frontend-libs/dist/error';
	import router from '@/router';
	import DocumentEditor from './components/document/DocumentEditor.vue';

	const props = defineProps<{
		documentId: number;
		instanceId: string;
	}>();

	async function closeDocument() {
		await router.push({ name: 'instance:view', params: { instanceId: props.instanceId } });
	}
</script>