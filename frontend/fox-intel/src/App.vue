<template>
	<template v-if="discordAccess.ready.value">
		<RouterView />
	</template>
</template>

<script setup lang="ts">
	import { useDiscordAccess } from './lib/discord';

	const discordAccess = useDiscordAccess();
</script>
