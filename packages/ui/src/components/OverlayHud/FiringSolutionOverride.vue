<template>
	<PrimeDialog
		append-to=".App__container"
		class="FiringSolutionOverride__dialog"
		v-model:visible="visible"
		:header="
			'Firing solution override: ' +
			getUnitLabel(artillery.unitMap.value, props.unitIdFrom) +
			' -> ' +
			getUnitLabel(artillery.unitMap.value, props.unitIdTo)
		"
		:style="{
			minWidth: '30rem',
			'--ui-scale': settings.unitSettingsScale,
			animation: 'none',
			transition: 'none',
		}"
		position="top"
		@pointerdown.stop
		@wheel.stop
		@show="customPosition = false"
		@dragend="customPosition = true"
	>
		<div
			class="FiringSolutionOverride__container"
			@pointerdown.stop
			@touchstart.stop
		>
			<div class="FiringSolutionOverride__table">
				<div class="FiringSolutionOverride__row">
					<span>Distance:</span>
					<DistanceInput
						ref="distanceInput"
						autofocus
						:model-value="vectorValue.distance"
						@update:model-value="vectorValue.distance = $event"
						@keydown.enter="azimuthInput?.inputElement?.select()"
					/>
				</div>
				<div class="FiringSolutionOverride__row">
					<span>Azimuth:</span>
					<DirectionInput
						ref="azimuthInput"
						:model-value="wrapDegrees(firingVectorWithWind.azimuth)"
						@update:model-value="vectorValue.azimuth = wrapDegrees($event)"
						@keydown.enter="submit()"
					/>
				</div>
				<template v-if="settings.showXYOffsets">
					<div class="FiringSolutionOverride__row">
						<span>X:</span>
						<DistanceInput
							:model-value="firingVectorWithWind.x"
							@update:model-value="vectorValue.x = $event"
						/>
					</div>
					<div class="FiringSolutionOverride__row">
						<span>Y:</span>
						<DistanceInput
							:model-value="firingVectorWithWind.y"
							@update:model-value="vectorValue.y = $event"
						/>
					</div>
				</template>
			</div>
			<div class="FiringSolutionOverride__actions">
				<PrimeButton
					class="FiringSolutionOverride__action"
					@click.stop="submit"
				>
					Submit
				</PrimeButton>
			</div>
		</div>
	</PrimeDialog>
</template>

<style lang="scss">
	.FiringSolutionOverride__dialog {
		font-size: calc(1em * var(--ui-scale) * 0.4);
		margin-bottom: calc(0.75rem + var(--toggle-button-size)) !important;
		margin-right: 0.75rem !important;

		.p-dialog-title {
			font-size: 2em;
		}
		.p-button-icon-only.p-button-rounded {
			height: 2em;
			width: 2em;
		}
	}

	.FiringSolutionOverride__container {
		display: flex;
		flex-direction: column;
		align-items: stretch;

		padding: 1em;
		gap: 0.5em;

		input {
			font-size: inherit;
		}

		.FiringSolutionOverride__table {
			display: grid;
			grid-template-columns: max-content 1fr;
			grid-auto-rows: min-content;
			align-items: center;

			gap: 0.5em;

			text-align: end;

			.FiringSolutionOverride__row {
				grid-column: 1 / -1;

				display: grid;
				grid-template-columns: subgrid;
				grid-template-rows: subgrid;
				align-items: inherit;
			}

			.FiringSolutionOverride__span {
				grid-column: 1 / -1;
				text-align: center;
			}

			.FiringSolutionOverride__select {
				text-align: initial;
			}
		}

		.FiringSolutionOverride__actions {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			font-size: 125%;

			gap: 0.5em;

			.FiringSolutionOverride__action {
				flex: 1 0 auto;

				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				padding: 0.75em;

				color: inherit;
				font-size: inherit;

				.Unit__icon {
					width: 1em;
					height: 1em;
					background: currentColor;
					mask: var(--icon-url) no-repeat center;
				}
			}
		}
	}
</style>

<script setup lang="ts">
	import PrimeButton from 'primevue/button';
	import PrimeDialog from 'primevue/dialog';
	import DirectionInput from '@/components/inputs/DirectionInput/DirectionInput.vue';
	import DistanceInput from '@/components/inputs/DistanceInput.vue';
	import { wrapDegrees } from '@/lib/angle';
	import { artillery, syncedRoom } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import {
		getUnitLabel,
		getUnitResolvedVector,
	} from '@/lib/unit';
	import { computed, ref, shallowRef, watch } from 'vue';

	const distanceInput = shallowRef<InstanceType<typeof DistanceInput>>(null!);
	const azimuthInput = shallowRef<InstanceType<typeof DirectionInput>>(null!);

	const visible = defineModel('visible', { type: Boolean, required: true });
	const customPosition = defineModel('customPosition', {
		type: Boolean,
		required: true,
	});

	const props = defineProps<{
		unitIdFrom: string;
		unitIdTo: string;
	}>();

	const resolvedVectorFrom = computed(() =>
		getUnitResolvedVector(artillery.unitMap.value, props.unitIdFrom)
	);
	const resolvedVectorTo = computed(() =>
		getUnitResolvedVector(artillery.unitMap.value, props.unitIdTo)
	);
	const firingVector = computed(() =>
		resolvedVectorFrom.value.getRelativeOffset(resolvedVectorTo.value)
	);

	const firingVectorWithWind = computed(() => firingVector.value.addVector(artillery.getWindOffset(props.unitIdFrom).scale(-1)));

	const vectorValue = ref(firingVectorWithWind.value.clone());
	watch(firingVectorWithWind, (value) => {
		vectorValue.value = value.clone();
	});

	const submit = () => {
		const unitTo = artillery.unitMap.value[props.unitIdTo];
		if (unitTo == null) return;
		unitTo.vector = unitTo.vector.addVector(
			vectorValue.value.addVector(firingVectorWithWind.value.scale(-1))
		);
		syncedRoom.updateUnit(unitTo.id);
		emit('updated');
		visible.value = false;
	};

	const emit = defineEmits<{
		(event: 'updated'): void;
	}>();
</script>
