import type { DiscordAccessToken } from '@packages/data/dist/discord.js';
import type {
	IntelInstance,
	IntelMarkerRegion,
	IntelTag,
	BasicIntelDocument,
	IntelDocument,
	IntelDocumentTag,
	IntelDocumentAttachment,
	IntelInstanceDiscordPermissions,
	IntelIcon,
} from '@packages/data/dist/intel.js';
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { getUserGuildMember, getUserGuilds } from './discord.js';
import { Team } from '@packages/foxhole-api';

mkdirSync('data', { recursive: true });

const db = new Database('data/fox-intel.db');
db.pragma('journal_mode = WAL');
process.on('exit', () => db.close());

let schemaVersion = -1;
const targetSchemaVersion = 3;
function getSchemaVersion() {
	return schemaVersion = db.pragma('user_version', { simple: true }) as number;
}

while (getSchemaVersion() !== targetSchemaVersion) {
	switch(schemaVersion) {
		case 0:
			db.exec(`
				CREATE TABLE IF NOT EXISTS IntelInstance (
					id TEXT PRIMARY KEY,
					shard TEXT NOT NULL,
					discord_guild_id TEXT NOT NULL
				);

				CREATE TABLE IF NOT EXISTS IntelInstanceDiscordPermissions (
					instance_id TEXT NOT NULL,
					access_type TEXT NOT NULL,
					role_id TEXT NOT NULL,
					FOREIGN KEY (instance_id) REFERENCES IntelInstance(id) ON DELETE CASCADE ON UPDATE CASCADE,
					PRIMARY KEY (instance_id, access_type, role_id)
				);

				CREATE TABLE IF NOT EXISTS IntelMarkerRegion (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					instance_id INTEGER NOT NULL,
					region_x INTEGER NOT NULL,
					region_y INTEGER NOT NULL,
					timestamp INTEGER NOT NULL,
					mime_type TEXT NOT NULL,
					region_data BLOB NOT NULL,
					FOREIGN KEY (instance_id) REFERENCES IntelInstance(id) ON DELETE CASCADE ON UPDATE CASCADE
				);

				CREATE UNIQUE INDEX IF NOT EXISTS idx_IntelMarkerRegion_instance_id_region_x_region_y ON IntelMarkerRegion (instance_id, region_x, region_y);

				CREATE TABLE IF NOT EXISTS IntelTag (
					instance_id INTEGER NOT NULL,
					tag TEXT NOT NULL,
					FOREIGN KEY (instance_id) REFERENCES IntelInstance(id) ON DELETE CASCADE ON UPDATE CASCADE,
					PRIMARY KEY (instance_id, tag)
				);

				CREATE UNIQUE INDEX IF NOT EXISTS idx_IntelTag_instance_id_tag ON IntelTag (instance_id, tag);

				CREATE TABLE IF NOT EXISTS IntelDocument (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					instance_id INTEGER NOT NULL,
					document_x INTEGER NOT NULL,
					document_y INTEGER NOT NULL,
					ui_size FLOAT NOT NULL,
					timestamp INTEGER NOT NULL,
					deleted BOOLEAN NOT NULL DEFAULT FALSE,
					document_name TEXT NOT NULL,
					document_content TEXT NOT NULL,
					FOREIGN KEY (instance_id) REFERENCES IntelInstance(id) ON DELETE CASCADE ON UPDATE CASCADE
				);

				CREATE UNIQUE INDEX IF NOT EXISTS idx_IntelDocument_instance_id_id ON IntelDocument (instance_id, id);

				CREATE TABLE IF NOT EXISTS IntelDocumentTag (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					instance_id INTEGER NOT NULL,
					document_id INTEGER NOT NULL,
					tag TEXT NOT NULL,
					timestamp INTEGER NOT NULL,
					deleted BOOLEAN NOT NULL DEFAULT FALSE,
					FOREIGN KEY (instance_id, document_id) REFERENCES IntelDocument(instance_id, id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY (instance_id, tag) REFERENCES IntelTag(instance_id, tag) ON DELETE CASCADE ON UPDATE CASCADE
				);

				CREATE UNIQUE INDEX IF NOT EXISTS idx_IntelDocumentTag_instance_id_document_id_tag ON IntelDocumentTag (instance_id, document_id, tag);

				CREATE TABLE IF NOT EXISTS IntelDocumentAttachment (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					instance_id INTEGER NOT NULL,
					document_id INTEGER NOT NULL,
					timestamp INTEGER NOT NULL,
					mime_type TEXT NOT NULL,
					attachment_content BLOB NOT NULL,
					FOREIGN KEY (instance_id) REFERENCES IntelInstance(id) ON DELETE CASCADE ON UPDATE CASCADE,
					FOREIGN KEY (instance_id, document_id) REFERENCES IntelDocument(instance_id, id) ON DELETE CASCADE ON UPDATE CASCADE
				);

				PRAGMA user_version = 1;
			`);
			break;
		case 1:
			db.exec(`
				ALTER TABLE IntelDocument ADD COLUMN document_color TEXT NOT NULL DEFAULT '#FFFFFF';
				PRAGMA user_version = 2;
			`);
			break;
		case 2:
			db.exec(`
				CREATE TABLE IF NOT EXISTS IntelIcon (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					instance_id INTEGER NOT NULL,
					icon_x INTEGER NOT NULL,
					icon_y INTEGER NOT NULL,
					icon_type TEXT NOT NULL,
					icon_team TEXT NOT NULL,
					timestamp INTEGER NOT NULL,
					deleted BOOLEAN NOT NULL DEFAULT FALSE,
					FOREIGN KEY (instance_id) REFERENCES IntelInstance(id) ON DELETE CASCADE ON UPDATE CASCADE
				);

				PRAGMA user_version = 3;
			`);
			break;
		default:
			throw new Error(`Unknown database schema version: ${schemaVersion}`);
	}
}


