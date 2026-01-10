<template>
	<PositionedElement :x="props.position.x" :y="props.position.y" :layer="2">
		<div
			class="ImagePaste__container"
			:class="{
				'ImagePaste__aspect-ratio-locked': lockAspectRatio,
				'ImagePaste__position-locked': lockPosition,
			}"
			:style="{
				height: props.size.y + 'px',
				width: props.size.x + 'px',
			}"
		>
			<canvas
				ref="canvas"
				class="ImagePaste__canvas"
				:class="{ 'ImagePaste__canvas-grabbing': moving != null }"
				@pointerdown="onPositionControlPointerDown"
				@pointermove="onPositionControlPointerMove"
				@pointerup="onPositionControlPointerUp"
			/>
			<div class="ImagePaste__actions">
				<button @pointerdown.stop="emit('delete')">
					<i class="pi pi-trash" />
				</button>
				<button
					@pointerdown.stop="lockAspectRatio = !lockAspectRatio"
					:class="{ 'ImagePaste__lock-aspect-ratio-locked': lockAspectRatio }"
				>
					<i class="pi pi-lock" /> Aspect ratio
				</button>
				<button
					@pointerdown.stop="lockPosition = !lockPosition"
					:class="{ 'ImagePaste__lock-position-locked': lockPosition }"
				>
					<i class="pi pi-lock" /> Position
				</button>
				<button @pointerdown.stop="emit('submit', canvas!)">
					<i class="pi pi-check" />
				</button>
			</div>
			<div class="ImagePaste__size-controls">
				<a
					class="ImagePaste__size-control-button top-left"
					@pointerdown="onSizeControlPointerDown($event, 'top', 'left')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
				<a
					class="ImagePaste__size-control-button top-center"
					@pointerdown="onSizeControlPointerDown($event, 'top', 'center')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
				<a
					class="ImagePaste__size-control-button top-right"
					@pointerdown="onSizeControlPointerDown($event, 'top', 'right')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
				<a
					class="ImagePaste__size-control-button center-left"
					@pointerdown="onSizeControlPointerDown($event, 'center', 'left')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
				<a
					class="ImagePaste__size-control-button center-right"
					@pointerdown="onSizeControlPointerDown($event, 'center', 'right')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
				<a
					class="ImagePaste__size-control-button bottom-left"
					@pointerdown="onSizeControlPointerDown($event, 'bottom', 'left')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
				<a
					class="ImagePaste__size-control-button bottom-center"
					@pointerdown="onSizeControlPointerDown($event, 'bottom', 'center')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
				<a
					class="ImagePaste__size-control-button bottom-right"
					@pointerdown="onSizeControlPointerDown($event, 'bottom', 'right')"
					@pointermove="onSizeControlPointerMove($event)"
					@pointerup="onSizeControlPointerUp($event)"
				/>
			</div>
			<div class="ImagePaste__opacity-controls" @pointerdown.stop>
				<Slider
					class="ImagePaste__opacity-slider"
					:model-value="props.opacity"
					@update:model-value="emit('update:opacity', $event as number)"
					:min="0"
					:max="1"
					:step="0.01"
				/>
			</div>
		</div>
	</PositionedElement>
</template>

