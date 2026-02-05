import { HEX_SIZE } from '@packages/data/dist/artillery/map';
import { computed, type Ref } from 'vue';

export type ShouldRenderOptions = {
	width: Ref<number>;
	height: Ref<number>;
	zoom: Ref<number>;
};
export function useShouldRender(options: ShouldRenderOptions) {
	const drawHexLabels = computed(() => options.width.value / options.zoom.value > HEX_SIZE.width * 1.5 &&
		options.height.value / options.zoom.value > HEX_SIZE.height * 1.5);

	const drawRegionLabels = computed(() => options.width.value / options.zoom.value < HEX_SIZE.width * 1.5 ||
		options.height.value / options.zoom.value < HEX_SIZE.height * 1.5);

	const drawDocuments = computed(() => options.width.value / options.zoom.value < HEX_SIZE.width * 1.5 ||
		options.height.value / options.zoom.value < HEX_SIZE.height * 1.5);

	const drawIcons = computed(() => options.width.value / options.zoom.value < HEX_SIZE.width * 1.2 ||
		options.height.value / options.zoom.value < HEX_SIZE.height * 1.2);

	const drawMinorLabels = computed(() => options.width.value / options.zoom.value < HEX_SIZE.width * 0.5 ||
		options.height.value / options.zoom.value < HEX_SIZE.height * 0.5);

	return {
		drawHexLabels,
		drawRegionLabels,
		drawDocuments,
		drawIcons,
		drawMinorLabels,
	};
};