<template>
	<InstanceEditor
		v-if="instance"
		:instance-id="props.instanceId"
		:shard="instance?.shard"
		:guild-id="instance?.discord_guild_id"
		:guild-admin-role-ids="instancePermissions.filter((permission) => permission.access_type === 'admin').map((permission) => permission.role_id)"
		:guild-write-role-ids="instancePermissions.filter((permission) => permission.access_type === 'write').map((permission) => permission.role_id)"
		:guild-read-role-ids="instancePermissions.filter((permission) => permission.access_type === 'read').map((permission) => permission.role_id)"
		@submit="submit"
		@cancel="cancel"
	/>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import InstanceEditor from './components/InstanceEditor.vue';
import { useDiscordAccess } from '@/lib/discord';
import { IntelInstance, IntelInstanceDiscordPermissions } from '@packages/data/dist/intel';
import { withHandlingAsync } from '@packages/frontend-libs/dist/error';
import router from '..';

const props = defineProps<{
	instanceId: string;
}>();

const discordAccess = useDiscordAccess();

const instance = ref<IntelInstance | null>(null);
const instancePermissions = ref<IntelInstanceDiscordPermissions[]>([]);

async function getInstance(): Promise<IntelInstance> {
	const response = await fetch(`/api/v1/instance/${encodeURIComponent(props.instanceId)}`, {
		method: 'GET',
		headers: discordAccess.getFetchHeaders(),
	});
	if (!response.ok) {
		throw new Error('Failed to get instance: ' + (await response.text()));
	}
	return await response.json();
};

async function getInstancePermissions(): Promise<IntelInstanceDiscordPermissions[]> {
	const response = await fetch(`/api/v1/instance/${encodeURIComponent(props.instanceId)}/permissions`, {
		method: 'GET',
		headers: discordAccess.getFetchHeaders(),
	});
	if (!response.ok) {
		throw new Error('Failed to get instance permissions: ' + (await response.text()));
	}
	return await response.json();
}

async function initialiseEditInstance(): Promise<void> {
	const [_instance, _instancePermissions] = await Promise.all([getInstance(), getInstancePermissions()]);
	instance.value = _instance;
	instancePermissions.value = _instancePermissions;
	console.log('instance', JSON.parse(JSON.stringify({
		instance: instance.value,
		instancePermissions: instancePermissions.value,
	})));
}

watch(() => props.instanceId, async () => {
	withHandlingAsync(initialiseEditInstance);
}, { flush: 'sync' });
initialiseEditInstance();

async function submit(_instanceId: string): Promise<void> {
	router.push({ name: 'instance:select' });
}

async function cancel(): Promise<void> {
	router.push({ name: 'instance:select' });
}
</script>