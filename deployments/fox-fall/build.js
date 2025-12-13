const { publicFiles } = require('@frontend/fox-fall');
const { cpSync } = require('node:fs');
const path = require('node:path');
// const { fileURLToPath } = require('node:url');

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

cpSync(publicFiles, path.resolve(__dirname, './www'), { recursive: true });
