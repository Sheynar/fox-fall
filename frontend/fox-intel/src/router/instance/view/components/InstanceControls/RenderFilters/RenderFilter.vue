<template>
	<label class="RenderFilter__container">
		<input type="checkbox" v-model="props.filterState" @change="emit('update:filterState', props.filterState)" />
		{{ description }}
	</label>
</template>

<style lang="scss">
.RenderFilter__container {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 0.5em;
	cursor: pointer;
}
</style>

<script setup lang="ts">
const props = defineProps<{
	description: string;
	filterState: boolean;
}>();

const emit = defineEmits<{
	(e: 'update:filterState', filterState: boolean): void;
}>();
</script>