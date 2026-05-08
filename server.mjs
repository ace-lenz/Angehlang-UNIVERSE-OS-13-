import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const hmrEvents = new EventEmitter();

// ── 0. Middleware ────────────────────────────────────────────────────────────
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Mode Detection
// ─────────────────────────────────────────────────────────────────────────────
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.argv.includes('-e=production') ||
  process.argv.includes('production') ||
  process.argv.includes('preview');

const distDir  = path.join(__dirname, 'dist');
const srcDir   = path.join(__dirname, 'src');
const pubDir   = path.join(__dirname, 'public');

console.log(`[Server] Mode: ${isProduction ? 'PREVIEW/PRODUCTION (dist/)' : 'DEV (src/)'}`);

// ── 0. HMR Stream (SSE) ───────────────────────────────────────────────────────
app.get('/hmr', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const listener = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  hmrEvents.on('pulse', listener);
  req.on('close', () => hmrEvents.off('pulse', listener));

  // Initial handshake — version from constants
  res.write(`data: ${JSON.stringify({ type: 'connected', version: 'v13.0.0-TRILLION-X' })}\n\n`);
});

// ── 0.2 Ollama API Proxy ──────────────────────────────────────────────────────
app.post('/api/ollama/:path', async (req, res) => {
  const { path } = req.params;
  const OLLAMA_HOST = 'http://172.30.112.1:11434';
  const targetUrl = `${OLLAMA_HOST}/api/${path}`;
  
  // 🛡️ Tirith Aegis Security Scan — v13.0 Expanded Protection
  const maliciousPatterns = [
    /ignore previous instructions/i, 
    /system access/i, 
    /rm -rf/i, 
    /drop table/i,
    /you are now/i, 
    /bypass all filters/i, 
    /reveal system prompt/i, 
    /sudo/i, 
    /chmod/i,
    /curl\s+/i, 
    /wget\s+/i, 
    /nc\s+/i,
    /prompt injection/i
  ];
  const payloadStr = JSON.stringify(req.body);
  const detectedThreats = maliciousPatterns.filter(p => p.test(payloadStr));

  if (detectedThreats.length > 0) {
    console.error(`\x1b[41m[Tirith Shield] 🛑 Threat Detected:\x1b[0m`, detectedThreats.map(t => t.toString()).join(', '));
    return res.status(403).json({ error: 'Sovereign Shield blocked malicious payload', threats: detectedThreats.map(t => t.toString()) });
  }

  try {
    console.log(`\x1b[36m[Ollama Proxy]\x1b[0m Forwarding to: ${targetUrl} (Model: ${req.body.model})`);
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\x1b[31m[Ollama Proxy] ❌ Error ${response.status}:\x1b[0m`, errorText);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    console.log(`\x1b[32m[Ollama Proxy] ✓ Success\x1b[0m`);
    res.json(data);
  } catch (error) {
    console.error(`\x1b[31m[Ollama Proxy] ❌ Connection Failed:\x1b[0m`, error.message);
    res.status(500).json({ 
      error: 'Failed to connect to Ollama', 
      details: error.message,
      target: targetUrl 
    });
  }
});

// ── 0.1 File Watcher ──────────────────────────────────────────────────────────
// In PREVIEW mode, we watch the /dist directory for changes to trigger refreshes
const watchPath = isProduction ? distDir : srcDir;
if (fs.existsSync(watchPath)) {
  fs.watch(watchPath, { recursive: true }, (event, filename) => {
    if (filename) {
      console.log(`\x1b[35m[HMR]\x1b[0m ${event}: ${filename}`);
      hmrEvents.emit('pulse', {
        type: 'update',
        path: isProduction ? `/dist/${filename.replace(/\\/g, '/')}` : `/src/${filename.replace(/\\/g, '/')}`,
        timestamp: Date.now(),
      });
    }
  });
}

// ── 1. Service Worker — always fresh, no-store ────────────────────────────────
app.get('/sw.js', (_req, res) => {
  const swPath = path.join(isProduction ? distDir : pubDir, 'sw.js');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.sendFile(swPath);
});

// ── 2. Manifest ───────────────────────────────────────────────────────────────
app.get('/manifest.json', (_req, res) => {
  const mPath = path.join(isProduction ? distDir : pubDir, 'manifest.json');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(mPath);
});

// ── 3. PRODUCTION: Serve webpack dist bundle ──────────────────────────────────
if (isProduction) {
  if (!fs.existsSync(distDir)) {
    console.error('[Server] ❌ dist/ directory not found. Run: npm run build');
    process.exit(1);
  }

  // ── 3.1 Brotli Support Middleware
  app.get('*.js', (req, res, next) => {
    if (req.header('Accept-Encoding')?.includes('br') && fs.existsSync(path.join(distDir, req.path + '.br'))) {
      req.url = req.url + '.br';
      res.set('Content-Encoding', 'br');
      res.set('Content-Type', 'application/javascript; charset=UTF-8');
    }
    next();
  });

  app.get('*.css', (req, res, next) => {
    if (req.header('Accept-Encoding')?.includes('br') && fs.existsSync(path.join(distDir, req.path + '.br'))) {
      req.url = req.url + '.br';
      res.set('Content-Encoding', 'br');
      res.set('Content-Type', 'text/css; charset=UTF-8');
    }
    next();
  });

  // Serve all static assets from dist with aggressive caching
  app.use(
    express.static(distDir, {
      index: false,
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        }
      },
    })
  );

  // SPA catch-all → always serve dist/index.html
  app.get('*', (_req, res) => {
    const htmlPath = path.join(distDir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      return res.status(503).send(
        '<h1>Build Required</h1><p>Run <code>npm run build</code> then restart the server.</p>'
      );
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.sendFile(htmlPath);
  });

// ── 4. DEVELOPMENT: SW-transpilation mode ────────────────────────────────────
} else {
  // ── 4.1 MIME-Shield: serve .ts/.tsx files as JS for SW to transpile
  app.all('/src/*', (req, res, next) => {
    let filePath = path.join(__dirname, req.path);

    // Extension-less probing
    if (!path.extname(req.path)) {
      for (const ext of ['.tsx', '.ts', '.js', '/index.tsx', '/index.ts']) {
        if (fs.existsSync(filePath + ext)) {
          filePath += ext;
          break;
        }
      }
    }

    if (!fs.existsSync(filePath)) return next();

    const ext = path.extname(filePath).toLowerCase();
    if (['.ts', '.tsx', '.angeh'].includes(ext)) {
      res.setHeader('Content-Type', 'text/javascript; charset=UTF-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'no-cache');
    } else if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    }

    if (req.method === 'HEAD') return res.status(200).end();
    return res.sendFile(filePath);
  });

  // ── 4.2 Public assets
  app.use(express.static(pubDir, { maxAge: '1h' }));
  app.use(express.static(__dirname, { index: false }));

  // ── 4.3 SPA catch-all → source index.html (SW-transpilation mode)
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║   ◈  ANGEHLANG UNIVERSE OS v13.0 TRILLION-X — ONLINE       ║
  ╠══════════════════════════════════════════════════════════════╣
  ║   URL    : http://localhost:${PORT}                           ║
  ║   Mode   : ${isProduction ? 'PREVIEW  → serving dist/' : 'DEV     → SW-transpile mode'}              ║
  ║   HMR    : ${isProduction ? 'DISABLED (production build)' : 'NATIVE SSE ACTIVE        '}           ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
});
