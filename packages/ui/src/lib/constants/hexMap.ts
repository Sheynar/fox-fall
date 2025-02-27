import BasinSionnachMap from '@/assets/images/hex-maps/MapBasinSionnachHex.png';
import SpeakingWoodsMap from '@/assets/images/hex-maps/MapSpeakingWoodsHex.png';
import HowlCountyMap from '@/assets/images/hex-maps/MapHowlCountyHex.png';
import CallumsCapeMap from '@/assets/images/hex-maps/MapCallumsCapeHex.png';
import ReachingTrailMap from '@/assets/images/hex-maps/MapReachingTrailHex.png';
import ClansheadValleyMap from '@/assets/images/hex-maps/MapClansheadValleyHex.png';
import NevishLineMap from '@/assets/images/hex-maps/MapNevishLineHex.png';
import TheMoorsMap from '@/assets/images/hex-maps/MapMooringCountyHex.png';
import ViperPitMap from '@/assets/images/hex-maps/MapViperPitHex.png';
import MorgensCrossingMap from '@/assets/images/hex-maps/MapMorgensCrossingHex.png';
import TheOarbreakerIslesMap from '@/assets/images/hex-maps/MapOarbreakerHex.png';
import StonecradleMap from '@/assets/images/hex-maps/MapStonecradleHex.png';
import CallahansPassageMap from '@/assets/images/hex-maps/MapCallahansPassageHex.png';
import WeatheredExpanseMap from '@/assets/images/hex-maps/MapWeatheredExpanseHex.png';
import GodcroftsMap from '@/assets/images/hex-maps/MapGodcroftsHex.png';
import FarranacCoastMap from '@/assets/images/hex-maps/MapFarranacCoastHex.png';
import TheLinnOfMercyMap from '@/assets/images/hex-maps/MapLinnMercyHex.png';
import MarbanHollowMap from '@/assets/images/hex-maps/MapMarbanHollow.png';
import StlicanShelfMap from '@/assets/images/hex-maps/MapStlicanShelfHex.png';
import FishermansRowMap from '@/assets/images/hex-maps/MapFishermansRowHex.png';
import KingsCageMap from '@/assets/images/hex-maps/MapKingsCageHex.png';
import DeadlandsMap from '@/assets/images/hex-maps/MapDeadlandsHex.png';
import TheClahstraMap from '@/assets/images/hex-maps/MapClahstraHexMap.png';
import TempestIslandMap from '@/assets/images/hex-maps/MapTempestIslandHex.png';
import WestgateMap from '@/assets/images/hex-maps/MapWestgateHex.png';
import LochMorMap from '@/assets/images/hex-maps/MapLochMorHex.png';
import TheDrownedValeMap from '@/assets/images/hex-maps/MapDrownedValeHex.png';
import EndlessShoreMap from '@/assets/images/hex-maps/MapEndlessShoreHex.png';
import StemaLandingMap from '@/assets/images/hex-maps/MapStemaLandingHex.png';
import SableportMap from '@/assets/images/hex-maps/MapSableportHex.png';
import UmbralWildwoodMap from '@/assets/images/hex-maps/MapUmbralWildwoodHex.png';
import AllodsBightMap from '@/assets/images/hex-maps/MapAllodsBightHex.png';
import TheFingersMap from '@/assets/images/hex-maps/MapTheFingersHex.png';
import OriginMap from '@/assets/images/hex-maps/MapOriginHex.png';
import TheHeartlandsMap from '@/assets/images/hex-maps/MapHeartlandsHex.png';
import ShackledChasmMap from '@/assets/images/hex-maps/MapShackledChasmHex.png';
import ReaversPassMap from '@/assets/images/hex-maps/MapReaversPassHex.png';
import AshFieldsMap from '@/assets/images/hex-maps/MapAshFieldsHex.png';
import GreatMarchMap from '@/assets/images/hex-maps/MapGreatMarchHex.png';
import TerminusMap from '@/assets/images/hex-maps/MapTerminusHex.png';
import RedRiverMap from '@/assets/images/hex-maps/MapRedRiverHex.png';
import AcrithiaMap from '@/assets/images/hex-maps/MapAcrithiaHex.png';
import KalokaiMap from '@/assets/images/hex-maps/MapKalokaiHex.png';

export enum Hex {
	BasinSionnach = 'Basin Sionnach',
	SpeakingWoods = 'Speaking Woods',
	HowlCounty = 'Howl County',
	CallumsCape = 'Callum\'s Cape',
	ReachingTrail = 'Reaching Trail',
	ClansheadValley = 'Clanshead Valley',
	NevishLine = 'Nevish Line',
	TheMoors = 'The Moors',
	ViperPit = 'Viper Pit',
	MorgensCrossing = 'Morgen\'s Crossing',
	TheOarbreakerIsles = 'The Oarbreaker Isles',
	Stonecradle = 'Stonecradle',
	CallahansPassage = 'Callahan\'s Passage',
	WeatheredExpanse = 'Weathered Expanse',
	Godcrofts = 'Godcrofts',
	FarranacCoast = 'Farranac Coast',
	TheLinnOfMercy = 'The Linn of Mercy',
	MarbanHollow = 'Marban Hollow',
	StlicanShelf = 'Stlican Shelf',
	FishermansRow = 'Fisherman\'s Row',
	KingsCage = 'King\'s Cage',
	Deadlands = 'Deadlands',
	TheClahstra = 'The Clahstra',
	TempestIsland = 'Tempest Island',
	Westgate = 'Westgate',
	LochMor = 'Loch Mór',
	TheDrownedVale = 'The Drowned Vale',
	EndlessShore = 'Endless Shore',
	StemaLanding = 'Stema Landing',
	Sableport = 'Sableport',
	UmbralWildwood = 'Umbral Wildwood',
	AllodsBight = 'Allod\'s Bight',
	TheFingers = 'The Fingers',
	Origin = 'Origin',
	TheHeartlands = 'The Heartlands',
	ShackledChasm = 'Shackled Chasm',
	ReaversPass = 'Reaver\'s Pass',
	AshFields = 'Ash Fields',
	GreatMarch = 'Great March',
	Terminus = 'Terminus',
	RedRiver = 'Red River',
	Acrithia = 'Acrithia',
	Kalokai = 'Kalokai',
}

