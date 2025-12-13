import { publicFiles } from '@frontend/fox-fall';
import { cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

cpSync(publicFiles, path.resolve(__dirname, './www'), { recursive: true });
