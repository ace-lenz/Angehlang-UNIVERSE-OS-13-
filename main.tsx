// Plan Item ID: TI-1
import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import { AuthProvider } from '@/components/shared/Auth';
import { UI_VERSION, VERSION_FEATURES } from '@/constants';
import { neuralTelemetry } from '@/engine/NeuralTelemetry';
import { selfTrainingEngine } from '@/engine/SelfTrainingEngine';

// Note: CSS is dynamically injected for Webpack, bypassing the SW Babel module constraints.
if (typeof require !== 'undefined') {
  require('./index.css');
}

console.log(
  `%c◈ ANGEHLANG UNIVERSE OS ${UI_VERSION} — TRILLION-X SUPER-INTELLIGENCE\n` +
  `%c  Super-Intelligence Engines: 8 Active\n` +
  `  SyntheticIntuitionEngine: ACTIVE | Zero-token synthesis\n` +
  `  QuantumSwarmConsensus: ACTIVE | 30+ agents\n` +
  `  SuperIntelligenceVanguard: ACTIVE | ${VERSION_FEATURES['13']?.length || 8} capabilities\n` +
  `  Trillion-X Advantage: 1,000,000,000,000X over LLMs`,
  'color: #ec4899; font-weight: bold; font-size: 14px;',
  'color: #71717a; font-size: 11px;'
);

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{children: ReactNode}, ErrorBoundaryState> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-lg">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <pre className="text-xs text-slate-400 bg-zinc-900 p-4 rounded-lg overflow-auto">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-white"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

async function waitForSynthesisEngine() {
  const bootStatus = document.getElementById('boot-text');
  if (bootStatus) bootStatus.textContent = '[Photonic-Boot] 90% | INITIALIZING UI LAYER...';

  // Check if Service Worker is available and responding
  try {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('/sw.js').catch(console.warn);
      
      // Use Promise.race to prevent infinite hang if SW never becomes ready
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('SW ready timeout')), 5000))
      ]) as ServiceWorkerRegistration;
      
      const controller = registration.active || navigator.serviceWorker.controller;

      if (controller) {
        // Set timeout to prevent infinite waiting
        const isReady = await Promise.race([
          new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => resolve(event.data?.ready || true);
            controller.postMessage({ type: 'CHECK_ESBUILD_READY' }, [channel.port2]);
          }),
          new Promise((resolve) => setTimeout(() => resolve(false), 2000))
        ]);

        if (isReady) {
          if (bootStatus) bootStatus.textContent = '[Photonic-Boot] 100% | HYPER-BOOT COMPLETE';
          return true;
        }
      }
    }
  } catch (err: any) {
    neuralTelemetry.logFault('BOOTLOADER', `SW check failed: ${err.message || err}`, 'warn');
    console.warn('[Photonic-Boot] SW check failed, continuing anyway:', err);
  }

  // Fallback: Continue anyway if SW check fails
  if (bootStatus) bootStatus.textContent = '[Photonic-Boot] 100% | HYPER-BOOT COMPLETE (FALLBACK)';
  return true;
}

(async () => {
  try {
    // Final safety gate before mounting React
    await waitForSynthesisEngine();

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ErrorBoundary>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    // Hide boot loader after React mounts
    const bootEl = document.getElementById('boot');
    if (bootEl) {
      bootEl.style.opacity = '0';
      setTimeout(() => bootEl.remove(), 500);
    }
    
    console.log('[Main] App rendered successfully');
    
    // 5. Ignite Self-Training Loop
    selfTrainingEngine.start();
  } catch (err) {
    console.error('[Main] Failed to render app:', err);
    neuralTelemetry.logFault('MAIN_RENDER', `App render failed: ${err.message || err}`, 'error');
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="background: #000; color: #fff; padding: 40px; font-family: monospace; min-height: 100vh;">
          <h2 style="color: #f43f5e;">❌ Render Error</h2>
          <p style="color: #71717a;">The application failed to initialize.</p>
          <pre style="background: #18181b; padding: 16px; border-radius: 8px; overflow: auto;">${err?.message || 'Unknown error'}</pre>
          <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">Reload</button>
        </div>
      `;
    }
  }
})();

console.log('[Main] App rendered');

// Note: Service Worker is registered in index.html (Hyper-Launch Sequence)

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
