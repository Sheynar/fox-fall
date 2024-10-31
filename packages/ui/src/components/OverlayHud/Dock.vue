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

	<SyncSettings v-model:visible="syncSettingsVisible" />

	<Settings v-model:visible="settingsVisible" />

	<WindSettings v-model:visible="windSettingsVisible" />
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
	import GridIcon from '@/components/icons/GridIcon.vue';
	import Settings from '@/components/OverlayHud/Settings.vue';
	import SyncSettings from '@/components/OverlayHud/SyncSettings.vue';
	import WindIndicator from '@/components/OverlayHud/WindIndicator.vue';
	import WindSettings from '@/components/OverlayHud/WindSettings.vue';
	import { artillery, serverConnection, syncedRoom } from '@/lib/globals';
	import { UnitType } from '@/lib/unit';
	import { ServerConnectionState } from '@/mixins/server-connection';
	import PrimeButton from 'primevue/button';
	import PrimeDock from 'primevue/dock';
	import vPrimeTooltip from 'primevue/tooltip';
	import { computed, ref } from 'vue';

	const emit = defineEmits<{
		(event: 'calibrate-grid'): void;
	}>();

	const settingsVisible = ref(false);
	const windSettingsVisible = ref(false);
	const syncSettingsVisible = ref(false);

	const openGunnerInterface = () => {
		window.location.pathname = window.location.pathname.replace(
			/(index\.html)?$/,
			'gunner/$1'
		);
	};

	const showHelp = () => {
		alert(
			`Controls:\nLeft click: select unit\nLeft click drag: move unit / pan camera\nRight click drag / shift + left click drag: rotate camera\nScroll: zoom camera (hold CTRL to zoom 5x faster or shift to zoom 10x slower)\n\nClick unit's create buttons to insert a new child units\nCTRL + click unit's create buttons to change the unit type\n\nShow firing arcs by selecting an artillery unit or a target.\nAlternatively pin/hover an artillery unit and a target\n`
		);
	};

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
		icon: `pi ${artillery.readyToFire.value ? 'pi-play-circle' : 'pi-pause-circle'}`,
		severity: artillery.readyToFire.value ? 'success' : 'danger',
		command: () => {
			artillery.readyToFire.value = !artillery.readyToFire.value;
			syncedRoom.updateReadyToFire();
		},
	}));

	const isConnected = computed(
		() =>
			serverConnection.connectionState.value === ServerConnectionState.connected
	);
	const connectedItem = computed<Item>(() => ({
		label: isConnected.value ? 'Connected' : 'Disconnected',
		icon: 'pi pi-sync',
		severity: isConnected.value ? 'success' : 'danger',
		command: () => syncSettingsVisible.value = !syncSettingsVisible.value,
	}));

	const items = computed<Item[]>(() => [
		{
			label: 'Calibrate grid',
			iconComponent: GridIcon,
			severity: 'secondary',
			command: () => emit('calibrate-grid'),
		},
		{
			label: 'Wind',
			iconComponent: WindIndicator,
			severity: 'secondary',
			command: () => windSettingsVisible.value = !windSettingsVisible.value,
		},
		{
			label: 'Add unit',
			icon: 'pi pi-plus',
			severity: 'secondary',
			command: () => artillery.addUnit(UnitType.Location, undefined, undefined),
		},
		readyToFireItem.value,
		connectedItem.value,
		{
			label: 'Settings',
			icon: 'pi pi-cog',
			severity: 'secondary',
			command: () => settingsVisible.value = !settingsVisible.value,
		},
		{
			label: 'Gunner interface',
			icon: 'pi pi-window-minimize',
			severity: 'secondary',
			command: openGunnerInterface,
		},
		{
			label: 'Help',
			icon: 'pi pi-question-circle',
			severity: 'secondary',
			command: showHelp,
		},
	]);
</script>
