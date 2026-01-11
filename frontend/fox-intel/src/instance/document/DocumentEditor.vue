<template>
	<Teleport to="body">
		<div
			v-show="documentRef != null"
			class="DocumentEditor__backdrop"
			@pointerdown.stop="emit('close')"
			@wheel.stop
		>
			<div class="DocumentEditor__container" @pointerdown.stop>
				<div class="DocumentEditor__header-bar">
					<input
						class="DocumentEditor__header-bar-input"
						type="text"
						:value="documentRef?.document_name ?? ''"
						@input="
							withHandlingAsync(() =>
								updateDocumentDebounced(
									{
										...documentRef!,
										document_name: ($event.target! as HTMLInputElement).value,
									},
									documentRef!
								)
							)
						"
					/>
					<button @pointerdown.stop="withHandlingAsync(() => deleteDocument())">
						<i class="pi pi-trash" />
					</button>
					<button @pointerdown.stop="emit('close')">
						<i class="pi pi-times" />
					</button>
				</div>
				<div class="DocumentEditor__metadata">
					<label class="DocumentEditor__metadata-entry">
						Tags
						<DocumentTags v-if="documentRef != null" :document-id="documentRef.id" />
					</label>
					<label class="DocumentEditor__metadata-entry">
						UI Size
						<NumberInput
							:model-value="documentRef?.ui_size ?? 0"
							@update:model-value="
								withHandlingAsync(() => updateDocumentDebounced({
									...documentRef!,
									ui_size: $event,
								}, documentRef!))
							"
							:fraction-digits="2"
							:min="0.1"
						/>
					</label>
					<div>
						Updated {{ new Date(documentRef?.timestamp ?? 0).toLocaleString() }}
					</div>
				</div>
				<div ref="editorContainer" class="DocumentEditor__editor" />
				<div
					class="DocumentEditor__attachments"
					:class="{
						'DocumentEditor__attachments--loading': attachmentsLoading,
					}"
				>
					<div
						class="DocumentEditor__attachment-container"
						v-for="attachment in attachments"
						:key="attachment.id"
					>
						<img
							class="DocumentEditor__attachment-thumbnail"
							v-if="attachment.mime_type.startsWith('image/')"
							:src="attachment.attachment_content"
							@pointerdown.stop.prevent="previewingAttachment = attachment"
						/>
						<div class="DocumentEditor__attachment-thumbnail" v-else>
							UNKNOWN ATTACHMENT TYPE
						</div>
					</div>
					<button
						class="DocumentEditor__add-attachment-button"
						@pointerdown.stop="addAttachment"
					>
						<i class="pi pi-plus" />
					</button>
				</div>
				<Teleport to="body" v-if="previewingAttachment != null">
					<div
						class="DocumentEditor__attachment-preview-backdrop"
						@pointerdown.stop="previewingAttachment = null"
					>
						<div
							class="DocumentEditor__attachment-preview-container"
							@pointerdown.stop
						>
							<div class="DocumentEditor__attachment-preview-header">
								<button @pointerdown.stop="previewingAttachment = null">
									<i class="pi pi-arrow-left" />
								</button>
								<button
									@pointerdown.stop="
										withHandlingAsync(() =>
											deleteAttachment(previewingAttachment!.id)
										);
										previewingAttachment = null;
									"
								>
									<i class="pi pi-trash" />
								</button>
							</div>
							<div class="DocumentEditor__attachment-preview-content">
								<img
									class="DocumentEditor__attachment-preview"
									v-if="previewingAttachment.mime_type.startsWith('image/')"
									:src="previewingAttachment.attachment_content"
								/>
								<div class="DocumentEditor__attachment-preview" v-else>
									UNKNOWN ATTACHMENT TYPE
								</div>
							</div>
						</div>
					</div>
				</Teleport>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	@use '@packages/frontend-libs/src/styles/mixins/border' as border;

	.DocumentEditor__backdrop {
		position: fixed;
		inset: 0;
		width: 100dvw;
		height: 100dvh;
		background: rgba(0, 0, 0, 0.5);

		display: flex;
	}

	.DocumentEditor__container {
		width: 90%;
		height: 90%;
		margin: auto;

		color: var(--color-primary);
		background: var(--color-primary-contrast);
		display: grid;
		grid-template-rows: auto auto minmax(0, 1fr) auto;
		grid-template-columns: 1fr;
		grid-template-areas:
			'header'
			'metadata'
			'editor'
			'attachments';
		border-radius: 0.5em;
		overflow: hidden;

		@include border.border-gradient();
		&:hover {
			@include border.border-gradient-hovered();

			.DocumentEditor__header-bar,
			.DocumentEditor__metadata {
				@include border.border-gradient-hovered();
			}
		}
		&:focus,
		&:focus-within {
			@include border.border-gradient-focused();
			outline: none;

			.DocumentEditor__header-bar,
			.DocumentEditor__metadata {
				@include border.border-gradient-focused();
			}
		}
		@include border.border-gradient-transition();

		.DocumentEditor__header-bar {
			grid-area: header;

			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			padding: 0.5em;
			gap: 0.5em;

			@include border.border-gradient();

			border-width: 0 !important;
			border-bottom-width: 0.125em !important;

			> .DocumentEditor__header-bar-input {
				flex: 1 0 auto;
				align-self: stretch;
				font-size: 2em;
				padding: 0.25em 0;
				border: none;
				background: none;
				outline: none;
				color: inherit;
			}
		}

		.DocumentEditor__metadata {
			grid-area: metadata;
			display: flex;
			flex-direction: row;
			align-items: center;
			white-space: nowrap;
			flex-wrap: wrap;
			padding: 0.5em;
			gap: 0.25em .5em;

			@include border.border-gradient();

			border-width: 0 !important;
			border-bottom-width: 0.125em !important;

			.DocumentEditor__metadata-entry {
				max-width: max-content;

				display: flex;
				flex-direction: row;
				align-items: center;
				gap: 0.5em;
			}
		}

		.DocumentEditor__editor {
			grid-area: editor;
			padding: 0.5em 0;

			> .cm-editor {
				height: 100%;
			}
		}

		.DocumentEditor__attachments {
			grid-area: attachments;

			position: relative;
			height: 8em;
			display: flex;
			flex-direction: row;
			padding: 0.5em;
			gap: 0.5em;
			overflow-x: auto;

			&.DocumentEditor__attachments--loading::after {
				content: 'Loading attachments...';
				position: absolute;
				inset: 0;
				background: rgb(0 0 0 / 0.5);
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 2em;
				font-weight: bold;
			}

			.DocumentEditor__attachment-container {
				display: grid;
				grid-template-rows: minmax(0, 1fr);
				grid-template-columns: auto;

				> .DocumentEditor__attachment-thumbnail {
					align-self: center;
					justify-self: center;
					max-height: 100%;
					max-width: 15em;

					cursor: pointer;
				}
			}

			.DocumentEditor__add-attachment-button {
				aspect-ratio: 1;
			}
		}
	}

	.DocumentEditor__attachment-preview-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;

		> .DocumentEditor__attachment-preview-container {
			max-height: 90%;
			max-width: 90%;
			margin: auto;

			display: grid;
			grid-template-rows: auto auto;
			grid-template-columns: auto;
			grid-template-areas:
				'header'
				'content';

			background: var(--color-primary-contrast);
			border-radius: 0.5em;
			border: 0.125em solid var(--color-primary);
			overflow: hidden;

			> .DocumentEditor__attachment-preview-header {
				grid-area: header;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: start;
				padding: 0.25em;
				gap: 0.25em;

				border-bottom: 0.125em solid var(--color-primary);
			}

			> .DocumentEditor__attachment-preview-content {
				grid-area: content;
				align-self: center;
				justify-self: center;
				max-height: 100%;
				max-width: 100%;
				padding: 0.5em;

				> .DocumentEditor__attachment-preview {
					max-height: 100%;
					max-width: 100%;
					object-fit: contain;
				}
			}
		}
	}
