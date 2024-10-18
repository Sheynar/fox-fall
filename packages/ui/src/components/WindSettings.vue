<template>
	<PrimeDialog
		v-model:visible="visible"
		header="Wind"
		position="bottomleft"
		@pointerdown.stop
		@wheel.stop
		:style="{ animation: 'none', transition: 'none' }"
	>
		<div class="Wind__information">
			<div class="Wind__information__item">
				<label>Wind direction:</label>
				<DirectionInput v-model="wind.azimuth" @update:model-value="emit('update')" auto-focus />
			</div>
			<div class="Wind__information__item">
				<label>Wind distance:</label>
				<DistanceInput v-model="wind.distance" @update:model-value="emit('update')" />
			</div>
			<PrimeButton
				class="Wind__information__button"
				label="Reset"
				@pointerdown.stop="emit('reset')"
			/>
		</div>
	</PrimeDialog>
</template>

<style lang="scss">
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
	import DirectionInput from '@/components/inputs/DirectionInput/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import { injectWind } from '@/contexts/wind';

	const visible = defineModel('visible', { type: Boolean, required: true });

	const wind = injectWind();

	const emit = defineEmits<{
		(event: 'reset'): void;
		(event: 'update'): void;
	}>();
</script>
