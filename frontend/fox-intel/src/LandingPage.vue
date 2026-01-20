<template>
	<div class="LandingPage__container">
		<h1 class="LandingPage__title">FoxIntel</h1>
		<div class="LandingPage__body">
			<p class="LandingPage__description">
				Annotate your map with intel securely linked to your Discord server.
				<br />
				Draw freehand, paste screenshots of your in-game map, create documents with markdown content and image
				attachments.
				<br />
				All syncing in real-time with the other members of your Discord server.
			<p class="LandingPage__disclaimer">
				* Please note you will need to install a bot on your Discord server so you can limit access to users with
				particular
				roles.
			</p>
			</p>
			<button @click="emit('signIn')">Sign In</button>
		</div>
	</div>
</template>

<style lang="scss">
.LandingPage__container {
	height: 100%;
	width: 100%;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.LandingPage__title {
	margin-top: 2em;
}

.LandingPage__body {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: start;
}

.LandingPage__disclaimer {
	font-size: 0.8em;
}
</style>

<script setup lang="ts">
const emit = defineEmits<{
	(e: 'signIn'): void;
}>();
</script>