import { retrieveBlob, storeBlob } from '@/lib/store';
import { computed, Ref } from 'vue';

export type UseCanvasStorageOptions = {
	canvas: OffscreenCanvas;
	context: OffscreenCanvasRenderingContext2D;
	regionWidth: Ref<number>;
	regionHeight: Ref<number>;
	storageId: Ref<string>;
};

export function useCanvasStorage(options: UseCanvasStorageOptions) {
	const regionCountX = computed(() =>
		Math.ceil(options.canvas.width / options.regionWidth.value)
	);
	const regionCountY = computed(() =>
		Math.ceil(options.canvas.height / options.regionHeight.value)
	);

	async function saveArea(x1: number, y1: number, x2: number, y2: number) {
		const regionX1 = Math.floor(x1 / options.regionWidth.value);
		const regionY1 = Math.floor(y1 / options.regionHeight.value);
		const regionX2 = Math.floor(x2 / options.regionWidth.value);
		const regionY2 = Math.floor(y2 / options.regionHeight.value);

		await saveRegions(regionX1, regionY1, regionX2, regionY2);
	}

	async function saveRegions(x1: number, y1: number, x2: number, y2: number) {
		x1 = Math.max(0, Math.min(x1, regionCountX.value));
		y1 = Math.max(0, Math.min(y1, regionCountY.value));
		x2 = Math.max(0, Math.min(x2, regionCountX.value));
		y2 = Math.max(0, Math.min(y2, regionCountY.value));

		const promises: Promise<void>[] = [];
		for (let x = x1; x <= x2; x++) {
			for (let y = y1; y <= y2; y++) {
				promises.push(saveRegion(x, y));
			}
		}
		await Promise.all(promises);
	}

	async function saveRegion(x: number, y: number) {
		if (x < 0 || x > regionCountX.value) throw new Error('x is out of range');
		if (y < 0 || y > regionCountY.value) throw new Error('y is out of range');

		const regionId = `${x}-${y}`;

		const regionCanvas = new OffscreenCanvas(options.regionWidth.value, options.regionHeight.value);
		const regionContext = regionCanvas.getContext('2d')!;
		if (regionContext == null) {
			throw new Error('Failed to get context');
		}

		regionContext.clearRect(
			0,
			0,
			options.regionWidth.value,
			options.regionHeight.value
		);
		regionContext.drawImage(
			options.canvas,
			-x * options.regionWidth.value,
			-y * options.regionHeight.value,
			options.canvas.width,
			options.canvas.height
		);

		const blob = await regionCanvas.convertToBlob({ type: 'image/webp' });
		await storeBlob(blob, options.storageId.value + '-' + regionId);
	}

	async function loadArea(x1: number, y1: number, x2: number, y2: number) {
		const regionX1 = Math.floor(x1 / options.regionWidth.value);
		const regionY1 = Math.floor(y1 / options.regionHeight.value);
		const regionX2 = Math.floor(x2 / options.regionWidth.value);
		const regionY2 = Math.floor(y2 / options.regionHeight.value);

		await loadRegions(regionX1, regionY1, regionX2, regionY2);
	}

	async function loadRegions(x1: number, y1: number, x2: number, y2: number) {
		x1 = Math.max(0, Math.min(x1, regionCountX.value));
		y1 = Math.max(0, Math.min(y1, regionCountY.value));
		x2 = Math.max(0, Math.min(x2, regionCountX.value));
		y2 = Math.max(0, Math.min(y2, regionCountY.value));

		const promises: Promise<void>[] = [];
		for (let x = x1; x <= x2; x++) {
			for (let y = y1; y <= y2; y++) {
				promises.push(loadRegion(x, y));
			}
		}
		await Promise.all(promises);
	}

	async function loadRegion(x: number, y: number) {
		if (x < 0 || x > regionCountX.value) throw new Error('x is out of range');
		if (y < 0 || y > regionCountY.value) throw new Error('y is out of range');

		const regionId = `${x}-${y}`;
		const blob = await retrieveBlob(options.storageId.value + '-' + regionId);
		if (blob == null) {
			// console.log(`Region ${regionId} not found, skipping load`);
			return;
		}
		// console.log(`Loading region ${regionId}`);
		const image = await createImageBitmap(blob);

		options.context.clearRect(
			x * options.regionWidth.value,
			y * options.regionHeight.value,
			options.regionWidth.value,
			options.regionHeight.value
		);
		options.context.drawImage(
			image,
			x * options.regionWidth.value,
			y * options.regionHeight.value,
			options.regionWidth.value,
			options.regionHeight.value
		);
	}

	return {
		saveArea,
		saveRegions,
		saveRegion,
		loadArea,
		loadRegions,
		loadRegion,
	};
}
