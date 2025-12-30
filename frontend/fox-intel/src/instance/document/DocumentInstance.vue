<template>
	<PositionedElement
		:layer="1"
		:x="props.document.document_x"
		:y="props.document.document_y"
		cancel-viewport-rotation
	>
		<div
			ref="documentElement"
			class="DocumentInstance__container"
			:data-document-id="props.document.id"
			:style="{ '--_document-ui-size': String(props.document.ui_size) }"
			@pointerdown.stop="onPointerDown"
			@pointermove.stop="onPointerMove"
			@pointerup.stop="onPointerUp"
			@openDocument="() => withHandlingAsync(() => openDocument())"
			:title="props.document.document_name"
		>
			<DocumentIcon class="DocumentInstance__icon" />
		</div>
	</PositionedElement>

	<DocumentEditor
		:key="editing?.document.id"
		v-if="editing != null"
		:document="editing.document"
		:attachments="editing.attachments"
		@update:document="
			($event) =>
				withHandlingAsync(() =>
					updateDocumentDebounced($event, editing!.document)
				)
		"
		@addAttachment="($event) => withHandlingAsync(() => addAttachment($event))"
		@deleteAttachment="
			($event) => withHandlingAsync(() => deleteAttachment($event))
		"
		@close="() => withHandling(() => closeDocument())"
		@delete="() => withHandlingAsync(() => deleteDocument())"
	/>
</template>

<style lang="scss">
	.DocumentInstance__container {
		width: calc(2rem * var(--_document-ui-size));
		height: calc(2rem * var(--_document-ui-size));
		color: var(--color-primary);
		transform: translate(-50%, -50%);
		transform-origin: center center;
		background: var(--color-primary-contrast);
		border-radius: 50%;
		padding: calc(0.1rem * var(--_document-ui-size));
		border: calc(1px * var(--_document-ui-size)) solid;
		overflow: hidden;

		opacity: 0.7;
		&:hover {
			opacity: 1;
		}

		cursor: pointer;
	}

	.DocumentInstance__icon {
		width: 100%;
		height: 100%;
	}
</style>

<script setup lang="ts">
	import { Vector } from '@packages/data/dist/artillery/vector';
	import { debounce } from '@packages/data/dist/helpers';
	import type {
		BasicIntelDocument,
		IntelDocument,
		IntelDocumentAttachmentFrontend,
	} from '@packages/data/dist/intel.js';
	import {
		withHandling,
		withHandlingAsync,
	} from '@packages/frontend-libs/dist/error';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import { injectViewport } from '@packages/frontend-libs/dist/viewport/viewport';
	import DocumentIcon from '@packages/frontend-libs/dist/icons/DocumentIcon.vue';
	import { ref, shallowRef } from 'vue';
	import { injectIntelInstance } from '@/lib/intel-instance';
	import DocumentEditor from './DocumentEditor.vue';

	const documentElement = shallowRef<HTMLDivElement | null>(null);

	const props = defineProps<{
		document: BasicIntelDocument;
	}>();

	const intelInstance = injectIntelInstance();

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

	const editing = ref<{
		document: IntelDocument;
		attachments: Promise<IntelDocumentAttachmentFrontend[]>;
	} | null>(null);
	async function openDocument() {
		const response = await intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.document.id)}`,
			{
				method: 'GET',
			}
		);
		if (!response.ok) {
			throw new Error('Failed to open document. ' + (await response.text()));
		}
		const data: IntelDocument = await response.json();
		editing.value = { document: data, attachments: getAttachments() };
	}

	async function updatePartialDocument(updateData: Partial<IntelDocument>) {
		const response = await intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/document/${encodeURIComponent(props.document.id)}`,
			{
				method: 'POST',
				body: JSON.stringify(updateData),
			}
		);
		if (!response.ok) {
			throw new Error('Failed to update document. ' + (await response.text()));
		}
	}

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

		await updatePartialDocument(updateData);
	}

	const updateDocumentDebounced = debounce(updateDocument, 1000);

	function closeDocument() {
		editing.value = null;
	}

	async function deleteDocument() {
		if (editing.value == null) return;
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
		editing.value = null;
	}

	async function addAttachment(blob: Blob) {
		if (editing.value == null) return;
		editing.value.attachments = editing.value.attachments.then(
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
	}

	async function deleteAttachment(attachmentId: number) {
		if (editing.value == null) return;
		if (!confirm('Are you sure you want to delete this attachment?')) return;
		editing.value.attachments = editing.value.attachments.then(
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
	}

	const MOVE_ACTIVATION_DISTANCE = 5;
	const viewport = injectViewport();
	type MovingData = {
		sharedStateId?: string;
		startEvent: PointerEvent;
		startCursorViewport: Vector;
		startDocumentPosition: Vector;
		moveActivated: boolean;
	};
	const moving = ref<null | MovingData>(null);
	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || documentElement.value == null) return;
		event.preventDefault();
		event.stopPropagation();

		moving.value = {
			startEvent: event,
			startCursorViewport: viewport.value.toWorldPosition(
				Vector.fromCartesianVector({
					x: event.clientX,
					y: event.clientY,
				})
			),
			startDocumentPosition: Vector.fromCartesianVector({
				x: props.document.document_x,
				y: props.document.document_y,
			}),
			moveActivated: false,
		};
		documentElement.value.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (moving.value == null || documentElement.value == null) return;
		event.preventDefault();
		event.stopPropagation();

		const distanceMoved = Vector.fromCartesianVector({
			x: event.clientX - moving.value.startEvent.clientX,
			y: event.clientY - moving.value.startEvent.clientY,
		});
		if (distanceMoved.distance >= MOVE_ACTIVATION_DISTANCE) {
			moving.value.moveActivated = true;
		}

		if (moving.value.moveActivated) {
			props.document.document_x =
				moving.value.startDocumentPosition.x +
				distanceMoved.x / viewport.value.resolvedZoom;
			props.document.document_y =
				moving.value.startDocumentPosition.y +
				distanceMoved.y / viewport.value.resolvedZoom;
		}
	}

	function onPointerUp(event: PointerEvent) {
		if (moving.value == null || documentElement.value == null) return;
		event.preventDefault();
		event.stopPropagation();

		if (!moving.value.moveActivated) {
			withHandlingAsync(openDocument);
		} else {
			withHandlingAsync(() => updatePartialDocument({
				document_x: props.document.document_x,
				document_y: props.document.document_y,
			}));
		}

		moving.value = null;
		documentElement.value.releasePointerCapture(event.pointerId);
	}
</script>
