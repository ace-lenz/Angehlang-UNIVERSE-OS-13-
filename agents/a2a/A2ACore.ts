// Plan Item ID: TI-1
/**
 * A2ACore.ts — Foundation of the Agent-to-Agent Communication System
 */

import { a2aHub, WDMChannel, WDM_CHANNELS, wdmManager } from '../A2ACommunicationHub';
import { evolutionCore } from '@/memory/EvolutionEngine';
import { a2aSecurity, SovereignHandshake } from './A2ASecurity';

export const ANGEH_QUANTUM_PATH = 'Angehlang_Universe_OS_v6.0 :: Sovereign-Omni-Prime';

export function assignWavelength(channel: WDMChannel): number {
  const base = WDM_CHANNELS[channel];
  const jitter = Math.random() * 0.5 - 0.25;
  return base + jitter;
}

export function calculateWDMDelay(sourceChannel: WDMChannel, targetChannel: WDMChannel): number {
  const lambda1 = WDM_CHANNELS[sourceChannel];
  const lambda2 = WDM_CHANNELS[targetChannel];
  const diff = Math.abs(lambda1 - lambda2);
  return Math.floor(diff * 0.1);
}

// ============ System Security & A2A Config ============
export interface A2ASecurityConfig {
  allowExternalNetwork: boolean;
}

export const a2aSecurityConfig: A2ASecurityConfig = {
  allowExternalNetwork: false // HARDENED: Sovereign local-only by default
};

/**
 * LATTICE RESONANCE ROUTING: Assigns wavelengths based on Cognitive Lattice specialization.
 */
export function assignLatticeWavelength(role: string): number {
  const roleMap: Record<string, number> = {
    'logic': 1550,
    'tech': 1530,
    'creative': 1510,
    'security': 1490
  };
  const base = roleMap[role.toLowerCase()] || 1550;
  return base + (Math.random() * 2 - 1);
}

// ============ A2A Protocol Types ============
export interface A2AMessage {
  text: string;
  sender?: string;
  agent?: string;
  timestamp?: number;
  subject?: string;
  metadata?: Record<string, any>;
  wdm?: {
    channel: WDMChannel;
    wavelength: number;
    delay: number;
    collisionId?: string;
    coherence: number;
  };
  handshake?: SovereignHandshake;
}

export interface A2AResponse {
  text: string;
  agent?: string;
  metadata?: Record<string, any>;
}

export interface A2AAgentCard {
  name: string;
  description: string;
  url: string;
  port: number;
  capabilities: string[];
  intelligenceLevel?: number;
  epochs?: number;
}

export interface A2AClientConfig {
  baseUrl: string;
  timeout?: number;
}

export type A2AHandler = (message: A2AMessage, metadata?: any) => Promise<A2AResponse>;

export interface A2AHandlerMap {
  send_message?: A2AHandler;
  tasks_get?: (params: any) => Promise<any>;
  tasks_cancel?: (params: any) => Promise<any>;
  royal_sync?: (params: any) => Promise<A2AResponse>;
  royal_handshake?: (params: any) => Promise<A2AResponse>;
  tools_list?: (params: any) => Promise<any>;
  tools_call?: (params: any) => Promise<any>;
}

// ============ A2A Client ============
export class A2AClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: A2AClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 3000;
  }

  async sendMessage(message: any, options?: { isDeep?: boolean }): Promise<A2AResponse> {
    const isDeep = options?.isDeep || false;
    const currentTimeout = isDeep ? 60000 : this.timeout;
    const channel: WDMChannel = isDeep ? 'CRITICAL' : 'STANDARD';
    const wavelength = assignWavelength(channel);
    const sender = message.sender || 'unknown';
    const collisionResult = wdmManager.checkCollision(wavelength, channel, sender);
    const coherence = message.metadata?.coherence || 0.9;
    
    const wdm = { channel, wavelength, delay: collisionResult.delay, collisionId: collisionResult.collisionId, coherence };
    message.wdm = wdm;
    message.handshake = a2aSecurity.generateHandshake(sender);
    
    a2aHub.sendMessage({
      type: isDeep ? 'request' : 'broadcast',
      priority: isDeep ? 'high' : 'normal',
      senderId: sender,
      senderName: sender,
      senderStudio: 'A2ASystem',
      subject: message.subject || 'A2A System Transmission',
      content: message.text,
    });

    const registry = (window as any).a2aRegistry;
    if (registry && registry.getAllAgentCards) {
      const cards = registry.getAllAgentCards();
      const targetCard = cards.find((c: any) => c.url === this.baseUrl);
      if (targetCard) {
        const localAgent = registry.getAgent(targetCard.name);
        if (localAgent && localAgent.process) {
          return await localAgent.process(message);
        }
      }
    }

    if (!a2aSecurityConfig.allowExternalNetwork) return { text: isDeep ? '' : 'A2A_OFFLINE_FALLBACK' };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), currentTimeout);
      const response = await fetch(`${this.baseUrl}/a2a`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'send_message', params: message, id: Date.now() }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        return data.result || { text: 'No response from agent' };
      }
    } catch (e) {
      console.warn(`[A2A Client] Failed to connect to ${this.baseUrl}:`, e);
    }
    return { text: isDeep ? '' : 'A2A_OFFLINE_FALLBACK' };
  }

  async getTask(taskId: string): Promise<any> {
    if (!a2aSecurityConfig.allowExternalNetwork) {
        const { angvStorage } = await import('@/storage/AngvStorageEngine');
        return angvStorage.loadArtifact(taskId);
    }
    try {
      const response = await fetch(`${this.baseUrl}/a2a`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'tasks_get', params: { id: taskId }, id: Date.now() })
      });
      if (response.ok) return await response.json();
    } catch (e) { console.warn(`[A2A Client] Task get failed:`, e); }
    return null;
  }
}

