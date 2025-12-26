<template>
	<Teleport to="body">
		<div
			class="DocumentEditor__backdrop"
			@pointerdown.stop="emit('close')"
			@wheel.stop
		>
			<div class="DocumentEditor__container" @pointerdown.stop>
				<div class="DocumentEditor__header-bar">
					<input
						class="DocumentEditor__header-bar-input"
						type="text"
						:value="props.document.document_name"
						@input="
							emit('update:document', {
								...props.document,
								document_name: ($event.target! as HTMLInputElement).value,
							})
						"
					/>
					<button @pointerdown.stop="emit('delete')">
						<i class="pi pi-trash" />
					</button>
					<button @pointerdown.stop="emit('close')">
						<i class="pi pi-times" />
					</button>
				</div>
				<div class="DocumentEditor__metadata">
					<label class="DocumentEditor__metadata-entry">
						UI Size
						<NumberInput
							:model-value="props.document.ui_size"
							@update:model-value="
								emit('update:document', {
									...props.document,
									ui_size: $event,
								})
							"
							:fraction-digits="2"
							:min="0.1"
						/>
					</label>
					<div>
						Updated {{ new Date(props.document.timestamp).toLocaleString() }}
					</div>
				</div>
				<div ref="editorContainer" class="DocumentEditor__editor" />
				<div class="DocumentEditor__attachments" :class="{ 'DocumentEditor__attachments--loading': attachmentsLoading }">
					<div
						class="DocumentEditor__attachment-container"
						v-for="attachment in attachments"
						:key="attachment.id"
						@pointerdown.stop="previewingAttachment = attachment"
					>
						<img
							class="DocumentEditor__attachment-thumbnail"
							v-if="attachment.mime_type.startsWith('image/')"
							:src="attachment.attachment_content"
						/>
						<div class="DocumentEditor__attachment-thumbnail" v-else>
							UNKNOWN ATTACHMENT TYPE
						</div>
						<div class="DocumentEditor__attachment-actions-container">
							<button
								class="DocumentEditor__attachment-action"
								@pointerdown.stop="emit('deleteAttachment', attachment.id)"
							>
								<i class="pi pi-trash" />
							</button>
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
						class="DocumentEditor__attachment-preview-container"
						@pointerdown.stop="previewingAttachment = null"
					>
						<img
							class="DocumentEditor__attachment-preview"
							v-if="previewingAttachment.mime_type.startsWith('image/')"
							:src="previewingAttachment.attachment_content"
						/>
						<div class="DocumentEditor__attachment-thumbnail" v-else>
							UNKNOWN ATTACHMENT TYPE
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
			flex-direction: column;
			padding: 0.5em;
			gap: 0.5em;

			@include border.border-gradient();

			border-width: 0 !important;
			border-bottom-width: 0.125em !important;

			.DocumentEditor__metadata-entry {
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
				content: '';
				position: absolute;
				inset: 0;
				background: rgb(0 0 0 / 0.5);
			}

			.DocumentEditor__attachment-container {
				display: grid;
				grid-template-rows:
					[thumbnail-start actions-start] auto [actions-end] minmax(0, 1fr)
					[thumbnail-end];
				grid-template-columns: [thumbnail-start] auto [actions-start] auto [thumbnail-end actions-end];

				> .DocumentEditor__attachment-thumbnail {
					grid-row: thumbnail-start / thumbnail-end;
					grid-column: thumbnail-start / thumbnail-end;

					align-self: center;
					max-height: 100%;
					max-width: 15em;

					cursor: pointer;
				}

				> .DocumentEditor__attachment-actions-container {
					grid-row: actions-start / actions-end;
					grid-column: actions-start / actions-end;

					display: flex;
					flex-direction: row;
					padding: 0.25em;
					gap: 0.25em;
				}
				&:not(:hover) {
					> .DocumentEditor__attachment-actions-container {
						opacity: 0;
						pointer-events: none;
					}
				}
			}

			.DocumentEditor__add-attachment-button {
				aspect-ratio: 1;
			}
		}
	}

	.DocumentEditor__attachment-preview-container {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;

		> .DocumentEditor__attachment-preview {
			max-height: 90%;
			max-width: 90%;
			object-fit: contain;
			margin: auto;
		}
	}
</style>

<script setup lang="ts">
	import { EditorView } from '@codemirror/view';
	import { EditorState, EditorStateConfig } from '@codemirror/state';
	import { markdown } from '@codemirror/lang-markdown';
	import { GFM } from '@lezer/markdown';
	import { withHandling } from '@packages/frontend-libs/dist/error';
	import type {
		IntelDocument,
		IntelDocumentAttachmentFrontend,
	} from '@packages/data/dist/intel';
	import NumberInput from '@packages/frontend-libs/dist/inputs/NumberInput.vue';
	import {
		prosemarkBasicSetup,
		prosemarkBaseThemeSetup,
		prosemarkMarkdownSyntaxExtensions,
	} from '@prosemark/core';
	import { htmlBlockExtension } from '@prosemark/render-html';
	import { onMounted, onUnmounted, ref, watch } from 'vue';

	const props = defineProps<{
		document: IntelDocument;
		attachments: Promise<IntelDocumentAttachmentFrontend[]>;
	}>();

	const emit = defineEmits<{
		(event: 'update:document', value: IntelDocument): void;
		(event: 'addAttachment', value: Blob): void;
		(event: 'deleteAttachment', value: number): void;
		(event: 'close'): void;
		(event: 'delete'): void;
	}>();

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
				emit('update:document', {
					...props.document,
					document_content: editor!.state.doc.toString(),
				});
			}
		}),
	];

	watch(
		() => props.document.document_content,
		(newDocumentContent) => {
			if (editor == null) return;
			if (editor.state.doc.toString() === newDocumentContent) return;

			editor.setState(
				EditorState.create({ doc: newDocumentContent, extensions })
			);
		}
	);

	const attachmentsLoading = ref(true);
	const attachments = ref<IntelDocumentAttachmentFrontend[]>([]);
	watch(
		() => props.attachments,
		async (newAttachmentsPromise) => {
			attachmentsLoading.value = true;
			const newAttachments = await newAttachmentsPromise;
			if (props.attachments === newAttachmentsPromise) {
				attachments.value = newAttachments;
				attachmentsLoading.value = false;
			}
		},
		{ immediate: true }
	);

	function addAttachment() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = (event) => {
			const file = (event.target! as HTMLInputElement).files![0];
			emit('addAttachment', file);
		};
		input.click();
	}

	onMounted(() => withHandling(() => {
		editor = new EditorView({
			state: EditorState.create({
				doc: props.document.document_content,
				extensions,
			}),
			parent: editorContainer.value!,
		});
	}));

	onUnmounted(() => {
		editor?.destroy();
	});
</script>
