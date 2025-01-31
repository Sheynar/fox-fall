<template>
	<PrimeDock :model="items" @pointerdown.stop>
		<template #item="{ item }">
			<PrimeButton
				v-if="isItem(item)"
				class="Dock__button"
				raised
				:severity="item.severity"
				:disabled="item.disabled"
				@pointerdown.stop="item.command()"
				@pointerenter="(event) => (tooltip = { label: item.label, event })"
				@pointerleave="tooltip = null"
			>
				<i v-for="icon in item.icons" :class="icon" />
				<Component v-for="iconComponent in item.iconComponents" :is="iconComponent" />
			</PrimeButton>
		</template>
	</PrimeDock>

	<PrimePopover ref="primePopover" :dismissable="false" append-to=".App__container">
		{{ tooltip?.label }}
	</PrimePopover>

	<SyncSettings v-model:visible="syncSettingsVisible" />

	<Settings v-model:visible="settingsVisible" />

	<WindSettings v-model:visible="windSettingsVisible" />
</template>

<style lang="scss">
	.Dock__button {
		width: 3rem;
		height: 3rem;
		padding: 0;

		> :not(:first-child) {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
	}
</style>

<script setup lang="ts">
	import GridIcon from '@/components/icons/GridIcon.vue';
	import Settings from '@/components/OverlayHud/Settings.vue';
	import SyncSettings from '@/components/OverlayHud/SyncSettings.vue';
	import WindIndicator from '@/components/OverlayHud/WindIndicator.vue';
	import WindSettings from '@/components/OverlayHud/WindSettings.vue';
	import {
		artillery,
		serverConnection,
		syncedRoom,
	} from '@/lib/globals';
	import { UnitType } from '@/lib/unit';
	import { ServerConnectionState } from '@/mixins/server-connection';
	import PrimeButton from 'primevue/button';
	import PrimeDock from 'primevue/dock';
	import PrimePopover from 'primevue/popover';
	import { computed, ref, shallowRef, watch } from 'vue';

	const primePopover = ref<InstanceType<typeof PrimePopover> | null>(null);
	const tooltip = shallowRef<{ label: string, event: MouseEvent } | null>(null);
	watch(() => tooltip.value, () => {
		primePopover.value?.hide();
		if (tooltip.value) {
			primePopover.value?.show(tooltip.value.event);
		}
	})

	const settingsVisible = ref(false);
	const windSettingsVisible = ref(false);
	const syncSettingsVisible = ref(false);

	const showHelp = () => {
		alert(
			`Controls:\nLeft click: select unit\nLeft click drag: move unit / pan camera\nRight click drag / shift + left click drag: rotate camera\nScroll: zoom camera (hold CTRL to zoom 5x faster or shift to zoom 10x slower)\n\nClick unit's create buttons to insert a new child units\nCTRL + click unit's create buttons to change the unit type\n\nShow firing arcs by selecting an artillery unit or a target.\nAlternatively pin/hover an artillery unit and a target\n`
		);
	};

	type Item = {
		label: string;
		icons?: string[];
		iconComponents?: any[];
		severity?: string;
		disabled?: boolean;
		command: () => void;
	};
	const isItem = (_item: any): _item is Item => true;

	const readyToFireItem = computed<Item>(() => ({
		label: 'Ready to fire',
		icons: [`pi ${artillery.readyToFire.value ? 'pi-play-circle' : 'pi-pause-circle'}`],
		severity: artillery.readyToFire.value ? 'success' : 'danger',
		command: () => {
			artillery.readyToFire.value = !artillery.readyToFire.value;
			syncedRoom.updateReadyToFire();
		},
	}));

	const screenshotItem = computed<Item>(() => {
		const hasScreenshot = !!artillery.viewportControl.screenShot.value;
		return {
			label: hasScreenshot ? 'Clear screenshot' : 'Take screenshot',
			icons: hasScreenshot ? ['pi pi-camera', 'pi pi-times'] : ['pi pi-camera'],
			severity: hasScreenshot ? 'danger' : 'secondary',
			command: async () => {
				if (artillery.viewportControl.screenShot.value) {
					artillery.viewportControl.screenShot.value = null;
				} else {
					await artillery.viewportControl.captureScreenShot();
				}
			},
		};
	});

	const isConnected = computed(
		() =>
			serverConnection.connectionState.value === ServerConnectionState.connected
	);
	const connectedItem = computed<Item>(() => ({
		label: isConnected.value ? 'Connected' : 'Disconnected',
		icons: ['pi pi-sync'],
		severity: isConnected.value ? 'success' : 'danger',
		command: () => (syncSettingsVisible.value = !syncSettingsVisible.value),
	}));

	const items = computed<Item[]>(() => [
		{
			label: 'Calibrate grid',
			iconComponents: [GridIcon],
			severity: 'secondary',
			command: () => artillery.viewportControl.calibrateGrid(),
		},
		{
			label: 'Wind',
			iconComponents: [WindIndicator],
			severity: 'secondary',
			command: () => (windSettingsVisible.value = !windSettingsVisible.value),
		},
		{
			label: 'Add unit',
			icons: ['pi pi-plus'],
			severity: 'secondary',
			command: () => artillery.addUnit(UnitType.Location, undefined, undefined),
		},
		readyToFireItem.value,
		screenshotItem.value,
		connectedItem.value,
		{
			label: 'Settings',
			icons: ['pi pi-cog'],
			severity: 'secondary',
			command: () => (settingsVisible.value = !settingsVisible.value),
		},
		{
			label: 'Help',
			icons: ['pi pi-question-circle'],
			severity: 'secondary',
			command: showHelp,
		},
	]);
</script>
