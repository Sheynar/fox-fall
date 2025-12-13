import { UnitType } from '@packages/data/dist/artillery/unit';
import ICON__artillery from '@/components/icons/ArtilleryIcon.vue';
import ICON__landing_zone from '@/components/icons/ExplosionIcon.vue';
import ICON__location from '@/components/icons/LocationIcon.vue';
import ICON__spotter from '@/components/icons/SpotterIcon.vue';
import ICON__target from '@/components/icons/TargetIcon.vue';

export const UNIT_ICON_BY_TYPE: Record<UnitType, any> = {
	[UnitType.Artillery]: ICON__artillery,
	[UnitType.LandingZone]: ICON__landing_zone,
	[UnitType.Location]: ICON__location,
	[UnitType.Spotter]: ICON__spotter,
	[UnitType.Target]: ICON__target,
};
