import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { buildSync } from 'esbuild';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ and compiles worker.ts into dist/_worker.js so
      // Cloudflare Pages (Git or manual dist/ upload) and Workers both support /api/viewing-request.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }

          const workerEntry = path.resolve(__dirname, 'worker.ts');
          const distWorker = path.resolve(distDir, '_worker.js');
          if (fs.existsSync(distDir) && fs.existsSync(workerEntry)) {
            buildSync({
              entryPoints: [workerEntry],
              outfile: distWorker,
              bundle: true,
              format: 'esm',
              platform: 'neutral',
              target: 'es2022',
              minify: false,
            });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
