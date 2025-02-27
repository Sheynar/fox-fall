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

export enum SPOTTING_TYPE {
	BINOCULARS = 'Binoculars',
	OBSERVATION_BUNKER = 'Observation bunker',
}

export type SpottingSpecs = {
	ICON: any;
	MAX_RANGE: number;
};

export const SPOTTING_BY_TYPE: {
	[ST in SPOTTING_TYPE]: SpottingSpecs;
} = {
	[SPOTTING_TYPE.BINOCULARS]: {
		ICON: ICON__binoculars,
		MAX_RANGE: 125,
	},
	[SPOTTING_TYPE.OBSERVATION_BUNKER]: {
		ICON: ICON__observation_bunker,
		MAX_RANGE: 230,
	},
};

export enum AMMO_TYPE {
	MORTAR = 'mortar',
	FIRE_ROCKET = '4c fire rocket',
	HIGH_EXPLOSIVE_ROCKET = '3c high explosive rocket',
	SHELL_120MM = '120mm',
	SHELL_150MM = '150mm',
	SHELL_300MM = '300mm',
}

export enum MORTAR_PLATFORM {
	PELTAST = 'HH-d peltast',
	CHARON = 'Type C charon',
	CREMARI = 'Cremari',
}

export enum FIRE_ROCKET_PLATFORM {
	DEIONEUS = 'T13 deionius',
}

export enum HIGH_EXPLOSIVE_ROCKET_PLATFORM {
	RETIARIUS = 'R-17 retiarius skirmisher',
	HADES_NET = 'DAE 3b-2 hades net',
}

export enum SHELL_120MM_PLATFORM {
	KORONIDES = '120-68 koronides field gun',
	TRIDENT = 'AC-b trident',
	CONQUEROR = 'Conqueror',
	TITAN = 'Titan',
}

export enum SHELL_150MM_PLATFORM {
	SARISSA = 'Lance-46 sarissa',
	TITAN = 'Titan',
	THUNDERBOLT = '50-500 thunderbolt',
}

export enum SHELL_300MM_PLATFORM {
	TEMPEST = 'Tempest cannon RA-2',
	STORM_CANNON = 'Storm cannon',
}

export type Platform<AT extends AMMO_TYPE> = AT extends AMMO_TYPE.MORTAR
	? MORTAR_PLATFORM
	: AT extends AMMO_TYPE.FIRE_ROCKET
		? FIRE_ROCKET_PLATFORM
		: AT extends AMMO_TYPE.HIGH_EXPLOSIVE_ROCKET
			? HIGH_EXPLOSIVE_ROCKET_PLATFORM
			: AT extends AMMO_TYPE.SHELL_120MM
				? SHELL_120MM_PLATFORM
				: AT extends AMMO_TYPE.SHELL_150MM
					? SHELL_150MM_PLATFORM
					: AT extends AMMO_TYPE.SHELL_300MM
						? SHELL_300MM_PLATFORM
						: never;

export type ArtillerySpecs = {
	ICON: any;
	MIN_RANGE: number;
	MAX_RANGE: number;
	RANGE_INCREMENT: number;
	MIN_SPREAD: number;
	MAX_SPREAD: number;
	WIND_OFFSET: number;
};

export type ArtilleryPlatform = ArtillerySpecs &
	(
		| {
				AMMO_TYPE: AMMO_TYPE.MORTAR;
				PLATFORM: MORTAR_PLATFORM;
		  }
		| {
				AMMO_TYPE: AMMO_TYPE.FIRE_ROCKET;
				PLATFORM: FIRE_ROCKET_PLATFORM;
		  }
		| {
				AMMO_TYPE: AMMO_TYPE.HIGH_EXPLOSIVE_ROCKET;
				PLATFORM: HIGH_EXPLOSIVE_ROCKET_PLATFORM;
		  }
		| {
				AMMO_TYPE: AMMO_TYPE.SHELL_120MM;
				PLATFORM: SHELL_120MM_PLATFORM;
		  }
		| {
				AMMO_TYPE: AMMO_TYPE.SHELL_150MM;
				PLATFORM: SHELL_150MM_PLATFORM;
		  }
		| {
				AMMO_TYPE: AMMO_TYPE.SHELL_300MM;
				PLATFORM: SHELL_300MM_PLATFORM;
		  }
	);

