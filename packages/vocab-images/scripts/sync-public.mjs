import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'media');
const TARGETS = [
  path.join(__dirname, '../../../apps/nihongo-web/public/media'),
  path.join(__dirname, '../../../apps/english-web/public/media'),
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Skip (chưa có): ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

for (const target of TARGETS) {
  console.log(`Sync → ${target}`);
  copyDir(SRC, target);
}
console.log('Sync media xong.');
