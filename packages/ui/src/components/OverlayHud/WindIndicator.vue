<template>
	<WindIcon
		class="Wind__indicator"
		:style="{
			'--wind-deg': artillery.sharedState.currentState.value.wind.azimuth,
			'--viewport-deg': artillery.viewport.value.rotation,
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
			calc((var(--wind-deg) + var(--viewport-deg)) * 1deg - 90deg)
		);
		transform-origin: 50% 50%;
	}
</style>

<script setup lang="ts">
	import { ref } from 'vue';
	import WindIcon from '@/components/icons/WindIcon.vue';
	import { artillery } from '@/lib/globals';

	const open = ref(false);
</script>
