import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targets = {
  app: {
    entryPoint: path.join(rootDir, 'backend/src/app.ts'),
    outfile: path.join(rootDir, 'dist-server/app.js'),
  },
  server: {
    entryPoint: path.join(rootDir, 'backend/src/server.ts'),
    outfile: path.join(rootDir, 'dist-server/server.js'),
  },
};

const targetName = process.argv[2];
const target = targets[targetName];

if (!target) {
  console.error(`Unknown backend build target: ${targetName || '(missing)'}`);
  process.exit(1);
}

await build({
  entryPoints: [target.entryPoint],
  absWorkingDir: rootDir,
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  outfile: target.outfile,
});