<style lang="scss">
	.ImagePaste__container {
		position: relative;
	}

	.ImagePaste__canvas {
		pointer-events: initial;

		.ImagePaste__container.ImagePaste__position-locked & {
			pointer-events: none;
		}
		cursor: grab;
		&.ImagePaste__canvas-grabbing {
			cursor: grabbing;
		}
	}

	.ImagePaste__actions {
		position: absolute;
		top: 0;
		right: 0;

		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1em;
		padding: 1em;

		pointer-events: none;
		> * {
			pointer-events: initial;
		}

		.ImagePaste__lock-aspect-ratio-locked,
		.ImagePaste__lock-position-locked {
			background: var(--color-selected);
		}
	}

	.ImagePaste__size-controls {
		display: contents;
		pointer-events: none;

		.ImagePaste__size-control-button {
			position: absolute;
			inset: auto;

			transform: translate(-50%, -50%);
			transition: transform 0.1s ease-in-out;
			width: 1em;
			height: 1em;
			background-color: var(--color-selected);
			border-radius: 0.5em;
			cursor: pointer;
			pointer-events: initial;

			&.top-left {
				top: 0;
				left: 0;
				cursor: nwse-resize;
			}
			&.top-center {
				top: 0;
				left: 50%;
				cursor: ns-resize;
			}
			&.top-right {
				top: 0;
				left: 100%;
				cursor: nesw-resize;
			}
			&.center-left {
				top: 50%;
				left: 0;
				cursor: ew-resize;
			}
			&.center-right {
				top: 50%;
				left: 100%;
				cursor: ew-resize;
			}
			&.bottom-left {
				top: 100%;
				left: 0;
				cursor: nesw-resize;
			}
			&.bottom-center {
				top: 100%;
				left: 50%;
				cursor: ns-resize;
			}
			&.bottom-right {
				top: 100%;
				left: 100%;
				cursor: nwse-resize;
			}
		}
	}

	.ImagePaste__opacity-controls {
		position: absolute;
		top: calc(100% + 1em);
		left: 0;
		right: 0;
		width: 100%;

		pointer-events: initial;

		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto;
	}
</style>

