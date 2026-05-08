// Plan Item ID: TI-1
/**
 * A2ASystem.ts — Sovereign Agent-to-Agent Orchestration Layer (v5.0 Modular)
 */

import { sovereignDiffusion } from '@/engine/SovereignDiffusionLattice';
import { 
  A2AClient, 
  A2AServer, 
  A2ARegistry, 
  A2AMessage, 
  A2AResponse, 
  A2AAgentCard,
  A2AClientConfig
} from './a2a/A2ACore';
import { SearchPromptAgent, SearchServerAgent } from './a2a/SearchAgents';
import { ResearcherAgent, OrchestratorAgent } from './a2a/ResearchAgents';
import { WikiKeeperAgent, RoyalsArbiterAgent, Royals_Ollama_Agent } from './a2a/SpecializedAgents';
import { SwarmMonitorAgent } from './a2a/MonitorAgents';
import { neuralTelemetry } from '@/engine/NeuralTelemetry';

export const A2A_PORTS = {
  ORCHESTRATOR: 3000,
  RESEARCHER: 3001,
  SEARCH_SERVER: 3002,
  SEARCH_PROMPT: 3003,
  ROYALS_ARBITER: 3010,
  NATIVE_BUILDER: 3030,
  WIKI_KEEPER: 3040,
  SWARM_MONITOR: 3050
};

class A2ASystem {
  private registry: A2ARegistry;
  private orchestrator: OrchestratorAgent | null = null;

  constructor() {
    this.registry = new A2ARegistry();
  }

