import { readdir, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const indexScript = join(root, 'scripts', 'build-content-index.mjs');
const directories = [join(root, 'assets', 'photos'), join(root, 'assets', 'projects')];
let isBuilding = false;
let buildAgain = false;

const snapshot = async () => {
  const entries = await Promise.all(directories.map(async directory => {
    const files = await readdir(directory, { withFileTypes: true });
    return Promise.all(files
      .filter(file => file.isFile())
      .map(async file => {
        const filePath = join(directory, file.name);
        const details = await stat(filePath);
        return `${filePath}:${details.size}:${details.mtimeMs}`;
      }));
  }));
  return entries.flat().join('\n');
};

const build = () => {
  if (isBuilding) {
    buildAgain = true;
    return;
  }
  isBuilding = true;
  const child = spawn(process.execPath, [indexScript], { cwd: root, stdio: 'inherit' });
  child.on('exit', () => {
    isBuilding = false;
    if (buildAgain) {
      buildAgain = false;
      build();
    }
  });
};

let previousSnapshot = await snapshot();
build();
setInterval(async () => {
  const nextSnapshot = await snapshot();
  if (nextSnapshot !== previousSnapshot) {
    previousSnapshot = nextSnapshot;
    build();
  }
}, 1000);
console.log('Watching assets/photos and assets/projects. Press Ctrl+C to stop.');
