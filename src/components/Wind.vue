<template>
	<div
		class="Wind__container"
		@pointerdown.stop="open = !open"
		@touchstart.stop
	>
		<WindIcon
			class="Wind__indicator"
			:style="{
				'--wind-deg': wind.azimuth,
				'--viewport-deg': viewport.rotation,
			}"
		/>

		<PrimeDialog
			v-model:visible="open"
			header="Wind"
			position="bottomleft"
			@pointerdown.stop
			@wheel.stop
		>
			<div class="Wind__information">
				<div class="Wind__information__item">
					<label>Wind direction:</label>
					<DirectionInput v-model="wind.azimuth" />
				</div>
				<div class="Wind__information__item">
					<label>Wind distance:</label>
					<DistanceInput v-model="wind.distance" />
				</div>
				<PrimeButton
					class="Wind__information__button"
					label="Reset"
					@pointerdown.stop="emit('reset')"
				/>
			</div>
		</PrimeDialog>
	</div>
</template>

<style lang="scss">
	.Wind__container {
		cursor: pointer;
		user-select: none;
	}

	.Wind__indicator {
		height: 5em;
		width: 5em;

		border-radius: 50%;

		transform: rotate(
			calc((var(--wind-deg) + var(--viewport-deg)) * 1deg + 180deg)
		);
		transform-origin: 50% 50%;
	}

	.Wind__information {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 1rem;
		align-items: center;
	}

	.Wind__information__item {
		grid-column: auto / span 2;
		display: grid;
		grid-template-columns: subgrid;
		align-items: inherit;
	}

	.Wind__information__item__angle-input {
		margin: 0 !important;
	}

	.Wind__information__button {
		grid-column: auto / span 2;
	}
</style>

<script setup lang="ts">
	import PrimeButton from 'primevue/button';
	import PrimeDialog from 'primevue/dialog';
	import { ref } from 'vue';
	import WindIcon from '@/components/icons/WindIcon.vue';
	import DirectionInput from '@/components/inputs/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import { injectViewport } from '@/contexts/viewport';
	import { injectWind } from '@/contexts/wind';

	const emit = defineEmits<{
		(event: 'reset'): void;
	}>();

	const viewport = injectViewport();
	const wind = injectWind();

	const open = ref(false);
</script>
