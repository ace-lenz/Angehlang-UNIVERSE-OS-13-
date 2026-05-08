// Plan Item ID: TI-1
/**
 * sw.js
 * Sovereign Infinity Ultra Service Worker v13.0
 * 
 * Optimized for Nanosecond-scale Boot and Light-Speed Synthesis.
 * Utilizes Esbuild-Wasm for near-instant transpilation.
 */

// ── 0. Substrate Dependencies ────────────────────────────────────────────────
// NOTE: importScripts must be called in the global scope to be cached during installation.
importScripts('https://unpkg.com/esbuild-wasm@0.20.1/lib/browser.min.js');

const VERSION = 'v13.0.1-ultra';
const CACHE_NAME = `sovereign-cache-${VERSION}`;
const LOGIC_DB = 'SovereignLogicCache';
const LOGIC_STORE = 'transpiled';
let dnaRegistry = null;

// Determine if in production (by checking if sw is served from /dist or via message)
let isProduction = false;

// ── 1. Install & Activate ────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  console.log('[SW-Ultra] 🚀 Sovereign Substrate Initializing...');
  e.waitUntil(
    (async () => {
      // Pre-cache the Esbuild WASM binary for absolute offline sovereignty
      const cache = await caches.open(CACHE_NAME);
      await cache.add('https://unpkg.com/esbuild-wasm@0.20.1/esbuild.wasm');
      console.log('[SW-Ultra] 📦 Synthesis substrate pre-cached.');
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
  console.log('[SW-Ultra] ✅ Sovereign Protocol Online.');
});

// ── 2. Logic Synthesis Engine (Esbuild-Wasm) ──────────────────────────────────
let esbuildInitialized = false;

async function initEsbuild() {
  if (esbuildInitialized) return;
  try {
    // 1. Initialize with a direct link to the WASM file
    // The 'esbuild' global is provided by the top-level importScripts
    await self.esbuild.initialize({
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.20.1/esbuild.wasm',
      worker: false
    });
    
    esbuildInitialized = true;
    console.log('[SW-Ultra] ⚡ Esbuild Synthesis Engine Active (Cloud Purge Mode).');
  } catch (err) {
    console.warn('[SW-Ultra] ⚠️ Synthesis Engine failed. Activating Ghost Recovery...');
    // Ghost Recovery: Allow system to continue by serving un-transpiled logic
    esbuildInitialized = false;
  }
}

// ── 3. Logic Cache (Native IndexedDB Wrapper) ─────────────────────────────────
async function getCachedLogic(url, hash) {
  return new Promise((resolve) => {
    const request = indexedDB.open(LOGIC_DB, 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(LOGIC_STORE);
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(LOGIC_STORE, 'readonly');
      const store = tx.objectStore(LOGIC_STORE);
      const getReq = store.get(`${url}_${hash}`);
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => resolve(null);
    };
  });
}

async function putCachedLogic(url, hash, code) {
  const request = indexedDB.open(LOGIC_DB, 1);
  request.onsuccess = (e) => {
    const db = e.target.result;
    const tx = db.transaction(LOGIC_STORE, 'readwrite');
    const store = tx.objectStore(LOGIC_STORE);
    store.put(code, `${url}_${hash}`);
  };
}

// ── 4. Fetch Interception & Synthesis ─────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept all requests to the source substrate
  const isSovereign = url.origin === self.location.origin && url.pathname.startsWith('/src/');
  // Match ALL webpack output files: named chunks (main, vendors, react.vendor, etc.)
  // AND numbered dynamic chunks (e.g. /2097.a96dd8efa387.js, /123.abc.js)
  const isJsOrCssAsset = /\.(js|css|woff2?|ttf|eot|png|svg|ico)(\?.*)?$/.test(url.pathname);
  const isBuildAsset = isProduction && url.origin === self.location.origin && isJsOrCssAsset;

  if (isProduction && isBuildAsset) {
    event.respondWith(handleProductionCache(event.request));
  } else if (isSovereign) {
    event.respondWith(handleSovereignRequest(event.request));
  }
});

async function handleProductionCache(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  
  const networkResponse = await fetch(request);
  cache.put(request, networkResponse.clone());
  return networkResponse;
}

