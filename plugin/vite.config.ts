import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      external: ['mp4-muxer'],
    },
  },
  resolve: {
    alias: {
      '@shaders': resolve(__dirname, '../src/lib/shaders.ts'),
      '@editor': resolve(__dirname, '../src/lib/editor.ts'),
      '@types-editor': resolve(__dirname, '../src/types/editor.ts'),
    },
  },
});
