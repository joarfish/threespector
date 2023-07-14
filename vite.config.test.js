/** @type {import('vite').UserConfig} */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {writeManifest} from "./plugins/writeManifest.js";
import manifest from "./src/manifest.json";

export default defineConfig({
  mode: 'development',
  plugins: [react(), writeManifest(manifest)]
})