async function handleSovereignRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 0. DNA Resolution (Zeta+ Absolute Sovereignty)
  if (dnaRegistry && dnaRegistry[path.substring(1)]) {
    const entry = dnaRegistry[path.substring(1)];
    return synthesizeResponse(path, entry.c);
  }
  
  // 1. Fetch raw source (with bypass header and extension probing)
  let networkResponse = await fetch(request, {
    headers: { 'X-SW-Bypass': 'true' }
  });

  // 1.1 Extension-less Probing (if source fetch fails)
  let actualPath = path;
  if (!networkResponse.ok && !path.includes('.')) {
    const variants = ['.tsx', '.ts', '.angeh'];
    for (const ext of variants) {
      const probeRes = await fetch(path + ext, { headers: { 'X-SW-Bypass': 'true' } });
      if (probeRes.ok) {
        networkResponse = probeRes;
        actualPath = path + ext;
        break;
      }
    }
  }

  if (!networkResponse.ok) return networkResponse;

  // 2. Logic Interception Logic
  const contentType = networkResponse.headers.get('Content-Type');
  const isSovereignJS = contentType?.includes('javascript') || contentType?.includes('text/plain');

  if (!isSovereignJS && !actualPath.endsWith('.ts') && !actualPath.endsWith('.tsx')) {
    return networkResponse; // Pass through non-logic assets (images, etc)
  }

  // 3. Synthesis Path (Dev Mode)
  const source = await networkResponse.text();
  const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(source))
    .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''));

  const cached = await getCachedLogic(actualPath, hash);
  if (cached) {
    return new Response(cached, { headers: { 'Content-Type': 'text/javascript; charset=UTF-8' } });
  }

  await initEsbuild();
  
  if (!esbuildInitialized) {
    return new Response(source, { headers: { 'Content-Type': 'text/javascript; charset=UTF-8' } });
  }

  try {
    const start = performance.now();
    const result = await esbuild.transform(source, {
      loader: actualPath.endsWith('.tsx') ? 'tsx' : 'ts',
      format: 'esm',
      target: 'es2022',
      minify: false,
      sourcemap: 'inline'
    });
    
    const duration = performance.now() - start;
    console.log(`[SW-Ultra] 💎 Synthesized ${actualPath} in ${duration.toFixed(2)}ms`);
    
    await putCachedLogic(actualPath, hash, result.code);
    
    return new Response(result.code, {
      headers: { 
        'Content-Type': 'text/javascript; charset=UTF-8',
        'X-Synthesis-Time': `${duration}ms`,
        'X-Sovereign-DNA-Hit': dnaRegistry ? 'true' : 'false'
      }
    });
  } catch (err) {
    console.error('[SW-Ultra] ❌ Synthesis Error:', actualPath, err);
    return new Response(`console.error("[SW-Ultra] Synthesis Failed: ${actualPath}", ${JSON.stringify(err.message)})`, {
      headers: { 'Content-Type': 'text/javascript; charset=UTF-8' }
    });
  }
}

/**
 * Shared Synthesis logic for both Network & DNA hits
 */
async function synthesizeResponse(path, source) {
  const url = { pathname: path }; // Mock for esbuild selector
  const hash = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(source))
    .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''));

  const cached = await getCachedLogic(path, hash);
  if (cached) {
    return new Response(cached, { headers: { 'Content-Type': 'text/javascript; charset=UTF-8' } });
  }

  await initEsbuild();
  
  if (!esbuildInitialized) {
    return new Response(source, { headers: { 'Content-Type': 'text/javascript; charset=UTF-8' } });
  }

  const start = performance.now();
  const result = await esbuild.transform(source, {
    loader: path.endsWith('.tsx') ? 'tsx' : 'ts',
    format: 'esm',
    target: 'es2022',
    minify: false,
    sourcemap: 'inline'
  });
  
  const duration = performance.now() - start;
  return new Response(result.code, {
    headers: { 
      'Content-Type': 'text/javascript; charset=UTF-8',
      'X-Synthesis-Time': `${duration}ms`,
      'X-DNA-Source': 'true'
    }
  });
}

// ── 5. HMR & Communication ────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  // Support both internal and suggested READY protocol
  if (event.data && (event.data.type === 'INITIALIZE_SYNTHESIS' || event.data.type === 'CHECK_ESBUILD_READY')) {
    initEsbuild().then(() => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'SYNTHESIS_READY', ready: true });
      } else {
        event.source.postMessage({ type: 'SYNTHESIS_READY', ready: true });
      }
    });
  }

  if (event.data && event.data.type === 'SYNC_DNA') {
    dnaRegistry = event.data.dna;
    console.log('[SW-Ultra] 🧬 DNA Registry Synchronized. Virtual Substrate active.');
  }
  
  if (event.data && event.data.type === 'HMR_UPDATE') {
    console.log('[SW-Ultra] 📡 HMR Signal received for:', event.data.path);
  }

  if (event.data && event.data.type === 'SET_MODE') {
    isProduction = event.data.mode === 'production';
    console.log(`[SW-Ultra] Mode synced to: ${event.data.mode}`);
  }
});

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
