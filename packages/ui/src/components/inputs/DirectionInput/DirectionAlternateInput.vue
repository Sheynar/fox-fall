<template>
	<CompassIcon
		ref="compassIcon"
		class="DirectionAlternateInput__compass"
		:model-value="modelValue"
		@touchstart.prevent.stop
	/>
</template>

<style lang="scss">
	.DirectionAlternateInput__compass {
		width: 10em;
		height: 10em;
	}
</style>

<script setup lang="ts">
	import CompassIcon from '@/components/icons/CompassIcon.vue';
	import { toDegrees, wrapDegrees } from '@/lib/angle';
	import { useEventListener } from '@vueuse/core';
	import { computed, defineModel, shallowRef } from 'vue';

	const modelValue = defineModel({ type: Number, required: true });

	const compassIcon = shallowRef<InstanceType<typeof CompassIcon>>(null!);
	const compassEl = computed(() => compassIcon.value?.$el as Element);

	let dragging = false;

	const updateAngle = (event: PointerEvent) => {
		const bounds = compassEl.value.getBoundingClientRect();
		const position = {
			x: event.clientX - bounds.left - bounds.width / 2,
			y: event.clientY - bounds.top - bounds.height / 2,
		};

		modelValue.value = wrapDegrees(toDegrees(Math.atan2(position.y, position.x)) + 90);
	};

	useEventListener(compassEl, 'pointerdown', (event: PointerEvent) => {
		event.stopPropagation();
		event.preventDefault();

		compassEl.value.setPointerCapture(event.pointerId);
		dragging = true;
		updateAngle(event);
	});

	useEventListener(compassEl, 'pointermove', (event: PointerEvent) => {
		if (dragging) {
			event.stopPropagation();
			event.preventDefault();
			updateAngle(event);
		}
	});

	useEventListener(compassEl, 'pointerup', (event: PointerEvent) => {
		event.stopPropagation();
		event.preventDefault();

		compassEl.value.releasePointerCapture(event.pointerId);
		dragging = false;
	});
</script>
