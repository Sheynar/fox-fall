<template>
	<Teleport to="body" v-if="!addingInstance">
		<div class="InstanceSelector__backdrop">
			<div class="InstanceSelector__container">
				<div class="InstanceSelector__header">
					Select intel instance
					<div class="InstanceSelector__header-separator" />
					<button @click="emit('signOut')">
						<i class="pi pi-sign-out" />
						Sign out
					</button>
					<button @click="addingInstance = true">
						<i class="pi pi-plus" />
						Add new instance
					</button>
				</div>
				<div class="InstanceSelector__content" :class="{ 'InstanceSelector__content--loading': !ready }">
					<div class="InstanceSelector__instance" v-for="instance in instances" :key="instance.id">
						<div class="InstanceSelector__instance__buttons">
							<button @click="withHandlingAsync(() => editInstance(instance))" title="Edit instance">
								<i class="pi pi-pencil" />
							</button>
							<button @click="withHandlingAsync(() => deleteInstance(instance))" title="Delete instance">
								<i class="pi pi-trash" />
							</button>
							<button class="InstanceSelector__open-instance-button" @click="withHandlingAsync(() => selectInstance(instance.id))" title="Open instance">
								<i class="pi pi-arrow-right" />
							</button>
						</div>
						{{ instance.id }}
					</div>
				</div>
			</div>
		</div>
	</Teleport>
	<InstanceEditor v-if="addingInstance" @submit="emit('selectInstance', $event)" @cancel="addingInstance = false" />
	<InstanceEditor v-if="editingInstance" :instance-id="editingInstance.instance.id"
		:shard="editingInstance.instance.shard" :guild-id="editingInstance.instance.discord_guild_id" :guild-admin-role-ids="editingInstance.discordPermissions
				.filter((role) => role.access_type === 'admin')
				.map((role) => role.role_id)
			" :guild-write-role-ids="editingInstance.discordPermissions
				.filter((role) => role.access_type === 'write')
				.map((role) => role.role_id)
			" :guild-read-role-ids="editingInstance.discordPermissions
				.filter((role) => role.access_type === 'read')
				.map((role) => role.role_id)
			" @submit="editingInstance = null" @cancel="editingInstance = null" />
</template>

<style lang="scss">
.InstanceSelector__backdrop {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);

	display: flex;
}

.InstanceSelector__container {
	max-width: 90%;
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

.InstanceSelector__header {
	grid-area: header;
	padding: 0.5em;
	font-size: 1.5em;
	font-weight: bold;

	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: start;
	gap: 0.5em;

	> .InstanceSelector__header-separator {
		margin: auto;
	}
}

.InstanceSelector__content {
	grid-area: content;

	display: grid;
	grid-template-columns: max-content 1fr;
	grid-auto-rows: min-content;
	padding: 0.5em;
	gap: 0.5em;
	overflow-y: auto;

	.InstanceSelector__instance {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: subgrid;
		align-items: center;
    font-weight: bold;

		.InstanceSelector__instance__buttons {
			display: flex;
			flex-direction: row;
			gap: 0.5em;
			font-size: 0.75em;

			.InstanceSelector__open-instance-button {
				background: var(--color-selected);
				color: var(--color-primary);
			}
		}
	}

	&.InstanceSelector__content--loading {
		position: relative;

		&::after {
			content: 'Loading...';
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 1.5em;
			font-weight: bold;
			color: var(--color-primary);
			z-index: 1;
			background: rgba(0, 0, 0, 0.5);
		}
	}
}
</style>

<script setup lang="ts">
import type {
	IntelInstance,
	IntelInstanceDiscordPermissions,
} from '@packages/data/dist/intel';
import { onMounted, ref } from 'vue';
import { useDiscordAccess } from '@/lib/discord';
import InstanceEditor from './InstanceEditor.vue';
import { withHandlingAsync } from '@packages/frontend-libs/dist/error';

const emit = defineEmits<{
	(e: 'selectInstance', instanceId: string): void;
	(e: 'signOut'): void;
}>();

const discordAccess = useDiscordAccess();

const instances = ref<IntelInstance[]>([]);
const ready = ref(false);
const addingInstance = ref(false);
const editingInstance = ref<{
	instance: IntelInstance;
	discordPermissions: IntelInstanceDiscordPermissions[];
} | null>(null);

async function initialise() {
	ready.value = false;
	try {
		const response = await fetch('/api/v1/instance', {
			method: 'GET',
			headers: discordAccess.getFetchHeaders(),
		});

		if (!response.ok) {
			throw new Error('Failed to get instances: ' + (await response.text()));
		}

		instances.value = await response.json();
	} finally {
		ready.value = true;
	}
}

async function editInstance(instance: IntelInstance) {
	const response = await fetch(
		`/api/v1/instance/${encodeURIComponent(instance.id)}/permissions`,
		{
			method: 'GET',
			headers: discordAccess.getFetchHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error('Failed to get permissions: ' + (await response.text()));
	}
	const discordPermissions: IntelInstanceDiscordPermissions[] =
		await response.json();
	editingInstance.value = { instance, discordPermissions };
}

async function deleteInstance(instance: IntelInstance) {
	if (!confirm(`Are you sure you want to delete instance ${instance.id}?`)) return;
	const response = await fetch(
		`/api/v1/instance/${encodeURIComponent(instance.id)}`,
		{
			method: 'DELETE',
			headers: discordAccess.getFetchHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error('Failed to delete instance: ' + (await response.text()));
	}
	instances.value = instances.value.filter((i) => i.id !== instance.id);
}

async function selectInstance(instanceId: string) {
	const response = await fetch(
		`/api/v1/instance/${encodeURIComponent(instanceId)}`,
		{
			method: 'GET',
			headers: discordAccess.getFetchHeaders(),
		}
	);
	if (!response.ok) {
		throw new Error('Failed to select instance: ' + (await response.text()));
	}
	emit('selectInstance', instanceId);
}

onMounted(() => {
	withHandlingAsync(initialise);
});
</script>