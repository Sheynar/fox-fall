<template>
	<div class="DocumentManager__container">

		<label class="DocumentManager__search--container">
			Search
			<FoxText v-model="search" />
		</label>
	</div>
</template>

<style lang="scss">
.DocumentManager__container {
	display: flex;
	flex-direction: column;
	align-items: start;
	justify-content: start;
	gap: 0.5em;
}
</style>

<script setup lang="ts">
import FoxText from '@packages/frontend-libs/dist/inputs/FoxText.vue';
import { ref } from 'vue';

const search = ref('');
</script>