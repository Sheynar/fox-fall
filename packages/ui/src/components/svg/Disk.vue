<template>
	<path
		:d="`
				M 0 ${-props.outerRadius}
				A ${props.outerRadius} ${props.outerRadius} 0 1 0 0 ${+props.outerRadius}
				A ${props.outerRadius} ${props.outerRadius} 0 1 0 0 ${-props.outerRadius}
				Z
				M 0 ${-props.innerRadius}
				A ${props.innerRadius} ${props.innerRadius} 0 1 1 0 ${+props.innerRadius}
				A ${props.innerRadius} ${props.innerRadius} 0 1 1 0 ${-props.innerRadius}
				Z
			`"
	/>
</template>

<script setup lang="ts">
	const props = defineProps<{
		outerRadius: number;
		innerRadius: number;
	}>();
</script>