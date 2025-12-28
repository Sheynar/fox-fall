<template>
	<Teleport to="body">
		<div class="InstanceCreator__backdrop">
			<div class="InstanceCreator__container">
				<div class="InstanceCreator__header">
					Create new intel instance
					<button @click="emit('cancel')">Cancel</button>
				</div>
				<div class="InstanceCreator__content">
					<FoxText v-model="instanceName" placeholder="Enter instance name" />
					<FoxSelect
						v-model="guildId"
						:options="guildOptions"
						placeholder="Select a guild"
						:enable-search="true"
						:disabled="!ready"
					/>
					<button
						@click="() => withHandlingAsync(createInstance)"
						:disabled="!ready || !instanceName || !guildId"
					>
						Create
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.InstanceCreator__backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);

		display: flex;
	}

	.InstanceCreator__container {
		width: 90%;
		height: 90%;
		margin: auto;

		background-color: var(--color-primary-contrast);
		border-radius: 0.5em;
		overflow: hidden;

		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		grid-template-columns: 1fr;
		grid-template-areas:
			'header'
			'content';
	}

	.InstanceCreator__header {
		grid-area: header;
		padding: 0.5em;
		font-size: 1.5em;
		font-weight: bold;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.InstanceCreator__content {
		grid-area: content;
		padding: 0.5em;

		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
</style>

<script setup lang="ts">
	import type { DiscordGuild } from '@packages/data/dist/discord';
	import FoxSelect from '@packages/frontend-libs/dist/inputs/FoxSelect.vue';
	import FoxText from '@packages/frontend-libs/dist/inputs/FoxText.vue';
	import { onMounted, ref } from 'vue';
	import { useDiscordAccess } from '@/lib/discord';
	import { withHandlingAsync } from '@packages/frontend-libs/dist/error';

	const emit = defineEmits<{
		(e: 'createInstance', instanceId: string): void;
		(e: 'cancel'): void;
	}>();

	const discordAccess = useDiscordAccess();

	const guildOptions = ref(
		new Map<
			string,
			{
				label: string;
				icon?: any;
				order?: number | undefined;
			}
		>()
	);
	const ready = ref(false);
	async function initialiseGuildOptions() {
		ready.value = false;
		try {
			const newGuildOptions = new Map<
				string,
				{
					label: string;
					icon?: any;
					order?: number | undefined;
				}
			>();

			const response = await fetch('/api/v1/discord/guild', {
				method: 'GET',
				headers: {
					'X-Discord-Access-Code': discordAccess.code.value,
					'X-Discord-Redirect-Uri': discordAccess.redirectUri.value,
				},
			});
			if (!response.ok) {
				throw new Error('Failed to get guilds: ' + (await response.text()));
			}
			const data: DiscordGuild[] = await response.json();
			for (const [index, guild] of data.entries()) {
				newGuildOptions.set(guild.id, {
					label: guild.name,
					order: index,
				});
			}
			guildOptions.value = newGuildOptions;
		} finally {
			ready.value = true;
		}
	}
	onMounted(() => {
		withHandlingAsync(initialiseGuildOptions);
	});

	async function createInstance() {
		const response = await fetch('/api/v1/instance', {
			method: 'POST',
			body: JSON.stringify({
				id: instanceName.value,
				discordGuildId: guildId.value,
				discordGuildRoles: [],
			}),
		});
		if (!response.ok) {
			throw new Error('Failed to create instance: ' + (await response.text()));
		}
		// const data: { sessionId: string; issuedAt: number; expiresAt: number } =
		// 	await response.json();
		emit('createInstance', instanceName.value);
	}

	const instanceName = ref<string>('');
	const guildId = ref<string | undefined>(undefined);
</script>
