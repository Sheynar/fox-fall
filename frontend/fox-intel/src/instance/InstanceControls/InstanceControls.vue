<template>
	<div class="InstanceControls__container"
		:class="{ 'InstanceControls__container-open': open, 'InstanceControls__container-active': !!activeTab }">
		<div class="InstanceControls__tabs">
			<button v-if="!open" class="InstanceControls__tab" title="Open" @click="open = true">
				<i class="pi pi-bars" />
			</button>
			<button v-else class="InstanceControls__tab" title="Close" @click="open = false">
				<i class="pi pi-chevron-left" />
			</button>
			<template v-if="open">
				<button class="InstanceControls__tab" :class="{ 'InstanceControls__tab-active': activeTab === Tab.Marker }"
					title="Marker" @click="activeTab = activeTab === Tab.Marker ? null : Tab.Marker">
					<i class="pi pi-pencil" />
				</button>
				<button class="InstanceControls__tab"
					:class="{ 'InstanceControls__tab-active': activeTab === Tab.RenderFilters }" title="Render Filters"
					@click="activeTab = activeTab === Tab.RenderFilters ? null : Tab.RenderFilters">
					<i class="pi pi-filter" />
				</button>
				<button class="InstanceControls__tab" :class="{ 'InstanceControls__tab-active': activeTab === Tab.Documents }"
					title="Documents" @click="activeTab = activeTab === Tab.Documents ? null : Tab.Documents">
					<i class="pi pi-file" />
				</button>
				<button class="InstanceControls__tab" title="Exit instance" @click="emit('exitInstance')">
					<i class="pi pi-sign-out" />
				</button>
			</template>
		</div>
		<template v-if="open">
			<MarkerControls v-if="activeTab === Tab.Marker" class="InstanceControls__active-control" />
			<RenderFilters v-if="activeTab === Tab.RenderFilters" class="InstanceControls__active-control" />
			<DocumentManager v-if="activeTab === Tab.Documents" class="InstanceControls__active-control" />
		</template>
	</div>
</template>

<style lang="scss">
.InstanceControls__container {
	display: grid;
	grid-template-columns: minmax(auto, 100%);
	grid-template-rows: auto minmax(0, 1fr);
	grid-template-areas:
		'tabs'
		'active-control';
	padding: .5em;

	&.InstanceControls__container-open {
		background: var(--p-content-background);
		overflow: auto;
		border-bottom-right-radius: 0.5em;

		&.InstanceControls__container-active {
			border-bottom-right-radius: 0;
			gap: .5em;
		}
	}

	.InstanceControls__tabs {
		grid-area: tabs;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		gap: .5em;
		overflow: auto;

		.InstanceControls__tab {
			padding: 0.5em;
			border-radius: 0.5em;
			background-color: var(--color-primary-contrast);
			color: var(--color-primary);

			&-active {
				background-color: var(--color-primary);
				color: var(--color-primary-contrast);
			}
		}
	}

	.InstanceControls__active-control {
		grid-area: active-control;
	}
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { markerDisabled } from '@/lib/globals';
import DocumentManager from './DocumentManager.vue';
import MarkerControls from './MarkerControls.vue';
import RenderFilters from './RenderFilters/RenderFilters.vue';

const emit = defineEmits<{
	(e: 'exitInstance'): void;
}>();

enum Tab {
	Marker = 'marker',
	RenderFilters = 'render-filters',
	Documents = 'documents',
}

const open = ref(false);
const activeTab = ref<Tab | null>(null);

watch(() => activeTab.value === Tab.Marker && open.value, (markerTabActive) => {
	markerDisabled.value = !markerTabActive;
}, { immediate: true, flush: 'sync' })
</script>