<script setup lang="ts">
	import { Vector } from '@packages/data/dist/artillery/vector';
	import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
	import { injectViewport } from '@packages/frontend-libs/dist/viewport/viewport';
	import Slider from 'primevue/slider';
	import { ref, shallowRef, watch } from 'vue';
	import type { Props, Emits } from './types';

	const canvas = shallowRef<HTMLCanvasElement | null>(null);

	const props = defineProps<Props>();
	const emit = defineEmits<Emits>();

	const viewport = injectViewport();
	const lockAspectRatio = ref(true);
	const lockPosition = ref(false);

	watch(
		[() => canvas.value, () => props.size, () => props.opacity],
		([newCanvas, newSize, newOpacity]) => {
			if (!newCanvas) return;
			newCanvas.width = newSize.x;
			newCanvas.height = newSize.y;
			const context = newCanvas.getContext('2d');
			if (!context) return;
			context.globalAlpha = newOpacity;
			context.drawImage(props.image, 0, 0, newSize.x, newSize.y);
			context.globalAlpha = 1;
		}
	);

	const moving = ref<{
		startEvent: PointerEvent;
		startPosition: Vector;
	} | null>(null);
	const onPositionControlPointerDown = (event: PointerEvent) => {
		if (lockPosition.value) return;
		event.preventDefault();
		event.stopPropagation();
		(event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
		moving.value = {
			startEvent: event,
			startPosition: props.position.clone(),
		};

		onPositionControlPointerMove(event);
	};
	const onPositionControlPointerMove = (event: PointerEvent) => {
		if (!moving.value) return;
		event.preventDefault();
		event.stopPropagation();
		const distanceMoved = Vector.fromCartesianVector({
			x:
				(event.clientX - moving.value.startEvent.clientX) /
				viewport.value.resolvedZoom,
			y:
				(event.clientY - moving.value.startEvent.clientY) /
				viewport.value.resolvedZoom,
		});

		emit(
			'update:position',
			Vector.fromCartesianVector({
				x: Math.round(moving.value.startPosition.x + distanceMoved.x),
				y: Math.round(moving.value.startPosition.y + distanceMoved.y),
			})
		);
	};
	const onPositionControlPointerUp = (event: PointerEvent) => {
		if (!moving.value) return;
		event.preventDefault();
		event.stopPropagation();
		(event.target as HTMLCanvasElement).releasePointerCapture(event.pointerId);
		moving.value = null;
		emit('submit:position');
	};

	type VerticalPosition = 'top' | 'bottom' | 'center';
	type HorizontalPosition = 'left' | 'right' | 'center';

	const resizing = ref<{
		startEvent: PointerEvent;
		startPosition: Vector;
		startSize: Vector;
		verticalAnchor: VerticalPosition;
		horizontalAnchor: HorizontalPosition;
	} | null>(null);
	const onSizeControlPointerDown = (
		event: PointerEvent,
		verticalAnchor: VerticalPosition,
		horizontalAnchor: HorizontalPosition
	) => {
		event.preventDefault();
		event.stopPropagation();
		(event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
		resizing.value = {
			startEvent: event,
			startPosition: props.position.clone(),
			startSize: props.size.clone(),
			verticalAnchor,
			horizontalAnchor,
		};
		onSizeControlPointerMove(event);
	};
	const onSizeControlPointerMove = (event: PointerEvent) => {
		if (!resizing.value) return;
		event.preventDefault();
		event.stopPropagation();
		let distanceMoved = Vector.fromCartesianVector({
			x:
				(event.clientX - resizing.value.startEvent.clientX) /
				viewport.value.resolvedZoom,
			y:
				(event.clientY - resizing.value.startEvent.clientY) /
				viewport.value.resolvedZoom,
		});

		let newSize = Vector.fromCartesianVector({
			x: resizing.value.startSize.x,
			y: resizing.value.startSize.y,
		});

		if (resizing.value.verticalAnchor === 'top') {
			newSize.y = Math.round(newSize.y - distanceMoved.y);
		} else if (resizing.value.verticalAnchor === 'bottom') {
			newSize.y = Math.round(newSize.y + distanceMoved.y);
		}

		if (resizing.value.horizontalAnchor === 'left') {
			newSize.x = Math.round(newSize.x - distanceMoved.x);
		} else if (resizing.value.horizontalAnchor === 'right') {
			newSize.x = Math.round(newSize.x + distanceMoved.x);
		}

		if (lockAspectRatio.value) {
			const averageSize =
				(newSize.x / resizing.value.startSize.x +
					newSize.y / resizing.value.startSize.y) /
				2;
			newSize = Vector.fromCartesianVector({
				x: Math.round(resizing.value.startSize.x * averageSize),
				y: Math.round(resizing.value.startSize.y * averageSize),
			});
		}

		newSize.x = Math.max(newSize.x, 0);
		newSize.y = Math.max(newSize.y, 0);

		const newPosition = Vector.fromCartesianVector({
			x: resizing.value.startPosition.x,
			y: resizing.value.startPosition.y,
		});
		if (lockPosition.value || resizing.value.verticalAnchor === 'center') {
			newPosition.y = Math.round(
				resizing.value.startPosition.y +
					resizing.value.startSize.y / 2 -
					newSize.y / 2
			);
		} else if (resizing.value.verticalAnchor === 'top') {
			newPosition.y = Math.round(
				resizing.value.startPosition.y + resizing.value.startSize.y - newSize.y
			);
		}
		if (lockPosition.value || resizing.value.horizontalAnchor === 'center') {
			newPosition.x = Math.round(
				resizing.value.startPosition.x +
					resizing.value.startSize.x / 2 -
					newSize.x / 2
			);
		} else if (resizing.value.horizontalAnchor === 'left') {
			newPosition.x = Math.round(
				resizing.value.startPosition.x + resizing.value.startSize.x - newSize.x
			);
		}

		if (
			newPosition.x !== props.position.x ||
			newPosition.y !== props.position.y
		) {
			emit('update:position', newPosition);
		}
		if (newSize.x !== props.size.x || newSize.y !== props.size.y) {
			emit('update:size', newSize);
		}
	};
	const onSizeControlPointerUp = (event: PointerEvent) => {
		if (!resizing.value) return;
		event.preventDefault();
		event.stopPropagation();
		(event.target as HTMLCanvasElement).releasePointerCapture(event.pointerId);
		resizing.value = null;
		emit('submit:position');
		emit('submit:size');
	};
</script>