  async initialize() {
    console.log('[A2A] Initializing Agent-to-Agent system...');
    
    // Core Infrastructure
    const searchPrompt = new SearchPromptAgent(A2A_PORTS.SEARCH_PROMPT);
    const searchServer = new SearchServerAgent(A2A_PORTS.SEARCH_SERVER);
    const researcher = new ResearcherAgent(
      A2A_PORTS.RESEARCHER,
      A2A_PORTS.SEARCH_PROMPT,
      A2A_PORTS.SEARCH_SERVER
    );
    
    this.orchestrator = new OrchestratorAgent(A2A_PORTS.ORCHESTRATOR, [A2A_PORTS.RESEARCHER]);
    const royalsArbiter = new RoyalsArbiterAgent(A2A_PORTS.ROYALS_ARBITER);
    const wikiKeeper = new WikiKeeperAgent(A2A_PORTS.WIKI_KEEPER);
    
    // ── DIFFUSION LATTICE AGENT ──────────────────────────────────────────────
    const diffusionLatticeAgent = new A2AServer({
      name: 'DiffusionLattice_Agent',
      description: 'Unified multimodal synthesis via Sovereign Diffusion Lattice (Image, Video, 3D)',
      port: 3020,
      handlers: {
        send_message: async (msg) => {
          const text = msg.text.toLowerCase();
          const modality = text.includes('video') ? 'temporal' :
                           text.includes('3d') || text.includes('spatial') ? 'spatial' :
                           text.includes('unified') || text.includes('animated') ? 'unified' :
                           'aesthetic';

          const result = await sovereignDiffusion.synthesize({
            prompt: msg.text,
            modality,
            complexity: 'extreme'
          });

          return {
            text: result.description,
            agent: 'DiffusionLattice_Agent',
            metadata: {
              modality,
              latencyMs: result.telemetry.latencyMs,
              synapticLoad: result.telemetry.synapticLoad,
              files: result.files.map(f => f.name)
            }
          };
        }
      }
    });

    this.registry.registerAgent(diffusionLatticeAgent);
    this.registry.registerClient('DiffusionLattice_Agent', { baseUrl: 'http://localhost:3020' });

    // ── NATIVE BUILDER AGENT ────────────────────────────────────────────────
    const nativeBuilderAgent = new A2AServer({
      name: 'NativeBuilder_Agent',
      description: 'Quantum logic compiler and TSX-to-DNA transformer',
      port: A2A_PORTS.NATIVE_BUILDER,
      handlers: {
        send_message: async (msg) => {
          const { quantumBuilder } = await import('@/engine/QuantumBuilder');
          const result = await quantumBuilder.compileStream(
            msg.metadata?.moduleId || `DNA_${Date.now()}.tsx`,
            msg.text
          );
          return {
            text: `[BUILD_COMPLETE] Module cached in Photonic RAM: ${result.executableUri}`,
            agent: 'NativeBuilder_Agent',
            metadata: { ...result }
          };
        }
      }
    });

    this.registry.registerAgent(nativeBuilderAgent);
    this.registry.registerClient('NativeBuilder_Agent', { baseUrl: `http://localhost:${A2A_PORTS.NATIVE_BUILDER}` });

    this.registry.registerAgent(this.orchestrator);
    this.registry.registerAgent(royalsArbiter);
    this.registry.registerAgent(wikiKeeper);
    
    const swarmMonitor = new SwarmMonitorAgent(A2A_PORTS.SWARM_MONITOR);
    this.registry.registerAgent(swarmMonitor);
    this.registry.registerClient('Swarm_Monitor_Agent', { baseUrl: `http://localhost:${A2A_PORTS.SWARM_MONITOR}` });
    this.registry.registerAgent(searchPrompt);
    this.registry.registerAgent(searchServer);
    this.registry.registerAgent(researcher);
    
    // DYNAMIC UNIT DISCOVERY
    try {
      const { nativeNeuralCore } = await import('@/engine/NativeNeuralCore');
      const health = nativeNeuralCore.getHealth();
      if (health.available && health.available.length > 0) {
        health.available.forEach((model: string, index: number) => {
          const ollamaAgent = new Royals_Ollama_Agent(3100 + index, model);
          this.registry.registerAgent(ollamaAgent);
        });
      }
    } catch (e: any) {
      neuralTelemetry.recordFault('A2A_SYSTEM', `Dynamic discovery failed: ${e.message || e}`, 'warn');
      console.warn('[A2A] Dynamic discovery failed.', e);
    }

    // Register primary clients
    this.registry.registerClient('Search_Prompt_Agent', { baseUrl: `http://localhost:${A2A_PORTS.SEARCH_PROMPT}` });
    this.registry.registerClient('Search_Server_Agent', { baseUrl: `http://localhost:${A2A_PORTS.SEARCH_SERVER}` });
    this.registry.registerClient('Researcher_Agent', { baseUrl: `http://localhost:${A2A_PORTS.RESEARCHER}` });
    this.registry.registerClient('WikiKeeper_Agent', { baseUrl: `http://localhost:${A2A_PORTS.WIKI_KEEPER}` });

    console.log('[A2A] System initialized with', this.registry.listAgents().length, 'agents');
  }

  async research(query: string, isDeep: boolean = false): Promise<string> {
    if (this.orchestrator) {
      const result = await this.orchestrator.process({ text: query, metadata: { isDeep } });
      return result.text;
    }
    return `Research fallback for: ${query}`;
  }

  async search(query: string): Promise<any[]> {
    const searchServer = this.registry.getAgent('Search_Server_Agent') as SearchServerAgent;
    if (searchServer) {
      const result = await searchServer.process({ text: query });
      return JSON.parse(result.text || '[]');
    }
    return [];
  }

  getRegistry(): A2ARegistry { return this.registry; }
  getOrchestrator(): OrchestratorAgent | null { return this.orchestrator; }
}

const a2aSystem = new A2ASystem();

// Export all A2A components for backward compatibility
export { 
  A2AClient, 
  A2AServer, 
  A2ARegistry,
  SearchPromptAgent,
  SearchServerAgent,
  ResearcherAgent,
  OrchestratorAgent,
  a2aSystem
};

export type { 
  A2AMessage, 
  A2AResponse, 
  A2AAgentCard
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
