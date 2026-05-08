/**
 * archive.ts — SOVEREIGN ARCHIVAL ENGINE
 * 
 * Creates a clean, upload-ready distribution folder.
 * Filters out node_modules, dist, and AI metadata.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(rootDir, '..', 'angehlang-universe-os-upload');

async function archive() {
  console.log('◈◈◈ INITIATING SOVEREIGN ARCHIVAL ◈◈◈');
  console.log(`Target: ${targetDir}`);

  if (fs.existsSync(targetDir)) {
    console.log('⚠️ Target already exists. Purging legacy substrate...');
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const ignoreList = [
    'node_modules',
    'dist',
    'build',
    'coverage',
    '.git',
    '.gemini',
    'brain',
    '.brain',
    'scratch',
    '.scratch',
    '.DS_Store'
  ];

  function copyRecursive(src: string, dest: string) {
    const stats = fs.statSync(src);
    const isDirectory = stats.isDirectory();
    const baseName = path.basename(src);

    if (ignoreList.includes(baseName)) return;

    if (isDirectory) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest);
      fs.readdirSync(src).forEach(child => {
        copyRecursive(path.join(src, child), path.join(dest, child));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  console.log('📦 Manifesting clean source substrate...');
  copyRecursive(rootDir, targetDir);

  console.log('✅ ARCHIVAL COMPLETE: Sovereign folder is ready for upload.');
  console.log(`Location: ${targetDir}`);
}

archive().catch(console.error);
