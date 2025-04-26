import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import inject from '@rollup/plugin-inject'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle 'buffer/' and 'process/' imports
    {
      name: 'handle-trailing-slash-imports',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'buffer/') {
          return path.resolve(__dirname, 'node_modules/buffer/index.js');
        }
        if (id === 'process/') {
          return path.resolve(__dirname, 'node_modules/process/browser.js');
        }
        return null;
      }
    }
  ],
  define: {
    'process.env': {},
    'process.nextTick': 'undefined',
    'process.version': '"0.0.0"',
    'global': 'globalThis',
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
          process: ['process']
        })
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.nextTick': 'undefined',
        'process.version': '"0.0.0"'
      },
    },
    include: [
      'buffer',
      'process',
      'crypto-browserify',
      'stream-browserify',
      'util',
      'assert',
    ],
    force: ['buffer'] // Force pre-bundling of buffer
  },
  resolve: {
    alias: [
      // Core polyfills with explicit paths
      { find: 'crypto', replacement: 'crypto-browserify' },
      { find: 'stream', replacement: 'stream-browserify' },
      { find: 'util', replacement: 'util/' },
      { find: 'assert', replacement: 'assert/' },
      // Project-specific aliases
      { find: '@toniq-labs/bioniq', replacement: path.resolve(__dirname, 'bioniq/packages/bioniq-frontend') },
      { find: /^~(.*)$/, replacement: path.resolve(__dirname, 'src/$1') },
      { find: /^utils$/, replacement: path.resolve(__dirname, 'src/utils') }
    ]
  }
})