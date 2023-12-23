import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	optimizeDeps: {
		include: ['@repo/ui']
	},
	preview: {
		port: 3400
	},
	server: {
		port: 3400,
		strictPort: true
	},
	build: {
		commonjsOptions: {
			include: [/@repo-ui/, /node_modules/]
		}
	}
});
