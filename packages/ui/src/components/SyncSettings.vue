<template>
	<PrimeDialog
		v-model:visible="visible"
		header="Sync"
		position="bottomleft"
		@pointerdown.stop
		@wheel.stop
	>
		<div class="Sync__settings">
			<div class="Sync__settings__item">
				<label>Server address:</label>
				<TextInput v-model="serverIp" :allowEmpty="false" auto-focus highlightOnFocus @keydown.enter="connect" />
			</div>
			<div class="Sync__settings__item">
				<label>Sync code:</label>
				<TextInput v-model="serverCode" :allowEmpty="false" highlightOnFocus @keydown.enter="connect" />
			</div>
			<PrimeButton
				class="Sync__settings__button"
				label="Connect"
				@pointerdown.stop="connect"
			/>
		</div>
	</PrimeDialog>
</template>

<style lang="scss">
	.Sync__settings {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 1rem;
		align-items: center;
	}

	.Sync__settings__item {
		grid-column: auto / span 2;
		display: grid;
		grid-template-columns: subgrid;
		align-items: inherit;
	}

	.Wind__information__item__angle-input {
		margin: 0 !important;
	}

	.Sync__settings__button {
		grid-column: auto / span 2;
	}
</style>

<script setup lang="ts">
	import PrimeButton from 'primevue/button';
	import PrimeDialog from 'primevue/dialog';
	import { ref } from 'vue';
	import TextInput from '@/components/inputs/TextInput.vue';

	const visible = defineModel('visible', { type: Boolean, required: true });

	const url = new URL(window.location.href);
	const serverIp = ref(url.searchParams.get('serverAddress') ?? window.location.hostname);
	const serverCode = ref(url.searchParams.get('code') ?? '');

	const connect = () => {
	const newUrl = new URL(window.location.href);
	newUrl.searchParams.set('serverAddress', serverIp.value);
	newUrl.searchParams.set('code', serverCode.value);
	if (newUrl.search === location.search) {
		location.reload();
	} else {
		location.search = newUrl.search;
	}
	};
</script>
