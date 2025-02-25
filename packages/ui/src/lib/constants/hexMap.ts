import BasinSionnach from '@/assets/hexMap/BasinSionnach.png';
import SpeakingWoods from '@/assets/hexMap/SpeakingWoods.png';
import HowlCountry from '@/assets/hexMap/HowlCountry.png';
import CallumsCape from '@/assets/hexMap/CallumsCape.png';
import ReachingTrail from '@/assets/hexMap/ReachingTrail.png';
import ClansheadValley from '@/assets/hexMap/ClansheadValley.png';
import NevishLine from '@/assets/hexMap/NevishLine.png';
import TheMoors from '@/assets/hexMap/TheMoors.png';
import ViperPit from '@/assets/hexMap/ViperPit.png';
import MorgensCrossing from '@/assets/hexMap/MorgensCrossing.png';
import TheOarbreakerIsles from '@/assets/hexMap/TheOarbreakerIsles.png';
import Stonecradle from '@/assets/hexMap/Stonecradle.png';
import CallahansPassage from '@/assets/hexMap/CallahansPassage.png';
import WeatheredExpanse from '@/assets/hexMap/WeatheredExpanse.png';
import Godcrofts from '@/assets/hexMap/Godcrofts.png';
import FarranacCoast from '@/assets/hexMap/FarranacCoast.png';
import TheLinnOfMercy from '@/assets/hexMap/TheLinnOfMercy.png';
import MarbanHollow from '@/assets/hexMap/MarbanHollow.png';
import StlicanShelf from '@/assets/hexMap/StlicanShelf.png';
import FishermansRow from '@/assets/hexMap/FishermansRow.png';
import KingsCage from '@/assets/hexMap/KingsCage.png';
import Deadlands from '@/assets/hexMap/Deadlands.png';
import TheClahstra from '@/assets/hexMap/TheClahstra.png';
import TempestIsland from '@/assets/hexMap/TempestIsland.png';
import Westgate from '@/assets/hexMap/Westgate.png';
import LochMor from '@/assets/hexMap/LochMor.png';
import TheDrownedVale from '@/assets/hexMap/TheDrownedVale.png';
import EndlessShore from '@/assets/hexMap/EndlessShore.png';
import StemaLanding from '@/assets/hexMap/StemaLanding.png';
import Sableport from '@/assets/hexMap/Sableport.png';
import UmbralWildwood from '@/assets/hexMap/UmbralWildwood.png';
import AllodsBight from '@/assets/hexMap/AllodsBight.png';
import TheFingers from '@/assets/hexMap/TheFingers.png';
import Origin from '@/assets/hexMap/Origin.png';
import TheHeartlands from '@/assets/hexMap/TheHeartlands.png';
import ShackledChasm from '@/assets/hexMap/ShackledChasm.png';
import ReaversPass from '@/assets/hexMap/ReaversPass.png';
import AshFields from '@/assets/hexMap/AshFields.png';
import GreatMarch from '@/assets/hexMap/GreatMarch.png';
import Terminus from '@/assets/hexMap/Terminus.png';
import RedRiver from '@/assets/hexMap/RedRiver.png';
import Acrithia from '@/assets/hexMap/Acrithia.png';
import Kalokai from '@/assets/hexMap/Kalokai.png';

export enum Hex {
	BasinSionnach = 'Basin Sionnach',
	SpeakingWoods = 'Speaking Woods',
	HowlCountry = 'Howl Country',
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
	[            undefined,              Hex.SpeakingWoods,      Hex.HowlCountry,        undefined                           ],
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
	[Hex.BasinSionnach]: BasinSionnach,
	[Hex.SpeakingWoods]: SpeakingWoods,
	[Hex.HowlCountry]: HowlCountry,
	[Hex.CallumsCape]: CallumsCape,
	[Hex.ReachingTrail]: ReachingTrail,
	[Hex.ClansheadValley]: ClansheadValley,
	[Hex.NevishLine]: NevishLine,
	[Hex.TheMoors]: TheMoors,
	[Hex.ViperPit]: ViperPit,
	[Hex.MorgensCrossing]: MorgensCrossing,
	[Hex.TheOarbreakerIsles]: TheOarbreakerIsles,
	[Hex.Stonecradle]: Stonecradle,
	[Hex.CallahansPassage]: CallahansPassage,
	[Hex.WeatheredExpanse]: WeatheredExpanse,
	[Hex.Godcrofts]: Godcrofts,
	[Hex.FarranacCoast]: FarranacCoast,
	[Hex.TheLinnOfMercy]: TheLinnOfMercy,
	[Hex.MarbanHollow]: MarbanHollow,
	[Hex.StlicanShelf]: StlicanShelf,
	[Hex.FishermansRow]: FishermansRow,
	[Hex.KingsCage]: KingsCage,
	[Hex.Deadlands]: Deadlands,
	[Hex.TheClahstra]: TheClahstra,
	[Hex.TempestIsland]: TempestIsland,
	[Hex.Westgate]: Westgate,
	[Hex.LochMor]: LochMor,
	[Hex.TheDrownedVale]: TheDrownedVale,
	[Hex.EndlessShore]: EndlessShore,
	[Hex.StemaLanding]: StemaLanding,
	[Hex.Sableport]: Sableport,
	[Hex.UmbralWildwood]: UmbralWildwood,
	[Hex.AllodsBight]: AllodsBight,
	[Hex.TheFingers]: TheFingers,
	[Hex.Origin]: Origin,
	[Hex.TheHeartlands]: TheHeartlands,
	[Hex.ShackledChasm]: ShackledChasm,
	[Hex.ReaversPass]: ReaversPass,
	[Hex.AshFields]: AshFields,
	[Hex.GreatMarch]: GreatMarch,
	[Hex.Terminus]: Terminus,
	[Hex.RedRiver]: RedRiver,
	[Hex.Acrithia]: Acrithia,
	[Hex.Kalokai]: Kalokai,
};
