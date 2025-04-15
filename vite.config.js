import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';
import inject from '@rollup/plugin-inject';
import { nodePolyfills } from 'vite-plugin-node-polyfills'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // To add only specific polyfills, add them here
      include: ['stream', 'util'],
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    proxy: {
      '/api/bioniq': {
        target: 'https://api.bioniq.io/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bioniq/, '')
      },
      '/api/plebes': {
        target: 'https://api.plebes.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/plebes/, '')
      }
    }
  },
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
