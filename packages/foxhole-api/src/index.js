"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORLD_EXTENTS = exports.MapMarkerType = exports.MapFlags = exports.TeamColor = exports.Team = exports.MapIconType = exports.FoxholeApiEndpoint = void 0;
exports.getWarDetails = getWarDetails;
exports.getWarMaps = getWarMaps;
exports.getMapData = getMapData;
var FoxholeApiEndpoint;
(function (FoxholeApiEndpoint) {
    FoxholeApiEndpoint["Able"] = "https://war-service-live.foxholeservices.com/api";
    FoxholeApiEndpoint["Baker"] = "https://war-service-live-2.foxholeservices.com/api";
    FoxholeApiEndpoint["Charlie"] = "https://war-service-live-3.foxholeservices.com/api";
    FoxholeApiEndpoint["Development"] = "https://war-service-dev.foxholeservices.com/api";
})(FoxholeApiEndpoint || (exports.FoxholeApiEndpoint = FoxholeApiEndpoint = {}));
var MapIconType;
(function (MapIconType) {
    /** @deprecated Removed in Update 46 */
    MapIconType[MapIconType["StaticBase1"] = 5] = "StaticBase1";
    /** @deprecated Removed in Update 46 */
    MapIconType[MapIconType["StaticBase2"] = 6] = "StaticBase2";
    /** @deprecated Removed in Update 46 */
    MapIconType[MapIconType["StaticBase3"] = 7] = "StaticBase3";
    MapIconType[MapIconType["ForwardBase1"] = 8] = "ForwardBase1";
    /** @deprecated Removed in Update 50 */
    MapIconType[MapIconType["ForwardBase2"] = 9] = "ForwardBase2";
    /** @deprecated Removed in Update 50 */
    MapIconType[MapIconType["ForwardBase3"] = 10] = "ForwardBase3";
    MapIconType[MapIconType["Hospital"] = 11] = "Hospital";
    MapIconType[MapIconType["VehicleFactory"] = 12] = "VehicleFactory";
    /** @deprecated */
    MapIconType[MapIconType["Armory"] = 13] = "Armory";
    /** @deprecated */
    MapIconType[MapIconType["SupplyStation"] = 14] = "SupplyStation";
    /** @deprecated */
    MapIconType[MapIconType["Workshop"] = 15] = "Workshop";
    /** @deprecated */
    MapIconType[MapIconType["ManufacturingPlant"] = 16] = "ManufacturingPlant";
    MapIconType[MapIconType["Refinery"] = 17] = "Refinery";
    MapIconType[MapIconType["Shipyard"] = 18] = "Shipyard";
    MapIconType[MapIconType["TechCenter"] = 19] = "TechCenter";
    MapIconType[MapIconType["SalvageField"] = 20] = "SalvageField";
    MapIconType[MapIconType["ComponentField"] = 21] = "ComponentField";
    MapIconType[MapIconType["FuelField"] = 22] = "FuelField";
    MapIconType[MapIconType["SulfurField"] = 23] = "SulfurField";
    MapIconType[MapIconType["WorldMapTent"] = 24] = "WorldMapTent";
    MapIconType[MapIconType["TravelTent"] = 25] = "TravelTent";
    MapIconType[MapIconType["TrainingArea"] = 26] = "TrainingArea";
    MapIconType[MapIconType["Keep"] = 27] = "Keep";
    MapIconType[MapIconType["ObservationTower"] = 28] = "ObservationTower";
    MapIconType[MapIconType["Fort"] = 29] = "Fort";
    MapIconType[MapIconType["TroopShip"] = 30] = "TroopShip";
    MapIconType[MapIconType["SulfurMine"] = 32] = "SulfurMine";
    MapIconType[MapIconType["StorageFacility"] = 33] = "StorageFacility";
    MapIconType[MapIconType["Factory"] = 34] = "Factory";
    MapIconType[MapIconType["GarrisonStation"] = 35] = "GarrisonStation";
    /** @deprecated */
    MapIconType[MapIconType["AmmoFactory"] = 36] = "AmmoFactory";
    MapIconType[MapIconType["RocketSite"] = 37] = "RocketSite";
    MapIconType[MapIconType["SalvageMine"] = 38] = "SalvageMine";
    MapIconType[MapIconType["ConstructionYard"] = 39] = "ConstructionYard";
    MapIconType[MapIconType["ComponentMine"] = 40] = "ComponentMine";
    /** @deprecated Removed in Update 50 */
    MapIconType[MapIconType["OilWell"] = 41] = "OilWell";
    MapIconType[MapIconType["RelicBase1"] = 45] = "RelicBase1";
    /** @deprecated Removed in Update 52 */
    MapIconType[MapIconType["RelicBase2"] = 46] = "RelicBase2";
    /** @deprecated Removed in Update 52 */
    MapIconType[MapIconType["RelicBase3"] = 47] = "RelicBase3";
    MapIconType[MapIconType["MassProductionFactory"] = 51] = "MassProductionFactory";
    MapIconType[MapIconType["Seaport"] = 52] = "Seaport";
    MapIconType[MapIconType["CoastalGun"] = 53] = "CoastalGun";
    MapIconType[MapIconType["SoulFactory"] = 54] = "SoulFactory";
    MapIconType[MapIconType["TownBase1"] = 56] = "TownBase1";
    MapIconType[MapIconType["TownBase2"] = 57] = "TownBase2";
    MapIconType[MapIconType["TownBase3"] = 58] = "TownBase3";
    MapIconType[MapIconType["StormCannon"] = 59] = "StormCannon";
    MapIconType[MapIconType["IntelCenter"] = 60] = "IntelCenter";
    MapIconType[MapIconType["CoalField"] = 61] = "CoalField";
    MapIconType[MapIconType["OilField"] = 62] = "OilField";
    MapIconType[MapIconType["RocketTarget"] = 70] = "RocketTarget";
    MapIconType[MapIconType["RocketGroundZero"] = 71] = "RocketGroundZero";
    MapIconType[MapIconType["RocketSiteWithRocket"] = 72] = "RocketSiteWithRocket";
    MapIconType[MapIconType["FacilityMineOilRig"] = 75] = "FacilityMineOilRig";
    MapIconType[MapIconType["WeatherStation"] = 83] = "WeatherStation";
    MapIconType[MapIconType["MortarHouse"] = 84] = "MortarHouse";
})(MapIconType || (exports.MapIconType = MapIconType = {}));
var Team;
(function (Team) {
    Team["Colonial"] = "COLONIALS";
    Team["Warden"] = "WARDENS";
    Team["None"] = "NONE";
})(Team || (exports.Team = Team = {}));
var TeamColor;
(function (TeamColor) {
    TeamColor["Colonial"] = "#152612";
    TeamColor["Warden"] = "#041739";
    TeamColor["None"] = "#FFFFFF";
})(TeamColor || (exports.TeamColor = TeamColor = {}));
var MapFlags;
(function (MapFlags) {
    MapFlags[MapFlags["IsVictoryBase"] = 1] = "IsVictoryBase";
    /** @deprecated Removed in Update 29 */
    MapFlags[MapFlags["IsHomeBase"] = 2] = "IsHomeBase";
    MapFlags[MapFlags["IsBuildSite"] = 4] = "IsBuildSite";
    MapFlags[MapFlags["IsScorched"] = 16] = "IsScorched";
    MapFlags[MapFlags["IsTownClaimed"] = 32] = "IsTownClaimed";
})(MapFlags || (exports.MapFlags = MapFlags = {}));
function getWarDetails(endpoint) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(endpoint, "/worldconquest/war"))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to get war details: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
function getWarMaps(endpoint) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(endpoint, "/worldconquest/maps"))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to get war maps: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
var MapMarkerType;
(function (MapMarkerType) {
    MapMarkerType["Region"] = "Major";
    MapMarkerType["Minor"] = "Minor";
})(MapMarkerType || (exports.MapMarkerType = MapMarkerType = {}));
function getMapData(endpoint_1, mapId_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, mapId, isDynamicData, Etag) {
        var response, data;
        if (isDynamicData === void 0) { isDynamicData = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(endpoint, "/worldconquest/maps/").concat(mapId, "/").concat(isDynamicData ? 'dynamic/public' : 'static'), {
                        headers: Etag ? { 'If-None-Match': Etag } : undefined,
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to get map data: ".concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data];
            }
        });
    });
}
exports.WORLD_EXTENTS = {
    x1: -109199.999997,
    x2: 109199.999997,
    y1: -94499.99999580906968410989,
    y2: 94499.99999580906968410989,
};