</style>

<script setup lang="ts">
	import { EditorView } from '@codemirror/view';
	import { EditorState, EditorStateConfig } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';
	import { GFM } from '@lezer/markdown';
	import { debounce } from '@packages/data/dist/helpers';
	import type {
		BasicIntelDocument,
		IntelDocument,
		IntelDocumentAttachmentFrontend,
	} from '@packages/data/dist/intel';
	import {
		withHandling,
		withHandlingAsync,
	} from '@packages/frontend-libs/dist/error';
	import NumberInput from '@packages/frontend-libs/dist/inputs/NumberInput.vue';
	import {
		prosemarkBasicSetup,
		prosemarkBaseThemeSetup,
		prosemarkMarkdownSyntaxExtensions,
	} from '@prosemark/core';
	import { htmlBlockExtension } from '@prosemark/render-html';
	import { onMounted, onUnmounted, ref, watch } from 'vue';
	import { requestFile } from '@/lib/file';
	import { injectIntelInstance } from '@/lib/intel-instance';
	import DocumentTags from './DocumentTags.vue';
	import { useDocument } from './mixins';
	import { updatePartialDocument } from './helpers';

	const props = defineProps<{
		document: BasicIntelDocument;
	}>();

	const emit = defineEmits<{
		(event: 'update:document', value: IntelDocument): void;
		(event: 'close'): void;
	}>();

	const intelInstance = injectIntelInstance();

	const { document: documentRef } = useDocument({
		intelInstance,
		document: props.document,
	});

	const editorContainer = ref<HTMLDivElement | null>(null);

	const previewingAttachment = ref<IntelDocumentAttachmentFrontend | null>(
		null
	);

	let editor: EditorView | null = null;
	const extensions: EditorStateConfig['extensions'] = [
		// Adds support for the Markdown language
		markdown({
			// adds support for standard syntax highlighting inside code fences
			// codeLanguages: languages,
			extensions: [
				// GitHub Flavored Markdown (support for autolinks, strikethroughs)
				GFM,
				// additional parsing tags for existing markdown features, backslash escapes, emojis
				prosemarkMarkdownSyntaxExtensions,
			],
		}),
		// Basic prosemark extensions
		prosemarkBasicSetup(),
		// Theme extensions
		prosemarkBaseThemeSetup(),
		// Render HTML blocks (optional)
		htmlBlockExtension,

		EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				withHandlingAsync(() => updateDocumentDebounced(
					{
						...documentRef.value!,
						document_content: editor!.state.doc.toString(),
					},
					documentRef.value!
				));
			}
		}),
	];

	watch(
		() => documentRef.value?.document_content ?? '',
		(newDocumentContent) => {
			if (editor == null) return;
			if (editor.state.doc.toString() === newDocumentContent) return;

			editor.setState(
				EditorState.create({ doc: newDocumentContent, extensions })
			);
		}
	);

	async function getAttachments() {
		const attachmentsResponse = await intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.document.id)}/attachment`,
			{
				method: 'GET',
			}
		);
		if (!attachmentsResponse.ok) {
			throw new Error(
				'Failed to open document attachments. ' +
					(await attachmentsResponse.text())
			);
		}
		const attachmentsData: IntelDocumentAttachmentFrontend[] =
			await attachmentsResponse.json();
		return attachmentsData;
	}

	const attachmentsPromise =
		ref<Promise<IntelDocumentAttachmentFrontend[]>>(getAttachments());
	const attachmentsLoading = ref(true);
	const attachments = ref<IntelDocumentAttachmentFrontend[]>([]);
	watch(
		attachmentsPromise,
		async (newAttachmentsPromise) => {
			attachmentsLoading.value = true;
			const newAttachments = await newAttachmentsPromise;
			if (attachmentsPromise.value === newAttachmentsPromise) {
				attachments.value = newAttachments;
				attachmentsLoading.value = false;
			}
		},
		{ immediate: true }
	);

	async function addAttachment() {
		const blob = await requestFile('image/*');
		attachmentsPromise.value = attachmentsPromise.value.then(
			async (attachments) => {
				const response = await intelInstance.authenticatedFetch(
					`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.document.id)}/attachment`,
					{
						method: 'POST',
						body: blob,
					}
				);
				if (!response.ok) {
					throw new Error(
						'Failed to add attachment. ' + (await response.text())
					);
				}
				const data: { id: number } = await response.json();

				const reader = new FileReader();
				const attachment_content = await new Promise<string>(
					(resolve, reject) => {
						reader.onload = () => resolve(reader.result as string);
						reader.onerror = () =>
							reject(new Error('Failed to read attachment content'));
						reader.readAsDataURL(blob);
					}
				);
				attachments.push({
					id: data.id,
					instance_id: props.document.instance_id,
					document_id: props.document.id,
					mime_type: blob.type,
					attachment_content,
				});
				return attachments;
			}
		);

		await attachmentsPromise.value;
	}

	onMounted(() =>
		withHandling(() => {
			editor = new EditorView({
				state: EditorState.create({
					doc: documentRef.value?.document_content ?? '',
					extensions,
				}),
				parent: editorContainer.value!,
			});
		})
	);

	onUnmounted(() => {
		editor?.destroy();
	});

	async function updateDocument(
		newDocument: IntelDocument,
		oldDocument: IntelDocument
	) {
		const updateData: Partial<IntelDocument> = {};
		for (const key of Object.keys(newDocument) as (keyof IntelDocument)[]) {
			if (newDocument[key] !== oldDocument[key]) {
				updateData[key] = newDocument[key] as any;
			}
		}

		if (Object.keys(updateData).length === 0) {
			console.log(
				'no updates',
				JSON.parse(JSON.stringify(newDocument)),
				JSON.parse(JSON.stringify(oldDocument))
			);
			return;
		}
		oldDocument = newDocument;

		await updatePartialDocument(intelInstance, props.document.id, updateData);
		emit('update:document', newDocument);
	}

	const updateDocumentDebounced = debounce(updateDocument, 1000);

	async function deleteDocument() {
		if (!confirm('Are you sure you want to delete this document?')) return;
		const response = await intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.document.id)}`,
			{
				method: 'DELETE',
			}
		);
		if (!response.ok) {
			throw new Error('Failed to delete document. ' + (await response.text()));
		}
		emit('close');
	}

	async function deleteAttachment(attachmentId: number) {
		if (!confirm('Are you sure you want to delete this attachment?')) return;
		attachmentsPromise.value = attachmentsPromise.value.then(
			async (attachments) => {
				const response = await intelInstance.authenticatedFetch(
					`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.document.id)}/attachment/${encodeURIComponent(attachmentId)}`,
					{
						method: 'DELETE',
					}
				);
				if (!response.ok) {
					throw new Error(
						'Failed to delete attachment. ' + (await response.text())
					);
				}
				const index = attachments.findIndex(
					(attachment) => attachment.id === attachmentId
				);
				if (index === -1) return attachments;
				attachments.splice(index, 1);
				return attachments;
			}
		);

		await attachmentsPromise.value;
	}
</script>
