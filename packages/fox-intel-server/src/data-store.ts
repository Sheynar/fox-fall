import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';

mkdirSync('data', { recursive: true });

const db = new Database('data/foobar.db');
db.pragma('journal_mode = WAL');
process.on('exit', () => db.close());

export interface IntelInstance {
	id: string;
	passSalt: string;
	passHash: string;
}

export interface IntelMarkerRegion {
	id: number;
	instance_id: string;
	region_x: number;
	region_y: number;
	mime_type: string;
	region_data: Buffer;
}

db.exec(`
	CREATE TABLE IF NOT EXISTS IntelInstance (
		id TEXT PRIMARY KEY,
		passSalt TEXT NOT NULL,
		passHash TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS IntelMarkerRegion (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		instance_id INTEGER NOT NULL,
		region_x INTEGER NOT NULL,
		region_y INTEGER NOT NULL,
		mime_type TEXT NOT NULL,
		region_data BLOB NOT NULL,
		FOREIGN KEY (instance_id) REFERENCES IntelInstance(id)
	);

	CREATE UNIQUE INDEX IF NOT EXISTS idx_IntelMarkerRegion_instance_id_region_x_region_y ON IntelMarkerRegion (instance_id, region_x, region_y);
`);

export function createIntelInstance(
	name: string,
	passSalt: string,
	passHash: string
) {
	const instance = db
		.prepare(
			'INSERT INTO IntelInstance (id, passSalt, passHash) VALUES (?, ?, ?)'
		)
		.run(name, passSalt, passHash);
	return instance.lastInsertRowid;
}

export function getAllIntelInstances() {
	const instances = db
		.prepare<[], IntelInstance>('SELECT * FROM IntelInstance')
		.all();
	return instances;
}

export function getIntelInstance(instanceId: string) {
	const instance = db
		.prepare<
			[string],
			IntelInstance
		>('SELECT * FROM IntelInstance WHERE id = ?')
		.get(instanceId);
	return instance;
}

export function getIntelMarkerRegion(
	instanceId: string,
	regionX: number,
	regionY: number
) {
	const region = db
		.prepare<
			[string, number, number],
			IntelMarkerRegion
		>('SELECT * FROM IntelMarkerRegion WHERE instance_id = ? AND region_x = ? AND region_y = ?')
		.get(instanceId, regionX, regionY);
	return region;
}

export function getAllIntelMarkerRegions(instanceId: string) {
	const regions = db
		.prepare<
			[string],
			IntelMarkerRegion
		>('SELECT * FROM IntelMarkerRegion WHERE instance_id = ?')
		.all(instanceId);
	return regions;
}

export function getIntelMarkerRegions(
	instanceId: string,
	regionLocations: { regionX: number; regionY: number }[]
) {
	const regions = db
		.prepare<
			[string, ...number[]],
			IntelMarkerRegion
		>(`SELECT * FROM IntelMarkerRegion WHERE instance_id = ? AND (region_x, region_y) IN (${regionLocations.map(() => '(?, ?)').join(', ')})`)
		.all(
			instanceId,
			...regionLocations
				.map((location) => [location.regionX, location.regionY])
				.flat()
		);
	return regions;
}

export function createIntelMarkerRegion(
	instanceId: string,
	regionX: number,
	regionY: number,
	mimeType: string,
	regionData: Buffer
) {
	const insertResult = db
		.prepare(
			'INSERT INTO IntelMarkerRegion (instance_id, region_x, region_y, mime_type, region_data) VALUES (?, ?, ?, ?, ?) ON CONFLICT (instance_id, region_x, region_y) DO UPDATE SET mime_type = excluded.mime_type, region_data = excluded.region_data'
		)
		.run(instanceId, regionX, regionY, mimeType, regionData);
	return insertResult.lastInsertRowid;
}

export function createIntelMarkerRegions(
	instanceId: string,
	regions: { regionX: number; regionY: number; mimeType: string; regionData: Buffer }[]
) {
	const insertResult = db
		.prepare(
			`INSERT INTO IntelMarkerRegion (instance_id, region_x, region_y, mime_type, region_data) VALUES ${regions.map(() => '(?, ?, ?, ?, ?)').join(', ')} ON CONFLICT (instance_id, region_x, region_y) DO UPDATE SET mime_type = excluded.mime_type, region_data = excluded.region_data`
		)
		.run(
			...regions
				.map((region) => [
					instanceId,
					region.regionX,
					region.regionY,
					region.mimeType,
					region.regionData,
				])
				.flat()
		);
	return insertResult.lastInsertRowid;
}
