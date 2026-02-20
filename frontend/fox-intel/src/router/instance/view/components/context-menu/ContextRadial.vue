<template>
	<RadialMenu :options="options" @submit="emit('submit', $event)" @cancel="emit('cancel')" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BuildableSignpostIcon, Colonial, FacilityRefinery2Icon, FortT1BaseIcon, Shared, Warden } from '@packages/frontend-libs/dist/assets/images';
import RadialMenu, {
	// type Option,
	type Options,
} from '@packages/frontend-libs/dist/inputs/RadialMenu.vue';
import CameraIcon from '@packages/frontend-libs/dist/icons/CameraIcon.vue';
import StickyNoteIcon from '@packages/frontend-libs/dist/icons/StickyNoteIcon.vue';
import Icon from '@packages/frontend-libs/dist/icons/Icon.vue';
import { AddType, type Payload } from './types';
import { MapIconFacility, MapIconFortification, MapIconMisc, MapPost } from '@packages/data/dist/map-icons';
import { MAP_ICONS_BY_NAME } from '@packages/frontend-libs/dist/assets/images/map-icons';
import { Team } from '@packages/foxhole-api';

const emit = defineEmits<{
	(e: 'cancel'): void;
	(e: 'submit', payload: { value: Payload; path: any[] }): void;
}>();

const options = computed<Options<Payload>>(() => {
	const output: Options<Payload> = new Map();

	output.set({ type: AddType.Image }, {
		label: 'Image',
		icon: CameraIcon,
		order: 0,
	});

	output.set({ type: AddType.Document }, {
		label: 'Document',
		icon: StickyNoteIcon,
		order: 1,
	});

	output.set({} as any, {
		label: 'Icon',
		icon: Icon,
		order: 2,
		subOptions: new Map(Object.values(Team).map((iconTeam) => {
			return [{} as any, {
				label: iconTeam,
				icon: iconTeam === Team.Colonial ? Colonial : iconTeam === Team.Warden ? Warden : Shared,
				order: 0,
				subOptions: new Map([
					[{} as any, {
						label: 'Facility',
						icon: FacilityRefinery2Icon,
						order: 0,
						subOptions: new Map(
							Object.values(MapIconFacility).map((iconType) => [
								{ type: AddType.Icon, iconType, iconTeam },
								{
									label: iconType,
									icon: MAP_ICONS_BY_NAME[iconType],
								},
							])
						) satisfies Options<Payload>,
					}],
					[{} as any, {
						label: 'Fortification',
						icon: FortT1BaseIcon,
						order: 1,
						subOptions: new Map(
							Object.values(MapIconFortification).map((iconType) => [
								{ type: AddType.Icon, iconType, iconTeam },
								{
									label: iconType,
									icon: MAP_ICONS_BY_NAME[iconType],
								},
							])
						) satisfies Options<Payload>,
					}],
					[{} as any, {
						label: 'Post',
						icon: MAP_ICONS_BY_NAME[MapPost.FactoryFacility],
						order: 1,
						subOptions: new Map(
							Object.values(MapPost).map((iconType) => [
								{ type: AddType.Icon, iconType, iconTeam },
								{
									label: iconType,
									icon: MAP_ICONS_BY_NAME[iconType],
								},
							])
						) satisfies Options<Payload>,
					}],
					[{} as any, {
						label: 'Misc',
						icon: BuildableSignpostIcon,
						order: 2,
						subOptions: new Map(
							Object.values(MapIconMisc).map((iconType) => [
								{ type: AddType.Icon, iconType, iconTeam },
								{
									label: iconType,
									icon: MAP_ICONS_BY_NAME[iconType],
								},
							])
						) satisfies Options<Payload>,
					}]
				]),
			}];
		})) satisfies Options<Payload>,
	});

	return output;
});
</script>