<template>
	<PrimeDock :model="items" @pointerdown.stop>
		<template #item="{ item }">
			<PrimeButton
				class="Dock__button"
				raised
				:severity="item.severity"
				:disabled="item.disabled"
				@pointerdown.stop="item.command()"
				v-prime-tooltip.top="item.label"
			>
				<i v-if="item.icon" :class="item.icon" />
				<Component v-else-if="item.iconComponent" :is="item.iconComponent" />
			</PrimeButton>
		</template>
	</PrimeDock>
</template>

<style lang="scss">
	.Dock__button {
		width: 3rem;
		height: 3rem;
		padding: 0;
		display: grid !important;
	}
</style>

<script setup lang="ts">
	import PrimeButton from 'primevue/button';
	import PrimeDock from 'primevue/dock';
	import vPrimeTooltip from 'primevue/tooltip';
	import { computed, defineModel} from 'vue';
	import WindIndicator from '@/components/WindIndicator.vue';
	import { injectServerConnection } from '@/contexts/server-connection';
	import { ServerConnectionState } from '@/mixins/server-connection';

	const readyToFire = defineModel('readyToFire', { type: Boolean, required: true });

	const serverConnection = injectServerConnection();

	const emit = defineEmits<{
		(event: 'show-add-unit'): void;
		(event: 'show-help'): void;
		(event: 'show-sync'): void;
		(event: 'toggle-settings'): void;
		(event: 'open-gunner-interface'): void;
		(event: 'toggle-wind-settings'): void;
	}>();

	type Item = {
		label: string;
		icon?: string;
		iconComponent?: any;
		severity?: string;
		disabled?: boolean;
		command: () => void;
	};

	const readyToFireItem = computed<Item>(() => ({
		label: 'Ready to fire',
		icon: `pi ${readyToFire.value ? 'pi-play-circle' : 'pi-pause-circle'}`,
		severity: readyToFire.value ? 'success' : 'danger',
		command: () => readyToFire.value = !readyToFire.value,
	}));

	const isConnected = computed(() => serverConnection.connectionState.value === ServerConnectionState.connected)
	const connectedItem = computed<Item>(() => ({
		label: isConnected.value ? 'Connected' : 'Disconnected',
		icon: 'pi pi-sync',
		severity: isConnected.value ? 'success' : 'danger',
		command: () => emit('show-sync'),
	}));

	const items = computed<Item[]>(() => [
		{
			label: 'Wind',
			iconComponent: WindIndicator,
			severity: 'secondary',
			command: () => emit('toggle-wind-settings'),
		},
		{
			label: 'Add unit',
			icon: 'pi pi-plus',
			severity: 'secondary',
			command: () => emit('show-add-unit'),
		},
		readyToFireItem.value,
		connectedItem.value,
		{
			label: 'Settings',
			icon: 'pi pi-cog',
			severity: 'secondary',
			command: () => emit('toggle-settings'),
		},
		{
			label: 'Gunner interface',
			icon: 'pi pi-window-minimize',
			severity: 'secondary',
			command: () => emit('open-gunner-interface'),
		},
		{
			label: 'Help',
			icon: 'pi pi-question-circle',
			severity: 'secondary',
			command: () => emit('show-help'),
		},
	]);
</script>
