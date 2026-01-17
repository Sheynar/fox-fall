export type CacheDetails = {
	maxAge?: number;
	etag?: string;
}
export function parseCache(response: Response): CacheDetails {
	const output: CacheDetails = {};

	const cacheControl = response.headers.get('Cache-Control');
	const cacheDirectives = (cacheControl ?? '')
		.split(',')
		.filter(directive => directive.trim() !== '')
		.map(directive => {
			const [key, ...values] = directive.trim().toLowerCase().split('=');
			return { key, value: values.join('=') };
		});

	for (const cacheDirective of cacheDirectives) {
		switch (cacheDirective.key) {
			case 'max-age':
				output.maxAge = parseInt(cacheDirective.value);
				break;
			default:
				break;
		}
	}

	if (response.headers.has('ETag')) {
		output.etag = response.headers.get('ETag')!;
	}

	return output;
}

export type CacheableResponse<T> = CacheDetails & {
	data?: T;
}

export type RetrySettings = {
	retryDelay?: number;
	backoffMultiplier?: number;
	maxDelay?: number;
}

export function monitor<T>(_update: (etag?: string) => Promise<CacheableResponse<T>>, callback: (data: T) => void, retrySettings?: RetrySettings): () => void {
	let etag: string | undefined;
	const backoffMultiplier = retrySettings?.backoffMultiplier ?? 2;
	const maxDelay = retrySettings?.maxDelay ?? 10_000;

	async function update(retryDelay: number = retrySettings?.retryDelay ?? 1_000) {
		try {
			const updated = await _update(etag);
			etag = updated.etag;
			if (updated.data) {
				try {
					callback(updated.data);
				} catch(error) {
					console.log('Error in monitoring callback');
					console.error(error);
				}
			}
			const refreshDelay = updated.maxAge ? updated.maxAge * 1000 : retryDelay;
			queueUpdate(refreshDelay, Math.min(retryDelay * backoffMultiplier, maxDelay));
		} catch(error) {
			queueUpdate(retryDelay, Math.min(retryDelay * backoffMultiplier, maxDelay));
		}
	}

	let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
	function cancelUpdate() {
		if (timeoutHandle != null) {
			clearTimeout(timeoutHandle);
			timeoutHandle = null;
		}
	}
	function queueUpdate(timeout: number, retryDelay?: number) {
		cancelUpdate();
		timeoutHandle = setTimeout(() => update(retryDelay), timeout);
	}

	update();

	return cancelUpdate;
}

export enum Shard {
	Able = 'Able',
	Baker = 'Baker',
	Charlie = 'Charlie',
	Development = 'Development',
}

export enum FoxholeApiEndpoint {
	Able = 'https://war-service-live.foxholeservices.com/api',
	Baker = 'https://war-service-live-2.foxholeservices.com/api',
	Charlie = 'https://war-service-live-3.foxholeservices.com/api',
	Development = 'https://war-service-dev.foxholeservices.com/api',
}

export enum MapIconType {
	/** @deprecated Removed in Update 46 */
	StaticBase1 = 5,
	/** @deprecated Removed in Update 46 */
	StaticBase2 = 6,
	/** @deprecated Removed in Update 46 */
	StaticBase3 = 7,

	ForwardBase1 = 8,
	/** @deprecated Removed in Update 50 */
	ForwardBase2 = 9,
	/** @deprecated Removed in Update 50 */
	ForwardBase3 = 10,

	Hospital = 11,
	VehicleFactory = 12,
	/** @deprecated */
	Armory = 13,
	/** @deprecated */
	SupplyStation = 14,
	/** @deprecated */
	Workshop = 15,
	/** @deprecated */
	ManufacturingPlant = 16,
	Refinery = 17,
	Shipyard = 18,
	TechCenter = 19,

