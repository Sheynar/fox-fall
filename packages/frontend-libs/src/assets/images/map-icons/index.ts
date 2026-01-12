// import MapIconArmory from './MapIconArmory.png?no-inline';
// import MapIconBorderBase from './MapIconBorderBase.png?no-inline';
// import MapIconBunkerBaseTier1 from './MapIconBunkerBaseTier1.png?no-inline';
// import MapIconBunkerBaseTier2 from './MapIconBunkerBaseTier2.png?no-inline';
// import MapIconBunkerBaseTier3 from './MapIconBunkerBaseTier3.png?no-inline';
// import MapIconCivicCenter from './MapIconCivicCenter.png?no-inline';
import MapIconCoal from './MapIconCoal.png?no-inline';
import MapIconCoastalGun from './MapIconCoastalGun.png?no-inline';
import MapIconComponentMine from './MapIconComponentMine.png?no-inline';
import MapIconComponents from './MapIconComponents.png?no-inline';
import MapIconConquestC from './MapIconConquestC.png?no-inline';
import MapIconConstructionYard from './MapIconConstructionYard.png?no-inline';
import MapIconFacilityMineOilRig from './MapIconFacilityMineOilRig.png?no-inline';
// import MapIconFacilityModificationCenter from './MapIconFacilityModificationCenter.png?no-inline';
// import MapIconFacilityVehicleFactory1 from './MapIconFacilityVehicleFactory1.png?no-inline';
// import MapIconFacilityVehicleFactory2 from './MapIconFacilityVehicleFactory2.png?no-inline';
// import MapIconFacilityVehicleFactory3 from './MapIconFacilityVehicleFactory3.png?no-inline';
import MapIcomFactory from './MapIconFactory.png?no-inline';
import MapIconFort from './MapIconFort.png?no-inline';
// import MapIconFortCursed from './MapIconFortCursed.png?no-inline';
import MapIconForwardBase1 from './MapIconForwardBase1.png?no-inline';
// import MapIconFrontierBase1 from './MapIconFrontierBase1.png?no-inline';
import MapIconFuel from './MapIconFuel.png?no-inline';
import MapIconHospital from './MapIconHospital.png?no-inline';
import MapIconIntelcenter from './MapIconIntelcenter.png?no-inline';
import MapIconLargeShipBaseShip from './MapIconLargeShipBaseShip.png?no-inline';
// import MapIconLargeShipStorageShip from './MapIconLargeShipStorageShip.png?no-inline';
import MapIconManufacturing from './MapIconManufacturing.png?no-inline';
import MapIconMassProductionFactory from './MapIconMassProductionFactory.png?no-inline';
import MapIconMortarHouse from './MapIconMortarHouse.png?no-inline';
import MapIconObservationTower from './MapIconObservationTower.png?no-inline';
// import MapIconOutpost from './MapIconOutpost.png?no-inline';
import MapIconRelicBase from './MapIconRelicBase.png?no-inline';
import MapIconRocketGroundZero from './MapIconRocketGroundZero.png?no-inline';
import MapIconRocketSite from './MapIconRocketSite.png?no-inline';
import MapIconRocketSiteWithRocket from './MapIconRocketSiteWithRocket.png?no-inline';
import MapIconRocketTarget from './MapIconRocketTarget.png?no-inline';
import MapIconSafehouse from './MapIconSafehouse.png?no-inline';
// import MapIconScorchedTown from './MapIconScorchedTown.png?no-inline';
import MapIconScrapMine from './MapIconScrapMine.png?no-inline';
import MapIconSeaport from './MapIconSeaport.png?no-inline';
// import MapIconsFortGarrisonStation from './MapIconsFortGarrisonStation.png?no-inline';
import MapIconsKeep from './MapIconsKeep.png?no-inline';
// import MapIconSmallArmsFacility from './MapIconSmallArmsFacility.png?no-inline';
import MapIconSoulFactory from './MapIconSoulFactory.png?no-inline';
// import MapIconStaticBase1 from './MapIconStaticBase1.png?no-inline';
// import MapIconStaticBase2 from './MapIconStaticBase2.png?no-inline';
// import MapIconStaticBase3 from './MapIconStaticBase3.png?no-inline';
import MapIconStorageFacility from './MapIconStorageFacility.png?no-inline';
import MapIconStormCannon from './MapIconStormCannon.png?no-inline';
import MapIconsTrainingGround from './MapIconsTrainingGround.png?no-inline';
import MapIconSulfur from './MapIconSulfur.png?no-inline';
import MapIconSulfurMine from './MapIconSulfurMine.png?no-inline';
// import MapIconSupplies from './MapIconSupplies.png?no-inline';
import MapIconTechCenter from './MapIconTechCenter.png?no-inline';
import MapIconTownBaseTier1 from './MapIconTownBaseTier1.png?no-inline';
import MapIconTownBaseTier2 from './MapIconTownBaseTier2.png?no-inline';
import MapIconTownBaseTier3 from './MapIconTownBaseTier3.png?no-inline';
// import MapIconTownHallNeutral from './MapIconTownHallNeutral.png?no-inline';
// import MapIconTunnelNetwork from './MapIconTunnelNetwork.png?no-inline';
import MapIconVehicle from './MapIconVehicle.png?no-inline';
import MapIconWeatherStation from './MapIconWeatherStation.png?no-inline';
// import MaterialTransferStationMapIcon from './MaterialTransferStationMapIcon.png?no-inline';
// import ResourceTransferStationMapIcon from './ResourceTransferStationMapIcon.png?no-inline';
import SalvageMapIcon from './SalvageMapIcon.png?no-inline';
import Shipyard from './Shipyard.png?no-inline';

