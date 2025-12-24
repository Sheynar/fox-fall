import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { generateId } from '@packages/data/dist/id.js';
import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import {
	createIntelInstance,
	createIntelMarkerRegion,
	getAllIntelInstances,
	getAllIntelMarkerRegions,
	getIntelInstance,
	getIntelMarkerRegion,
	getIntelMarkerRegions,
	getIntelMarkerRegionsByTimestamp,
	type IntelMarkerRegion,
} from './data-store.js';
import crypto from 'crypto';

const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes
export type Session = {
	instanceId: string;
	issuedAt: number;
	expiresAt: number;
};
const activeSessions = new Map<string, Session>();

function hashPassword(password: string, salt: string) {
	return crypto
		.createHash('sha256')
		.update(password + salt)
		.digest('hex');
}

export async function initialiseHttp(
	port = Number(process.env.FOX_INFO_SYNC_PORT) || 80
) {
	const app = new Hono();
	app.use(cors());

	app.get('/api/v1/instance', (c) => {
		const instances = getAllIntelInstances();
		return c.json(instances);
	});

	app.get('/api/v1/instance/:instanceId', (c) => {
		const instanceId = c.req.param('instanceId');
		const instance = getIntelInstance(instanceId);
		return c.json(instance);
	});

	app.post('/api/v1/instance', async (c) => {
		const instance = await c.req.json();
		if (typeof instance.id !== 'string') {
			return c.json({ error: 'Invalid instance id' }, 400);
		}
		const instanceId = instance.id;
		if (typeof instanceId !== 'string') {
			return c.json({ error: 'Invalid instance id' }, 400);
		}
		const password = instance.password;
		if (typeof password !== 'string') {
			return c.json({ error: 'Invalid password' }, 400);
		}

		const existingInstance = getIntelInstance(instanceId);
		const passSalt = existingInstance?.passSalt ?? generateId();
		const passHash = hashPassword(password, passSalt);

		if (existingInstance) {
			if (existingInstance.passHash !== passHash) {
				return c.json({ error: 'Invalid password' }, 400);
			}
		} else {
			createIntelInstance(instanceId, passSalt, passHash);
		}

		const sessionId = generateId();
		const session: Session = {
			instanceId,
			issuedAt: Date.now(),
			expiresAt: Date.now() + SESSION_TIMEOUT,
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
	});

	function validateSession(c: Context, instanceId: string) {
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
		return;
	}

	const pendingRequests = new Map<string, Set<() => void>>();
	app.get('/api/v1/instance/:instanceId/since', async (c) => {
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

		let regions = getIntelMarkerRegionsByTimestamp(instanceId, timestamp);
		if (regions.length === 0) {
			regions = await new Promise<IntelMarkerRegion[]>((resolve) => {
				if (!pendingRequests.has(instanceId)) {
					pendingRequests.set(instanceId, new Set());
				}

				const onRegions = () => {
					pendingRequests.get(instanceId)?.delete(onRegions);
					resolve(getIntelMarkerRegionsByTimestamp(instanceId, timestamp));
				}

				pendingRequests.get(instanceId)!.add(onRegions);
				setTimeout(onRegions, timeout);
			});
		}

		return c.json({
			regions: regions.map((region) => ({
				...region,
				region_data: `data:${region.mime_type};base64,${region.region_data.toString('base64')}`
			})),
			timestamp: Math.max(...regions.map((region) => region.timestamp), timestamp),
		});
	});

	app.get(
		'/api/v1/instance/:instanceId/markers/:regionX/:regionY',
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

			const region = getIntelMarkerRegion(instanceId, regionX, regionY);
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

	app.get(
		'/api/v1/instance/:instanceId/markers',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId);
			if (sessionOutput) return sessionOutput;

			const regions = getAllIntelMarkerRegions(instanceId);
			return c.json(regions.map((region) => ({
				...region,
				region_data: `data:${region.mime_type};base64,${region.region_data.toString('base64')}`
			})));
		}
	);

	app.get(
		'/api/v1/instance/:instanceId/markers/area/:regionX1/:regionY1/:regionX2/:regionY2',
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

			const regions = getIntelMarkerRegions(instanceId, regionLocations);
			return c.json(regions.map((region) => ({
				...region,
				region_data: `data:${region.mime_type};base64,${region.region_data.toString('base64')}`
			})));
		}
	);

	app.post(
		'/api/v1/instance/:instanceId/markers/:regionX/:regionY',
		async (c) => {
			const instanceId = c.req.param('instanceId');
			const sessionOutput = validateSession(c, instanceId);
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
			const regionId = createIntelMarkerRegion(
				instanceId,
				regionX,
				regionY,
				c.req.header('Content-Type') ?? 'image/png',
				Buffer.from(regionData)
			);

			for (const listener of pendingRequests.get(instanceId) ?? []) {
				listener();
			}

			return c.json({ id: regionId });
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
			},
			(info) => {
				console.log(`HTTP server running on ${info.address}:${info.port}`);
				resolve();
			}
		);
	});
}