export const ARTILLERY_BY_SHELL: {
	[AT in AMMO_TYPE]: {
		ICON: any;
		PLATFORM: {
			[PF in Platform<AMMO_TYPE>]?: ArtilleryPlatform;
		};
	};
} = {
	[AMMO_TYPE.MORTAR]: {
		ICON: ICON__mortar,
		PLATFORM: {
			[MORTAR_PLATFORM.CHARON]: {
				ICON: ICON__mortar_charon,
				AMMO_TYPE: AMMO_TYPE.MORTAR,
				PLATFORM: MORTAR_PLATFORM.CHARON,
				MIN_RANGE: 75,
				MAX_RANGE: 100,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 2.5,
				MAX_SPREAD: 9.45,
				WIND_OFFSET: 7.5, // NOT VERIFIED
			},
			[MORTAR_PLATFORM.CREMARI]: {
				ICON: ICON__mortar_cremari,
				AMMO_TYPE: AMMO_TYPE.MORTAR,
				PLATFORM: MORTAR_PLATFORM.CREMARI,
				MIN_RANGE: 45,
				MAX_RANGE: 80,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 5.5,
				MAX_SPREAD: 12,
				WIND_OFFSET: 7.5, // NOT VERIFIED
			},
			[MORTAR_PLATFORM.PELTAST]: {
				ICON: ICON__mortar_peltast,
				AMMO_TYPE: AMMO_TYPE.MORTAR,
				PLATFORM: MORTAR_PLATFORM.PELTAST,
				MIN_RANGE: 45,
				MAX_RANGE: 80,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 2.5,
				MAX_SPREAD: 9.45,
				WIND_OFFSET: 7.5, // NOT VERIFIED
			},
		},
	},

	[AMMO_TYPE.FIRE_ROCKET]: {
		ICON: ICON__fire_rocket,
		PLATFORM: {
			[FIRE_ROCKET_PLATFORM.DEIONEUS]: {
				ICON: ICON__fire_rocket_deioneus,
				AMMO_TYPE: AMMO_TYPE.FIRE_ROCKET,
				PLATFORM: FIRE_ROCKET_PLATFORM.DEIONEUS,
				MIN_RANGE: 250,
				MAX_RANGE: 300,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 30,
				MAX_SPREAD: 41.5,
				WIND_OFFSET: 25,
			},
		},
	},

	[AMMO_TYPE.HIGH_EXPLOSIVE_ROCKET]: {
		ICON: ICON__high_explosive_rocket,
		PLATFORM: {
			[HIGH_EXPLOSIVE_ROCKET_PLATFORM.HADES_NET]: {
				ICON: ICON__high_explosive_rocket_hades_net,
				AMMO_TYPE: AMMO_TYPE.HIGH_EXPLOSIVE_ROCKET,
				PLATFORM: HIGH_EXPLOSIVE_ROCKET_PLATFORM.HADES_NET,
				MIN_RANGE: 200,
				MAX_RANGE: 425,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 25,
				MAX_SPREAD: 41.5,
				WIND_OFFSET: 25,
			},
			[HIGH_EXPLOSIVE_ROCKET_PLATFORM.RETIARIUS]: {
				ICON: ICON__high_explosive_rocket_retiarius,
				AMMO_TYPE: AMMO_TYPE.HIGH_EXPLOSIVE_ROCKET,
				PLATFORM: HIGH_EXPLOSIVE_ROCKET_PLATFORM.RETIARIUS,
				MIN_RANGE: 225,
				MAX_RANGE: 350,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 25,
				MAX_SPREAD: 41.5,
				WIND_OFFSET: 25,
			},
		},
	},

	[AMMO_TYPE.SHELL_120MM]: {
		ICON: ICON__120mm,
		PLATFORM: {
			[SHELL_120MM_PLATFORM.CONQUEROR]: {
				ICON: ICON__120mm_conqueror,
				AMMO_TYPE: AMMO_TYPE.SHELL_120MM,
				PLATFORM: SHELL_120MM_PLATFORM.CONQUEROR,
				MIN_RANGE: 100,
				MAX_RANGE: 200,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 2.5,
				MAX_SPREAD: 8.5,
				WIND_OFFSET: 25,
			},
			[SHELL_120MM_PLATFORM.KORONIDES]: {
				ICON: ICON__120mm_koronides,
				AMMO_TYPE: AMMO_TYPE.SHELL_120MM,
				PLATFORM: SHELL_120MM_PLATFORM.KORONIDES,
				MIN_RANGE: 100,
				MAX_RANGE: 250,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 22.5,
				MAX_SPREAD: 30,
				WIND_OFFSET: 25,
			},
			[SHELL_120MM_PLATFORM.TITAN]: {
				ICON: ICON__titan,
				AMMO_TYPE: AMMO_TYPE.SHELL_120MM,
				PLATFORM: SHELL_120MM_PLATFORM.TITAN,
				MIN_RANGE: 100,
				MAX_RANGE: 200,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 2.5,
				MAX_SPREAD: 8.5,
				WIND_OFFSET: 25,
			},
			[SHELL_120MM_PLATFORM.TRIDENT]: {
				ICON: ICON__120mm_trident,
				AMMO_TYPE: AMMO_TYPE.SHELL_120MM,
				PLATFORM: SHELL_120MM_PLATFORM.TRIDENT,
				MIN_RANGE: 100,
				MAX_RANGE: 225,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 2.5,
				MAX_SPREAD: 8.5,
				WIND_OFFSET: 25,
			},
		},
	},

	[AMMO_TYPE.SHELL_150MM]: {
		ICON: ICON__150mm,
		PLATFORM: {
			[SHELL_150MM_PLATFORM.SARISSA]: {
				ICON: ICON__150mm_sarissa,
				AMMO_TYPE: AMMO_TYPE.SHELL_150MM,
				PLATFORM: SHELL_150MM_PLATFORM.SARISSA,
				MIN_RANGE: 120,
				MAX_RANGE: 250,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 25,
				MAX_SPREAD: 35,
				WIND_OFFSET: 25,
			},
			[SHELL_150MM_PLATFORM.THUNDERBOLT]: {
				ICON: ICON__150mm_thunderbolt,
				AMMO_TYPE: AMMO_TYPE.SHELL_150MM,
				PLATFORM: SHELL_150MM_PLATFORM.THUNDERBOLT,
				MIN_RANGE: 200,
				MAX_RANGE: 350,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 32.5,
				MAX_SPREAD: 40,
				WIND_OFFSET: 25,
			},
			[SHELL_150MM_PLATFORM.TITAN]: {
				ICON: ICON__titan,
				AMMO_TYPE: AMMO_TYPE.SHELL_150MM,
				PLATFORM: SHELL_150MM_PLATFORM.TITAN,
				MIN_RANGE: 100,
				MAX_RANGE: 225,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 2.5,
				MAX_SPREAD: 8.5,
				WIND_OFFSET: 25,
			},
		},
	},

	[AMMO_TYPE.SHELL_300MM]: {
		ICON: ICON__300mm,
		PLATFORM: {
			[SHELL_300MM_PLATFORM.STORM_CANNON]: {
				ICON: ICON__300mm_storm_cannon,
				AMMO_TYPE: AMMO_TYPE.SHELL_300MM,
				PLATFORM: SHELL_300MM_PLATFORM.STORM_CANNON,
				MIN_RANGE: 400,
				MAX_RANGE: 1000,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 50,
				MAX_SPREAD: 50,
				WIND_OFFSET: 50,
			},
			[SHELL_300MM_PLATFORM.TEMPEST]: {
				ICON: ICON__300mm_tempest,
				AMMO_TYPE: AMMO_TYPE.SHELL_300MM,
				PLATFORM: SHELL_300MM_PLATFORM.TEMPEST,
				MIN_RANGE: 350,
				MAX_RANGE: 500,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 50,
				MAX_SPREAD: 50,
				WIND_OFFSET: 50,
			},
		},
	},
};
