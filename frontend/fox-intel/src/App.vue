<template>
	<template v-if="discordAccess.ready.value">
		<LandingPage v-if="!discordAccess.discordAuthenticated.value" @signIn="discordAccess.redirectToDiscordAuth()" />
		<InstanceSelector
			v-else-if="selectedInstanceId == null"
			@selectInstance="selectedInstanceId = $event"
			@signOut="discordAccess.signOut()"
		/>
		<InstanceView v-else :instanceId="selectedInstanceId" @exitInstance="selectedInstanceId = null" />
	</template>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import InstanceSelector from './instance/InstanceSelector.vue';
	import InstanceView from './instance/InstanceView.vue';
	import LandingPage from './LandingPage.vue';
	import { useDiscordAccess } from './lib/discord';

	const discordAccess = useDiscordAccess();
	const selectedInstanceId = ref<string | null>(null);
</script>