import { MapIconType } from '@packages/foxhole-api';

export const MAP_ICONS: Record<MapIconType, string | false> = {
	[MapIconType.StaticBase1]: false,
	[MapIconType.StaticBase2]: false,
	[MapIconType.StaticBase3]: false,
	[MapIconType.ForwardBase1]: MapIconForwardBase1,
	[MapIconType.ForwardBase2]: false,
	[MapIconType.ForwardBase3]: false,
	[MapIconType.Hospital]: MapIconHospital,
	[MapIconType.VehicleFactory]: MapIconVehicle,
	[MapIconType.Armory]: false,
	[MapIconType.SupplyStation]: false,
	[MapIconType.Workshop]: false,
	[MapIconType.ManufacturingPlant]: false,
	[MapIconType.Refinery]: MapIconManufacturing,
	[MapIconType.Shipyard]: Shipyard,
	[MapIconType.TechCenter]: MapIconTechCenter,
	[MapIconType.SalvageField]: SalvageMapIcon,
	[MapIconType.ComponentField]: MapIconComponents,
	[MapIconType.FuelField]: MapIconFuel,
	[MapIconType.SulfurField]: MapIconSulfur,
	[MapIconType.WorldMapTent]: false,
	[MapIconType.TravelTent]: MapIconConquestC,
	[MapIconType.TrainingArea]: MapIconsTrainingGround,
	[MapIconType.Keep]: MapIconsKeep,
	[MapIconType.ObservationTower]: MapIconObservationTower,
	[MapIconType.Fort]: MapIconFort,
	[MapIconType.TroopShip]: MapIconLargeShipBaseShip,
	[MapIconType.SulfurMine]: MapIconSulfurMine,
	[MapIconType.StorageFacility]: MapIconStorageFacility,
	[MapIconType.Factory]: MapIcomFactory,
	[MapIconType.GarrisonStation]: MapIconSafehouse,
	[MapIconType.AmmoFactory]: false,
	[MapIconType.RocketSite]: MapIconRocketSite,
	[MapIconType.SalvageMine]: MapIconScrapMine,
	[MapIconType.ConstructionYard]: MapIconConstructionYard,
	[MapIconType.ComponentMine]: MapIconComponentMine,
	[MapIconType.OilWell]: false,
	[MapIconType.RelicBase1]: MapIconRelicBase,
	[MapIconType.RelicBase2]: false,
	[MapIconType.RelicBase3]: false,
	[MapIconType.MassProductionFactory]: MapIconMassProductionFactory,
	[MapIconType.Seaport]: MapIconSeaport,
	[MapIconType.CoastalGun]: MapIconCoastalGun,
	[MapIconType.SoulFactory]: MapIconSoulFactory,
	[MapIconType.TownBase1]: MapIconTownBaseTier1,
	[MapIconType.TownBase2]: MapIconTownBaseTier2,
	[MapIconType.TownBase3]: MapIconTownBaseTier3,
	[MapIconType.StormCannon]: MapIconStormCannon,
	[MapIconType.IntelCenter]: MapIconIntelcenter,
	[MapIconType.CoalField]: MapIconCoal,
	[MapIconType.OilField]: MapIconFuel,
	[MapIconType.RocketTarget]: MapIconRocketTarget,
	[MapIconType.RocketGroundZero]: MapIconRocketGroundZero,
	[MapIconType.RocketSiteWithRocket]: MapIconRocketSiteWithRocket,
	[MapIconType.FacilityMineOilRig]: MapIconFacilityMineOilRig,
	[MapIconType.WeatherStation]: MapIconWeatherStation,
	[MapIconType.MortarHouse]: MapIconMortarHouse,
};
