<template>
	<div class="Controls__container" @pointerdown.stop @touchstart.stop>
		<div class="Controls__menu" tabindex="-1">
			<button class="Controls__button">+</button>
			<div class="Controls__submenu">
				<button
					class="Controls__button"
					@pointerdown.stop="
						emit('create-unit', {
							unitType: UnitType.Artillery,
							pointerEvent: $event,
						})
					"
				>
					<ArtilleryIcon class="Controls__icon" />
				</button>
				<button
					class="Controls__button"
					@pointerdown.stop="
						emit('create-unit', {
							unitType: UnitType.Spotter,
							pointerEvent: $event,
						})
					"
				>
					<SpotterIcon class="Controls__icon" />
				</button>
				<button
					class="Controls__button"
					@pointerdown.stop="
						emit('create-unit', {
							unitType: UnitType.Target,
							pointerEvent: $event,
						})
					"
				>
					<TargetIcon class="Controls__icon" />
				</button>
			</div>
		</div>

		<button class="Controls__button" @click.stop="emit('show-sync')">Sync</button>

		<button class="Controls__button" @click.stop="emit('show-help')">?</button>
	</div>
</template>

<style lang="scss">
	.Controls__container {
		display: flex;
		flex-direction: row-reverse;
		gap: 0.5em;
	}

	.Controls__menu {
		position: relative;

		.Controls__submenu {
			position: absolute;
			left: 0;
			bottom: 100%;
			width: 100%;
			padding-bottom: 0.5em;

			display: flex;
			flex-direction: column-reverse;
			gap: 0.5em;
		}

		&:not(:hover):not(:focus-within) .Controls__submenu {
			display: none;
		}
	}

	.Controls__button {
		flex: 1 0 auto;
		min-width: 4em;
		min-height: 4em;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		color: inherit;
		font-size: inherit;

		.Unit__icon {
			width: 1em;
			height: 1em;
		}
	}

	.Controls__icon {
		width: 2em;
		height: 2em;
	}
</style>

<script setup lang="ts">
	import ArtilleryIcon from '@/components/icons/ArtilleryIcon.vue';
	import SpotterIcon from '@/components/icons/SpotterIcon.vue';
	import TargetIcon from '@/components/icons/TargetIcon.vue';
	import { UnitType } from '@/lib/unit';

	const emit = defineEmits<{
		(
			event: 'create-unit',
			payload: { unitType: UnitType; pointerEvent: PointerEvent }
		): void;
		(event: 'show-sync'): void;
		(event: 'show-help'): void;
	}>();
</script>
