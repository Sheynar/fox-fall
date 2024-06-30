<template>
	<div class="DirectionInput__container">
		<PrimeInputNumber
			ref="primeInputNumber"
			v-model="modelValue"
			@input="modelValue = $event.value"
			suffix="°"
			locale="en-UK"
			:allowEmpty="false"
			highlightOnFocus
			:minFractionDigits="0"
			:maxFractionDigits="1"
		/>
		<AngleInput
			class="Wind__information__item__angle-input"
			:value="wrapDegrees(-modelValue - viewport.rotation + 180)"
			@change="modelValue = wrapDegrees(-$event - viewport.rotation + 180)"
			:step="1"
		/>
	</div>
</template>

<style lang="scss">
	.DirectionInput__container {
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
</style>

<script setup lang="ts">
	import PrimeInputNumber from 'primevue/inputnumber';
	import { defineModel, nextTick, onMounted, ref } from 'vue';
	import AngleInput from 'vue-angle-input';
	import { injectViewport } from '@/contexts/viewport';
	import { wrapDegrees } from '@/lib/angle';

	const primeInputNumber = ref<InstanceType<typeof PrimeInputNumber>>(null!);

	const props = defineProps<{
		autoFocus?: boolean;
	}>();

	const viewport = injectViewport();

	const modelValue = defineModel({ type: Number, required: true });

	onMounted(() => {
		const inputElement = primeInputNumber.value.$el
			.children[0] as HTMLInputElement;

		if (props.autoFocus) {
			nextTick(() => {
				inputElement.select();
			});
		}
	});
</script>
