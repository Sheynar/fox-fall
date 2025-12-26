<template>
	<RadialMenu
		:options="options"
		@submit="emit('submit', $event)"
		@cancel="emit('cancel')"
	/>
</template>

<script setup lang="ts">
	import { computed } from 'vue';
	import RadialMenu, {
		// type Option,
		type Options,
	} from '@packages/frontend-libs/dist/inputs/RadialMenu.vue';
	import CameraIcon from '@packages/frontend-libs/dist/icons/CameraIcon.vue';
	import DocumentIcon from '@packages/frontend-libs/dist/icons/DocumentIcon.vue';
	import { AddType } from './types';

	export type Payload = AddType;

	const emit = defineEmits<{
		(e: 'cancel'): void;
		(e: 'submit', payload: { value: Payload; path: any[] }): void;
	}>();

	const options = computed<Options<Payload>>(() => {
		const output: Options<Payload> = new Map();

		output.set(AddType.Image, {
			label: 'Image',
			icon: CameraIcon,
			order: 0,
		});

		output.set(AddType.Document, {
			label: 'Document',
			icon: DocumentIcon,
			order: 1,
		});

		return output;
	});
</script>
