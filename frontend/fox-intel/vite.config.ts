import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	plugins: [
		vue(),
		nodePolyfills({
			protocolImports: true,
		}),
	],
	resolve: {
		alias: {
			'@': '/src',
		},
	},
	build: {
		outDir: './dist',
		emptyOutDir: true,
		sourcemap: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, './index.html'),
			},
		},
	},
});
