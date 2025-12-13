<template>
	<FoxDialog class="SyncSettings__dialog" v-model:visible="visible">
		<template #header>Sync</template>
		<div class="Sync__settings">
			<div class="Sync__settings__item">
				<label>Server address:</label>
				<FoxText
					type="addressInput"
					v-model="connectionDetails.serverAddress"
					autofocus
				/>
			</div>
			<div class="Sync__settings__item">
				<label>Sync code:</label>
				<FoxText ref="codeInput" v-model="connectionDetails.code" />
			</div>
			<PrimeButton class="Sync__settings__button" label="Connect" />
		</div>
	</FoxDialog>
</template>

<style lang="scss">
	.SyncSettings__dialog {
		top: auto;
		right: auto;
	}

	.Sync__settings {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 1rem;
		padding: 1rem;
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
	import { computed, ref, shallowRef } from 'vue';
	import FoxDialog from '@packages/frontend-libs/dist/FoxDialog.vue';
	import FoxText from '@packages/frontend-libs/dist/inputs/FoxText.vue';
	import { useFieldGroup } from '@/mixins/form';
	import { getConnectionDetails } from '@/mixins/server-connection';

	const addressInput = shallowRef<InstanceType<typeof FoxText>>(null!);
	const codeInput = shallowRef<InstanceType<typeof FoxText>>(null!);

	const visible = defineModel('visible', { type: Boolean, required: true });

	const connectionDetails = ref(
		getConnectionDetails() ?? { code: '', serverAddress: '' }
	);

	const connect = () => {
		const newUrl = new URL(window.location.href);
		newUrl.searchParams.set(
			'serverAddress',
			connectionDetails.value.serverAddress
		);
		newUrl.searchParams.set('code', connectionDetails.value.code);
		if (newUrl.search === location.search) {
			location.reload();
		} else {
			location.search = newUrl.search;
		}
	};

	useFieldGroup({
		inputs: computed(() => [addressInput.value, codeInput.value]),
		onLastSubmit() {
			connect();
		},
	});
</script>
