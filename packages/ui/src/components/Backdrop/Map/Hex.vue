<template>
	<div class="Hex__container">
		<svg
			class="Hex__svg"
			viewBox="0 0 4388 3800"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			stroke="#000000"
			:stroke-width="props.strokeWidth"
			preserveAspectRatio="none"
		>
			<g>
				<path :d="hexPath" />
			</g>
			<g :style="{ clipPath: `path('${hexPath.replace(/[\n]/g, '')}')` }">
				<line
					v-for="x in Math.ceil(x4 / gridSize)"
					:key="x"
					:stroke="(x - 1) % 3 === 0 ? '#000000' : '#333333'"
					:stroke-width="props.strokeWidth / ((x - 1) % 3 === 0 ? 3 : 5)"
					:x1="gridSize * (x - 1) + props.strokeWidth / 3"
					:y1="y1 + props.strokeWidth / 3"
					:x2="gridSize * (x - 1) + props.strokeWidth / 3"
					:y2="y3 + props.strokeWidth / 3"
				/>
				<line
					v-for="y in Math.ceil(y3 / gridSize)"
					:key="y"
					:stroke="(y - 1) % 3 === 0 ? '#000000' : '#333333'"
					:stroke-width="props.strokeWidth / 3"
					:x1="x1 + props.strokeWidth / 3"
					:y1="gridSize * (y - 1) + props.strokeWidth / 3"
					:x2="x4 + props.strokeWidth / 3"
					:y2="gridSize * (y - 1) + props.strokeWidth / 3"
				/>
			</g>
		</svg>
		<div class="Hex__label">
			<slot />
		</div>
	</div>
</template>

<style lang="scss">
	.Hex__container {
		position: relative;
	}

	.Hex__svg {
		overflow: visible;
	}

	.Hex__label {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15em;
		color: white;
		text-align: center;

		transform-origin: 50% 50%;
		transform: translate(-50%, -50%) rotate(calc(var(--viewport-deg) * -1deg + 90deg));
		z-index: 1;
	}
</style>

<script setup lang="ts">
	import { computed } from 'vue';

	const props = withDefaults(defineProps<{ strokeWidth?: number }>(), {
		strokeWidth: 11,
	});

	const x1 = computed(() => 0);
	const x2 = computed(() => 1097);
	const x3 = computed(() => 3291);
	const x4 = computed(() => 4388);

	const y1 = computed(() => 0);
	const y2 = computed(() => 1900);
	const y3 = computed(() => 3800);

	const hexPath = computed(() => {
		return `
					M ${x2.value} ${y1.value}
					L ${x3.value} ${y1.value}
					L ${x4.value} ${y2.value}
					L ${x3.value} ${y3.value}
					L ${x2.value} ${y3.value}
					L ${x1.value} ${y2.value}
					Z
				`;
	});

	const gridSize = computed(() => 250 / 3);
</script>
