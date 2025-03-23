<template>
	<div class="FiringArcs__container">
		<FiringArc
			v-for="firingArc in firingArcList"
			:key="firingArc.to.id"
			:unit-id-from="firingArc.from.id"
			:unit-id-to="firingArc.to.id"
			:hide-label="firingArc.hideLabel"
			:is-primary="firingArc.isPrimary"
		/>
	</div>
</template>

<style lang="scss">
	.FiringArcs__container {
		position: absolute;
		left: 0;
		top: 0;
		width: 0;
		height: 0;

		overflow: visible;

		pointer-events: none;
	}
</style>

<script setup lang="ts">
	import { artillery } from '@/lib/globals';
	import { settings } from '@/lib/settings';
	import { UnitType, type Unit } from '@/lib/unit';
	import {
		useFocusedUnitIds,
		usePrimaryUnitsByType,
		useUnitsByType,
	} from '@/mixins/focused-units';
	import { computed } from 'vue';
	import FiringArc from './FiringArc.vue';

	const unitsByType = useUnitsByType();
	const focusedUnitIds = useFocusedUnitIds();
	const primaryUnitsByType = usePrimaryUnitsByType();

	type FiringArc = {
		from: Unit;
		to: Unit;
		hideLabel: boolean;
		isPrimary: boolean;
	};

	const firingArcList = computed(() => {
		const output: FiringArc[] = [];

		for (const targetUnit of unitsByType.value[UnitType.Target]) {
			for (const artilleryUnit of unitsByType.value[UnitType.Artillery]) {
				const isFocused =
					focusedUnitIds.value.includes(artilleryUnit.id) ||
					focusedUnitIds.value.includes(targetUnit.id);
				const isPrimary =
					primaryUnitsByType.value[UnitType.Artillery]?.id ===
						artilleryUnit.id &&
					primaryUnitsByType.value[UnitType.Target]?.id === targetUnit.id;

				if (!isFocused && !isPrimary) continue;
				const firingArc: FiringArc = {
					from: artilleryUnit,
					to: targetUnit,
					hideLabel:
						settings.value.firingArcOpacity <= 0 ||
						artillery.draggingUnits.value.has(artilleryUnit.id) ||
						artillery.draggingUnits.value.has(targetUnit.id) ||
						!isFocused,
					isPrimary,
				};

				if (firingArc.isPrimary || !firingArc.hideLabel) output.push(firingArc);
			}
		}

		return output;
	});
</script>
