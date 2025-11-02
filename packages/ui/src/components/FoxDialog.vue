<template>
	<Teleport :to="pinned ? 'body' : '.App__container'" v-if="visible || pinned">
		<div
			ref="containerElement"
			class="FoxDialog__container"
			:class="{
				'FoxDialog__container-rolled-up': rolledUp,
				'FoxDialog__container-move-mode': moveMode,
				MouseCapture: pinned,
			}"
			v-bind="$attrs"
			:style="{
				transform: positionOverride?.centerX || positionOverride?.centerY ? `translate(${positionOverride?.centerX ? '-50%' : '0'}, ${positionOverride?.centerY ? '-50%' : '0'})` : positionOverride ? 'none' : undefined,
				top: positionOverride?.top
					? `${positionOverride.top}px`
					: positionOverride
						? 'auto'
						: undefined,
				left: positionOverride?.left
					? `${positionOverride.left}px`
					: positionOverride
						? 'auto'
						: undefined,
				bottom: positionOverride?.bottom
					? `${positionOverride.bottom}px`
					: positionOverride
						? 'auto'
						: undefined,
				right: positionOverride?.right
					? `${positionOverride.right}px`
					: positionOverride
						? 'auto'
						: undefined,
			}"
			@pointerdown.stop
			@contextmenu.stop
			@wheel.stop
			@pointerup.stop.prevent="onPointerUp"
			@pointermove="onPointerMove"
		>
			<h1 class="FoxDialog__header">
				<slot name="header" />
				<span class="FoxDialog__header-actions" @doubleclick.stop>
					<slot name="header-actions" />
					<PrimeButton
						v-if="!props.disablePin"
						class="FoxDialog__header-action"
						:severity="pinned ? 'success' : 'secondary'"
						@pointerdown.stop="pinned = !pinned"
					>
						<i class="pi pi-thumbtack" />
					</PrimeButton>
					<PrimeButton
						v-if="!props.disableRollUp && !moveMode"
						class="FoxDialog__header-action"
						severity="secondary"
						@pointerdown.stop.prevent="rolledUp = !rolledUp"
					>
						<i
							class="pi"
							:class="{
								'pi-chevron-up': !rolledUp,
								'pi-chevron-down': rolledUp,
							}"
						/>
					</PrimeButton>
					<PrimeButton
						v-if="!props.disableMove && !rolledUp"
						class="FoxDialog__header-action"
						:severity="moveMode ? 'success' : 'secondary'"
						@pointerdown.stop="moveMode = !moveMode"
					>
						<i class="pi pi-arrows-alt" />
					</PrimeButton>
					<PrimeButton
						v-if="!pinned"
						class="FoxDialog__header-action"
						severity="secondary"
						@pointerdown.stop="visible = false"
					>
						<i class="pi pi-times" />
					</PrimeButton>
				</span>
			</h1>
			<div class="FoxDialog__body" v-if="!moveMode && !rolledUp">
				<slot />
			</div>
			<div class="FoxDialog__move-zones" v-if="moveMode">
				<template v-for="y in 3">
					<div
						v-for="x in 3"
						class="FoxDialog__move-zone"
						@pointerdown="
							onPointerDown($event, { x: x - 2, y: y - 2 } as SnapPosition)
						"
					></div>
				</template>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	@use '@/styles/constants' as constants;
	@use '@/styles/mixins/border' as border;

	@property --ui-scale {
		syntax: '<number>';
		initial-value: 1;
		inherits: false;
	}

	.FoxDialog__container {
		position: fixed;
		inset: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		grid-template-columns: auto;
		align-items: inherit;
		overflow: hidden;

		font-size: calc(1em * var(--ui-scale) * 0.6);
		margin: 0.75rem;
		margin-bottom: calc(0.75rem + var(--toggle-button-size, 0px));

		@include border.border-gradient();
		&:focus,
		&:focus-within {
			@include border.border-gradient-focused();
		}
		&:hover {
			@include border.border-gradient-hovered();
		}
		--_background: 100% 75% / 200% 200% no-repeat
			radial-gradient(canvas, #{constants.$dark}) !important;
		border-radius: 1.25em;
	}

	.FoxDialog__header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		@include border.border-gradient();

		border-width: 0 !important;
		border-bottom-width: calc(0.125em / 2) !important;
		border-top-left-radius: inherit;
		border-top-right-radius: inherit;

		margin: 0;
		padding: 0.5em;
		gap: 0.5em;

		font-size: 1.5em;
		user-select: none;
	}

	.FoxDialog__container:focus .FoxDialog__header,
	.FoxDialog__container:focus-within .FoxDialog__header {
		@include border.border-gradient-focused();
	}
	.FoxDialog__container:hover .FoxDialog__header {
		@include border.border-gradient-hovered();
	}

	.FoxDialog__header-actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
		cursor: pointer;

		.FoxDialog__header-action {
			font-size: inherit;
			--p-button-padding-x: 0.5em;
			--p-button-padding-y: 0.5em;
			.pi {
				font-size: inherit;
			}
		}
	}

	.FoxDialog__container-rolled-up {
		.FoxDialog__header {
			border-bottom-width: 0 !important;
			border-bottom-left-radius: inherit;
			border-bottom-right-radius: inherit;
		}

		.FoxDialog__body {
			display: none;
		}
	}

	.FoxDialog__body {
		position: relative;
		display: grid;
		grid-template-rows: auto;
		grid-template-columns: auto;
		align-items: inherit;
	}

	.FoxDialog__move-zones {
		min-width: 15rem;
		min-height: 15rem;
		aspect-ratio: 1;

		display: grid;
		grid-template-rows: repeat(3, minmax(0, 1fr));
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 2em;
		padding: 2em;
	}

	.FoxDialog__move-zone {
		border: 1px dashed white;
		cursor: grab;
	}
