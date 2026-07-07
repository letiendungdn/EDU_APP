import { existsSync, lstatSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const linkPath = join(root, 'app');
const target = join(root, 'src', 'app');

function isOurAppLink() {
  if (!existsSync(linkPath)) return false;
  try {
    const stat = lstatSync(linkPath);
    if (!stat.isSymbolicLink()) {
      return process.platform === 'win32';
    }
    return true;
  } catch {
    return false;
  }
}

function ensureAppLink() {
  if (existsSync(linkPath)) return;

  if (process.platform === 'win32') {
    execSync(`cmd /c mklink /J "${linkPath}" "${target}"`, { stdio: 'inherit' });
  } else {
    execSync('ln -sf src/app app', { cwd: root, stdio: 'inherit' });
  }
}

function removeAppLink() {
  if (!isOurAppLink()) return;

  if (process.platform === 'win32') {
    execSync(`cmd /c rmdir "${linkPath}"`, { stdio: 'inherit' });
  } else {
    execSync('rm -f app', { cwd: root, stdio: 'inherit' });
  }
}

const action = process.argv[2] ?? 'ensure';
if (action === 'remove') {
  removeAppLink();
} else {
  ensureAppLink();
}
