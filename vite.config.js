/** @type {import('vite').UserConfig} */

import {defineConfig, splitVendorChunkPlugin} from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import {writeManifest} from "./plugins/writeManifest.js";
import manifest from "./src/manifest.json";

const noHashNames = [
    'contentScript',
    'injectedScript',
    'serviceWorker',
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        panel: resolve(__dirname, 'panel.html'),
        injectedScript: resolve(__dirname, 'src/Injection/index.ts'),
        contentScript: resolve(__dirname, 'src/contentScript.ts'),
        serviceWorker: resolve(__dirname, 'src/serviceWorker.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (noHashNames.includes(chunkInfo.name)) {
            return '[name].js';
          } else {
            return '[name].[hash].js'
          }
        },
      },
    },
  },
  plugins: [react(), writeManifest(manifest), splitVendorChunkPlugin()]
})
