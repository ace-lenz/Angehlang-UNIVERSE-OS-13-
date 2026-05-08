import { DiffusionRequest, DiffusionResult, DiffusionMode } from './DiffusionTypes';
import { aestheticDiffusionCore } from './AestheticDiffusionCore';
import { temporalDiffusionCore } from './TemporalDiffusionCore';
import { spatialDiffusionCore } from './SpatialDiffusionCore';
import { abstractDiffusionCore } from './AbstractDiffusionCore';
import { a2aHub } from '@/agents/A2ACommunicationHub';

/**
 * SovereignDiffusionHub — The central orchestrator for the Omni-Diffusion System.
 * Routes requests to specialized cores and manages the local synthesis lattice.
 */

export class SovereignDiffusionHub {
  private readonly cores = {
    aesthetic: aestheticDiffusionCore,
    temporal: temporalDiffusionCore,
    spatial: spatialDiffusionCore,
    abstract: abstractDiffusionCore,
    sovereign: aestheticDiffusionCore // Default high-fidelity fallback
  };

  /**
   * Primary entry point for any diffusion-based synthesis task.
   */
  public async diffuse(request: DiffusionRequest): Promise<DiffusionResult> {
    const mode = request.mode;
    const core = this.cores[mode] || this.cores.sovereign;

    console.log(`[DiffusionHub] Routing synthesis request (Mode: ${mode}) to core: ${core.coreName}`);

    try {
      const result = await core.diffuse(request);
      
      // Broadcast success across the A2A network
      a2aHub.broadcastDiffusionResult(result).catch(err => 
        console.warn('[DiffusionHub] Broadcast failed:', err)
      );
      
      return result;
    } catch (error) {
      console.error(`[DiffusionHub] Routing failure for mode ${mode}:`, error);
      
      // Broadcast error across the A2A network
      a2aHub.broadcastDiffusionError(String(error), { mode, prompt: request.prompt }).catch(err =>
        console.warn('[DiffusionHub] Error broadcast failed:', err)
      );
      
      throw error;
    }
  }

  /**
   * Returns telemetry-grade status of all active diffusion cores.
   */
  public getRegistryStatus() {
    return Object.entries(this.cores).map(([mode, core]) => ({
      mode,
      core: core.coreName,
      version: core.version,
      status: 'ACTIVE'
    }));
  }
}

export const sovereignDiffusionHub = new SovereignDiffusionHub();
