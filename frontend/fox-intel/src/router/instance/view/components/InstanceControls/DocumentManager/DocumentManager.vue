<template>
	<div class="DocumentManager__container">
		<DocumentTagGroup v-for="tag in Object.keys(documentsByTag)" :key="tag" :tag="tag" :documents="documentsByTag[tag]" />
		<DocumentTagGroup v-if="Object.keys(untaggedDocuments).length > 0" :tag="'<Untagged>'" :documents="untaggedDocuments" />
	</div>
</template>

<style lang="scss">
.DocumentManager__container {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: start;
	gap: 0.5em;
}
</style>

<script setup lang="ts">
import { injectIntelInstance } from '@/lib/intel-instance';
import { ref } from 'vue';
import { useDocumentsByTag } from '../../../mixins';
import DocumentTagGroup from './DocumentTagGroup.vue';

const intelInstance = injectIntelInstance();

const { documentsByTag, untaggedDocuments, ready } = useDocumentsByTag({
	intelInstance,
});

const loading = ref(true);
ready.finally(() => {
	loading.value = false;
});
</script>