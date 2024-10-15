import ICON__120mm_conqueror from '@/assets/images/artillery/platform/120mm/conqueror.webp';
import ICON__120mm_koronides from '@/assets/images/artillery/platform/120mm/koronides.webp';
import ICON__120mm_trident from '@/assets/images/artillery/platform/120mm/trident.webp';
import ICON__150mm_sarissa from '@/assets/images/artillery/platform/150mm/sarissa.webp';
import ICON__150mm_thunderbolt from '@/assets/images/artillery/platform/150mm/thunderbolt.webp';
import ICON__300mm_storm_cannon from '@/assets/images/artillery/platform/300mm/storm-cannon.webp';
import ICON__300mm_tempest from '@/assets/images/artillery/platform/300mm/tempest.webp';
import ICON__fire_rocket_deioneus from '@/assets/images/artillery/platform/fire-rocket/deioneus.webp';
import ICON__high_explosive_rocket_hades_net from '@/assets/images/artillery/platform/high-explosive-rocket/hades-net.webp';
import ICON__high_explosive_rocket_retiarius from '@/assets/images/artillery/platform/high-explosive-rocket/retiarius.webp';
import ICON__mortar_charon from '@/assets/images/artillery/platform/mortar/charon.webp';
import ICON__mortar_cremari from '@/assets/images/artillery/platform/mortar/cremari.webp';
import ICON__mortar_peltast from '@/assets/images/artillery/platform/mortar/peltast.webp';
import ICON__titan from '@/assets/images/artillery/platform/titan.webp';
import ICON__120mm from '@/assets/images/artillery/shell/120mm.webp';
import ICON__150mm from '@/assets/images/artillery/shell/150mm.webp';
import ICON__300mm from '@/assets/images/artillery/shell/300mm.webp';
import ICON__fire_rocket from '@/assets/images/artillery/shell/fire-rocket.webp';
import ICON__high_explosive_rocket from '@/assets/images/artillery/shell/high-explosive-rocket.webp';
import ICON__mortar from '@/assets/images/artillery/shell/mortar.webp';

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
	ICON: string;
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

export const ARTILLERY_BY_SHELL = {
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
			},
			[SHELL_120MM_PLATFORM.TRIDENT]: {
				ICON: ICON__120mm_trident,
				AMMO_TYPE: AMMO_TYPE.SHELL_120MM,
				PLATFORM: SHELL_120MM_PLATFORM.TRIDENT,
				MIN_RANGE: 200,
				MAX_RANGE: 425,
				RANGE_INCREMENT: 0,
				MIN_SPREAD: 2.5,
				MAX_SPREAD: 8.5,
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
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
				WIND_OFFSET: 0,
			},
		},
	},
} satisfies {
	[AT in AMMO_TYPE]: {
		ICON: string;
		PLATFORM: {
			[PF in Platform<AT>]: ArtilleryPlatform;
		};
	};
};
