import type { IntelIcon } from '@packages/data/dist/intel';
import type { NamedMapIcon } from '@packages/data/dist/map-icons';
import type { Team } from '@packages/foxhole-api';
import { wrapMixin } from '@packages/frontend-libs/src/reference-cache';
import { onScopeDispose, ref } from 'vue';
import { injectIntelInstance } from '@/lib/intel-instance';

export type UseIconsOptions = {
	intelInstance: ReturnType<typeof injectIntelInstance>;
};
function _useIcons(options: UseIconsOptions) {
	const icons = ref<{ [id: IntelIcon['id']]: IntelIcon }>(
		{}
	);

	async function addIcon(iconX: number, iconY: number, iconType: NamedMapIcon, iconTeam: Team) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/icon`,
			{
				method: 'POST',
				body: JSON.stringify({
					iconX,
					iconY,
					iconType,
					iconTeam,
				}),
			}
		);
		if (!response.ok) {
			throw new Error('Failed to add icon. ' + (await response.text()));
		}
		const data: { id: IntelIcon['id'] } = await response.json();
		icons.value[data.id] = {
			id: data.id,
			instance_id: options.intelInstance.instanceId.value,
			icon_x: iconX,
			icon_y: iconY,
			icon_type: iconType,
			icon_team: iconTeam,
			timestamp: 0,
			deleted: false,
		};
		return data.id;
	}

	let lastLoadedTimestamp = 0;
	async function loadSince(timestamp: number, timeout: number = 10000) {
		const response = await options.intelInstance.authenticatedFetch(
			`/api/v1/instance/${encodeURIComponent(options.intelInstance.instanceId.value)}/icon/since?timestamp=${timestamp}&timeout=${timeout}`,
			{
				method: 'GET',
			}
		);
		if (!response.ok) {
			throw new Error('Failed to load icons. ' + (await response.text()));
		}
		const data: { icons: IntelIcon[]; timestamp: number } = await response.json();
		lastLoadedTimestamp = data.timestamp;
		const newIcons = { ...icons.value };
		for (const icon of data.icons) {
			if (icon.deleted) {
				delete newIcons[icon.id];
			} else {
				newIcons[icon.id] = icon;
			}
		}
		icons.value = newIcons;
	}

	let scopeDestroyed = false;
	onScopeDispose(() => {
		scopeDestroyed = true;
	});

	const ready = ref(false);
	async function loop(backoff: number = 1_000, isFirst: boolean = false) {
		if (scopeDestroyed) return;
		await loadSince(lastLoadedTimestamp, isFirst ? 0 : undefined)
			.then(() => {
				if (scopeDestroyed) return;
				ready.value = true;
				loop();
			})
			.catch(async (err) => {
				console.error(err);
				if (scopeDestroyed) return;
				await new Promise((resolve) => setTimeout(resolve, backoff));
				return loop(Math.min(backoff * 2, 60_000));
			});
	}
	const readyPromise = loop(undefined, true);

	return {
		addIcon,
		icons,
		ready,
		readyPromise,
	};
}

export const useIcons = wrapMixin(_useIcons, (options) => `${options.intelInstance.instanceId.value}-icons`);
