import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    crx({ manifest })
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@shared': '/src/shared',
      '@content': '/src/content',
      '@popup': '/src/popup',
      '@background': '/src/background'
    }
  },
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html'
      }
    }
  }
});
