import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const linkPath = join(root, 'app');
const target = join(root, 'src', 'app');

if (existsSync(linkPath)) {
  process.exit(0);
}

if (process.platform === 'win32') {
  execSync(`cmd /c mklink /J "${linkPath}" "${target}"`, { stdio: 'inherit' });
} else {
  execSync('ln -sf src/app app', { cwd: root, stdio: 'inherit' });
}
