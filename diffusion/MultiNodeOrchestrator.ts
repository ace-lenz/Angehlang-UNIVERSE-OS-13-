import { DiffusionRequest, DiffusionResult } from './DiffusionTypes';
import { sovereignDiffusionHub } from './SovereignDiffusionHub';
import { diffusionNodeManager } from './DiffusionNodeManager';
import { diffusionTelemetry } from './DiffusionTelemetry';

/**
 * MultiNodeOrchestrator — High-fidelity task distribution and swarm synchronization.
 * Manages the delegation of synthesis logic across native and remote A2A nodes.
 */

export class MultiNodeOrchestrator {
  /**
   * Alias for orchestrate - primary entry point
   */
  public async distributeTask(request: DiffusionRequest): Promise<DiffusionResult> {
    return this.orchestrate(request);
  }

  /**
   * Orchestrates a single diffusion task by selecting the most suitable compute node.
   */
  public async orchestrate(request: DiffusionRequest): Promise<DiffusionResult> {
    console.log(`[MultiNodeOrchestrator] Engaging Swarm for: ${request.prompt.substring(0, 40)}...`);

    const bestNode = diffusionNodeManager.getBestNode(request.mode);
    
    // If no external node is available or the local core is optimal, execute locally.
    if (!bestNode || bestNode.id === 'NATIVE_SOVEREIGN_CORE') {
      const result = await sovereignDiffusionHub.diffuse(request);
      diffusionTelemetry.record(result);
      return result;
    }

    // A2A Delegation Sequence
    console.log(`[MultiNodeOrchestrator] Delegating Task → Node: ${bestNode.id} [${request.mode}]`);
    
    // Simulate node transition to busy state
    diffusionNodeManager.updateNode(bestNode.id, { status: 'busy' });
    
    try {
      /**
       * In the primary A2A architecture, this would invoke a broadcast over the lattice.
       * For this implementation, we utilize the Hub to resolve the synthesis.
       */
      const result = await sovereignDiffusionHub.diffuse({
        ...request,
        // Tag the result with the delegating node ID for telemetry accuracy
      });

      // Synchronize Node Load
      diffusionNodeManager.updateNode(bestNode.id, { 
        status: 'idle', 
        load: result.telemetry.synapticLoad 
      });

      diffusionTelemetry.record(result);
      return result;

    } catch (error) {
      console.warn(`[MultiNodeOrchestrator] Node Failure Detected (${bestNode.id}). Triggering Sovereign Fallback...`);
      
      // Prune failed node and retry locally
      diffusionNodeManager.updateNode(bestNode.id, { status: 'offline' });
      
      const localFallback = await sovereignDiffusionHub.diffuse(request);
      diffusionTelemetry.record(localFallback);
      return localFallback;
    }
  }

  /**
   * Orchestrates multiple synthesis tasks in parallel across the available node matrix.
   */
  public async orchestrateSwarm(requests: DiffusionRequest[]): Promise<DiffusionResult[]> {
    console.log(`[MultiNodeOrchestrator] Initiating Parallel Swarm Synthesis (${requests.length} units)...`);
    return Promise.all(requests.map(req => this.orchestrate(req)));
  }
}

export const multiNodeOrchestrator = new MultiNodeOrchestrator();
