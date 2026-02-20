<template>
	<InstanceEditor
		@submit="submit"
		@cancel="cancel"
	/>
</template>

<script setup lang="ts">
import InstanceEditor from './components/InstanceEditor.vue';
import router from '..';

async function submit(_instanceId: string): Promise<void> {
	router.push({ name: 'instance:select' });
}

async function cancel(): Promise<void> {
	router.push({ name: 'instance:select' });
}
</script>