import { MapSource } from '@/lib/settings';
import { HEX_ASSETS as VANILLA } from './vanilla';
import { HEX_ASSETS as IMPROVED_MAP_MOD_RUSTARD_KNIGHT_EDIT } from './improved-map-mod-rustard-knight-edit';

export const HEX_MAPS = {
	[MapSource.Vanilla]: VANILLA,
	[MapSource.ImprovedMapModRustardKnightEdit]:
		IMPROVED_MAP_MOD_RUSTARD_KNIGHT_EDIT,
};
