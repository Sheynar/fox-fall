<template>
	<FoxText
		ref="textInput"
		class="TagInput__input"
		v-model="editingTag"
		@keydown.stop.prevent.enter="addTag"
		@keydown.stop.prevent.escape="editingTag = ''"
		@keydown.backspace="(!editingTag && props.modelValue.length > 0) ? removeTag(props.modelValue[props.modelValue.length - 1]) : undefined"
	>
		<template #icons-before v-if="props.modelValue.length > 0">
			<div class="TagInput__tags">
				<div
					class="TagInput__tag"
					v-for="tag in props.modelValue"
					:key="tag"
					tabIndex="0"
					@pointerdown.stop.prevent="editTag(tag)"
					@keydown.stop.prevent.enter="editTag(tag)"
					@keydown.stop.prevent.delete="removeTag(tag)"
					@keydown.stop.prevent.backspace="removeTag(tag)"
					@keydown.stop.prevent.escape="removeTag(tag)"
				>
					{{ tag }}
					<a class="TagInput__tag-remove" @pointerdown.stop.prevent="removeTag(tag)"><i class="pi pi-times"></i></a>
				</div>
			</div>
		</template>
	</FoxText>
</template>

<style lang="scss">
	.TagInput__tags {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
	}

	.TagInput__tag {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;

		background: var(--color-primary);
		color: var(--color-primary-contrast);
		line-height: 100%;
		padding: .25em .5em;
		border-radius: 100vmax;

		cursor: pointer;
	}

	.TagInput__tag-remove {
		cursor: pointer;
	}
</style>

<script setup lang="ts">
	import { ref, shallowRef } from 'vue';
	import FoxText from './FoxText.vue';

	const props = defineProps<{
		modelValue: string[];
	}>();

	const emit = defineEmits<{
		(event: 'update:modelValue', value: string[]): void;
		(event: 'add:tag', tag: string): void;
		(event: 'remove:tag', tag: string): void;
	}>();

	const textInput = shallowRef<InstanceType<typeof FoxText>>(null!);

	const editingTag = ref<string>('');

	function addTag() {
		if (editingTag.value.trim() === '') return;
		emit('add:tag', editingTag.value.trim());
		emit('update:modelValue', [...props.modelValue, editingTag.value.trim()]);
		editingTag.value = '';
	}

	function removeTag(tag: string) {
		emit('remove:tag', tag);
		emit(
			'update:modelValue',
			props.modelValue.filter((t) => t !== tag)
		);
	}

	function editTag(tag: string) {
		editingTag.value = tag;
		textInput.value.focus();
		removeTag(tag);
	}
</script>
