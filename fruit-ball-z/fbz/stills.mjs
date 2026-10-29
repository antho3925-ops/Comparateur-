import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const frames = process.argv.slice(2).map(Number);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Episode1', browserExecutable});
for (const f of frames) {
  await renderStill({serveUrl, composition, frame: f, output: `${process.env.OUT}/f${String(f).padStart(4,'0')}.png`, browserExecutable, scale: 0.5});
  console.log('ok', f);
}
