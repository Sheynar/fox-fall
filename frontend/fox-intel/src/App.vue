<template>
	<template v-if="ready">
		<InstanceSelector
			v-if="selectedInstanceId == null"
			@selectInstance="selectedInstanceId = $event"
		/>
		<InstanceView v-else :instanceId="selectedInstanceId" />
	</template>
</template>

<style lang="scss">
	.App__container {
		contain: content;
		position: fixed;
		left: 0;
		top: 0;
		width: 100dvw;
		height: 100dvh;
		cursor: initial;

		color: var(--color-primary);
		outline: none;

		will-change: transform;
		transform: translateZ(0);

		&:not(.App__transparent) {
			background-color: var(--color-primary-contrast);
		}

		&.App__hidden {
			filter: opacity(0);
			pointer-events: none;
		}

		&.App__screenshot {
			cursor: none;
		}

		&.App__calibrating,
		&.App__screenshot {
			opacity: 0;
			pointer-events: none;
		}
	}

	.App__hexMapCanvas {
		pointer-events: none;
	}

	.App__markerCanvas {
		pointer-events: initial;
	}

	.App__hexMapCanvas,
	.App__markerCanvas {
		position: fixed;
		inset: 0;
		width: 100dvw;
		height: 100dvh;
	}
</style>

<script setup lang="ts">
	import { withHandlingAsync } from '@packages/frontend-libs/dist/error';
	import { onMounted, ref } from 'vue';
	import InstanceSelector from './instance/InstanceSelector.vue';
	import InstanceView from './instance/InstanceView.vue';
	import { useDiscordAccess } from './lib/discord';

	const discordAccess = useDiscordAccess();
	const ready = ref(false);
	const selectedInstanceId = ref<string | null>(null);

	async function initialise() {
		const response = await fetch('/api/v1/discord/access-token', {
			method: 'GET',
			headers: {
				'X-Discord-Access-Code': discordAccess.code,
				'X-Discord-Redirect-Uri': discordAccess.redirectUri,
			},
		});
		if (!response.ok) {
			discordAccess.redirectToDiscordAuth();
		} else {
			ready.value = true;
		}
	}

	onMounted(() => {
		withHandlingAsync(initialise);
	});
</script>
