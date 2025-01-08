<template>
	<PrimeSelect>
		<template #value="{ value: option, placeholder }">
			<div class="flex items-center" v-if="option">
				<Component v-if="option.icon" :is="option.icon" />
				{{ option.label }}
			</div>
			<div v-else>{{ placeholder }}</div>
		</template>
		<template #option="{ option }">
			<div class="flex items-center">
				<Component v-if="option.icon" :is="option.icon" />
				{{ option.label }}
			</div>
		</template>
	</PrimeSelect>
</template>

<script setup lang="ts">
	import PrimeSelect from 'primevue/select';
</script>
