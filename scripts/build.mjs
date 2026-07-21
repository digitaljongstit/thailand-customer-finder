import { mkdir, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

await rm('dist', { recursive: true, force: true });
await mkdir('dist/src', { recursive: true });
const result = spawnSync('tsc', ['-p', 'tsconfig.build.json'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
await cp('src/styles.css', 'dist/src/styles.css');
let html = await readFile('index.html', 'utf8');
html = html.replace('./src/main.ts', './src/main.js');
await writeFile('dist/index.html', html);
if (!existsSync('dist/index.html') || !existsSync('dist/src/main.js')) throw new Error('Build failed: missing dist assets');
console.log('Built static app in dist/');
