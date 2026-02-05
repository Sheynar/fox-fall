<template>
	<PositionedElement :layer="1" :x="props.icon.icon_x" :y="props.icon.icon_y" cancel-viewport-rotation
		cancel-viewport-zoom>
		<div class="IconInstance__container" :class="{ 'IconInstance__container-disabled': !markerDisabled }">
			<img ref="iconElement" class="IconInstance__icon"
				:style="{ filter: `url(#team-icon-${props.icon.icon_team}) url(#outline-white)` }"
				:src="MAP_ICONS_BY_NAME[props.icon.icon_type]" :alt="props.icon.icon_type" tabindex="0"
				@pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp" />
			<button class="IconInstance__delete-button" @pointerdown.stop="withHandlingAsync(onDelete)"><i
					class="pa pi pi-trash"></i></button>
		</div>
	</PositionedElement>
</template>

<style lang="scss">
.IconInstance__container {
	position: relative;
	anchor-scope: --icon;

	&-disabled {
		pointer-events: none;
	}

	.IconInstance__delete-button {
		position: absolute;
    top: anchor(--icon top);
    right: anchor(--icon right);
    transform: translate(50%, -50%);
    margin: 0;

    cursor: pointer;
    font-size: 0.5em;
	}

	&:not(:focus-within) {
		.IconInstance__delete-button {
			opacity: 0;
			pointer-events: none;
		}
	}
}

.IconInstance__icon {
	anchor-name: --icon;
	width: 2em;
	height: 2em;
	cursor: move;
	transform: translate(-50%, -50%);
	filter: url(#outline-white);
}
</style>

<script setup lang="ts">
import { injectIntelInstance } from '@/lib/intel-instance';
import { Vector } from '@packages/data/dist/artillery/vector';
import type { IntelIcon } from '@packages/data/dist/intel';
import { MAP_ICONS_BY_NAME } from '@packages/frontend-libs/dist/assets/images/map-icons';
import { withHandlingAsync } from '@packages/frontend-libs/dist/error';
import PositionedElement from '@packages/frontend-libs/dist/viewport/PositionedElement.vue';
import { injectViewport } from '@packages/frontend-libs/dist/viewport/viewport';
import { ref, shallowRef } from 'vue';
import { markerDisabled } from '@/lib/globals';
import { updatePartialIcon } from './helpers';

const iconElement = shallowRef<HTMLImageElement | null>(null);

const props = defineProps<{
	icon: IntelIcon;
}>();

const intelInstance = injectIntelInstance();

const viewport = injectViewport();
type MovingData = {
	startEvent: PointerEvent;
	startIconPosition: Vector;
};
const moving = ref<null | MovingData>(null);
function onPointerDown(event: PointerEvent) {
	if (event.button !== 0 || iconElement.value == null) return;
	event.preventDefault();
	event.stopPropagation();

	iconElement.value.focus();

	moving.value = {
		startEvent: event,
		startIconPosition: Vector.fromCartesianVector({
			x: props.icon.icon_x,
			y: props.icon.icon_y,
		}),
	};
	iconElement.value.setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent) {
	if (moving.value == null || iconElement.value == null) return;
	event.preventDefault();
	event.stopPropagation();

	const distanceMoved = Vector.fromCartesianVector({
		x: event.clientX - moving.value.startEvent.clientX,
		y: event.clientY - moving.value.startEvent.clientY,
	});

	props.icon.icon_x = Math.round(
		moving.value.startIconPosition.x +
		distanceMoved.x / viewport.value.resolvedZoom
	);
	props.icon.icon_y = Math.round(
		moving.value.startIconPosition.y +
		distanceMoved.y / viewport.value.resolvedZoom
	);
}

function onPointerUp(event: PointerEvent) {
	if (moving.value == null || iconElement.value == null) return;
	event.preventDefault();
	event.stopPropagation();

	withHandlingAsync(() =>
		updatePartialIcon(intelInstance, props.icon.id, {
			icon_x: props.icon.icon_x,
			icon_y: props.icon.icon_y,
		})
	);

	moving.value = null;
	iconElement.value.releasePointerCapture(event.pointerId);
}

async function onDelete() {
	const response = await intelInstance.authenticatedFetch(`/api/v1/instance/${encodeURIComponent(intelInstance.instanceId.value)}/icon/id/${encodeURIComponent(props.icon.id)}`, {
		method: 'DELETE',
	});
	if (!response.ok) {
		throw new Error('Failed to delete icon. ' + (await response.text()));
	}
}
</script>