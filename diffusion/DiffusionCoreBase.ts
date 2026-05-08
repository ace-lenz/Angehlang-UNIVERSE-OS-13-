import { DiffusionRequest, DiffusionResult, DiffusionMode, DiffusionMetadata } from './DiffusionTypes';

/**
 * DiffusionCoreBase — The foundational blueprint for all Angehlang diffusion modules.
 */

export abstract class DiffusionCoreBase {
  abstract readonly mode: DiffusionMode;
  abstract readonly coreName: string;
  abstract readonly version: string;

  /**
   * Internal synthesis logic to be implemented by specialized cores.
   */
  protected abstract synthesize(request: DiffusionRequest): Promise<DiffusionResult>;

  /**
   * Public interface to trigger a diffusion process with automatic telemetry and lifecycle tracking.
   */
  public async diffuse(request: DiffusionRequest): Promise<DiffusionResult> {
    const startTime = Date.now();
    
    // Ensure request has required defaults
    const activeRequest: DiffusionRequest = {
      ...request,
      seed: request.seed ?? Math.floor(Math.random() * 1e9),
      steps: request.steps ?? 30,
      guidance: request.guidance ?? 7.5
    };

    console.log(`[Diffusion:${this.coreName}] Engaged — Mode: ${this.mode} | Prompt: ${request.prompt.substring(0, 50)}...`);

    try {
      const result = await this.synthesize(activeRequest);
      
      const duration = Date.now() - startTime;
      
      // Inject final telemetry data
      return {
        ...result,
        telemetry: {
          ...result.telemetry,
          latencyMs: duration,
          nodeId: result.telemetry.nodeId || 'NATIVE_SOVEREIGN_CORE'
        }
      };
    } catch (error) {
      console.error(`[Diffusion:${this.coreName}] Critical Synthesis Failure:`, error);
      throw error;
    }
  }

  /**
   * Helper to construct standard metadata for diffusion results.
   */
  protected createMetadata(request: DiffusionRequest, params: Record<string, any> = {}): DiffusionMetadata {
    return {
      core: this.coreName,
      mode: this.mode,
      seed: request.seed || 0,
      steps: request.steps || 0,
      timestamp: Date.now(),
      version: this.version,
      parameters: params
    };
  }

  /**
   * Simulates VRAM utilization based on steps and mode.
   */
  protected estimateVramLoad(request: DiffusionRequest): number {
    const base = 2048; // Base 2GB
    const multiplier = request.mode === 'spatial' ? 2 : (request.mode === 'temporal' ? 3 : 1);
    const stepWeight = (request.steps || 20) * 10;
    return base * multiplier + stepWeight;
  }
}
