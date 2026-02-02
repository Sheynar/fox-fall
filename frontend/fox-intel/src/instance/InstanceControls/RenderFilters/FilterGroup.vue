<template>
	<div class="FilterGroup__container" :class="{ 'FilterGroup__container-open': open }">
		<i class="FilterGroup__open-icon pi" :class="{ 'pi-chevron-down': open, 'pi-chevron-right': !open }" />
		<div class="FilterGroup__title" @click="open = !open">
			<input v-if="props.state != null" type="checkbox" :checked="props.state === FilterGroupState.AllEnabled"
				:indeterminate="props.state === FilterGroupState.Mixed"
				@change="emit('update:state', ($event.target as HTMLInputElement).checked ? FilterGroupState.AllEnabled : ($event.target as HTMLInputElement).checked ? FilterGroupState.AllEnabled : FilterGroupState.AllDisabled)"
				@click.stop />
			<slot name="title" />
		</div>
		<div class="FilterGroup__content" v-if="open">
			<slot />
		</div>
	</div>
</template>

<style lang="scss">
.FilterGroup__container {
	display: grid;
	grid-template-columns: max-content 1fr;
	grid-auto-rows: auto;
	grid-template-areas: 'open-icon title';
	gap: 0.5em;
	user-select: none;
	cursor: pointer;

	&-open {
		grid-template-areas:
			'open-icon title'
			'.         content';
	}
}

.FilterGroup__open-icon {
	grid-area: open-icon;
	font-size: 0.75em;
	justify-self: center;
	align-self: center;
}

.FilterGroup__title {
	grid-area: title;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 0.5em;
}

.FilterGroup__content {
	grid-area: content;
	display: flex;
	flex-direction: column;
	gap: 0.5em;
}
</style>

<script setup lang="ts">
import { FilterGroupState } from './types';

const props = defineProps<{
	state?: FilterGroupState;
}>();

const emit = defineEmits<{
	(e: 'update:state', state: FilterGroupState): void;
}>();

const open = defineModel<boolean>('open', { required: false });
</script>