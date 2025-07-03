import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'apps/electron/src/main.ts'),
        },
      },
    },
    resolve: {
      alias: {
        '@echosoul/common': resolve(__dirname, 'packages/common/src'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'apps/electron/src/preload.ts'),
        },
      },
    },
    resolve: {
      alias: {
        '@echosoul/common': resolve(__dirname, 'packages/common/src'),
      },
    },
  },
  renderer: {
    root: 'apps/renderer',
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'apps/renderer/src'),
        '@echosoul/common': resolve(__dirname, 'packages/common/src'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'apps/renderer/index.html'),
        },
      },
    },
  },
});
