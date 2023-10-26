<template>
	<slot />
</template>

<script setup lang="ts">
import { toRef } from 'vue';
import type { Location } from '@/lib/location';
import { provideLocation } from '.';

const props = defineProps<{
	location: Location;
}>();

provideLocation(toRef(props, 'location'));
</script>
