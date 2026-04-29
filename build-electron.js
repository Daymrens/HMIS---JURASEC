const { build } = require('esbuild');
const path = require('path');

const buildMain = () => {
  return build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist-electron/main.js',
    external: ['electron', 'better-sqlite3'],
    sourcemap: true,
  });
};

const buildPreload = () => {
  return build({
    entryPoints: ['electron/preload.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist-electron/preload.js',
    external: ['electron'],
    sourcemap: true,
  });
};

Promise.all([buildMain(), buildPreload()])
  .then(() => console.log('Electron build complete'))
  .catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
