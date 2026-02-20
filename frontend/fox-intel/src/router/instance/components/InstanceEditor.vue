<template>
	<Teleport to="body">
		<div class="InstanceEditor__backdrop">
			<div class="InstanceEditor__container">
				<div class="InstanceEditor__header">
					{{ props.instanceId ? 'Edit' : 'Create' }} intel instance
					{{ props.instanceId }}
					<button @click="emit('cancel')">Cancel</button>
				</div>
				<div class="InstanceEditor__content">
					<label>
						Instance ID
						<FoxText v-model="instanceName" />
					</label>
					<label>
						Shard
						<FoxSelect
							v-model="shard"
							:options="
								new Map(
									Object.entries(Shard).map(([key, value]) => [
										value,
										{ label: key },
									])
								)
							"
						/>
					</label>
					<label>
						Guild
						<FoxSelect
							v-if="guildOptions"
							v-model="guildId"
							:options="guildOptions"
							placeholder="Select a guild"
							:enable-search="true"
						/>
					</label>
					<label v-if="guildAdminRoleOptions" :key="guildId">
						Admin roles
						<FoxSelect
							v-model="guildAdminRoleIds"
							:options="guildAdminRoleOptions"
							placeholder="Select a role"
							:enable-search="true"
							:enable-multiple="true"
						/>
					</label>
					<label v-if="guildRoleOptions" :key="guildId">
						Write roles
						<FoxSelect
							v-model="guildWriteRoleIds"
							:options="guildRoleOptions"
							placeholder="Select a role"
							:enable-search="true"
							:enable-multiple="true"
						/>
					</label>
					<label v-if="guildRoleOptions" :key="guildId">
						Read roles
						<FoxSelect
							v-model="guildReadRoleIds"
							:options="guildRoleOptions"
							placeholder="Select a role"
							:enable-search="true"
							:enable-multiple="true"
						/>
					</label>
					<button
						@click="() => withHandlingAsync(submit)"
						:disabled="
							!guildOptions || !guildRoleOptions || !instanceName || !guildId
						"
					>
						Submit
					</button>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.InstanceEditor__backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);

		display: flex;
	}

	.InstanceEditor__container {
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

	.InstanceEditor__header {
		grid-area: header;
		padding: 0.5em;
		font-size: 1.5em;
		font-weight: bold;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.InstanceEditor__content {
		grid-area: content;
		padding: 0.5em;

		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
</style>

<script setup lang="ts">
	import type {
		DiscordGuild,
		DiscordGuildMember,
		DiscordRole,
	} from '@packages/data/dist/discord';
	import FoxSelect from '@packages/frontend-libs/dist/inputs/FoxSelect.vue';
	import FoxText from '@packages/frontend-libs/dist/inputs/FoxText.vue';
	import { onMounted, ref, watch } from 'vue';
	import { useDiscordAccess } from '@/lib/discord';
	import { withHandlingAsync } from '@packages/frontend-libs/dist/error';
	import { Shard } from '@packages/foxhole-api';

	const props = defineProps<{
		instanceId?: string;
		shard?: Shard;
		guildId?: string;
		guildAdminRoleIds?: string[];
		guildWriteRoleIds?: string[];
		guildReadRoleIds?: string[];
	}>();

	const emit = defineEmits<{
		(e: 'submit', instanceId: string): void;
		(e: 'cancel'): void;
	}>();

	const discordAccess = useDiscordAccess();

	const instanceName = ref<string>(props.instanceId ?? '');
	const shard = ref<Shard | null>(props.shard ?? null);
	const guildId = ref<string | undefined>(props.guildId ?? undefined);
	const guildAdminRoleIds = ref<string[]>(props.guildAdminRoleIds ?? []);
	const guildWriteRoleIds = ref<string[]>(props.guildWriteRoleIds ?? []);
	const guildReadRoleIds = ref<string[]>(props.guildReadRoleIds ?? []);

	type Options = Map<
		string,
		{
			label: string;
			icon?: any;
			order?: number | undefined;
		}
	>;

	const guildOptions = ref<Options | null>(null);
	async function initialiseGuildOptions() {
		guildOptions.value = null;
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
			headers: discordAccess.getFetchHeaders(),
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
	}
	onMounted(() => {
		withHandlingAsync(initialiseGuildOptions);
	});

	async function getGuildMember() {
		const response = await fetch(
			`/api/v1/discord/guild/${guildId.value}/member`,
			{
				method: 'GET',
				headers: discordAccess.getFetchHeaders(),
			}
		);
		if (!response.ok) {
			throw new Error('Failed to get guild member: ' + (await response.text()));
		}
		const data: DiscordGuildMember = await response.json();
		return data;
	}

	async function getGuildRoles() {
		const response = await fetch(
			`/api/v1/discord/guild/${guildId.value}/roles`,
			{
				method: 'GET',
				headers: discordAccess.getFetchHeaders(),
			}
		);
		if (!response.ok) {
			if (
				response.status === 404 &&
				confirm(
					'Unable to access guild roles. Would you like to add the bot to the guild?'
				)
			) {
				discordAccess.redirectToDiscordBotAuth();
				return [];
			}
			throw new Error('Failed to get guild roles: ' + (await response.text()));
		}
		const data: DiscordRole[] = await response.json();
		return data;
	}

	const guildRoleOptions = ref<Options | null>(null);
	const guildAdminRoleOptions = ref<Options | null>(null);
	let guildMemberPromise:
		| Promise<[DiscordGuildMember, DiscordRole[]]>
		| undefined = undefined;
	async function initialiseGuildRoleOptions() {
		guildRoleOptions.value = null;
		guildAdminRoleOptions.value = null;
		if (!guildId.value) return;
		const localPromise = (guildMemberPromise = Promise.all([
			getGuildMember(),
			getGuildRoles(),
		]));
		const [guildMember, guildRoles] = await localPromise;
		if (localPromise !== guildMemberPromise) return;
		if (guildMember.roles.length === 0) {
			alert(
				'You do not have any roles in this guild. Please add a role to your account and try again. It may take a few minutes for the changes to take effect.'
			);
			return;
		}
		const newGuildRoleOptions = new Map<
			string,
			{
				label: string;
				icon?: any;
				order?: number | undefined;
			}
		>();
		const newGuildAdminRoleOptions = new Map<
			string,
			{
				label: string;
				icon?: any;
				order?: number | undefined;
			}
		>();

		const rolesById = new Map<string, DiscordRole>();
		for (const [index, role] of guildRoles.entries()) {
			rolesById.set(role.id, role);
			newGuildRoleOptions.set(role.id, {
				label: role.name,
				order: index,
			});
			if (guildMember.roles.includes(role.id)) {
				newGuildAdminRoleOptions.set(role.id, {
					label: role.name,
					order: index,
				});
			}
		}
		guildRoleOptions.value = newGuildRoleOptions;
		guildAdminRoleOptions.value = newGuildAdminRoleOptions;
	}

	watch(
		guildId,
		() => {
			withHandlingAsync(initialiseGuildRoleOptions);
		},
		{ immediate: true }
	);

	async function submit() {
		if (!guildId.value) {
			throw new Error('Guild ID is required');
		}
		if (!shard.value) {
			throw new Error('Shard is required');
		}
		if (guildAdminRoleIds.value.length === 0) {
			throw new Error('At least one admin role is required');
		}

		const response = await fetch(
			props.instanceId
				? `/api/v1/instance/${encodeURIComponent(props.instanceId)}`
				: '/api/v1/instance',
			{
				method: 'POST',
				body: JSON.stringify({
					id: instanceName.value,
					shard: shard.value,
					discordGuildId: guildId.value,
					discordGuildRoles: [
						...guildAdminRoleIds.value.map((roleId) => ({
							accessType: 'admin',
							roleId,
						})),
						...guildWriteRoleIds.value.map((roleId) => ({
							accessType: 'write',
							roleId,
						})),
						...guildReadRoleIds.value.map((roleId) => ({
							accessType: 'read',
							roleId,
						})),
					] as {
						accessType: string;
						roleId: string;
					}[],
				}),
				headers: discordAccess.getFetchHeaders(),
			}
		);
		if (!response.ok) {
			throw new Error('Failed to submit instance: ' + (await response.text()));
		}
		// const data: { sessionId: string; issuedAt: number; expiresAt: number } =
		// 	await response.json();
		emit('submit', instanceName.value);
	}
</script>
