import { DiffusionNodeStatus, DiffusionMode } from './DiffusionTypes';

/**
 * DiffusionNodeManager — Swarm lifecycle and health management.
 * Tracks available nodes, their capabilities, and current computational load.
 */

export class DiffusionNodeManager {
  private nodes: Map<string, DiffusionNodeStatus> = new Map();

  constructor() {
    // Register the Local Native Sovereign Node as the primary compute core.
    this.registerNode({
      id: 'NATIVE_SOVEREIGN_CORE',
      status: 'idle',
      load: 0,
      capabilities: ['aesthetic', 'temporal', 'spatial', 'abstract', 'sovereign']
    });
  }

  /**
   * Registers a new node (A2A or Local) into the diffusion swarm.
   */
  public registerNode(status: DiffusionNodeStatus): void {
    console.log(`[NodeManager] Integrating Node: ${status.id} | Status: ${status.status}`);
    this.nodes.set(status.id, status);
  }

  /**
   * Updates the real-time status and load metrics for a specific node.
   */
  public updateNode(id: string, updates: Partial<DiffusionNodeStatus>): void {
    const node = this.nodes.get(id);
    if (node) {
      this.nodes.set(id, { ...node, ...updates });
    }
  }

  /**
   * Identifies all active nodes capable of handling a specific diffusion mode.
   */
  public getAvailableNodes(mode: DiffusionMode): DiffusionNodeStatus[] {
    return Array.from(this.nodes.values()).filter(node => 
      node.status !== 'offline' && node.capabilities.includes(mode)
    );
  }

  /**
   * Load-balancing logic to select the most optimal node for a given synthesis task.
   */
  public getBestNode(mode: DiffusionMode): DiffusionNodeStatus | null {
    const available = this.getAvailableNodes(mode);
    if (available.length === 0) return null;

    // Select the node with the lowest current synaptic load.
    return available.sort((a, b) => a.load - b.load)[0];
  }

  /**
   * Returns a complete registry of all known nodes.
   */
  public getAllNodes(): DiffusionNodeStatus[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Removes a node from the swarm.
   */
  public deregisterNode(id: string): void {
    this.nodes.delete(id);
    console.log(`[NodeManager] Node ${id} pruned from registry.`);
  }
}

export const diffusionNodeManager = new DiffusionNodeManager();