export const HEX_POSITIONS = [
	[undefined,              undefined,              Hex.BasinSionnach,      undefined,              undefined,              ],
	[            undefined,              Hex.SpeakingWoods,      Hex.HowlCounty,         undefined                           ],
	[undefined,              Hex.CallumsCape,        Hex.ReachingTrail,      Hex.ClansheadValley,    undefined               ],
	[            Hex.NevishLine,         Hex.TheMoors,           Hex.ViperPit,           Hex.MorgensCrossing                 ],
	[Hex.TheOarbreakerIsles, Hex.Stonecradle,        Hex.CallahansPassage,   Hex.WeatheredExpanse,   Hex.Godcrofts           ],
	[            Hex.FarranacCoast,      Hex.TheLinnOfMercy,     Hex.MarbanHollow,       Hex.StlicanShelf                    ],
	[Hex.FishermansRow,      Hex.KingsCage,          Hex.Deadlands,          Hex.TheClahstra,        Hex.TempestIsland       ],
	[            Hex.Westgate,           Hex.LochMor,            Hex.TheDrownedVale,     Hex.EndlessShore                    ],
	[Hex.StemaLanding,       Hex.Sableport,          Hex.UmbralWildwood,     Hex.AllodsBight,        Hex.TheFingers          ],
	[            Hex.Origin,             Hex.TheHeartlands,      Hex.ShackledChasm,      Hex.ReaversPass                     ],
	[undefined,              Hex.AshFields,          Hex.GreatMarch,         Hex.Terminus,           undefined               ],
	[            undefined,              Hex.RedRiver,           Hex.Acrithia,           undefined                           ],
	[undefined,              undefined,              Hex.Kalokai,            undefined,              undefined               ],
];

export const HEX_ASSETS: Record<Hex, string> = {
	[Hex.BasinSionnach]: BasinSionnachMap,
	[Hex.SpeakingWoods]: SpeakingWoodsMap,
	[Hex.HowlCounty]: HowlCountyMap,
	[Hex.CallumsCape]: CallumsCapeMap,
	[Hex.ReachingTrail]: ReachingTrailMap,
	[Hex.ClansheadValley]: ClansheadValleyMap,
	[Hex.NevishLine]: NevishLineMap,
	[Hex.TheMoors]: TheMoorsMap,
	[Hex.ViperPit]: ViperPitMap,
	[Hex.MorgensCrossing]: MorgensCrossingMap,
	[Hex.TheOarbreakerIsles]: TheOarbreakerIslesMap,
	[Hex.Stonecradle]: StonecradleMap,
	[Hex.CallahansPassage]: CallahansPassageMap,
	[Hex.WeatheredExpanse]: WeatheredExpanseMap,
	[Hex.Godcrofts]: GodcroftsMap,
	[Hex.FarranacCoast]: FarranacCoastMap,
	[Hex.TheLinnOfMercy]: TheLinnOfMercyMap,
	[Hex.MarbanHollow]: MarbanHollowMap,
	[Hex.StlicanShelf]: StlicanShelfMap,
	[Hex.FishermansRow]: FishermansRowMap,
	[Hex.KingsCage]: KingsCageMap,
	[Hex.Deadlands]: DeadlandsMap,
	[Hex.TheClahstra]: TheClahstraMap,
	[Hex.TempestIsland]: TempestIslandMap,
	[Hex.Westgate]: WestgateMap,
	[Hex.LochMor]: LochMorMap,
	[Hex.TheDrownedVale]: TheDrownedValeMap,
	[Hex.EndlessShore]: EndlessShoreMap,
	[Hex.StemaLanding]: StemaLandingMap,
	[Hex.Sableport]: SableportMap,
	[Hex.UmbralWildwood]: UmbralWildwoodMap,
	[Hex.AllodsBight]: AllodsBightMap,
	[Hex.TheFingers]: TheFingersMap,
	[Hex.Origin]: OriginMap,
	[Hex.TheHeartlands]: TheHeartlandsMap,
	[Hex.ShackledChasm]: ShackledChasmMap,
	[Hex.ReaversPass]: ReaversPassMap,
	[Hex.AshFields]: AshFieldsMap,
	[Hex.GreatMarch]: GreatMarchMap,
	[Hex.Terminus]: TerminusMap,
	[Hex.RedRiver]: RedRiverMap,
	[Hex.Acrithia]: AcrithiaMap,
	[Hex.Kalokai]: KalokaiMap,
};
