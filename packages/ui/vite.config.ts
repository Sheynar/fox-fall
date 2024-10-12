import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
  plugins: [vue()],
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
				gunner: resolve(__dirname, './gunner/index.html'),
			},
		},
	},
})
