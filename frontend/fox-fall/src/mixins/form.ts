import type DirectionInput from '@packages/frontend-libs/dist/inputs/DirectionInput/DirectionInput.vue';
import type DistanceInput from '@packages/frontend-libs/dist/inputs/DistanceInput.vue';
import type FoxSelect from '@packages/frontend-libs/dist/inputs/FoxSelect.vue';
import type FoxText from '@packages/frontend-libs/dist/inputs/FoxText.vue';
import type NumberInput from '@packages/frontend-libs/dist/inputs/NumberInput.vue';
import type AmmoSelect from '@/components/inputs/AmmoSelect.vue';
import type PlatformSelect from '@/components/inputs/PlatformSelect.vue';
import type SelectOneUnit from '@/components/inputs/select-unit/SelectOneUnit.vue';
import { computed, type ShallowRef } from 'vue';
import { useScopePerArrayIndex } from './scope';
import { useEventListener } from '@vueuse/core';

export type Input =
	| InstanceType<typeof FoxText>
	| InstanceType<typeof FoxSelect>
	| InstanceType<typeof NumberInput>
	| InstanceType<typeof SelectOneUnit>
	| InstanceType<typeof AmmoSelect>
	| InstanceType<typeof PlatformSelect>
	| InstanceType<typeof DirectionInput>
	| InstanceType<typeof DistanceInput>;

export type UseFieldGroupOptions = {
	inputs: ShallowRef<Input[]>;
	onSubmit?: (index: number) => void;
	onLastSubmit?: () => void;
};

export const useFieldGroup = (options: UseFieldGroupOptions) => {
	useScopePerArrayIndex(options.inputs, (index) => {
		const relevantElement = computed(() => {
			const instance = options.inputs.value[index];
			if (instance == null) return null;
			if ('inputElement' in instance) {
				return instance.inputElement;
			}
			if ('containerElement' in instance) {
				return instance.containerElement;
			}
			return null;
		});

		useEventListener(relevantElement, 'keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				event.stopPropagation();

				const nextInput =
					options.inputs.value[(index + 1) % options.inputs.value.length];
				if (nextInput) {
					nextInput.focus();
				}

				options.onSubmit?.(index);
				if (index === options.inputs.value.length - 1) {
					options.onLastSubmit?.();
				}
			}
		});
	});
};
