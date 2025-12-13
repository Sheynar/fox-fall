import ICON__120mm_conqueror from '@/components/icons/artillery/platform/120mm/conqueror.vue';
import ICON__120mm_koronides from '@/components/icons/artillery/platform/120mm/koronides.vue';
import ICON__120mm_trident from '@/components/icons/artillery/platform/120mm/trident.vue';
import ICON__150mm_sarissa from '@/components/icons/artillery/platform/150mm/sarissa.vue';
import ICON__150mm_thunderbolt from '@/components/icons/artillery/platform/150mm/thunderbolt.vue';
import ICON__300mm_storm_cannon from '@/components/icons/artillery/platform/300mm/storm-cannon.vue';
import ICON__300mm_tempest from '@/components/icons/artillery/platform/300mm/tempest.vue';
import ICON__fire_rocket_deioneus from '@/components/icons/artillery/platform/fire-rocket/deioneus.vue';
import ICON__high_explosive_rocket_hades_net from '@/components/icons/artillery/platform/high-explosive-rocket/hades-net.vue';
import ICON__high_explosive_rocket_retiarius from '@/components/icons/artillery/platform/high-explosive-rocket/retiarius.vue';
import ICON__mortar_charon from '@/components/icons/artillery/platform/mortar/charon.vue';
import ICON__mortar_cremari from '@/components/icons/artillery/platform/mortar/cremari.vue';
import ICON__mortar_peltast from '@/components/icons/artillery/platform/mortar/peltast.vue';
import ICON__titan from '@/components/icons/artillery/platform/titan.vue';
import ICON__120mm from '@/components/icons/artillery/shell/120mm.vue';
import ICON__150mm from '@/components/icons/artillery/shell/150mm.vue';
import ICON__300mm from '@/components/icons/artillery/shell/300mm.vue';
import ICON__fire_rocket from '@/components/icons/artillery/shell/fire-rocket.vue';
import ICON__high_explosive_rocket from '@/components/icons/artillery/shell/high-explosive-rocket.vue';
import ICON__mortar from '@/components/icons/artillery/shell/mortar.vue';
import ICON__observation_bunker from '@/components/icons/ObservationBunkerIcon.vue';
import ICON__binoculars from '@/components/icons/BinocularsIcon.vue';

import { AMMO_TYPE, FIRE_ROCKET_PLATFORM, HIGH_EXPLOSIVE_ROCKET_PLATFORM, MORTAR_PLATFORM, Platform, SHELL_120MM_PLATFORM, SHELL_150MM_PLATFORM, SHELL_300MM_PLATFORM, SPOTTING_TYPE } from '@packages/data/dist/artillery/unit/constants';

export const ICONS: Record<SPOTTING_TYPE | AMMO_TYPE | Platform<AMMO_TYPE>, any> = {
	[SPOTTING_TYPE.BINOCULARS]: ICON__binoculars,
	[SPOTTING_TYPE.OBSERVATION_BUNKER]: ICON__observation_bunker,
	[AMMO_TYPE.MORTAR]: ICON__mortar,
	[AMMO_TYPE.FIRE_ROCKET]: ICON__fire_rocket,
	[AMMO_TYPE.HIGH_EXPLOSIVE_ROCKET]: ICON__high_explosive_rocket,
	[AMMO_TYPE.SHELL_120MM]: ICON__120mm,
	[AMMO_TYPE.SHELL_150MM]: ICON__150mm,
	[AMMO_TYPE.SHELL_300MM]: ICON__300mm,
	[MORTAR_PLATFORM.PELTAST]: ICON__mortar_peltast,
	[MORTAR_PLATFORM.CHARON]: ICON__mortar_charon,
	[MORTAR_PLATFORM.CREMARI]: ICON__mortar_cremari,
	[FIRE_ROCKET_PLATFORM.DEIONEUS]: ICON__fire_rocket_deioneus,
	[HIGH_EXPLOSIVE_ROCKET_PLATFORM.HADES_NET]: ICON__high_explosive_rocket_hades_net,
	[HIGH_EXPLOSIVE_ROCKET_PLATFORM.RETIARIUS]: ICON__high_explosive_rocket_retiarius,
	[SHELL_120MM_PLATFORM.CONQUEROR]: ICON__120mm_conqueror,
	[SHELL_120MM_PLATFORM.KORONIDES]: ICON__120mm_koronides,
	[SHELL_120MM_PLATFORM.TITAN]: ICON__titan,
	[SHELL_120MM_PLATFORM.TRIDENT]: ICON__120mm_trident,
	[SHELL_150MM_PLATFORM.SARISSA]: ICON__150mm_sarissa,
	[SHELL_150MM_PLATFORM.THUNDERBOLT]: ICON__150mm_thunderbolt,
	[SHELL_150MM_PLATFORM.TITAN]: ICON__titan,
	[SHELL_300MM_PLATFORM.STORM_CANNON]: ICON__300mm_storm_cannon,
	[SHELL_300MM_PLATFORM.TEMPEST]: ICON__300mm_tempest,
};
