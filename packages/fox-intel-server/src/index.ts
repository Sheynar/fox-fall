import { initialiseHttp } from './http.js';
import { initialiseWebsocket } from './ws.js';

process.loadEnvFile('.env');

process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

initialiseHttp();
initialiseWebsocket();