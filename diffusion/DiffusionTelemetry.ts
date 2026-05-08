import { DiffusionTelemetry, DiffusionResult } from './DiffusionTypes';

/**
 * DiffusionTelemetrySystem — Real-time performance monitoring and analytical tracking.
 */

export class DiffusionTelemetrySystem {
  private history: DiffusionTelemetry[] = [];
  private totalLatency: number = 0;
  private totalLoads: number = 0;

  /**
   * Records telemetry from a successful diffusion cycle.
   */
  public record(result: DiffusionResult): void {
    const { telemetry } = result;
    this.history.push(telemetry);
    
    this.totalLatency += telemetry.latencyMs;
    this.totalLoads += telemetry.synapticLoad;

    console.log(`[Telemetry] Diffusion Complete — Node: ${telemetry.nodeId} | Latency: ${telemetry.latencyMs}ms | Load: ${(telemetry.synapticLoad * 100).toFixed(1)}%`);
    
    // Maintain a rolling window of history
    if (this.history.length > 500) {
      this.history.shift();
    }
  }

  /**
   * Returns aggregated statistics for the diffusion swarm.
   */
  public getStats() {
    const count = this.history.length;
    if (count === 0) return { avgLatency: 0, avgLoad: 0, count: 0 };

    return {
      avgLatency: this.totalLatency / count,
      avgLoad: this.totalLoads / count,
      totalCycles: count,
      lastTelemetry: this.history[count - 1]
    };
  }

  /**
   * Resets telemetry history.
   */
  public reset(): void {
    this.history = [];
    this.totalLatency = 0;
    this.totalLoads = 0;
  }
}

export const diffusionTelemetry = new DiffusionTelemetrySystem();