export const models = {
	intelInstance: {
		create: function createIntelInstance(
			name: string,
			shard: string,
			discordGuildId: string,
			discordGuildRoles: { accessType: string; roleId: string }[]
		) {
			db.transaction(() => {
				db.prepare(
					`
					INSERT INTO IntelInstance (id, shard, discord_guild_id) VALUES (?, ?, ?)
					`
				).run(name, shard, discordGuildId);
				if (discordGuildRoles.length > 0) {
					db.prepare(
						`
					INSERT INTO IntelInstanceDiscordPermissions (instance_id, access_type, role_id) VALUES ${discordGuildRoles.map(() => '(?, ?, ?)').join(',')}
				`
					).run(
						...discordGuildRoles
							.map((role) => [name, role.accessType, role.roleId])
							.flat()
					);
				}
			})();
			return name;
		},

		update: function updateIntelInstance(
			oldInstanceId: string,
			newInstanceId: string,
			discordGuildId: string,
			discordGuildRoles: { accessType: string; roleId: string }[]
		) {
			db.transaction(() => {
				db.prepare(
					`
					DELETE FROM IntelInstanceDiscordPermissions WHERE instance_id = ?`
				).run(oldInstanceId);
				db.prepare(
					`
					UPDATE IntelInstance SET id = ?, discord_guild_id = ? WHERE id = ?`
				).run(newInstanceId, discordGuildId, oldInstanceId);
				if (discordGuildRoles.length > 0) {
					db.prepare(
						`
					INSERT INTO IntelInstanceDiscordPermissions (instance_id, access_type, role_id) VALUES ${discordGuildRoles.map(() => '(?, ?, ?)').join(',')}
					`
					).run(
						...discordGuildRoles
							.map((role) => [newInstanceId, role.accessType, role.roleId])
							.flat()
					);
				}
			})();
		},

		delete: function deleteIntelInstance(instanceId: string) {
			db.prepare(
				`
				DELETE FROM IntelInstance WHERE id = ?`
			).run(instanceId);
		},

		getAll: function getAllIntelInstances() {
			const instances = db
				.prepare<[], IntelInstance>('SELECT * FROM IntelInstance')
				.all();
			return instances;
		},

		get: function getIntelInstance(instanceId: string) {
			const instance = db
				.prepare<
					[string],
					IntelInstance
				>('SELECT * FROM IntelInstance WHERE id = ?')
				.get(instanceId);
			return instance;
		},

		getDiscordPermissions: function getDiscordPermissions(instanceId: string) {
			const permissions = db
				.prepare<
					[string],
					IntelInstanceDiscordPermissions
				>('SELECT * FROM IntelInstanceDiscordPermissions WHERE instance_id = ?')
				.all(instanceId);
			return permissions;
		},

		userHasAccess: async function userHasAccess(
			accessToken: DiscordAccessToken,
			instance: IntelInstance
		) {
			const allowedRoles = models.intelInstance.getDiscordPermissions(
				instance.id
			);

			const member = await getUserGuildMember(
				accessToken,
				instance.discord_guild_id
			);

			if (allowedRoles.length === 0) {
				return {
					read: true,
					write: true,
					admin: true,
				};
			}
			const memberRoleMap = member.roles.reduce(
				(acc, roleId) => {
					acc[roleId] = true;
					return acc;
				},
				{} as Record<string, boolean>
			);

			let read = false;
			let write = false;
			let admin = false;

			for (const allowedRole of allowedRoles) {
				if (!memberRoleMap[allowedRole.role_id]) {
					continue;
				}
				if (allowedRole.access_type === 'read') {
					read = true;
				} else if (allowedRole.access_type === 'write') {
					write = true;
					read = true;
				} else if (allowedRole.access_type === 'admin') {
					admin = true;
					write = true;
					read = true;
					break;
				} else {
					console.error('Invalid access type', allowedRole.access_type);
				}
			}
			return {
				read,
				write,
				admin,
			};
		},

		getAvailableInstances: async function getAvailableInstances(
			accessToken: DiscordAccessToken
		) {
			const guilds = await getUserGuilds(accessToken);
			const instances = db
				.prepare<
					string[],
					IntelInstance
				>(`SELECT * FROM IntelInstance WHERE discord_guild_id IN (${guilds.map(() => '?').join(', ')})`)
				.all(...guilds.map((guild) => guild.id));

			return instances;

			// This would check the roles of the user, I have decided to show the user all instances they are in the required guilds for. Access will be checked when they try to open the instance.
			// const output: typeof instances = [];
			// for (const instance of instances) {
			// 	if (await this.userHasAccess(accessToken, instance)) {
			// 		output.push(instance);
			// 	}
			// }
			// return output;
		},
	},

	intelMarkerRegion: {
		get: function getIntelMarkerRegion(
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
		},

		getAll: function getAllIntelMarkerRegions(instanceId: string) {
			const regions = db
				.prepare<
					[string],
					IntelMarkerRegion
				>('SELECT * FROM IntelMarkerRegion WHERE instance_id = ?')
				.all(instanceId);
			return regions;
		},

		getList: function getIntelMarkerRegions(
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
		},

		getByTimestamp: function getIntelMarkerRegionsByTimestamp(
			instanceId: string,
			timestamp: number
		) {
			const regions = db
				.prepare<
					[string, number],
					IntelMarkerRegion
				>('SELECT * FROM IntelMarkerRegion WHERE instance_id = ? AND timestamp > ?')
				.all(instanceId, timestamp);
			return regions;
		},

		create: function createIntelMarkerRegion(
			instanceId: string,
			regionX: number,
			regionY: number,
			mimeType: string,
			regionData: Buffer
		) {
			const insertResult = db
				.prepare(
					'INSERT INTO IntelMarkerRegion (instance_id, region_x, region_y, timestamp, mime_type, region_data) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (instance_id, region_x, region_y) DO UPDATE SET timestamp = excluded.timestamp, mime_type = excluded.mime_type, region_data = excluded.region_data'
				)
				.run(instanceId, regionX, regionY, Date.now(), mimeType, regionData);
			return insertResult.lastInsertRowid;
		},

		createList: function createIntelMarkerRegions(
			instanceId: string,
			regions: {
				regionX: number;
				regionY: number;
				mimeType: string;
				regionData: Buffer;
			}[]
		) {
			const insertResult = db
				.prepare(
					`INSERT INTO IntelMarkerRegion (instance_id, region_x, region_y, timestamp, mime_type, region_data) VALUES ${regions.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')} ON CONFLICT (instance_id, region_x, region_y) DO UPDATE SET mime_type = excluded.mime_type, region_data = excluded.region_data`
				)
				.run(
					...regions
						.map((region) => [
							instanceId,
							region.regionX,
							region.regionY,
							Date.now(),
							region.mimeType,
							region.regionData,
						])
						.flat()
				);
			return insertResult.lastInsertRowid;
		},
	},

	intelIcon: {
		create: function createIntelIcon(
			instanceId: string,
			iconX: number,
			iconY: number,
			iconType: string,
			iconTeam: Team,
		) {
			const insertResult = db
				.prepare(
					'INSERT INTO IntelIcon (instance_id, icon_x, icon_y, icon_type, icon_team, timestamp) VALUES (?, ?, ?, ?, ?, ?)'
				)
				.run(instanceId, iconX, iconY, iconType, iconTeam, Date.now());
			return insertResult.lastInsertRowid;
		},

		delete: function deleteIntelIcon(
			instanceId: string,
			iconId: number
		) {
			const deleteResult = db
				.prepare(
					'UPDATE IntelIcon SET deleted = TRUE, timestamp = ? WHERE instance_id = ? AND id = ?'
				)
				.run(Date.now(), instanceId, iconId);
			return deleteResult.changes;
		},

		get: function getIntelIcon(instanceId: string, iconId: number) {
			const icon = db
				.prepare<
					[string, number],
					IntelIcon
				>('SELECT * FROM IntelIcon WHERE instance_id = ? AND id = ?')
				.get(instanceId, iconId);
			return icon;
		},

		getAll: function getAllIntelIcons(instanceId: string) {
			const icons = db
				.prepare<
					[string],
					IntelIcon
				>('SELECT * FROM IntelIcon WHERE instance_id = ?')
				.all(instanceId);
			return icons;
		},

		getByTimestamp: function getIntelIconsByTimestamp(
			instanceId: string,
			timestamp: number
		) {
			const icons = db
				.prepare<
					[string, number],
					IntelIcon
				>('SELECT * FROM IntelIcon WHERE instance_id = ? AND timestamp > ?')
				.all(instanceId, timestamp);
			return icons;
		},

		update: function updateIntelIcon(
			iconId: number,
			iconX: number,
			iconY: number,
			iconType: string,
			iconTeam: Team,
		) {
			const updateResult = db
				.prepare(
					'UPDATE IntelIcon SET icon_x = ?, icon_y = ?, icon_type = ?, icon_team = ?, timestamp = ? WHERE id = ?'
				)
				.run(iconX, iconY, iconType, iconTeam, Date.now(), iconId);
			return updateResult.changes;
		},
	},

	intelDocument: {
		create: function createIntelDocument(
			instanceId: string,
			documentX: number,
			documentY: number,
			uiSize: number,
			documentName: string,
			documentContent: string,
			documentColor: string
		) {
			const insertResult = db
				.prepare(
					'INSERT INTO IntelDocument (instance_id, document_x, document_y, ui_size, timestamp, document_name, document_content, document_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
				)
				.run(
					instanceId,
					documentX,
					documentY,
					uiSize,
					Date.now(),
					documentName,
					documentContent,
					documentColor
				);
			return insertResult.lastInsertRowid;
		},

		delete: function deleteIntelDocument(
			instanceId: string,
			documentId: number
		) {
			const deleteResult = db
				.prepare(
					'UPDATE IntelDocument SET deleted = TRUE, timestamp = ? WHERE instance_id = ? AND id = ?'
				)
				.run(Date.now(), instanceId, documentId);
			return deleteResult.changes;
		},

		get: function getIntelDocument(instanceId: string, documentId: number) {
			const document = db
				.prepare<
					[string, number],
					IntelDocument
				>('SELECT * FROM IntelDocument WHERE instance_id = ? AND id = ?')
				.get(instanceId, documentId);
			return document;
		},

		getByTimestamp: function getIntelDocumentsByTimestamp(
			instanceId: string,
			timestamp: number,
			skipDeleted: boolean = false
		) {
			const documents = db
				.prepare<
					[string, number, 1 | 0],
					BasicIntelDocument
				>('SELECT id, instance_id, document_x, document_y, ui_size, document_name, document_color, timestamp, deleted FROM IntelDocument WHERE instance_id = ? AND timestamp > ? AND (NOT ? OR deleted = FALSE)')
				.all(instanceId, timestamp, skipDeleted ? 1 : 0);
			return documents;
		},

		update: function updateIntelDocument(
			documentId: number,
			documentX: number,
			documentY: number,
			uiSize: number,
			documentName: string,
			documentContent: string,
			documentColor: string
		) {
			const updateResult = db
				.prepare(
					'UPDATE IntelDocument SET document_x = ?, document_y = ?, ui_size = ?, timestamp = ?, document_name = ?, document_content = ?, document_color = ? WHERE id = ?'
				)
				.run(
					documentX,
					documentY,
					uiSize,
					Date.now(),
					documentName,
					documentContent,
					documentColor,
					documentId
				);
			return updateResult.changes;
		},
	},

	intelTag: {
		getAll: function getAllIntelTags(instanceId: string) {
			const tags = db
				.prepare<
					[string],
					IntelTag
				>('SELECT * FROM IntelTag WHERE instance_id = ?')
				.all(instanceId);
			return tags;
		},
	},

	intelDocumentTag: {
		getDocumentTags: function getDocumentTags(
			instanceId: string,
			documentId: number
		) {
			const tags = db
				.prepare<
					[string, number],
					IntelTag
				>('SELECT * FROM IntelDocumentTag WHERE instance_id = ? AND document_id = ?')
				.all(instanceId, documentId);
			return tags;
		},

		getTagsSince: function getTagsSince(
			instanceId: string,
			timestamp: number,
			skipDeleted: boolean = false
		) {
			const tags = db
				.prepare<
					[string, number, 1 | 0],
					IntelDocumentTag
				>('SELECT * FROM IntelDocumentTag WHERE instance_id = ? AND timestamp > ? AND (NOT ? OR deleted = FALSE)')
				.all(instanceId, timestamp, skipDeleted ? 1 : 0);
			return tags;
		},

		getDocumentTagsSince: function getDocumentTagsSince(
			instanceId: string,
			documentId: number,
			timestamp: number,
			skipDeleted: boolean = false
		) {
			const tags = db
				.prepare<
					[string, number, number, 1 | 0],
					IntelDocumentTag
				>('SELECT * FROM IntelDocumentTag WHERE instance_id = ? AND document_id = ? AND timestamp > ? AND (NOT ? OR deleted = FALSE)')
				.all(instanceId, documentId, timestamp, skipDeleted ? 1 : 0);
			return tags;
		},

		addDocumentTag: function addDocumentTag(
			instanceId: string,
			documentId: number,
			tag: string
		) {
			return db.transaction(() => {
				db.prepare(
					`
					INSERT INTO IntelTag (instance_id, tag) VALUES (@instanceId, @tag) ON CONFLICT (instance_id, tag) DO NOTHING;
				`
				).run({ instanceId, tag });
				const insertResult = db
					.prepare(
						`
					INSERT INTO IntelDocumentTag (instance_id, document_id, tag, timestamp) VALUES (@instanceId, @documentId, @tag, @timestamp) ON CONFLICT (instance_id, document_id, tag) DO UPDATE SET timestamp = excluded.timestamp, deleted = FALSE;
				`
					)
					.run({ instanceId, documentId, tag, timestamp: Date.now() });

				return insertResult.lastInsertRowid;
			})();
		},

		removeDocumentTag: function removeDocumentTag(
			instanceId: string,
			documentId: number,
			tag: string
		) {
			const deleteResult = db
				.prepare<{ instanceId: string; documentId: number; tag: string; timestamp: number }, void>(
					`
					UPDATE IntelDocumentTag SET deleted = TRUE, timestamp = @timestamp WHERE instance_id = @instanceId AND document_id = @documentId AND tag = @tag;
				`
				)
				.run({ instanceId, documentId, tag, timestamp: Date.now() });
			return deleteResult.changes;
		},
	},

	intelDocumentAttachment: {
		create: function createIntelDocumentAttachment(
			instanceId: string,
			documentId: number,
			mimeType: string,
			attachmentContent: Buffer
		) {
			const insertResult = db
				.prepare(
					'INSERT INTO IntelDocumentAttachment (instance_id, document_id, timestamp, mime_type, attachment_content) VALUES (?, ?, ?, ?, ?)'
				)
				.run(instanceId, documentId, Date.now(), mimeType, attachmentContent);
			return insertResult.lastInsertRowid;
		},

		delete: function deleteIntelDocumentAttachment(
			instanceId: string,
			documentId: number,
			attachmentId: number
		) {
			const deleteResult = db
				.prepare(
					'DELETE FROM IntelDocumentAttachment WHERE instance_id = ? AND document_id = ? AND id = ?'
				)
				.run(instanceId, documentId, attachmentId);
			return deleteResult.changes;
		},

		getByDocumentId: function getIntelDocumentAttachmentForDocument(
			instanceId: string,
			documentId: number
		) {
			const attachment = db
				.prepare<
					[string, number],
					IntelDocumentAttachment
				>('SELECT * FROM IntelDocumentAttachment WHERE instance_id = ? AND document_id = ?')
				.all(instanceId, documentId);
			return attachment;
		},

		get: function getIntelDocumentAttachment(
			instanceId: string,
			documentId: number,
			attachmentId: number
		) {
			const attachment = db
				.prepare<
					[string, number, number],
					IntelDocumentAttachment
				>('SELECT * FROM IntelDocumentAttachment WHERE instance_id = ? AND document_id = ? AND id = ?')
				.get(instanceId, documentId, attachmentId);
			return attachment;
		},
	},
};
