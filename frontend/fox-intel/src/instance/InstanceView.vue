<template>
	<div
		class="Instance__container"
		:class="{
			Instance__marker: !markerDisabled,
			Instance__moving: moving != null,
		}"
		tabindex="-1"
		ref="containerElement"
		@touchstart.prevent
		@pointerdown.stop="
			containerElement?.focus();
			contextMenuPosition = null;
		"
		@contextmenu.prevent="($event) => withHandling(() => onContextMenu($event))"
		@paste="($event) => withHandling(() => onPaste($event))"
	>
		<canvas ref="canvasElement" :width="width" :height="height" tabindex="0" />

		<Viewport>
			<DocumentInstance
				v-for="document in documents"
				:key="document.id"
				:document="document"
			/>

			<ImagePaste
				v-if="addingImage != null"
				v-model:position="addingImage.position"
				v-model:size="addingImage.size"
				v-model:opacity="addingImage.opacity"
				:image="addingImage.image"
				@delete="addingImage = null"
				@submit="($event) => withHandling(() => onAddingImageSubmit($event))"
			/>

			<PositionedElement
				v-if="contextMenuPosition != null"
				:layer="1"
				:x="contextMenuPosition.x"
				:y="contextMenuPosition.y"
				cancel-viewport-rotation
				cancel-viewport-zoom
			>
				<ContextRadial
					@submit="
						($event) => withHandlingAsync(() => onContextMenuSubmit($event))
					"
					@cancel="() => (contextMenuPosition = null)"
				/>
			</PositionedElement>
		</Viewport>

		<InstanceControls class="Instance__instance-controls" @pointerdown.stop @contextmenu.stop @exitInstance="emit('exitInstance')" />

		<svg>
			<defs>
				<filter id="outline-black">
					<feMorphology
						in="SourceGraphic"
						result="DILATED"
						operator="dilate"
						radius="2"
					/>
					<feColorMatrix
						in="DILATED"
						result="OUTLINED"
						type="matrix"
						values="
						-1 0  0  0 0
						0  -1 0  0 0
						0  0  -1 0 0
						0  0  0  1 0
					"
					/>

					<feMerge>
						<feMergeNode in="OUTLINED" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<filter id="outline-white">
					<feMorphology
						in="SourceGraphic"
						result="DILATED"
						operator="dilate"
						radius="2"
					/>
					<feColorMatrix
						in="DILATED"
						result="OUTLINED"
						type="matrix"
						values="
						1 1 1 0 0
						1 1 1 0 0
						1 1 1 0 0
						0 0 0 1 0
					"
					/>

					<feMerge>
						<feMergeNode in="OUTLINED" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<filter id="outline-black-inset">
					<feFlood flood-color="black" result="inside-color" />
					<feComposite in2="SourceAlpha" operator="in" result="inside-stroke" />
					<!--fill-area-->
					<feMorphology in="SourceAlpha" operator="erode" radius="2" />
					<feComposite in="SourceGraphic" operator="in" result="fill-area" />

					<feMerge>
						<feMergeNode in="inside-stroke" />
						<feMergeNode in="fill-area" />
					</feMerge>
				</filter>
				<filter id="outline-white-inset">
					<feFlood flood-color="white" result="inside-color" />
					<feComposite in2="SourceAlpha" operator="in" result="inside-stroke" />
					<!--fill-area-->
					<feMorphology in="SourceAlpha" operator="erode" radius="2" />
					<feComposite in="SourceGraphic" operator="in" result="fill-area" />

					<feMerge>
						<feMergeNode in="inside-stroke" />
						<feMergeNode in="fill-area" />
					</feMerge>
				</filter>
				<filter v-for="team of Object.values(Team)" :id="`team-icon-${team}`">
					<feColorMatrix
						in="SourceGraphic"
						type="matrix"
						:values="`
							${TEAM_COLOR[team].r / 255} 0 0 0 0
              0 ${TEAM_COLOR[team].g / 255} 0 0 0
              0 0 ${TEAM_COLOR[team].b / 255} 0 0
              0 0 0 1 0
						`"
					/>
				</filter>
			</defs>
		</svg>
	</div>
</template>

<style lang="scss">
	.Instance__container {
		contain: content;
		position: fixed;
		left: 0;
		top: 0;
		width: 100dvw;
		height: 100dvh;

		color: var(--color-primary);
		background-color: var(--color-primary-contrast);
		outline: none;

		will-change: transform;
		transform: translateZ(0);

		cursor: grab;
		&.Instance__marker {
			cursor: crosshair;
		}
		&.Instance__moving {
			cursor: grabbing;
		}
	}

	.Instance__instance-controls {
		position: absolute;
		top: 0;
		left: 0;
		cursor: initial;

		&.InstanceControls__container-active {
			height: 100%;
		}
	}
</style>

<script setup lang="ts">
	import { MAP_SIZE } from '@packages/data/dist/artillery/map';
	import { Vector } from '@packages/data/dist/artillery/vector';
	import { MapSource } from '@packages/frontend-libs/dist/assets/images/hex-maps';
	import {
		withHandling,
		withHandlingAsync,
	} from '@packages/frontend-libs/dist/error';
	import {
		provideViewport,
		Viewport as ViewportClass,
	} from '@packages/frontend-libs/dist/viewport/viewport';
	import Viewport from '@packages/frontend-libs/dist/viewport/Viewport.vue';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import { useViewportControl } from '@packages/frontend-libs/dist/viewport/viewport-control';
	import {
		computed,
		nextTick,
		onMounted,
		onScopeDispose,
		onUnmounted,
		ref,
	} from 'vue';
	import {
		elementFilters,
		markerSize,
		markerColor,
		markerType,
		markerDisabled,
	} from '../lib/globals';
	import { AddType, ContextRadial } from './context-menu';
	import { useDocuments, DocumentInstance } from './document';
	import InstanceControls from './InstanceControls/InstanceControls.vue';
	import { useHexMap } from './canvas/hex-map';
	import { useMarker } from './canvas/marker';
	import { useElementBounding } from '@vueuse/core';
	import { provideIntelInstance, useIntelInstance } from '@/lib/intel-instance';
	import { requestFile } from '@/lib/file';
	import ImagePaste from './canvas/ImagePaste';
	import { Team, TEAM_COLOR } from '@packages/foxhole-api';

	const props = defineProps<{
		instanceId: string;
	}>();

	const emit = defineEmits<{
		(e: 'exitInstance'): void;
	}>();

	const intelInstance = useIntelInstance({
		intelInstanceId: computed(() => props.instanceId),
	});
	provideIntelInstance(intelInstance);

	const containerElement = ref<HTMLDivElement | null>(null);
	const canvasElement = ref<HTMLCanvasElement | null>(null);

	const { width, height } = useElementBounding(containerElement);

	const viewport = ref(
		new ViewportClass(
			Vector.fromCartesianVector({
				x: 0,
				y: 0,
			}),
			0,
			1
		)
	);

	const { addDocument, documents } = useDocuments({
		intelInstance,
	});

	provideViewport(viewport);

	const {
		backdropCanvas: hexMapCanvasElement,
		foregroundCanvas: hexMapForegroundCanvasElement,
		start: startHexMap,
		stop: stopHexMap,
	} = useHexMap({
		instanceId: computed(() => props.instanceId),
		mapSource: MapSource.ImprovedMapModRustardKnightEdit,
		position: computed(() => viewport.value.position),
		zoom: computed(() => viewport.value.resolvedZoom),
		width,
		height,
		elementFilters,
	});

	const {
		start: startMarker,
		stop: stopMarker,
		canvasElement: markerCanvasElement,
		storageContext: markerStorageContext,
		canvasStorage: markerCanvasStorage,
		activeMarker,
		ready: markerReady,
	} = useMarker({
		intelInstance,
		eventElement: canvasElement,
		zoom: computed(() => viewport.value.resolvedZoom),
		position: computed(() => viewport.value.position),
		width,
		height,
		maxWidth: MAP_SIZE.width,
		maxHeight: MAP_SIZE.height,
		markerType,
		markerColor,
		markerSize,
		markerDisabled: computed(
			() => markerDisabled.value || moving.value != null
		),
	});

	const { moving } = useViewportControl({
		containerElement,
		viewport,
		lockRotate: ref(true),
		disableMouseControls: computed(
			() => activeMarker.value != null || !markerReady.value
		),
	});

	const context = computed(() => canvasElement.value?.getContext('2d'));

	let scopeDestroyed = false;
	onScopeDispose(() => {
		scopeDestroyed = true;
	});

	let frameRequest: ReturnType<typeof requestAnimationFrame> | null = null;
	const cancelFrame = () => {
		if (frameRequest != null) {
			cancelAnimationFrame(frameRequest);
			frameRequest = null;
		}
	};
	const requestFrame = () => {
		cancelFrame();
		frameRequest = requestAnimationFrame(() => withHandling(() => render()));
	};
	const render = () => {
		cancelFrame();
		if (scopeDestroyed) return;
		try {
			if (!context.value) return;
			context.value.clearRect(0, 0, width.value, height.value);
			context.value.drawImage(
				hexMapCanvasElement,
				0,
				0,
				width.value,
				height.value
			);
			context.value.drawImage(
				markerCanvasElement,
				0,
				0,
				width.value,
				height.value
			);
			context.value.drawImage(
				hexMapForegroundCanvasElement,
				0,
				0,
				width.value,
				height.value
			);
		} finally {
			requestFrame();
		}
	};

	onMounted(() => {
		if (!canvasElement.value) return;
		startHexMap();
		startMarker();
		requestFrame();
	});

	onUnmounted(() => {
		stopHexMap();
		stopMarker();
		cancelFrame();
	});

	const addingImage = ref<{
		image: ImageBitmap;
		position: Vector;
		size: Vector;
		opacity: number;
	} | null>(null);

	const contextMenuPosition = ref<Vector | null>(null);
	const onContextMenu = (event: MouseEvent) => {
		contextMenuPosition.value = viewport.value.toWorldPosition(
			Vector.fromCartesianVector({
				x: event.clientX - viewport.value.viewportSize.x / 2,
				y: event.clientY - viewport.value.viewportSize.y / 2,
			})
		);
	};
	const onContextMenuSubmit = async (event: {
		value: AddType;
		path: any[];
	}) => {
		const position = contextMenuPosition.value!.clone();
		contextMenuPosition.value = null;

		if (event.value === AddType.Document) {
			const documentId = await addDocument(
				position.x,
				position.y,
				1,
				'New Document',
				''
			);
			nextTick(() => {
				const element = document.querySelector(
					`div[data-document-id="${documentId}"]`
				);
				if (element == null) return;
				(element as HTMLElement).dispatchEvent(
					new Event('openDocument', {
						bubbles: false,
						cancelable: true,
					})
				);
			});
		} else if (event.value === AddType.Image) {
			if (
				addingImage.value != null &&
				!confirm(
					'Are you sure you want to overwrite the current pasting image?'
				)
			) {
				return;
			}

			const blob = await requestFile('image/*');
			const image = await createImageBitmap(blob);

			const imageSize = Vector.fromCartesianVector({
				x: image.width,
				y: image.height,
			});

			addingImage.value = {
				image,
				position: position.addVector(imageSize.scale(-0.5)),
				size: imageSize,
				opacity: 0.5,
			};
		}
	};

	async function onPaste(event: ClipboardEvent) {
		event.preventDefault();
		event.stopPropagation();

		const clipboardContents = await navigator.clipboard.read();
		for (const clipboardItem of clipboardContents) {
			for (const type of clipboardItem.types) {
				if (type.startsWith('image/')) {
					if (
						addingImage.value != null &&
						!confirm(
							'Are you sure you want to overwrite the current pasting image?'
						)
					)
						return;
					const blob = await clipboardItem.getType(type);
					const image = await createImageBitmap(blob);
					const imageSize = Vector.fromCartesianVector({
						x: image.width,
						y: image.height,
					});
					addingImage.value = {
						image,
						position: viewport.value
							.toWorldPosition(Vector.zero())
							.addVector(imageSize.scale(-0.5)),
						size: imageSize,
						opacity: 0.5,
					};
				}
			}
		}
	}

	const onAddingImageSubmit = (imageCanvas: HTMLCanvasElement | OffscreenCanvas) => {
		if (addingImage.value == null) return;
		markerStorageContext.drawImage(
			imageCanvas,
			addingImage.value.position.x + MAP_SIZE.width / 2,
			addingImage.value.position.y + MAP_SIZE.height / 2,
			addingImage.value.size.x,
			addingImage.value.size.y
		);
		markerCanvasStorage.saveArea(
			addingImage.value.position.x + MAP_SIZE.width / 2,
			addingImage.value.position.y + MAP_SIZE.height / 2,
			addingImage.value.position.x +
				addingImage.value.size.x +
				MAP_SIZE.width / 2,
			addingImage.value.position.y +
				addingImage.value.size.y +
				MAP_SIZE.height / 2
		);
		addingImage.value = null;
	};
</script>