</style>

<script setup lang="ts">
	import { useEventListener } from '@vueuse/core';
	import PrimeButton from 'primevue/button';
	import { ref, shallowRef, watch } from 'vue';

	const props = defineProps<{
		persistPositionId?: string;
		disablePin?: boolean;
		disableRollUp?: boolean;
		disableMove?: boolean;
	}>();

	const containerElement = shallowRef<HTMLDivElement>(null!);
	const visible = defineModel('visible', { type: Boolean, required: true });
	const pinned = defineModel('pinned', { type: Boolean });
	const moveMode = defineModel('moveMode', { type: Boolean });
	const rolledUp = defineModel('rolledUp', { type: Boolean });

	const positionOverride = defineModel<
		| {
				top?: number;
				left?: number;
				bottom?: number;
				right?: number;
				centerX?: boolean;
				centerY?: boolean;
		  }
		| undefined
	>('positionOverride');

	type SnapPosition = { x: number; y: number };

	type MovingData = {
		startPosition: {
			top: number;
			left: number;
			bottom: number;
			right: number;
		};
		startSize: {
			width: number;
			height: number;
		};
		startEvent: PointerEvent;
		snapPosition: SnapPosition;
	};
	const moving = ref<null | MovingData>(null);

	useEventListener('keydown', (event) => {
		if (event.key === 'Escape' && !pinned.value) {
			visible.value = false;
		}
	});

	const onPointerDown = (event: PointerEvent, snapPosition: SnapPosition) => {
		event.stopPropagation();
		event.preventDefault();
		containerElement.value!.setPointerCapture(event.pointerId);
		const bounding = containerElement.value!.getBoundingClientRect();
		moving.value = {
			startPosition: {
				top: bounding.top,
				left: bounding.left,
				bottom: window.innerHeight - bounding.bottom,
				right: window.innerWidth - bounding.right,
			},
			startSize: {
				width: bounding.width,
				height: bounding.height,
			},
			startEvent: event,
			snapPosition,
		};
	};

	const onPointerUp = (event: PointerEvent) => {
		if (!moving.value) return;
		event.stopPropagation();
		event.preventDefault();
		containerElement.value!.releasePointerCapture(event.pointerId);
		moving.value = null;
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!moving.value) return;
		event.stopPropagation();
		event.preventDefault();

		const computedStyle = getComputedStyle(containerElement.value!);
		const newPositionOverride: typeof positionOverride.value = {
			top: undefined,
			left: undefined,
			bottom: undefined,
			right: undefined,
			centerX: undefined,
			centerY: undefined,
		};
		if (moving.value.snapPosition.y === -1) {
			const marginTop = Number(computedStyle.marginTop.replace('px', '')) || 0;
			// containerElement.value!.style.top = `${event.clientY - moving.value.startEvent.clientY + moving.value.startPosition.top - marginTop}px`;
			// containerElement.value!.style.bottom = 'auto';
			// containerElement.value!.style.removeProperty('--_translate-y');

			newPositionOverride.top =
				event.clientY -
				moving.value.startEvent.clientY +
				moving.value.startPosition.top -
				marginTop;
		}
		if (moving.value.snapPosition.y === 0) {
			const marginTop = Number(computedStyle.marginTop.replace('px', '')) || 0;
			// containerElement.value!.style.top = `${event.clientY - moving.value.startEvent.clientY + moving.value.startPosition.top - marginTop + moving.value.startSize.height / 2}px`;
			// containerElement.value!.style.bottom = 'auto';
			// containerElement.value!.style.setProperty('--_translate-y', `-50%`);

			newPositionOverride.top =
				event.clientY -
				moving.value.startEvent.clientY +
				moving.value.startPosition.top -
				marginTop +
				moving.value.startSize.height / 2;
			newPositionOverride.centerY = true;
		}
		if (moving.value.snapPosition.y === 1) {
			const marginBottom =
				Number(computedStyle.marginBottom.replace('px', '')) || 0;
			// containerElement.value!.style.bottom = `${moving.value.startEvent.clientY - event.clientY + moving.value.startPosition.bottom - marginBottom}px`;
			// containerElement.value!.style.top = 'auto';
			// containerElement.value!.style.removeProperty('--_translate-y');

			newPositionOverride.bottom =
				moving.value.startEvent.clientY -
				event.clientY +
				moving.value.startPosition.bottom -
				marginBottom;
		}

		if (moving.value.snapPosition.x === -1) {
			const marginLeft =
				Number(computedStyle.marginLeft.replace('px', '')) || 0;
			// containerElement.value!.style.left = `${event.clientX - moving.value.startEvent.clientX + moving.value.startPosition.left - marginLeft}px`;
			// containerElement.value!.style.right = 'auto';
			// containerElement.value!.style.removeProperty('--_translate-x');

			newPositionOverride.left =
				event.clientX -
				moving.value.startEvent.clientX +
				moving.value.startPosition.left -
				marginLeft;
		}
		if (moving.value.snapPosition.x === 0) {
			const marginLeft =
				Number(computedStyle.marginLeft.replace('px', '')) || 0;
			// containerElement.value!.style.left = `${event.clientX - moving.value.startEvent.clientX + moving.value.startPosition.left - marginLeft + moving.value.startSize.width / 2}px`;
			// containerElement.value!.style.right = 'auto';
			// containerElement.value!.style.setProperty('--_translate-x', `-50%`);

			newPositionOverride.left =
				event.clientX -
				moving.value.startEvent.clientX +
				moving.value.startPosition.left -
				marginLeft +
				moving.value.startSize.width / 2;
			newPositionOverride.centerX = true;
		}
		if (moving.value.snapPosition.x === 1) {
			const marginRight =
				Number(computedStyle.marginRight.replace('px', '')) || 0;
			// containerElement.value!.style.right = `${moving.value.startEvent.clientX - event.clientX + moving.value.startPosition.right - marginRight}px`;
			// containerElement.value!.style.left = 'auto';
			// containerElement.value!.style.removeProperty('--_translate-x');

			newPositionOverride.right =
				moving.value.startEvent.clientX -
				event.clientX +
				moving.value.startPosition.right -
				marginRight;
			newPositionOverride.centerX = false;
		}

		if (props.persistPositionId) {
			localStorage.setItem(
				`fox-dialog-position-${props.persistPositionId}`,
				JSON.stringify(newPositionOverride)
			);
		}
		positionOverride.value = newPositionOverride;
	};

	watch(
		() => [props.persistPositionId, pinned.value, visible.value],
		() => {
			if (props.persistPositionId) {
				const savedPosition = localStorage.getItem(
					`fox-dialog-position-${props.persistPositionId}`
				);
				if (savedPosition) {
					positionOverride.value = JSON.parse(savedPosition);
				}
			}
		},
		{ immediate: true }
	);
</script>
