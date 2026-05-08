/**
 * StressCascadeOrchestrator.ts — GLOBAL SYSTEM STRESS ENGINE
 * 
 * Orchestrates the 'Omni-Studio Stress Cascade' to validate the total 
 * operational maturity of all 24 studios simultaneously.
 * 
 * Plan Item ID: TI-1
 */

import { studioBenchmark, BenchmarkResult } from './StudioBenchmarkSystem';
import { progressiveTester } from '../agents/ProgressiveTestAgent';
import { neuralTelemetry } from './NeuralTelemetry';
import { refinementAgent } from '../agents/RecursiveRefinementAgent';
import { evolutionCore } from '../memory/EvolutionEngine';

export interface CascadeMetric {
  studio: string;
  status: 'PENDING' | 'STRESSING' | 'VALIDATED' | 'FAILED';
  fidelity: number;
  latency: number;
}

class StressCascadeOrchestrator {
  private static instance: StressCascadeOrchestrator;
  private isCascading = false;
  private activeMetrics: Map<string, CascadeMetric> = new Map();

  private constructor() {
    console.log('%c[Orchestrator] 🌊 OMNI-STUDIO STRESS CASCADE INITIALIZED', 
      'color: #ef4444; font-weight: bold; font-size: 14px;');
  }

  static getInstance(): StressCascadeOrchestrator {
    if (!StressCascadeOrchestrator.instance) {
      StressCascadeOrchestrator.instance = new StressCascadeOrchestrator();
    }
    return StressCascadeOrchestrator.instance;
  }

  /**
   * Executes the full system stress cascade.
   */
  public async executeCascade() {
    if (this.isCascading) return;
    this.isCascading = true;
    this.activeMetrics.clear();

    const studios = studioBenchmark.getResults().length > 0 
      ? studioBenchmark.getResults().map(r => r.type)
      : ['book', 'code', 'video', 'image', 'audio', '3d', 'bio', 'automation', 'network', 'dataviz', 'simulation', 'music-production', 'text', 'security', 'database', 'cloud', 'iot', 'game', 'browser', 'os', 'intelligence', 'a2a', 'mathematics'];

    console.log(`[Orchestrator] 🌊 Initiating Stress Cascade for ${studios.length} studios...`);

    // 1. PHASE 1: MASSIVE CONCURRENCY
    const tasks = studios.map(async (studio) => {
      this.activeMetrics.set(studio, { studio, status: 'STRESSING', fidelity: 0, latency: 0 });
      
      try {
        // Run both Benchmark and Progressive Test in parallel
        const [bench, test] = await Promise.all([
          studioBenchmark.runBenchmark(studio as any),
          progressiveTester.runTestSuite(studio)
        ]);

        const finalFidelity = (bench.quality + (test.fidelityScore * 100)) / 2;
        const status = finalFidelity >= 95 ? 'VALIDATED' : 'FAILED';

        this.activeMetrics.set(studio, { 
          studio, 
          status, 
          fidelity: finalFidelity, 
          latency: bench.latency 
        });

        if (status === 'FAILED') {
          console.warn(`[Orchestrator] ⚠️ ${studio} FAILED stress check (${finalFidelity.toFixed(1)}%). Triggering refinement...`);
          await refinementAgent.monitorAndRefine();
        }
      } catch (e) {
        this.activeMetrics.set(studio, { studio, status: 'FAILED', fidelity: 0, latency: 0 });
      }
    });

    await Promise.all(tasks);
    this.isCascading = false;

    // 2. PHASE 2: FINAL MATURITY AUDIT
    const allValidated = Array.from(this.activeMetrics.values()).every(m => m.status === 'VALIDATED');
    
    if (allValidated) {
      console.log('%c[Orchestrator] 🏆 SYSTEM ACHIEVED TOTAL OPERATIONAL MATURITY (TOM)', 
        'color: #10b981; font-weight: bold; font-size: 16px;');
      
      neuralTelemetry.recordFault({
        source: 'Orchestrator:StressCascade',
        severity: 'LOW',
        message: 'Omni-Studio Stress Cascade SUCCESSFUL. 100% Validation reached.',
        recoverable: true
      });

      // Reward all agents
      studios.forEach(s => evolutionCore.learn(s, 'STRESS_CASCADE_SUCCESS', 1000, true));
    } else {
      console.error('[Orchestrator] ❌ Stress Cascade INCOMPLETE. Some studios failed perfection threshold.');
    }
  }

  public getMetrics() {
    return Array.from(this.activeMetrics.values());
  }

  public getIsCascading() { return this.isCascading; }
}

export const stressOrchestrator = StressCascadeOrchestrator.getInstance();
