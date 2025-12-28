<template>
	<Teleport to="body" v-if="!addingInstance">
		<div class="InstanceSelector__backdrop">
			<div class="InstanceSelector__container">
				<div class="InstanceSelector__header">
					Select intel instance
					<button @click="addingInstance = true">Add new instance</button>
				</div>
				<div
					class="InstanceSelector__content"
					:class="{ 'InstanceSelector__content--loading': !ready }"
				>
					<div
						class="InstanceSelector__instance"
						v-for="instance in instances"
						:key="instance.id"
					>
						{{ instance.id }}
						<button @click="emit('selectInstance', instance.id)">Select</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
	<InstanceCreator
		v-if="addingInstance"
		@create-instance="emit('selectInstance', $event)"
		@cancel="addingInstance = false"
	/>
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

	.InstanceSelector__header {
		grid-area: header;
		padding: 0.5em;
		font-size: 1.5em;
		font-weight: bold;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.InstanceSelector__content {
		grid-area: content;

		display: grid;
		grid-template-columns: 1fr auto;
		grid-auto-rows: min-content;
		padding: 0.5em;
		gap: 0.5em;
		overflow-y: auto;

		.InstanceSelector__instance {
			grid-column: 1 / -1;
			display: grid;
			grid-template-columns: subgrid;
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
	import type { IntelInstance } from '@packages/data/dist/intel';
	import { onMounted, ref } from 'vue';
	import { useDiscordAccess } from '@/lib/discord';
	import InstanceCreator from './InstanceCreator.vue';
	import { withHandlingAsync } from '@packages/frontend-libs/dist/error';

	const emit = defineEmits<{
		(e: 'selectInstance', instanceId: string): void;
	}>();

	const discordAccess = useDiscordAccess();

	const instances = ref<IntelInstance[]>([]);
	const ready = ref(false);
	const addingInstance = ref(false);

	async function initialise() {
		ready.value = false;
		try {
			const response = await fetch('/api/v1/instance', {
				method: 'GET',
				headers: {
					'X-Discord-Access-Code': discordAccess.code.value,
					'X-Discord-Redirect-Uri': discordAccess.redirectUri.value,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to get instances: ' + (await response.text()));
			}

			instances.value = await response.json();
		} finally {
			ready.value = true;
		}
	}

	onMounted(() => {
		withHandlingAsync(initialise);
	});
</script>
