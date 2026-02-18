export enum MapSource {
	Vanilla = 'vanilla',
	ImprovedMapModRustardKnightEdit = 'improved-map-mod-rustard-knight-edit',
}

export const HEX_MAPS = {
	[MapSource.Vanilla]: () => import('./vanilla').then(module => module.HEX_ASSETS),
	[MapSource.ImprovedMapModRustardKnightEdit]:
		() => import('./improved-map-mod-rustard-knight-edit').then(module => module.HEX_ASSETS),
};
