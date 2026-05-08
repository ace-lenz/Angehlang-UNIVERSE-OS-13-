#!/usr/bin/env node
/**
 * ANGEHLANG UNIVERSE OS - Automated Recreation Script
 * Rebuilds the entire project from scratch with all dependencies
 * Version: 2.0.0
 * System Relevance: 10/10
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = __dirname;

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg, color = 'reset') {
  console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function runCommand(cmd, cwd = PROJECT_ROOT) {
  try {
    log(`Executing: ${cmd}`, 'cyan');
    execSync(cmd, { cwd, stdio: 'inherit' });
    return true;
  } catch (e) {
    log(`Failed: ${cmd}`, 'red');
    return false;
  }
}

function createDirIfNotExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created: ${dirPath}`, 'green');
  }
}

function writeFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    log(`Created: ${filePath}`, 'green');
  }
}

async function recreateProject() {
  log('════════════════════════════════════════════════════════════', 'magenta');
  log('  ANGEHLANG UNIVERSE OS - RECREATION ENGINE v2.0', 'magenta');
  log('════════════════════════════════════════════════════════════', 'magenta');

  // Step 1: Verify Prerequisites
  log('\n[STEP 1] Verifying Prerequisites...', 'yellow');
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    const npmVersion = execSync('npm --version').toString().trim();
    log(`Node.js: ${nodeVersion}`, 'green');
    log(`npm: ${npmVersion}`, 'green');
  } catch (e) {
    log('ERROR: Node.js/npm not found. Please install Node.js >=18', 'red');
    process.exit(1);
  }

  // Step 2: Create Directory Structure
  log('\n[STEP 2] Creating Directory Structure...', 'yellow');
  const dirs = [
    'src/agents',
    'src/agents/base',
    'src/components/agents',
    'src/components/chat',
    'src/components/dashboard',
    'src/components/explorer',
    'src/components/layout',
    'src/components/shared',
    'src/components/studios',
    'src/components/ui',
    'src/context',
    'src/engine/diffusion/adapters',
    'src/engine/studios',
    'src/features/ai',
    'src/features/audio',
    'src/features/automation',
    'src/features/automation/engines',
    'src/features/bio',
    'src/features/book',
    'src/features/browser',
    'src/features/cloud',
    'src/features/code',
    'src/features/database',
    'src/features/dataviz',
    'src/features/fullstack',
    'src/features/game',
    'src/features/image',
    'src/features/intelligence',
    'src/features/iot',
    'src/features/mcp',
    'src/features/network',
    'src/features/os',
    'src/features/security',
    'src/features/shared',
    'src/features/simulation',
    'src/features/text',
    'src/features/threed',
    'src/features/video',
    'src/hooks',
    'src/memory',
    'src/storage',
    'src/templates',
    'src/tools',
    'src/utils',
    'src/validation',
    'src/wiki',
    'public/libs',
    'public/angvengine',
    'dist',
    'dist/libs',
    'dist/angvengine',
    'dist_sovereign',
    'PLANS/.secure',
    'scratch',
    '.angie/rules',
  ];
  dirs.forEach(d => createDirIfNotExists(path.join(PROJECT_ROOT, d)));

  // Step 3: Install Dependencies
  log('\n[STEP 3] Installing Dependencies...', 'yellow');
  if (fs.existsSync(path.join(PROJECT_ROOT, 'package.json'))) {
    runCommand('npm install');
  } else {
    log('package.json not found. Initializing...', 'yellow');
    runCommand('npm init -y');
    const prodDeps = ['tone', '@ai-sdk/deepseek', '@types/three', 'clsx', 'dotenv', 'express', 'idb-keyval', 'lucide-react', 'motion', 'react', 'react-dom', 'react-markdown', 'tailwind-merge', 'three'];
    const devDeps = ['@esbuild/win32-x64', '@swc/core', '@types/express', '@types/node', '@types/react', '@types/react-dom', 'autoprefixer', 'compression-webpack-plugin', 'concurrently', 'copy-webpack-plugin', 'css-loader', 'css-minimizer-webpack-plugin', 'esbuild', 'esbuild-loader', 'html-webpack-plugin', 'postcss', 'postcss-loader', 'style-loader', 'tailwindcss', 'typescript', 'webpack', 'webpack-bundle-analyzer', 'webpack-cli', 'webpack-dev-server'];
    runCommand(`npm install ${prodDeps.join(' ')}`);
    runCommand(`npm install -D ${devDeps.join(' ')}`);
  }

  // Step 4: Environment Setup
  log('\n[STEP 4] Setting up Environment...', 'yellow');
  const envExample = path.join(PROJECT_ROOT, '.env.example');
  const envFile = path.join(PROJECT_ROOT, '.env');
  if (!fs.existsSync(envFile) && fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envFile);
    log('Created .env from .env.example', 'green');
  }

  // Step 5: Build Project
  log('\n[STEP 5] Building Project...', 'yellow');
  if (fs.existsSync(path.join(PROJECT_ROOT, 'webpack.config.js'))) {
    runCommand('npm run build');
  }

  // Step 6: Verify Integrity
  log('\n[STEP 6] Verifying System Integrity...', 'yellow');
  const requiredFiles = [
    'src/main.tsx',
    'src/App.tsx',
    'src/types.ts',
    'src/engine/InferenceEngine.ts',
    'package.json',
    'tsconfig.json',
    'webpack.config.js',
  ];
  let allPresent = true;
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(PROJECT_ROOT, file))) {
      log(`Missing: ${file}`, 'red');
      allPresent = false;
    }
  }
  if (allPresent) {
    log('All core files present ✓', 'green');
  }

  log('\n════════════════════════════════════════════════════════════', 'magenta');
  log('  RECREATION COMPLETE', 'magenta');
  log('  Run: npm run dev', 'green');
  log('════════════════════════════════════════════════════════════', 'magenta');
}

recreateProject().catch(e => {
  log(`Recreation failed: ${e.message}`, 'red');
  process.exit(1);
});
