https://www.w3schools.com/howto/howto_css_switch.asp

<template>
	<label class="ToggleSwitch__container">
		<input
			type="checkbox"
			v-model="props.modelValue"
			@change="
				emit('update:modelValue', ($event.target! as HTMLInputElement).checked)
			"
		/>
		<span
			class="ToggleSwitch__slider"
			:class="{ ToggleSwitch__round: props.rounded }"
		/>
	</label>
</template>

<style lang="scss">
	.ToggleSwitch__container {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	/* Hide default HTML checkbox */
	.ToggleSwitch__container > input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The ToggleSwitch__slider */
	.ToggleSwitch__slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #f3214a;
		transition: 0.4s;
	}

	.ToggleSwitch__slider:before {
		position: absolute;
		content: '';
		height: calc(100% - 8px);
		left: 4px;
		right: calc(57% - 4px);
		bottom: 4px;
		background-color: white;
		transition: 0.4s;
	}

	input:checked + .ToggleSwitch__slider {
		background-color: #3fda0b;
	}

	input:focus + .ToggleSwitch__slider {
		box-shadow: 0 0 1px #3fda0b;
	}

	input:checked + .ToggleSwitch__slider:before {
		/* transform: translateX(26px); */
		left: calc(57% - 4px);
		right: 4px;
	}

	/* Rounded sliders */
	.ToggleSwitch__slider.ToggleSwitch__round {
		border-radius: 50%;
	}

	.ToggleSwitch__slider.ToggleSwitch__round:before {
		border-radius: 50%;
	}
</style>

<script setup lang="ts">
	const props = defineProps<{
		modelValue?: boolean;
		rounded?: boolean;
	}>();

	const emit = defineEmits<{
		(event: 'update:modelValue', value: boolean): void;
	}>();
</script>
