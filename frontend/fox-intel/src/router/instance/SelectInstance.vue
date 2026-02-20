<template>
	<Teleport to="body">
		<div class="InstanceSelector__backdrop">
			<div class="InstanceSelector__container">
				<div class="InstanceSelector__header">
					Select intel instance
					<div class="InstanceSelector__header-separator" />
					<button @click="withHandlingAsync(() => signOut())">
						<i class="pi pi-sign-out" />
						Sign out
					</button>
					<button @click="withHandlingAsync(() => addInstance())">
						<i class="pi pi-plus" />
						Add new instance
					</button>
				</div>
				<div class="InstanceSelector__content" :class="{ 'InstanceSelector__content--loading': !ready }">
					<div class="InstanceSelector__instance" v-for="instance in instances" :key="instance.id">
						<div class="InstanceSelector__instance__buttons">
							<button @click="withHandlingAsync(() => editInstance(instance.id))" title="Edit instance">
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
} from '@packages/data/dist/intel';
import { onMounted, ref } from 'vue';
import { useDiscordAccess } from '@/lib/discord';
import { withHandlingAsync } from '@packages/frontend-libs/dist/error';
import router from '..';

const discordAccess = useDiscordAccess();

const instances = ref<IntelInstance[]>([]);
const ready = ref(false);

async function initialiseSelectInstance() {
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

async function addInstance() {
	await router.push({ name: 'instance:add' });
}

async function editInstance(instanceId: string) {
	await router.push({ name: 'instance:admin', params: { instanceId } });
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
	await router.push({ name: 'instance:view', params: { instanceId } });
}

async function signOut() {
	await discordAccess.signOut();
	await router.push({ name: 'home' });
}

onMounted(() => {
	withHandlingAsync(initialiseSelectInstance);
});
</script>