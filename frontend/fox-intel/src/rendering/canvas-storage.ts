// import { retrieveBlob, storeBlob } from '@/lib/store';
import { computed, Ref, shallowRef, watch } from 'vue';

export type UseCanvasStorageOptions = {
	canvas: OffscreenCanvas;
	context: OffscreenCanvasRenderingContext2D;
	regionWidth: Ref<number>;
	regionHeight: Ref<number>;
	intelInstance: Ref<{ id: string; password: string }>;
};

export function useCanvasStorage(options: UseCanvasStorageOptions) {
	const session = shallowRef<{
		sessionId: string;
		issuedAt: number;
		expiresAt: number;
	} | null>(null);
	watch(
		options.intelInstance,
		() => {
			session.value = null;
		},
		{ immediate: true, flush: 'sync', deep: true }
	);

	let getSessionIdPromise: Promise<string> = Promise.resolve('');
	async function getSessionId() {
		return (getSessionIdPromise = getSessionIdPromise
			.catch(() => {})
			.then(async () => {
				if (
					session.value != null &&
					session.value.expiresAt > Date.now() + 10_000
				) {
					return session.value.sessionId;
				}
				const response = await fetch('http://localhost:80/api/v1/instance', {
					method: 'POST',
					body: JSON.stringify(options.intelInstance.value),
				});
				if (!response.ok) {
					throw new Error(
						'Failed to create instance. ' + (await response.text())
					);
				}
				const data: { sessionId: string; issuedAt: number; expiresAt: number } =
					await response.json();
				session.value = data;
				return data.sessionId;
			}));
	}

	const regionCountX = computed(() =>
		Math.ceil(options.canvas.width / options.regionWidth.value)
	);
	const regionCountY = computed(() =>
		Math.ceil(options.canvas.height / options.regionHeight.value)
	);

	function getRegionCount(x1: number, y1: number, x2: number, y2: number) {
		const regionX1 = Math.floor(x1 / options.regionWidth.value);
		const regionY1 = Math.floor(y1 / options.regionHeight.value);
		const regionX2 = Math.floor(x2 / options.regionWidth.value);
		const regionY2 = Math.floor(y2 / options.regionHeight.value);

		return (regionX2 - regionX1 + 1) * (regionY2 - regionY1 + 1);
	}

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

		const saveFunctions: (() => Promise<void>)[] = [];
		for (let x = x1; x <= x2; x++) {
			for (let y = y1; y <= y2; y++) {
				saveFunctions.push(() => saveRegion(x, y));
			}
		}

		const BATCH_SIZE = 100;
		let batch = [] as typeof saveFunctions;
		while ((batch = saveFunctions.splice(0, BATCH_SIZE)).length) {
			await Promise.all(batch.map(fn => fn()));
		}
	}

	async function saveRegion(x: number, y: number) {
		if (x < 0 || x > regionCountX.value) throw new Error('x is out of range');
		if (y < 0 || y > regionCountY.value) throw new Error('y is out of range');

		// const regionId = `${x}-${y}`;

		const regionCanvas = new OffscreenCanvas(
			options.regionWidth.value,
			options.regionHeight.value
		);
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
			x * options.regionWidth.value,
			y * options.regionHeight.value,
			options.regionWidth.value,
			options.regionHeight.value,
			0,
			0,
			options.regionWidth.value,
			options.regionHeight.value
		);

		// Debugging: fill the region with a green color
		// const prevFillStyle = options.context.fillStyle;
		// options.context.fillStyle = 'rgb(0 255 0 / 0.5)';
		// options.context.fillRect(x * options.regionWidth.value, y * options.regionHeight.value, options.regionWidth.value, options.regionHeight.value);
		// options.context.fillStyle = prevFillStyle;

		const blob = await regionCanvas.convertToBlob({ type: 'image/webp' });
		const sessionId = await getSessionId();
		await fetch(
			`http://localhost:80/api/v1/instance/${options.intelInstance.value.id}/markers/${x}/${y}`,
			{
				method: 'POST',
				body: blob,
				headers: {
					'X-Session-Id': sessionId,
				},
			}
		);
		// await storeBlob(blob, options.intelInstance.value.id + '-' + regionId);
	}

	async function loadAll() {
		const sessionId = await getSessionId();
		const response = await fetch(
			`http://localhost:80/api/v1/instance/${options.intelInstance.value.id}/markers`,
			{
				method: 'GET',
				headers: {
					'X-Session-Id': sessionId,
				},
			}
		);
		if (!response.ok) {
			throw new Error('Failed to load regions. ' + await response.text());
		}
		for (const region of await response.json() as { id: number; instance_id: number; region_x: number; region_y: number; mime_type: string; region_data: string }[]) {
			const image = new Image();
			image.src = region.region_data;
			await new Promise((resolve, reject) => {
				image.onload = resolve;
				image.onerror = reject;
			});
			options.context.drawImage(image, region.region_x * options.regionWidth.value, region.region_y * options.regionHeight.value, options.regionWidth.value, options.regionHeight.value);
		}
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

		const loadFunctions: (() => Promise<void>)[] = [];
		for (let x = x1; x <= x2; x++) {
			for (let y = y1; y <= y2; y++) {
				loadFunctions.push(() => loadRegion(x, y));
			}
		}

		const BATCH_SIZE = 100;
		let batch = [] as typeof loadFunctions;
		while ((batch = loadFunctions.splice(0, BATCH_SIZE)).length) {
			await Promise.all(batch.map(fn => fn()));
		}
	}

	async function loadRegion(x: number, y: number) {
		if (x < 0 || x > regionCountX.value) throw new Error('x is out of range');
		if (y < 0 || y > regionCountY.value) throw new Error('y is out of range');

		const sessionId = await getSessionId();
		const response = await fetch(
			`http://localhost:80/api/v1/instance/${options.intelInstance.value.id}/markers/${x}/${y}`,
			{
				method: 'GET',
				headers: {
					'X-Session-Id': sessionId,
				},
			}
		);
		if (!response.ok) {
			throw new Error('Failed to load region. ' + await response.text());
		}
		if (response.status === 204) {
			// Region is empty, nothing to load
			return;
		}
		const blob = await response.blob();
		// const regionId = `${x}-${y}`;
		// const blob = await retrieveBlob(
		// 	options.intelInstance.value.id + '-' + regionId
		// );
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
		image.close();
	}

	return {
		getRegionCount,
		saveArea,
		saveRegions,
		saveRegion,
		loadAll,
		loadArea,
		loadRegions,
		loadRegion,
	};
}
