<template>
	<div class="Units__container">
		<UnitProvider
			v-for="unitId in Object.keys(artillery.sharedState.currentState.value.unitMap)"
			:key="unitId"
			:unit="artillery.sharedState.currentState.value.unitMap[unitId]"
		>
			<UnitComponent
				@create-child="artillery.addUnit($event, undefined, undefined, unitId)"
				@updated="syncedRoom.updateUnit(unitId)"
				@remove="artillery.removeUnit(unitId)"
				@set-unit-source="artillery.setUnitSource(unitId, $event)"
				@update-wind="artillery.editWind(unitId, $event)"
			/>
		</UnitProvider>
		<UnitLink
			v-for="unitId in Object.keys(artillery.sharedState.currentState.value.unitMap).filter(
				(unitId) => artillery.sharedState.currentState.value.unitMap[unitId].parentId != null
			)"
			:key="unitId"
			:unit-id-from="artillery.sharedState.currentState.value.unitMap[unitId].parentId!"
			:unit-id-to="unitId"
		/>
	</div>
</template>

<style lang="scss">
	.Units__container {
		display: contents;
	}
</style>

<script setup lang="ts">
	import UnitComponent from '@/components/Viewport/Units/Unit.vue';
	import UnitLink from '@/components/Viewport/UnitLink.vue';
	import UnitProvider from '@/contexts/unit/UnitProvider.vue';
	import { artillery, syncedRoom } from '@/lib/globals';
</script>
