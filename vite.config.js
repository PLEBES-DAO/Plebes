import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';
import { nodePolyfills } from 'vite-plugin-node-polyfills'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      // Moved to the first position
      // Removed the include array
      // include: ['stream', 'util', 'global', 'process'],
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Explicitly enable protocol imports
      protocolImports: true,
    }),
    react(),
    // TailwindCSS plugin applied via postcss config, no need to list here unless specific config needed
  ],
  resolve: {
    alias: {
      // Add aliases for problematic modules
      process: "node-stdlib-browser/process",
      buffer: "node-stdlib-browser/buffer",
      util: "node-stdlib-browser/util", // Add util just in case
      stream: "node-stdlib-browser/stream", // Add stream just in case
    }
  },
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
		},
})
