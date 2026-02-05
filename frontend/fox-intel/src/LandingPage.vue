<template>
	<div class="LandingPage__container" :class="{ 'LandingPage__container-hidden': dismissPatreonModal }">
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
			<button @click="signIn()">Sign In</button>
		</div>
	</div>

	<div class="LandingPage__patreon-modal-backdrop" v-if="dismissPatreonModal" @click="dismissPatreonModal = null">
		<div class="LandingPage__patreon-modal">
			<div class="LandingPage__patreon-modal-inner" @click.stop>
				<p>Please consider <a target="_blank"
						href="https://www.patreon.com/cw/KaoSDlanor?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink">supporting
						me on Patreon</a>. I will soon need to rent a larger server to handle hosting the application</p>
				<button @click="dismissPatreonModal()">Just sign me in already</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
@keyframes modal-enter {
	0% {
		transform-origin: center center;
		transform: scale(0);
		opacity: 0;
	}

	100% {
		transform-origin: center center;
		transform: scale(1);
		opacity: 1;
	}
}

.LandingPage__container {
	height: 100%;
	width: 100%;

	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	transform-origin: center center;
	transform: scale(1);
	opacity: 1;
	transition: transform 0.25s ease-in-out, opacity 0.25s ease-in-out;

	&.LandingPage__container-hidden {
		transform: scale(1.5);
		opacity: 0;
		pointer-events: none;
	}
}

.LandingPage__title {
	margin-top: 2em;
}

.LandingPage__body {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: start;
	margin: 0 3em;
}

.LandingPage__disclaimer {
	font-size: 0.8em;
}

.LandingPage__patreon-modal-backdrop {
	position: fixed;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.5);
}

.LandingPage__patreon-modal {
	position: absolute;
	inset: 0;
	animation: modal-enter .25s ease-in-out forwards;
}

.LandingPage__patreon-modal-inner {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	border: 1px solid var(--color-selected);
	border-radius: 1em;

	display: flex;
	flex-direction: column;
	background-color: var(--color-primary-contrast);
	color: var(--color-primary);
	padding: 1em;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
	(e: 'signIn'): void;
}>();

const dismissPatreonModal = ref<(() => void) | null>(null);
async function signIn() {
	await new Promise<void>((resolve) => {
		dismissPatreonModal.value = resolve;
	});
	emit('signIn');
}
</script>