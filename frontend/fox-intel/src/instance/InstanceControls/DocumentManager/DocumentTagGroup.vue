<template>
	<div class="DocumentTagGroup__container" :class="{ 'DocumentTagGroup__container-open': open }" @click="open = !open">
		<i class="DocumentTagGroup__open-icon pi" :class="{ 'pi-chevron-down': open, 'pi-chevron-right': !open }" />
		<div class="DocumentTagGroup__title">{{ props.tag }}</div>
		<div class="DocumentTagGroup__documents" v-if="open" @click.stop>
			<div v-for="document in Object.values(props.documents)" :key="document.id" class="DocumentTagGroup__document">
				<a @click.prevent.stop="openDocument(document.id)" class="DocumentTagGroup__document-name">{{ document.document_name }}</a>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.DocumentTagGroup__container {
	display: grid;
	grid-template-columns: max-content 1fr;
	grid-auto-rows: auto;
	grid-template-areas: 'open-icon title';
	gap: 0.5em;
	user-select: none;
	cursor: pointer;

	&-open {
		grid-template-areas:
			'open-icon title'
			'.         content';
	}
}

.DocumentTagGroup__open-icon {
	grid-area: open-icon;
	font-size: 0.75em;
	justify-self: center;
	align-self: center;
}

.DocumentTagGroup__title {
	grid-area: title;

	font-size: 1.2em;
	font-weight: bold;
}

.DocumentTagGroup__documents {
	grid-area: content;

	display: flex;
	flex-direction: column;
	align-items: stretch;
	justify-content: start;
	gap: 0.5em;
}
</style>

<script setup lang="ts">
import type { BasicIntelDocument } from '@packages/data/dist/intel';

const props = defineProps<{
	tag: string;
	documents: { [id: number]: BasicIntelDocument };
}>();

const open = defineModel<boolean>('open', { required: false });

function openDocument(documentId: number) {
	const documentElement: HTMLElement | null = document.querySelector(`.DocumentInstance__container[data-document-id="${documentId}"]`);
	console.log(documentElement);
	if (documentElement == null) return;
	documentElement.dispatchEvent(
		new Event('openDocument', {
			bubbles: false,
			cancelable: true,
		})
	);
}
</script>