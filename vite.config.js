import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';
import inject from '@rollup/plugin-inject';
import { nodePolyfills } from 'vite-plugin-node-polyfills'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      }
    },
    build: {
      target: 'esnext', 
			rollupOptions: {
				plugins: [inject({ Buffer: ['Buffer', 'Buffer'] })],
			},
		},
})
