/**
 * ResourceOrchestrator.ts
 * 
 * Manages the "Adaptive Resource Orchestration" (ARO).
 * Handles manual environmental overrides (D35-D42) and performance-based 
 * auto-inference (FPS/Synaptic Load mapping).
 */

import { angvCompute } from '@/storage/AngvComputeEngine';

export interface EnvironmentalState {
  temp: number;      // D35
  pressure: number;  // D36
  humidity: number;  // D37
  density: number;   // D39
  adaptation: number; // D42
}

export class ResourceOrchestrator {
  private static instance: ResourceOrchestrator;
  
  private envState: EnvironmentalState = {
    temp: 273,
    pressure: 101325,
    humidity: 45,
    density: 1.0,
    adaptation: 0.8
  };

  private lastFps: number = 60;

  private constructor() {
    this.startPerformanceMonitoring();
  }

  public static getInstance(): ResourceOrchestrator {
    if (!ResourceOrchestrator.instance) {
      ResourceOrchestrator.instance = new ResourceOrchestrator();
    }
    return ResourceOrchestrator.instance;
  }

  private startPerformanceMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    const tick = () => {
      const now = performance.now();
      frames++;
      if (now > lastTime + 1000) {
        this.lastFps = Math.round((frames * 1000) / (now - lastTime));
        this.autoInfer();
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /**
   * Performance Auto-Infer Logic
   * Maps actual device telemetry to photonic control dimensions.
   */
  private autoInfer() {
    // If FPS drops below 30, increase Adaptation (D42) and prioritize performance (D45)
    if (this.lastFps < 30) {
      this.envState.adaptation = Math.min(1.0, this.envState.adaptation + 0.1);
      console.warn(`[ARO] ⚠️ Low FPS detected (${this.lastFps}). Increasing adaptation trajectory.`);
    } else if (this.lastFps > 55) {
      this.envState.adaptation = Math.max(0.5, this.envState.adaptation - 0.05);
    }
  }

  public updateEnv(patch: Partial<EnvironmentalState>) {
    this.envState = { ...this.envState, ...patch };
    console.log('[ARO] ◈ Environmental Override Synchronized:', this.envState);
  }

  public getVectorOverrides(): Record<number, number> {
    return {
      34: this.envState.temp,
      35: this.envState.pressure,
      36: this.envState.humidity,
      38: this.envState.density,
      41: this.envState.adaptation
    };
  }

  public getVitals() {
    return {
      fps: this.lastFps,
      state: this.envState
    };
  }
}

export const aro = ResourceOrchestrator.getInstance();
