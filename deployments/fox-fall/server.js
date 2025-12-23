/**
 * This is necessary because electron is failing unless we use CommonJS modules
 * when we configure typescript to use esnext it replaces the async import with a require() call
 * require() fails because @packages/fox-fall-server uses ESM syntax
 */
module.exports = import("@packages/fox-fall-server/dist/ws.js")
	.then((mod) => mod.initialiseWebsocket())
	.then(() => {
		console.log('Sync server ready');
	})
	.catch((err) => {
		console.log("Failed to set up sync server");
		console.error(err);
	});
