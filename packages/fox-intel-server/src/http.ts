import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { generateId } from '@packages/data/dist/id.js';
import type {
	BasicIntelDocument,
	IntelDocument,
	IntelMarkerRegion,
} from '@packages/data/dist/intel.js';
import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import fs from 'node:fs';
import { createSecureServer } from 'node:http2';
import { models } from './data-store.js';
import {
	getAccessToken,
	getGuildRoles,
	getUserGuildMember,
	getUserGuilds,
} from './discord.js';

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
export type Session = {
	instanceId: string;
	issuedAt: number;
	expiresAt: number;
	permissions: { read: boolean; write: boolean; admin: boolean };
};
const activeSessions = new Map<string, Session>();

export async function initialiseHttp(
	port = Number(process.env.FOX_INFO_SYNC_PORT) || 443
) {
	const app = new Hono();
	app.use(cors());

	/* Discord API */
	app.get('/api/v1/discord/access-token', async (c) => {
		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}

		const timeout = parseInt(c.req.query('timeout') ?? '');
		if (isNaN(timeout)) {
			return c.json({ error: 'Invalid timeout' }, 400);
		}
		const accessToken = await getAccessToken(discordAccessCode, discordRedirectUri);
		await new Promise((resolve) => setTimeout(resolve, Math.min(timeout, accessToken.expiresAt - Date.now() - 10_000)));
		await getAccessToken(discordAccessCode, discordRedirectUri);

		return c.json({ success: true });
	});

	app.get('/api/v1/discord/guild', async (c) => {
		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const accessToken = await getAccessToken(
			discordAccessCode,
			discordRedirectUri
		);
		const guilds = await getUserGuilds(accessToken);
		return c.json(guilds);
	});

	app.get('/api/v1/discord/guild/:guildId/roles', async (c) => {
		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const guildId = c.req.param('guildId');
		if (typeof guildId !== 'string') {
			return c.json({ error: 'Invalid guild ID' }, 400);
		}

		await getAccessToken(discordAccessCode, discordRedirectUri);
		try {
			const roles = await getGuildRoles(guildId);
			return c.json(roles);
		} catch (error) {
			try {
				const [, jsonString] = /^Failed to get guild roles: (.*)$/.exec(
					error.message
				) ?? ['', '{}'];

				const discordError = JSON.parse(jsonString);
				if (discordError.code === 10004) {
					return c.json({ error: 'Guild not found' }, 404);
				}
				return c.json({ error: 'Failed to get guild roles' }, 500);
			} catch (error) {}
			throw error;
		}
	});

	app.get('/api/v1/discord/guild/:guildId/member', async (c) => {
		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const guildId = c.req.param('guildId');
		if (typeof guildId !== 'string') {
			return c.json({ error: 'Invalid guild ID' }, 400);
		}

		const accessToken = await getAccessToken(
			discordAccessCode,
			discordRedirectUri
		);
		const roles = await getUserGuildMember(accessToken, guildId);
		return c.json(roles);
	});

	/* Instance API */
	app.get('/api/v1/instance', async (c) => {
		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const accessToken = await getAccessToken(
			discordAccessCode,
			discordRedirectUri
		);
		const instances =
			await models.intelInstance.getAvailableInstances(accessToken);
		return c.json(instances);
	});

	function generateSession(
		c: Context,
		instanceId: string,
		permissions: Session['permissions']
	) {
		const sessionId = generateId();
		const session: Session = {
			instanceId,
			issuedAt: Date.now(),
			expiresAt: Date.now() + SESSION_TIMEOUT,
			permissions,
		};
		activeSessions.set(sessionId, session);

		setTimeout(() => {
			activeSessions.delete(sessionId);
		}, SESSION_TIMEOUT);

		return c.json({
			sessionId,
			issuedAt: session.issuedAt,
			expiresAt: session.expiresAt,
		});
	}

	app.post('/api/v1/instance', async (c) => {
		const instance = await c.req.json();
		if (typeof instance.id !== 'string') {
			return c.json({ error: 'Invalid instance id' }, 400);
		}
		const instanceId = instance.id;
		if (typeof instanceId !== 'string') {
			return c.json({ error: 'Invalid instance id' }, 400);
		}

		const existingInstance = models.intelInstance.get(instanceId);

		if (existingInstance) {
			return c.json({ error: 'Instance already exists' }, 400);
		}

		const discordGuildId = instance.discordGuildId;
		if (typeof discordGuildId !== 'string') {
			return c.json({ error: 'Invalid discord guild id' }, 400);
		}
		const discordGuildRoles = instance.discordGuildRoles;
		if (!Array.isArray(discordGuildRoles)) {
			return c.json({ error: 'Invalid discord guild roles' }, 400);
		}
		for (const role of discordGuildRoles) {
			if (
				typeof role.accessType !== 'string' ||
				typeof role.roleId !== 'string'
			) {
				return c.json({ error: 'Invalid discord guild role' }, 400);
			}
		}

		models.intelInstance.create(instanceId, discordGuildId, discordGuildRoles);

		return generateSession(c, instanceId, {
			read: true,
			write: true,
			admin: true,
		});
	});

	app.get('/api/v1/instance/:instanceId', async (c) => {
		const instanceId = c.req.param('instanceId');
		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const accessToken = await getAccessToken(
			discordAccessCode,
			discordRedirectUri
		);

		const instance = models.intelInstance.get(instanceId);
		if (!instance) {
			return c.json({ error: 'Instance not found' }, 404);
		}

		const permissions = await models.intelInstance.userHasAccess(
			accessToken,
			instance
		);
		if (!permissions.read) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		return generateSession(c, instanceId, permissions);
	});

	app.get('/api/v1/instance/:instanceId/permissions', async (c) => {
		const instanceId = c.req.param('instanceId');
		const existingInstance = models.intelInstance.get(instanceId);
		if (!existingInstance) {
			return c.json({ error: 'Instance not found' }, 404);
		}

		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const accessToken = await getAccessToken(
			discordAccessCode,
			discordRedirectUri
		);
		const permissions = await models.intelInstance.userHasAccess(
			accessToken,
			existingInstance
		);
		if (!permissions.admin) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		const discordPermissionsList =
			await models.intelInstance.getDiscordPermissions(instanceId);

		return c.json(discordPermissionsList);
	});

	app.post('/api/v1/instance/:instanceId', async (c) => {
		const newInstance = await c.req.json();
		if (typeof newInstance.id !== 'string') {
			return c.json({ error: 'Invalid instance id' }, 400);
		}
		const instanceId = c.req.param('instanceId');
		if (typeof instanceId !== 'string') {
			return c.json({ error: 'Invalid instance id' }, 400);
		}

		const existingInstance = models.intelInstance.get(instanceId);
		if (!existingInstance) {
			return c.json({ error: 'Instance not found' }, 404);
		}

		const discordGuildId = newInstance.discordGuildId;
		if (typeof discordGuildId !== 'string') {
			return c.json({ error: 'Invalid discord guild id' }, 400);
		}
		const discordGuildRoles = newInstance.discordGuildRoles;
		if (!Array.isArray(discordGuildRoles)) {
			return c.json({ error: 'Invalid discord guild roles' }, 400);
		}
		for (const role of discordGuildRoles) {
			if (
				typeof role.accessType !== 'string' ||
				typeof role.roleId !== 'string'
			) {
				return c.json({ error: 'Invalid discord guild role' }, 400);
			}
		}

		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const accessToken = await getAccessToken(
			discordAccessCode,
			discordRedirectUri
		);
		const permissions = await models.intelInstance.userHasAccess(
			accessToken,
			existingInstance
		);
		if (!permissions.admin) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		if (typeof newInstance.id !== 'string') {
			return c.json({ error: 'Invalid instance id' }, 400);
		}
		if (typeof newInstance.discordGuildId !== 'string') {
			return c.json({ error: 'Invalid discord guild id' }, 400);
		}
		if (!Array.isArray(newInstance.discordGuildRoles)) {
			return c.json({ error: 'Invalid discord guild roles' }, 400);
		}
		for (const role of newInstance.discordGuildRoles) {
			if (
				typeof role.accessType !== 'string' ||
				typeof role.roleId !== 'string'
			) {
				return c.json({ error: 'Invalid discord guild role' }, 400);
			}
		}

		models.intelInstance.update(
			instanceId,
			newInstance.id,
			discordGuildId,
			discordGuildRoles
		);

		return generateSession(c, instanceId, {
			read: true,
			write: true,
			admin: true,
		});
	});

	app.delete('/api/v1/instance/:instanceId', async (c) => {
		const instanceId = c.req.param('instanceId');
		const existingInstance = models.intelInstance.get(instanceId);
		if (!existingInstance) {
			return c.json({ error: 'Instance not found' }, 404);
		}

		const discordAccessCode = c.req.header('X-Discord-Access-Code');
		if (!discordAccessCode) {
			return c.json({ error: 'Discord access code is required' }, 401);
		}
		const discordRedirectUri = c.req.header('X-Discord-Redirect-Uri');
		if (!discordRedirectUri) {
			return c.json({ error: 'Discord redirect URI is required' }, 401);
		}
		const accessToken = await getAccessToken(
			discordAccessCode,
			discordRedirectUri
		);
		const permissions = await models.intelInstance.userHasAccess(
			accessToken,
			existingInstance
		);
		if (!permissions.admin) {
			return c.json({ error: 'Unauthorized' }, 401);
		}

		models.intelInstance.delete(instanceId);

		return c.json({ success: true });
	});

	function validateSession(
		c: Context,
		instanceId: string,
		forWrite = false,
		forAdmin = false
	) {
		const sessionId = c.req.header('X-Session-Id');
		if (!sessionId) {
			return c.json({ error: 'Session ID is required' }, 401);
		}

		const session = activeSessions.get(sessionId);
		if (!session) {
			return c.json(
				{
					error: 'Session expired',
					code: 'SESSION_EXPIRED',
					sessionId: sessionId,
				},
				401
			);
		}
		if (session.instanceId !== instanceId) {
			return c.json(
				{
					error: `Invalid session instance ID. Your session is for instance ${session.instanceId}, but the request is for instance ${instanceId}.`,
					code: 'INVALID_SESSION_INSTANCE_ID',
					sessionId: sessionId,
					instanceId: session.instanceId,
				},
				400
			);
		}
		if (forWrite && !session.permissions.write) {
			return c.json({ error: 'Unauthorized' }, 401);
		}
		if (forAdmin && !session.permissions.admin) {
			return c.json({ error: 'Unauthorized' }, 401);
		}
		return;
	}

	/* Marker Region API */
	const pendingMarkerRegionRequests = new Map<string, Set<() => void>>();
	app.get('/api/v1/instance/:instanceId/marker/since', async (c) => {
		const instanceId = c.req.param('instanceId');
		validateSession(c, instanceId);
		const timestamp = parseInt(c.req.query('timestamp') ?? '');
		if (isNaN(timestamp)) {
			return c.json({ error: 'Invalid timestamp' }, 400);
		}
		const timeout = parseInt(c.req.query('timeout') ?? '');
		if (isNaN(timeout)) {
			return c.json({ error: 'Invalid timeout' }, 400);
		}

		let regions = models.intelMarkerRegion.getByTimestamp(
			instanceId,
			timestamp
		);
		if (regions.length === 0) {
			regions = await new Promise<IntelMarkerRegion[]>((resolve) => {
				if (!pendingMarkerRegionRequests.has(instanceId)) {
					pendingMarkerRegionRequests.set(instanceId, new Set());
				}

				const onRegions = () => {
					pendingMarkerRegionRequests.get(instanceId)?.delete(onRegions);
					resolve(
						models.intelMarkerRegion.getByTimestamp(instanceId, timestamp)
					);
				};

				pendingMarkerRegionRequests.get(instanceId)!.add(onRegions);
				setTimeout(onRegions, timeout);
			});
		}

		return c.json({
			regions: regions.map((region) => ({
				...region,
				region_data: `data:${region.mime_type};base64,${region.region_data.toString('base64')}`,
			})),
			timestamp: Math.max(
				...regions.map((region) => region.timestamp),
				timestamp
			),
		});
	});

	app.get(
		'/api/v1/instance/:instanceId/marker/:regionX/:regionY',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId);
			if (sessionOutput) return sessionOutput;

			const regionX = parseInt(c.req.param('regionX'));
			if (isNaN(regionX)) {
				return c.json({ error: 'Invalid region X' }, 400);
			}
			const regionY = parseInt(c.req.param('regionY'));
			if (isNaN(regionY)) {
				return c.json({ error: 'Invalid region Y' }, 400);
			}

			const region = models.intelMarkerRegion.get(instanceId, regionX, regionY);
			if (!region) {
				return c.body(null, 204);
			}
			return c.body(
				region.region_data.buffer.slice(
					region.region_data.byteOffset,
					region.region_data.byteOffset + region.region_data.byteLength
				) as ArrayBuffer
			);
		}
	);

	app.get('/api/v1/instance/:instanceId/marker', async (c) => {
		const instanceId = c.req.param('instanceId');
		const sessionOutput = validateSession(c, instanceId);
		if (sessionOutput) return sessionOutput;

		const regions = models.intelMarkerRegion.getAll(instanceId);
		return c.json(
			regions.map((region) => ({
				...region,
				region_data: `data:${region.mime_type};base64,${region.region_data.toString('base64')}`,
			}))
		);
	});

	app.get(
		'/api/v1/instance/:instanceId/marker/area/:regionX1/:regionY1/:regionX2/:regionY2',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId);
			if (sessionOutput) return sessionOutput;

			const regionX1 = parseInt(c.req.param('regionX1'));
			if (isNaN(regionX1)) {
				return c.json({ error: 'Invalid region X1' }, 400);
			}
			const regionY1 = parseInt(c.req.param('regionY1'));
			if (isNaN(regionY1)) {
				return c.json({ error: 'Invalid region Y1' }, 400);
			}
			const regionX2 = parseInt(c.req.param('regionX2'));
			if (isNaN(regionX2)) {
				return c.json({ error: 'Invalid region X2' }, 400);
			}
			const regionY2 = parseInt(c.req.param('regionY2'));
			if (isNaN(regionY2)) {
				return c.json({ error: 'Invalid region Y2' }, 400);
			}

			const regionLocations: { regionX: number; regionY: number }[] = [];
			for (let x = regionX1; x <= regionX2; x++) {
				for (let y = regionY1; y <= regionY2; y++) {
					regionLocations.push({ regionX: x, regionY: y });
				}
			}

			const regions = models.intelMarkerRegion.getList(
				instanceId,
				regionLocations
			);
			return c.json(
				regions.map((region) => ({
					...region,
					region_data: `data:${region.mime_type};base64,${region.region_data.toString('base64')}`,
				}))
			);
		}
	);

	app.post(
		'/api/v1/instance/:instanceId/marker/:regionX/:regionY',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId, true);
			if (sessionOutput) return sessionOutput;

			const regionX = parseInt(c.req.param('regionX'));
			if (isNaN(regionX)) {
				return c.json(
					{
						error: 'Invalid region X',
						code: 'INVALID_REGION_X',
						regionX: regionX,
					},
					400
				);
			}
			const regionY = parseInt(c.req.param('regionY'));
			if (isNaN(regionY)) {
				return c.json(
					{
						error: 'Invalid region Y',
						code: 'INVALID_REGION_Y',
						regionY: regionY,
					},
					400
				);
			}
			const regionData = await c.req.arrayBuffer();
			const regionId = models.intelMarkerRegion.create(
				instanceId,
				regionX,
				regionY,
				c.req.header('Content-Type') ?? 'image/png',
				Buffer.from(regionData)
			);

			for (const listener of pendingMarkerRegionRequests.get(instanceId) ??
				[]) {
				listener();
			}

			return c.json({ id: regionId });
		}
	);

	/* Document API */
	const pendingDocumentRequests = new Map<string, Set<() => void>>();
	app.get('/api/v1/instance/:instanceId/document/since', async (c) => {
		const instanceId = c.req.param('instanceId');
		const sessionOutput = validateSession(c, instanceId);
		if (sessionOutput) return sessionOutput;

		const timestamp = parseInt(c.req.query('timestamp') ?? '');
		if (isNaN(timestamp)) {
			return c.json({ error: 'Invalid timestamp' }, 400);
		}
		const timeout = parseInt(c.req.query('timeout') ?? '');
		if (isNaN(timeout)) {
			return c.json({ error: 'Invalid timeout' }, 400);
		}
		const skipDeleted = c.req.query('skipDeleted') === 'true';

		let documents = models.intelDocument.getByTimestamp(
			instanceId,
			timestamp,
			skipDeleted
		);
		if (documents.length === 0) {
			documents = await new Promise<BasicIntelDocument[]>((resolve) => {
				if (!pendingDocumentRequests.has(instanceId)) {
					pendingDocumentRequests.set(instanceId, new Set());
				}

				const onDocuments = () => {
					pendingDocumentRequests.get(instanceId)?.delete(onDocuments);
					resolve(
						models.intelDocument.getByTimestamp(
							instanceId,
							timestamp,
							skipDeleted
						)
					);
				};

				pendingDocumentRequests.get(instanceId)!.add(onDocuments);
				setTimeout(onDocuments, timeout);
			});
		}

		return c.json({
			documents,
			timestamp: Math.max(
				...documents.map((document) => document.timestamp),
				timestamp
			),
		});
	});
	app.post('/api/v1/instance/:instanceId/document', async (c) => {
		const instanceId = c.req.param('instanceId');
		const sessionOutput = validateSession(c, instanceId, true);
		if (sessionOutput) return sessionOutput;

		const body = await c.req.json();

		const documentX = parseInt(body.documentX);
		if (isNaN(documentX)) {
			return c.json({ error: 'Invalid document X' }, 400);
		}
		const documentY = parseInt(body.documentY);
		if (isNaN(documentY)) {
			return c.json({ error: 'Invalid document Y' }, 400);
		}
		const uiSize = parseFloat(body.uiSize);
		if (isNaN(uiSize)) {
			return c.json({ error: 'Invalid UI size' }, 400);
		}
		const documentName = body.documentName;
		if (typeof documentName !== 'string') {
			return c.json({ error: 'Invalid document name' }, 400);
		}
		const documentContent = body.documentContent;
		if (typeof documentContent !== 'string') {
			return c.json({ error: 'Invalid document content' }, 400);
		}

		const documentId = models.intelDocument.create(
			instanceId,
			documentX,
			documentY,
			uiSize,
			documentName,
			documentContent
		);

		for (const listener of pendingDocumentRequests.get(instanceId) ?? []) {
			listener();
		}

		return c.json({ id: documentId });
	});

	app.post('/api/v1/instance/:instanceId/document/:documentId', async (c) => {
		const instanceId = c.req.param('instanceId');
		const sessionOutput = validateSession(c, instanceId, true);
		if (sessionOutput) return sessionOutput;

		const documentId = parseInt(c.req.param('documentId'));
		if (isNaN(documentId)) {
			return c.json({ error: 'Invalid document ID' }, 400);
		}

		const existingDocument = models.intelDocument.get(instanceId, documentId);
		const body = (await c.req.json()) as Partial<IntelDocument>;

		const documentX = parseInt(
			String(body.document_x ?? existingDocument?.document_x)
		);
		if (isNaN(documentX)) {
			return c.json({ error: 'Invalid document X' }, 400);
		}
		const documentY = parseInt(
			String(body.document_y ?? existingDocument?.document_y)
		);
		if (isNaN(documentY)) {
			return c.json({ error: 'Invalid document Y' }, 400);
		}
		const uiSize = parseFloat(
			String(body.ui_size ?? existingDocument?.ui_size)
		);
		if (isNaN(uiSize)) {
			return c.json({ error: 'Invalid UI size' }, 400);
		}
		const documentName = body.document_name ?? existingDocument?.document_name;
		if (typeof documentName !== 'string') {
			return c.json({ error: 'Invalid document name' }, 400);
		}
		const documentContent =
			body.document_content ?? existingDocument?.document_content;
		if (typeof documentContent !== 'string') {
			return c.json({ error: 'Invalid document content' }, 400);
		}

		models.intelDocument.update(
			documentId,
			documentX,
			documentY,
			uiSize,
			documentName,
			documentContent
		);

		for (const listener of pendingDocumentRequests.get(instanceId) ?? []) {
			listener();
		}

		return c.json({ success: true });
	});
	app.get('/api/v1/instance/:instanceId/document/:documentId/since', async (c) => {
		const instanceId = c.req.param('instanceId');
		const sessionOutput = validateSession(c, instanceId);
		if (sessionOutput) return sessionOutput;

		const documentId = parseInt(c.req.param('documentId'));
		if (isNaN(documentId)) {
			return c.json({ error: 'Invalid document ID' }, 400);
		}

		const timestamp = parseInt(c.req.query('timestamp') ?? '');
		if (isNaN(timestamp)) {
			return c.json({ error: 'Invalid timestamp' }, 400);
		}
		const timeout = parseInt(c.req.query('timeout') ?? '');
		if (isNaN(timeout)) {
			return c.json({ error: 'Invalid timeout' }, 400);
		}
		const skipDeleted = c.req.query('skipDeleted') === 'true';

		let document = models.intelDocument.get(instanceId, documentId);
		if (document?.timestamp == null || document.timestamp <= timestamp) {
			document = await new Promise<IntelDocument | undefined>((resolve) => {
				if (!pendingDocumentRequests.has(instanceId)) {
					pendingDocumentRequests.set(instanceId, new Set());
				}

				const onDocuments = () => {
					pendingDocumentRequests.get(instanceId)?.delete(onDocuments);
					resolve(
						models.intelDocument.get(instanceId, documentId)
					);
				};

				pendingDocumentRequests.get(instanceId)!.add(onDocuments);
				setTimeout(onDocuments, timeout);
			});
		}

		if (document == null) {
			return c.json({ error: 'Document not found' }, 404);
		}

		return c.json({
			document,
			timestamp: Math.max(
				document.timestamp,
				timestamp
			),
		});
	});

	app.delete('/api/v1/instance/:instanceId/document/:documentId', async (c) => {
		const instanceId = c.req.param('instanceId');
		const sessionOutput = validateSession(c, instanceId, true);
		if (sessionOutput) return sessionOutput;

		const documentId = parseInt(c.req.param('documentId'));
		if (isNaN(documentId)) {
			return c.json({ error: 'Invalid document ID' }, 400);
		}

		models.intelDocument.delete(instanceId, documentId);

		for (const listener of pendingDocumentRequests.get(instanceId) ?? []) {
			listener();
		}

		return c.json({ success: true });
	});

	app.get('/api/v1/instance/:instanceId/document/:documentId', async (c) => {
		const instanceId = c.req.param('instanceId');
		const sessionOutput = validateSession(c, instanceId);
		if (sessionOutput) return sessionOutput;

		const documentId = parseInt(c.req.param('documentId'));
		if (isNaN(documentId)) {
			return c.json({ error: 'Invalid document ID' }, 400);
		}

		const document = models.intelDocument.get(instanceId, documentId);
		if (!document) {
			return c.json({ error: 'Document not found' }, 404);
		}

		return c.json({
			...document,
			document_content: document.document_content,
		});
	});

	/* Document Attachment API */
	app.post(
		'/api/v1/instance/:instanceId/document/:documentId/attachment',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId, true);
			if (sessionOutput) return sessionOutput;

			const documentId = parseInt(c.req.param('documentId'));
			if (isNaN(documentId)) {
				return c.json({ error: 'Invalid document ID' }, 400);
			}

			const attachment = await c.req.arrayBuffer();
			const attachmentId = models.intelDocumentAttachment.create(
				instanceId,
				documentId,
				c.req.header('Content-Type') ?? 'image/png',
				Buffer.from(attachment)
			);
			return c.json({ id: attachmentId });
		}
	);

	app.delete(
		'/api/v1/instance/:instanceId/document/:documentId/attachment/:attachmentId',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId, true);
			if (sessionOutput) return sessionOutput;

			const documentId = parseInt(c.req.param('documentId'));
			if (isNaN(documentId)) {
				return c.json({ error: 'Invalid document ID' }, 400);
			}

			const attachmentId = parseInt(c.req.param('attachmentId'));
			if (isNaN(attachmentId)) {
				return c.json({ error: 'Invalid attachment ID' }, 400);
			}

			models.intelDocumentAttachment.delete(
				instanceId,
				documentId,
				attachmentId
			);
			return c.json({ success: true });
		}
	);

	app.get(
		'/api/v1/instance/:instanceId/document/:documentId/attachment',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId);
			if (sessionOutput) return sessionOutput;

			const documentId = parseInt(c.req.param('documentId'));
			if (isNaN(documentId)) {
				return c.json({ error: 'Invalid document ID' }, 400);
			}

			const attachments = models.intelDocumentAttachment.getByDocumentId(
				instanceId,
				documentId
			);
			return c.json(
				attachments.map((attachment) => ({
					...attachment,
					attachment_content: `data:${attachment.mime_type};base64,${attachment.attachment_content.toString('base64')}`,
				}))
			);
		}
	);

	app.use(
		'/*',
		serveStatic({
			root: './www/',
			index: 'index.html',
			onNotFound: (path, c) => {
				console.log(`${path} is not found, request to ${c.req.path}`);
			},
		})
	);

	await new Promise<void>((resolve) => {
		serve(
			{
				fetch: app.fetch,
				port,
				createServer: createSecureServer,
				serverOptions: {
					cert: fs.readFileSync(
						process.env.FOX_INTEL_SERVER_CERT_PATH ??
							'./foxintel.kaosdlanor.dev.pem'
					),
					key: fs.readFileSync(
						process.env.FOX_INTEL_SERVER_KEY_PATH ??
							'./foxintel.kaosdlanor.dev.key'
					),
				},
			},
			(info) => {
				console.log(`HTTP server running on ${info.address}:${info.port}`);
				resolve();
			}
		);
	});
}
