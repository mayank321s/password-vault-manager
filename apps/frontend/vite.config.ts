import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    vanillaExtractPlugin(),
    nodePolyfills({ globals: { Buffer: true }, protocolImports: true }),
  ],
  build: {
    rollupOptions: {
      output: { manualChunks: { crypto: ['@repo/crypto-utils'] } },
    },
  },
  optimizeDeps: {
    include: ['@repo/crypto-utils'],
  },
  resolve: {
    alias: {
      'vite-plugin-node-polyfills/shims/buffer': path.resolve(
        __dirname,
        'node_modules/vite-plugin-node-polyfills/shims/buffer',
      ),
      buffer: 'buffer',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