// ============ A2A Server ============
export class A2AServer {
  protected name: string;
  protected description: string;
  protected port: number;
  protected handlers: A2AHandlerMap;
  protected serverUrl: string;
  protected agentCard: A2AAgentCard;
  protected config: { name: string; description: string; port: number; handlers: A2AHandlerMap; };

  constructor(config: { name: string; description: string; port: number; handlers: A2AHandlerMap; }) {
    this.config = config;
    this.name = config.name;
    this.description = config.description;
    this.port = config.port;
    this.handlers = config.handlers;
    this.serverUrl = `http://localhost:${this.port}`;
    this.agentCard = { name: this.name, description: this.description, url: this.serverUrl, port: this.port, capabilities: Object.keys(this.handlers) };
  }

  getAgentCard(): A2AAgentCard {
    const evoState = evolutionCore.getOrCreateAgentState(this.name, Object.keys(this.handlers));
    return { ...this.agentCard, capabilities: Array.from(new Set([...this.agentCard.capabilities, ...evoState.capabilities])), intelligenceLevel: evoState.intelligenceLevel, epochs: evoState.totalEpochs };
  }

  getPort(): number { return this.port; }
  getName(): string { return this.name; }

  async handleRequest(method: string, params: any): Promise<any> {
    const handler = this.handlers[method as keyof A2AHandlerMap];
    
    // Security Verification
    if (params && params.handshake) {
      const isValid = a2aSecurity.verifyHandshake(params.handshake);
      if (!isValid) return { error: { code: -32000, message: 'Invalid Sovereign Handshake' } };
    }

    if (handler && method === 'send_message') {
      const result = await (handler as any)(params, params.metadata);
      const inputText = typeof params === 'object' && params.text ? params.text : JSON.stringify(params);
      evolutionCore.learn(this.name, inputText, result?.text ? result.text.length : 10, true);
      if (result && typeof result === 'object' && !result.metadata) result.metadata = {};
      if (result?.metadata) {
        const state = evolutionCore.getOrCreateAgentState(this.name);
        result.metadata.synapticState = `Lvl ${state.intelligenceLevel} | Epoch ${state.totalEpochs}`;
      }
      return result;
    }
    return { error: { code: -32601, message: 'Method not found' } };
  }

  async process(message: A2AMessage): Promise<A2AResponse> {
    if (this.handlers.send_message) {
      const result = await this.handlers.send_message(message);
      evolutionCore.learn(this.name, message.text, result.text ? result.text.length : 10, true);
      return result;
    }
    return { text: 'No handler configured' };
  }

  /**
   * THINK: Full SwarmV2-powered reasoning (Brought to A2AServer for photonic agents).
   */
  protected async think(prompt: string, context: string = ''): Promise<string> {
    try {
      const { sovereignSwarmV2 } = await import('@/engine/SovereignSwarmConsensusV2');
      const result = await sovereignSwarmV2.solve(
        `[A2A_AGENT: ${this.name}]\n${context ? `[CONTEXT]: ${context}\n` : ''}${prompt}`,
        { cluster: 'LOGIC', maxRounds: 1 }
      );
      return result.answer;
    } catch (e) {
      const { nativeNeuralCore } = await import('@/engine/NativeNeuralCore');
      return await nativeNeuralCore.generate(`[A2A_AGENT] ${prompt}`, context);
    }
  }
}

// ============ A2A Registry (Agent Discovery) ============
export class A2ARegistry {
  private agents: Map<string, A2AServer> = new Map();
  private clientConfigs: Map<string, A2AClientConfig> = new Map();

  registerAgent(agent: A2AServer) {
    this.agents.set(agent.getAgentCard().name, agent);
    const card = agent.getAgentCard();
    a2aHub.registerAgent({
      id: card.name, name: card.name, role: 'Sovereign Agent', studio: 'A2ASystem',
      expertise: card.capabilities, capabilities: card.capabilities, status: 'online',
      version: '1.0.0', performance: 90 + Math.random() * 10, contribution: 80 + Math.random() * 20,
      lastActive: new Date().toISOString(), createdAt: new Date().toISOString(), wavelength: assignWavelength('STANDARD')
    });
  }

  registerClient(name: string, config: A2AClientConfig) {
    this.clientConfigs.set(name, config);
    if (typeof window !== 'undefined') (window as any).a2aRegistry = this;
  }

  getAgent(name: string): A2AServer | undefined { return this.agents.get(name); }

  createClient(name: string): A2AClient | null {
    const config = this.clientConfigs.get(name);
    return config ? new A2AClient(config) : null;
  }

  getAllAgentCards(): A2AAgentCard[] { return Array.from(this.agents.values()).map(a => a.getAgentCard()); }
  listAgents(): string[] { return Array.from(this.agents.keys()); }
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