	SalvageField = 20,
	ComponentField = 21,
	FuelField = 22,
	SulfurField = 23,
	WorldMapTent = 24,
	TravelTent = 25,
	TrainingArea = 26,
	Keep = 27,
	ObservationTower = 28,
	Fort = 29,
	TroopShip = 30,
	SulfurMine = 32,
	StorageFacility = 33,
	Factory = 34,
	GarrisonStation = 35,
	/** @deprecated */
	AmmoFactory = 36,
	RocketSite = 37,
	SalvageMine = 38,
	ConstructionYard = 39,
	ComponentMine = 40,
	/** @deprecated Removed in Update 50 */
	OilWell = 41,

	RelicBase1 = 45,
	/** @deprecated Removed in Update 52 */
	RelicBase2 = 46,
	/** @deprecated Removed in Update 52 */
	RelicBase3 = 47,

	MassProductionFactory = 51,
	Seaport = 52,
	CoastalGun = 53,
	SoulFactory = 54,

	TownBase1 = 56,
	TownBase2 = 57,
	TownBase3 = 58,

	StormCannon = 59,
	IntelCenter = 60,

	CoalField = 61,
	OilField = 62,

	RocketTarget = 70,
	RocketGroundZero = 71,
	RocketSiteWithRocket = 72,

	FacilityMineOilRig = 75,

	WeatherStation = 83,
	MortarHouse = 84,
}

export enum Team {
	Colonial = 'COLONIALS',
	Warden = 'WARDENS',
	None = 'NONE',
}

export const TEAM_COLOR: Record<Team, { hex: string, r: number, g: number, b: number }> = {
	[Team.Colonial]: { hex: '#152612', r: 21, g: 38, b: 18 },
	[Team.Warden]: { hex: '#041739', r: 4, g: 23, b: 57 },
	[Team.None]: { hex: '#FFFFFF', r: 255, g: 255, b: 255 },
}

export enum MapFlags {
	IsVictoryBase = 0x01,
	/** @deprecated Removed in Update 29 */
	IsHomeBase = 0x02,
	IsBuildSite = 0x04,
	IsScorched = 0x10,
	IsTownClaimed = 0x20,
}

export type WarDetails = {
	warId: string;
	warNumber: number;
	winner: Team;
	conquestStartTime: number;
	conquestEndTime: number | null;
	resistanceStartTime: number | null;
	scheduledConquestEndTime: number | null;
	requiredVictoryTowns: number;
	shortRequiredVictoryTowns: number;
}

export async function getWarDetails(shard: Shard): Promise<WarDetails> {
	const response = await fetch(`${FoxholeApiEndpoint[shard]}/worldconquest/war`);
	if (!response.ok) {
		throw new Error(`Failed to get war details: ${response.statusText}`);
	}
	const data: WarDetails = await response.json();
	return data;
}

export async function checkWarDetails(shard: Shard, etag?: string): Promise<CacheableResponse<WarDetails>> {
	const response = await fetch(`${FoxholeApiEndpoint[shard]}/worldconquest/war`, {
		headers: etag ? { 'If-None-Match': etag } : undefined,
	});
	const cacheDetails = parseCache(response);
	if (response.status === 304) {
		return cacheDetails;
	}
	const data: WarDetails = await response.json();
	return {
		...cacheDetails,
		data,
	};
}

export function monitorWarDetails(shard: Shard, callback: (warDetails: WarDetails) => void, retrySettings?: RetrySettings): () => void {
	return monitor((etag) => checkWarDetails(shard, etag), callback, retrySettings);
}

export type KnownMapName = "TheFingersHex" | "TempestIslandHex" | "GreatMarchHex" | "ViperPitHex" | "MarbanHollow" | "BasinSionnachHex" | "StemaLandingHex" | "DeadLandsHex" | "HeartlandsHex" | "EndlessShoreHex" | "WestgateHex" | "OarbreakerHex" | "AcrithiaHex" | "MooringCountyHex" | "WeatheredExpanseHex" | "ReaversPassHex" | "MorgensCrossingHex" | "LochMorHex" | "StonecradleHex" | "AllodsBightHex" | "KalokaiHex" | "RedRiverHex" | "OriginHex" | "HowlCountyHex" | "ClahstraHex" | "SpeakingWoodsHex" | "ShackledChasmHex" | "TerminusHex" | "LinnMercyHex" | "ClansheadValleyHex" | "GodcroftsHex" | "NevishLineHex" | "CallumsCapeHex" | "FishermansRowHex" | "ReachingTrailHex" | "UmbralWildwoodHex" | "StlicanShelfHex" | "CallahansPassageHex" | "KingsCageHex" | "AshFieldsHex" | "FarranacCoastHex" | "DrownedValeHex" | "SableportHex";

