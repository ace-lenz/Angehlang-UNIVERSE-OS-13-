import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const filesToDelete = [
  'vite.config.ts',
  'dev.mjs'
];

console.log('🚀 Initiating Sovereign Core Purge...');

let deletedCount = 0;
filesToDelete.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath);
    console.log(`  🗑️ DELETED: ${file}`);
    deletedCount++;
  } else {
    console.log(`  ⏭️ SKIPPED: ${file} (already gone)`);
  }
});

console.log('\n🧹 Aligning node_modules dependency graph...');
try {
  // Run npm install to mathematically strip removed packages
  execSync('npm install', { stdio: 'inherit' });
  console.log('\n✅ PURE SOVEREIGN ZERO-SERVER ACHIEVED.');
  console.log('Vite routing and Tailwind compilation architectures have been fully replaced by the native Sovereign Express logic and in-browser CDNs.');
} catch (e) {
  console.error('\n❌ Failed to sync node_modules. Please run `npm install` manually.');
}
