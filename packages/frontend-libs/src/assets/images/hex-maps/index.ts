export enum MapSource {
	Vanilla = 'vanilla',
	ImprovedMapModRustardKnightEdit = 'improved-map-mod-rustard-knight-edit',
	ImprovedMapModRustardKnightEditHd = "improved-map-mod-rustard-knight-edit-hd"
}

export const HEX_MAPS = {
	[MapSource.Vanilla]: () => import('./vanilla').then(module => module.HEX_ASSETS),
	[MapSource.ImprovedMapModRustardKnightEdit]:
		() => import('./improved-map-mod-rustard-knight-edit').then(module => module.HEX_ASSETS),
	[MapSource.ImprovedMapModRustardKnightEditHd]: () => import('./improved-map-mod-rustard-knight-edit-hd').then(module => module.HEX_ASSETS),
};
