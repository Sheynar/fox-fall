/**
 * This is necessary because electron is failing unless we use CommonJS modules
 * when we configure typescript to use esnext it replaces the async import with a require() call
 * require() fails because @packages/server uses ESM syntax
 */
module.exports = import('@packages/server/dist/ws.js').then((mod) => mod.initialiseWebsocket());