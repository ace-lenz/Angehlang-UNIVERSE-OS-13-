import { spawn } from 'child_process';
import path from 'path';

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[36m%s\x1b[0m', ' 🚀 ANGEHLANG NATIVE OS: DUAL BOOT SEQUENCE START 🚀 ');
console.log('\x1b[36m%s\x1b[0m', '=====================================================');

console.log('\x1b[33m[SYSTEM]\x1b[0m Starting in offline-first mode...');

// 1. Launch Vite securely using Node (bypassing npm/npx cmd wrappers to avoid ENOENT)
const vite = spawn('node', ['./node_modules/vite/bin/vite.js', '--port=3000', '--host=0.0.0.0'], { 
    stdio: 'inherit',
    shell: false
});

vite.on('error', (err) => {
    console.error('\x1b[31m[VITE BOOT ERROR]\x1b[0m Failed to start UI server.');
    console.error(err);
});

process.on('SIGINT', () => {
    console.log('\x1b[33m[SYSTEM]\x1b[0m Shutting down Universe OS processes...');
    vite.kill();
    process.exit();
});
