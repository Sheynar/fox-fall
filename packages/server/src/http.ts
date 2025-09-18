import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';

export const initialiseHttp = async (port = Number(process.env.FOX_FALL_SYNC_PORT) || 80) => {
	const app = new Hono();
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
};
