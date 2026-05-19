import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/code.ts'),
      formats: ['iife'],
      name: 'pluginCode',
      fileName: () => 'code.js',
    },
  },
});
