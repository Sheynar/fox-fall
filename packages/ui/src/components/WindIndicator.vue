<template>
	<WindIcon
		class="Wind__indicator"
		:style="{
			'--wind-deg': wind.azimuth,
			'--viewport-deg': viewport.rotation,
		}"
	/>
	<div
		class="Wind__container"
		@pointerdown.stop="open = !open"
		@touchstart.stop
	>
	</div>
</template>

<style lang="scss">
	.Wind__indicator {
		height: 2em;
		width: 2em;

		border-radius: 50%;

		transform: rotate(
			calc((var(--wind-deg) + var(--viewport-deg)) * 1deg + 180deg)
		);
		transform-origin: 50% 50%;
	}
</style>

<script setup lang="ts">
	import { ref } from 'vue';
	import WindIcon from '@/components/icons/WindIcon.vue';
	import { injectViewport } from '@/contexts/viewport';
	import { injectWind } from '@/contexts/wind';

	const emit = defineEmits<{
		(event: 'reset'): void;
	}>();

	const viewport = injectViewport();
	const wind = injectWind();

	const open = ref(false);
</script>
