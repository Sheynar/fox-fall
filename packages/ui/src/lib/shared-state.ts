import { generateId } from '@packages/data/dist/id';
import { UnitMap } from "@packages/data/dist/artillery/unit";
import { AngularVector } from "@packages/data/dist/artillery/vector";
import { SharedObject } from "./shared-object";

export type SharedState = {
	unitMap: UnitMap;
	wind: AngularVector;
	readyToFire: boolean;
};

export const sharedState = new SharedObject<SharedState>({ unitMap: {}, wind: { azimuth: 0, distance: 0 }, readyToFire: false }, generateId());

// TODO : remove
(<any>window).sharedState = sharedState;