<template>
	<PositionedElement
		:layer="1"
		:x="props.document.document_x"
		:y="props.document.document_y"
		cancel-viewport-rotation
		cancel-viewport-zoom
	>
		<div
			ref="documentElement"
			class="DocumentInstance__container"
			:class="{ 'DocumentInstance__container-disabled': !markerDisabled }"
			:data-document-id="props.document.id"
			:style="{ '--_document-ui-size': String(props.document.ui_size) }"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
			@openDocument="editing = true"
			:title="props.document.document_name"
		>
			<StickyNoteIcon class="DocumentInstance__icon" />
		</div>
	</PositionedElement>

	<DocumentEditor
		:key="props.document.id"
		v-if="editing"
		:document="props.document"
		@close="editing = false"
	/>
</template>

<style lang="scss">
	.DocumentInstance__container {
		width: calc(3rem * var(--_document-ui-size));
		height: calc(3rem * var(--_document-ui-size));
		color: var(--color-primary-contrast);
		transform: translate(-50%, -50%);
		transform-origin: center center;
		overflow: hidden;

		cursor: pointer;
		&:hover {
			opacity: 1;
		}

		&-disabled {
			pointer-events: none;
		}
	}

	.DocumentInstance__icon {
		width: 100%;
		height: 100%;
	}
</style>

<script setup lang="ts">
	import { Vector } from '@packages/data/dist/artillery/vector';
	import type { BasicIntelDocument } from '@packages/data/dist/intel.js';
	import {
		withHandlingAsync,
	} from '@packages/frontend-libs/dist/error';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import { injectViewport } from '@packages/frontend-libs/dist/viewport/viewport';
	import StickyNoteIcon from '@packages/frontend-libs/dist/icons/StickyNoteIcon.vue';
	import { ref, shallowRef } from 'vue';
	import { markerDisabled } from '@/lib/globals';
	import { injectIntelInstance } from '@/lib/intel-instance';
	import DocumentEditor from './DocumentEditor.vue';
	import { updatePartialDocument } from './helpers';

	const documentElement = shallowRef<HTMLDivElement | null>(null);

	const props = defineProps<{
		document: BasicIntelDocument;
	}>();

	const intelInstance = injectIntelInstance();

	const editing = ref<boolean>(false);

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
			props.document.document_x = Math.round(
				moving.value.startDocumentPosition.x +
					distanceMoved.x / viewport.value.resolvedZoom
			);
			props.document.document_y = Math.round(
				moving.value.startDocumentPosition.y +
					distanceMoved.y / viewport.value.resolvedZoom
			);
		}
	}

	function onPointerUp(event: PointerEvent) {
		if (moving.value == null || documentElement.value == null) return;
		event.preventDefault();
		event.stopPropagation();

		if (!moving.value.moveActivated) {
			editing.value = true;
		} else {
			withHandlingAsync(() =>
				updatePartialDocument(intelInstance, props.document.id, {
					document_x: props.document.document_x,
					document_y: props.document.document_y,
				})
			);
		}

		moving.value = null;
		documentElement.value.releasePointerCapture(event.pointerId);
	}
</script>
