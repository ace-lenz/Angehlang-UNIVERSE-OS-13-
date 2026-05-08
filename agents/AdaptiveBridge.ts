// Plan Item ID: TI-1
/**
 * AdaptiveBridge.ts — Zero-latency Adaptive Intelligence Layer (v5.0 Modular)
 * 
 * This module coordinates the trajectory of incoming intelligence prompts.
 * It uses the Resource Orchestrator (ARO) and Dimension Mapper to determine
 * the optimal execution tier (Pattern, Heuristic, Logic, or Vortex).
 */

import { DimensionMapper, vectorToDimensions } from '@/storage/DimensionMapper';
import { aro } from '@/engine/ResourceOrchestrator';
import { KNOWLEDGE } from './bridge/KnowledgeBase';
import * as Templates from './bridge/ResponseTemplates';

export interface BridgeResult {
  response: string;
  tier: 'pattern' | 'heuristic' | 'logic' | 'vortex';
  latencyMs: number;
  model?: string;
}

/**
 * Main Entry Point: Absolute Sovereign Adaptive Intelligence
 * Resolves prompts purely on-device via patterns, heuristics, and logic.
 * Implements Trajectory Routing for automatic photonic/classical execution switching.
 */
export async function adaptiveInfer(prompt: string, metadata: { context?: string } = {}): Promise<BridgeResult> {
  const start = Date.now();
  const p = prompt.trim();
  
  // ── SENSING LAYER: Read ARO Vitals ──────────────────────
  const vitals = aro.getVitals();
  const overrides = aro.getVectorOverrides();
  
  const vector = DimensionMapper.createSemanticVector({
    intentDomain: 'inference',
    promptKey: p.substring(0, 50),
    moteScore: 0.8,
    zetaScalar: overrides[41] || 0.8, // Adaptation
    temperature: overrides[34] || 273,
    pressure: overrides[35] || 101325,
    coherence: 0.95,
    latency: 5,
    quality: 0.9,
    performance: vitals.fps / 60
  });

  const dims = vectorToDimensions(vector);
  const trajectory = dispatchTrajectory(dims, vitals);
  
  console.log(`[AdaptiveBridge] Trajectory: ${trajectory.mode} | Tier: ${trajectory.tier} | FPS: ${vitals.fps}`);

  // T0: Pattern - Always checked first for O(0) responses
  for (const entry of KNOWLEDGE) {
    if (entry.test.test(p)) {
      return {
        response: entry.respond(p),
        tier: 'pattern',
        latencyMs: Date.now() - start,
        model: trajectory.mode
      };
    }
  }

  // T1/T2: Logic & Heuristics
  if (trajectory.tier === 'pattern' || trajectory.tier === 'heuristic') {
     const heuristic = Templates.buildUniversalExpertResponse(p);
     return { 
       response: heuristic, 
       tier: 'heuristic', 
       latencyMs: Date.now() - start,
       model: trajectory.mode
     };
  }

  // T2/T3: Advanced Logic S-Expressions
  if (p.startsWith('(') && p.endsWith(')')) {
    try {
       const { sovereignLogic } = await import('@/engine/SovereignLogicCore');
       const res = await sovereignLogic.runScript(p);
       return {
         response: `[SOVEREIGN-LOGIC] ${JSON.stringify(res, null, 2)}`,
         tier: 'logic',
         latencyMs: Date.now() - start,
         model: trajectory.mode
       };
    } catch(e) {
       console.warn('[AdaptiveBridge] Logic eval failed:', e);
    }
  }

  // T3: Vortex — Full Swarm Consensus via Native Neural Core
  if (trajectory.tier === 'vortex') {
    try {
      const { nativeNeuralCore } = await import('@/engine/NativeNeuralCore');
      const vortexResult = await nativeNeuralCore.generate(p, metadata.context);
      return {
        response: vortexResult,
        tier: 'vortex',
        latencyMs: Date.now() - start,
        model: 'Sovereign-Lattice-Vortex'
      };
    } catch (e) {
      console.warn('[AdaptiveBridge] Vortex tier failed, falling back to expert:', e);
    }
  }

  const expert = Templates.buildUniversalExpertResponse(p);
  return { 
    response: expert, 
    tier: trajectory.tier, 
    latencyMs: Date.now() - start,
    model: trajectory.mode
  };
}

/**
 * Trajectory Routing: Selects execution tier based on ARO performance and environmental pressure.
 */
function dispatchTrajectory(dims: Record<string, number>, vitals: any): { mode: 'photonic' | 'classical' | 'hybrid'; tier: 'pattern' | 'heuristic' | 'logic' | 'vortex' } {
  const fps = vitals.fps;
  const pressure = vitals.state.pressure;
  const efficiency = dims.Efficiency ?? 0.8;
  
  // ── AUTO-DOWNMODULATION LOGIC ─────────────────────────────
  if (fps < 30 || pressure > 120000 || efficiency < 0.4) {
    console.log(`[AdaptiveBridge] ⚠ High Internal Pressure (${pressure}Pa) or Low FPS (${fps}). Downmodulating to CLASSICAL trajectory.`);
    return { mode: 'classical', tier: 'pattern' };
  }

  // High-fidelity Photonic Trajectory (Vortex)
  if (fps >= 55 && pressure < 105000 && efficiency > 0.8) {
    return { mode: 'photonic', tier: 'vortex' };
  }

  // Balanced Hybrid Trajectory
  if (fps >= 45 && pressure < 115000) {
    return { mode: 'hybrid', tier: 'logic' };
  }

  return { mode: 'classical', tier: 'heuristic' };
}

// Re-export specific synthesis builders for direct access by other agents
export const buildSwarmAgentFallback = Templates.buildSwarmAgentFallback;
export const buildSmartFallback = Templates.buildSmartFallback;

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