export type WarMaps = (KnownMapName | string)[];

export async function getWarMaps(shard: Shard): Promise<WarMaps> {
	const response = await fetch(`${FoxholeApiEndpoint[shard]}/worldconquest/maps`);
	if (!response.ok) {
		throw new Error(`Failed to get war maps: ${response.statusText}`);
	}
	const data: WarMaps = await response.json();
	return data;
}

export async function checkWarMaps(shard: Shard, etag?: string): Promise<CacheableResponse<WarMaps>> {
	const response = await fetch(`${FoxholeApiEndpoint[shard]}/worldconquest/maps`, {
		headers: etag ? { 'If-None-Match': etag } : undefined,
	});
	const cacheDetails = parseCache(response);
	if (response.status === 304) {
		return cacheDetails;
	}
	const data: WarMaps = await response.json();
	return {
		...cacheDetails,
		data,
	};
}

export function monitorWarMaps(shard: Shard, callback: (warMaps: WarMaps) => void, retrySettings?: RetrySettings): () => void {
	return monitor((etag) => checkWarMaps(shard, etag), callback, retrySettings);
}

export enum MapMarkerType {
	Region = 'Major',
	Minor = 'Minor',
}

export type MapItem = {
	teamId: Team;
	iconType: MapIconType;
	x: number;
	y: number;
	flags: number;
	viewDirection: number;
}

export type MapTextItem = {
	text: string;
	x: number;
	y: number;
	mapMarkerType: MapMarkerType;
};

export type MapData = {
	regionId: number;
	scorchedVictoryTowns: number;
	mapItems: MapItem[];
	mapItemsC: MapItem[];
	mapItemsW: MapItem[];
	mapTextItems: MapTextItem[];
	lastUpdated: number;
	version: number;
};

export async function getMapData(shard: Shard, mapId: string, isDynamicData = false, Etag?: string): Promise<MapData> {
	const response = await fetch(`${FoxholeApiEndpoint[shard]}/worldconquest/maps/${mapId}/${isDynamicData ? 'dynamic/public' : 'static'}`, {
		headers: Etag ? { 'If-None-Match': Etag } : undefined,
	});
	if (!response.ok) {
		throw new Error(`Failed to get map data: ${response.statusText}`);
	}
	const data: MapData = await response.json();
	return data;
}

export async function checkMapData(shard: Shard, mapId: string, isDynamicData = false, etag?: string): Promise<CacheableResponse<MapData>> {
	const response = await fetch(`${FoxholeApiEndpoint[shard]}/worldconquest/maps/${mapId}/${isDynamicData ? 'dynamic/public' : 'static'}`, {
		headers: etag ? { 'If-None-Match': etag } : undefined,
	});
	const cacheDetails = parseCache(response);
	if (response.status === 304) {
		return cacheDetails;
	}
	const data: MapData = await response.json();
	return {
		...cacheDetails,
		data,
	};
}

export function monitorMapData(shard: Shard, mapId: string, isDynamicData = false, callback: (mapData: MapData) => void, retrySettings?: RetrySettings): () => void {
	return monitor((etag) => checkMapData(shard, mapId, isDynamicData, etag), callback, retrySettings);
}

export const WORLD_EXTENTS = {
	x1: -109199.999997,
	x2: 109199.999997,
	y1: -94499.99999580906968410989,
	y2: 94499.99999580906968410989,
}
