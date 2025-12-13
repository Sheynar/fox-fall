import { UnitType } from '@packages/data/dist/artillery/unit';
import ICON__artillery from '@packages/frontend-libs/dist/icons/ArtilleryIcon.vue';
import ICON__landing_zone from '@packages/frontend-libs/dist/icons/ExplosionIcon.vue';
import ICON__location from '@packages/frontend-libs/dist/icons/LocationIcon.vue';
import ICON__spotter from '@packages/frontend-libs/dist/icons/SpotterIcon.vue';
import ICON__target from '@packages/frontend-libs/dist/icons/TargetIcon.vue';

export const UNIT_ICON_BY_TYPE: Record<UnitType, any> = {
	[UnitType.Artillery]: ICON__artillery,
	[UnitType.LandingZone]: ICON__landing_zone,
	[UnitType.Location]: ICON__location,
	[UnitType.Spotter]: ICON__spotter,
	[UnitType.Target]: ICON__target,
};
