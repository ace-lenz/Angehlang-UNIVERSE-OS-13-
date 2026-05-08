/**
 * run-studio-tests.ts — Sovereign OS Full LLM Studio Test Suite
 *
 * Run this file with:   npx ts-node run-studio-tests.ts
 *
 * It tests the native NativeNeuralCore + SwarmV2 across all studios
 * without needing a browser. Results are printed to console.
 */

// ─── Minimal browser-API shims ────────────────────────────────────────────────
// (We're running in Node — shim only what the engines absolutely need)
(global as any).localStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
})();
(global as any).window = global;
(global as any).fetch = async (url: string, opts?: any) => ({
  ok: false, status: 503,
  json: async () => ({}), text: async () => ''
});

// ─── Test runner ──────────────────────────────────────────────────────────────

interface TestResult {
  studio: string;
  prompt: string;
  passed: boolean;
  response: string;
  latencyMs: number;
  error?: string;
}

const STUDIO_PROMPTS: Array<{ studio: string; prompt: string }> = [
  { studio: 'MAIN CHAT',         prompt: 'What is the Angehlang Universe OS and how does your Sovereign Swarm V2 work?' },
  { studio: 'CodeStudio',        prompt: 'Write a TypeScript function that debounces a promise-returning async function.' },
  { studio: 'SecurityStudio',    prompt: 'Identify the top 3 OWASP threats and their mitigations in a React+Express app.' },
  { studio: 'GameStudio',        prompt: 'Design the core game loop for a procedurally-generated roguelike dungeon.' },
  { studio: 'BookStudio',        prompt: 'Write the opening paragraph of a science fiction novel set on a quantum computer.' },
  { studio: 'MusicStudio',       prompt: 'Compose a 4-bar chord progression in Dm and describe its emotional tone.' },
  { studio: 'BioStudio',         prompt: 'Explain CRISPR-Cas9 gene editing and its key off-target risks.' },
  { studio: 'ResearchStudio',    prompt: 'Summarize the current state of large language model evaluation benchmarks.' },
  { studio: 'SimulationStudio',  prompt: 'Describe a particle-based fluid simulation algorithm suitable for real-time use.' },
  { studio: 'CloudStudio',       prompt: 'Design a serverless event-driven architecture for a high-traffic IoT data pipeline.' },
  { studio: 'IoTStudio',         prompt: 'Describe an MQTT-based sensor mesh topology for a smart building system.' },
];

const PASS_THRESHOLD = 40; // Response must be at least 40 chars to count as real

async function runTests(): Promise<void> {
  console.log('\n' + '═'.repeat(70));
  console.log('  ◈  ANGEHLANG UNIVERSE OS — FULL LLM STUDIO TEST SUITE');
  console.log('  ◈  SwarmV2 + NativeNeuralCore Validation');
  console.log('═'.repeat(70) + '\n');

  // Dynamic import (avoids top-level circular dependency issues)
  let nativeNeuralCore: any;
  try {
    const mod = await import('./src/engine/NativeNeuralCore');
    nativeNeuralCore = mod.nativeNeuralCore;
    await nativeNeuralCore.initialize();
    console.log('  ✓  NativeNeuralCore initialized\n');
  } catch (e) {
    console.error('  ✗  NativeNeuralCore FAILED to initialize:', e);
    process.exit(1);
  }

  const results: TestResult[] = [];

  for (const { studio, prompt } of STUDIO_PROMPTS) {
    const start = Date.now();
    process.stdout.write(`  ▶  [${studio}] Testing...`);

    try {
      const studioPrefix = studio === 'MAIN CHAT' ? '' : `[STUDIO:${studio}] `;
      const response: string = await nativeNeuralCore.generate(`${studioPrefix}${prompt}`);
      const latencyMs = Date.now() - start;
      const passed = typeof response === 'string' && response.trim().length >= PASS_THRESHOLD;

      results.push({ studio, prompt, passed, response: response.trim().substring(0, 150) + '...', latencyMs });

      if (passed) {
        console.log(` ✓  PASS (${latencyMs}ms, ${response.trim().length} chars)`);
      } else {
        console.log(` ✗  FAIL — response too short or empty (${response?.length ?? 0} chars)`);
      }
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      console.log(` ✗  ERROR — ${err?.message ?? String(err)}`);
      results.push({ studio, prompt, passed: false, response: '', latencyMs, error: err?.message ?? String(err) });
    }
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  const passed  = results.filter(r => r.passed).length;
  const failed  = results.filter(r => !r.passed).length;
  const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / results.length);

  console.log('\n' + '─'.repeat(70));
  console.log(`  ◈  RESULTS:  ${passed}/${results.length} PASSED  |  ${failed} FAILED  |  avg ${avgLatency}ms`);
  console.log('─'.repeat(70));

  if (failed > 0) {
    console.log('\n  FAILED STUDIOS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`    ✗ ${r.studio}: ${r.error ?? 'Empty/short response'}`);
    });
  }

  if (passed === results.length) {
    console.log('\n  ◈  ALL STUDIOS OPERATIONAL — SOVEREIGN OS FULLY CHARGED  ◈');
  }
  console.log('\n' + '═'.repeat(70) + '\n');

  // Exit code: 0 = all pass, 1 = some fail
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
