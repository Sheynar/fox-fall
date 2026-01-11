<template>
	<template v-if="discordAccess.ready.value">
		<InstanceSelector
			v-if="selectedInstanceId == null"
			@selectInstance="selectedInstanceId = $event"
		/>
		<InstanceView v-else :instanceId="selectedInstanceId" />
	</template>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import InstanceSelector from './instance/InstanceSelector.vue';
	import InstanceView from './instance/InstanceView.vue';
	import { useDiscordAccess } from './lib/discord';

	const discordAccess = useDiscordAccess();
	const selectedInstanceId = ref<string | null>(null);
</script>
