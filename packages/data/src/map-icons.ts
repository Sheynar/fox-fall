

export enum MapPost {
	CrateFacility = 'Crate facility',
	FactoryFacility = 'Factory facility',
	FuelFacility = 'Fuel facility',
	MaterialFacility = 'Material facility',
	ResourceFacility = 'Resource facility',
	VehicleFacility = 'Vehicle facility',
}

export enum MapIconFacility {
	MaintenanceTunnel = 'Maintenance tunnel',
	CrateTransferStation = 'Crate transfer station',
	FuelTransferStation = 'Fuel transfer station',
	MaterialTransferStation = 'Material transfer station',
	ResourceTransferStation = 'Resource transfer station',
	SmallArmsFacility = 'Small arms facility',
	FieldModificationCenter = 'Field modification center',
	SmallAssemblyStation = 'Small assembly station',
	LargeAssemblyStation = 'Large assembly station',
	DryDock = 'Dry dock',
}

export enum MapIconFortification {
	BorderBase = 'Border base',
	BunkerBaseTier1 = 'Bunker base tier 1',
	BunkerBaseTier2 = 'Bunker base tier 2',
	BunkerBaseTier3 = 'Bunker base tier 3',
	Outpost = 'Outpost',
}

export enum MapIconMisc {
	CivicCenter = 'Civic center',
	// CoalField = 'Coal field',
	// CoastalGun = 'Coastal gun',
	// ComponentField = 'Component field',
	// OilField = 'Oil field',
	// SulfurField = 'Sulfur field',
	WorldMapTent = 'World map tent',
	TravelTent = 'Travel tent',
	TrainingArea = 'Training area',
	// Keep = 'Keep',
	// ObservationTower = 'Observation tower',
	Fort = 'Fort',
	// TroopShip = 'Troop ship',
	// SulfurMine = 'Sulfur mine',
	// StorageFacility = 'Storage facility',
	// Factory = 'factory',
	// SafeHouse = 'Safe house',
	// AmmoFactory = 'Ammo factory',
	// SalvageMine = 'Salvage mine',
	// ConstructionYard = 'Construction yard',
	// ComponentMine = 'Component mine',
	// OilRig = 'Oil rig',
	// RelicBase = 'Relic base',
	// MassProductionFactory = 'Mass production factory',
	// Seaport = 'Seaport',
	// SoulFactory = 'Soul factory',
	// TownBase1 = 'Town base 1',
	// TownBase2 = 'Town base 2',
	// TownBase3 = 'Town base 3',
	// StormCannon = 'Storm cannon',
	// IntelCenter = 'Intel center',
	// WeatherStation = 'Weather station',
	// MortarHouse = 'Mortar house',
}

export enum MapIconInternal {
	VictoryOutline = 'Victory outline',
	ScorchedTown = 'Scorched town',
	RocketSite = 'Rocket site',
	RocketTarget = 'Rocket target',
	RocketGroundZero = 'Rocket ground zero',
	RocketSiteWithRocket = 'Rocket site with rocket',
}

export type NamedMapIcon = MapIconFacility | MapIconMisc | MapPost | MapIconFortification | MapIconInternal;
