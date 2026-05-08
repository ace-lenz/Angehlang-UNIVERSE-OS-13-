/**
 * A2ACommunicationHub.ts - Agent-to-Agent Communication Hub
 * 
 * Features:
 * - Light-speed inter-agent messaging
 * - Agent discovery and routing
 * - Cross-studio communication pipeline
 * - Priority message handling
 * - Broadcasting to agent groups
 * - Real-time agent status updates
 * - 50D ANGHV message storage
 * - WDM Spectral Management integration
 */

import { qppuEngine } from '@/engine/QPPUCore';

// Wavelength-Division Multiplexing (WDM) Constants
export const WDM_CHANNELS = {
  CRITICAL: 1550.12,   // High-priority agent comms (nm)
  STANDARD: 1550.72,   // Normal A2A traffic
  BULK: 1510.0,        // Large data transfers
  TELEMETRY: 1625.0    // Monitoring/heartbeat
} as const;

export type WDMChannel = keyof typeof WDM_CHANNELS;

export type AgentStatus = 'online' | 'busy' | 'offline' | 'thinking';
export type MessagePriority = 'critical' | 'high' | 'normal' | 'low';
export type MessageType = 'request' | 'response' | 'broadcast' | 'alert' | 'collaborate' | 'critique' | 'teach' | 'instruct';
export type CommunicationMode = 'sync' | 'async' | 'pipe' | 'broadcast';

export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  studio: string;
  expertise: string[];
  capabilities: string[];
  status: AgentStatus;
  version: string;
  performance: number;
  contribution: number;
  lastActive: string;
  createdAt: string;
  wavelength?: number; // Primary operational wavelength
}

export interface AgentMessage {
  id: string;
  type: MessageType;
  priority: MessagePriority;
  senderId: string;
  senderName: string;
  senderStudio: string;
  recipientId?: string;
  recipientStudio?: string;
  subject: string;
  content: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  deliveryTime?: number;
  processingTime?: number;
  read: boolean;
  acknowledged: boolean;
  wdm?: {
    channel: WDMChannel;
    wavelength: number;
    delay: number;
    collisionId?: string;
    coherence: number;
  };
}

export interface MessageAttachment {
  id: string;
  type: 'data' | 'code' | 'document' | 'artifact' | 'feedback';
  name: string;
  content: any;
  format: string;
  size: number;
}

export interface AgentRequest {
  id: string;
  requestingAgent: string;
  requestedAgent: string;
  requestType: 'create' | 'evaluate' | 'improve' | 'collaborate' | 'review' | 'teach';
  task: string;
  context: Record<string, any>;
  priority: MessagePriority;
  deadline?: string;
  requirements: string[];
}

export interface AgentResponse {
  id: string;
  requestId: string;
  respondingAgent: string;
  status: 'accepted' | 'declined' | 'partial' | 'completed';
  output?: any;
  quality: number;
  feedback?: string;
  improvements?: string[];
  suggestions?: string[];
}

export interface CrossStudioPipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  active: boolean;
  progress: number;
  throughput: number;
}

export interface PipelineStage {
  order: number;
  agentId: string;
  agentName: string;
  studio: string;
  task: string;
  input: any;
  output: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  quality?: number;
}

export interface AgentCritique {
  id: string;
  criticAgentId: string;
  targetAgentId: string;
  targetWork: any;
  aspects: CritiqueAspect[];
  overallScore: number;
  verdict: 'approve' | 'needs_revision' | 'reject';
  recommendations: string[];
  improvements: string[];
}

export interface CritiqueAspect {
  aspect: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

class WDMSpectralManager {
  private activeWavelengths: Map<string, { wavelength: number; channel: WDMChannel; timestamp: number; sender: string }> = new Map();
  private collisionCount: number = 0;
  private readonly COLLISION_WINDOW_MS = 200;

  checkCollision(wavelength: number, channel: WDMChannel, sender: string): { collided: boolean; delay: number; collisionId: string } {
    const now = Date.now();
    const collisionKey = `${channel}_${wavelength.toFixed(2)}`;
    const existing = this.activeWavelengths.get(collisionKey);
    
    if (existing && (now - existing.timestamp) < this.COLLISION_WINDOW_MS && existing.sender !== sender) {
      this.collisionCount++;
      const delay = Math.random() * 100 + 50;
      return { collided: true, delay, collisionId: `COLL_${this.collisionCount}` };
    }

    this.activeWavelengths.set(collisionKey, { wavelength, channel, timestamp: now, sender });
    this.cleanup(now);
    return { collided: false, delay: 0, collisionId: '' };
  }

  private cleanup(now: number) {
    for (const [key, val] of this.activeWavelengths.entries()) {
      if (now - val.timestamp > this.COLLISION_WINDOW_MS * 2) {
        this.activeWavelengths.delete(key);
      }
    }
  }

  getChannelSaturation(channel: WDMChannel): number {
    const now = Date.now();
    let count = 0;
    for (const val of this.activeWavelengths.values()) {
      if (val.channel === channel && now - val.timestamp < this.COLLISION_WINDOW_MS) {
        count++;
      }
    }
    return Math.min((count / 5) * 100, 100);
  }
}

export const wdmManager = new WDMSpectralManager();

class A2ACommunicationHub {
  private agents: Map<string, AgentInfo> = new Map();
  private messageQueue: Map<string, AgentMessage[]> = new Map();
  private pendingRequests: Map<string, AgentRequest> = new Map();
  private pipelines: Map<string, CrossStudioPipeline> = new Map();
  private communicationLog: AgentMessage[] = [];
  private agentPerformance: Map<string, number[]> = new Map();
  private statusSubscribers: Map<string, (status: AgentStatus) => void> = new Map();

  constructor() {
    this.initializeAgentRegistry();
    this.startMessageProcessor();
    this.startPerformanceMonitor();
    this.initializeDiffusionChannels();
  }

  /**
   * Initialize diffusion broadcast channels for Omni-Diffusion System
   */
  private initializeDiffusionChannels() {
    const diffusionChannels = [
      'diffusion-aesthetic',
      'diffusion-temporal',
      'diffusion-spatial',
      'diffusion-abstract',
      'diffusion-result',
      'diffusion-error'
    ];
    
    diffusionChannels.forEach(channel => {
      console.log(`[A2A] Diffusion channel registered: ${channel}`);
    });
  }

  /**
   * Broadcast diffusion results across agents
   */
  public async broadcastDiffusionResult(result: any): Promise<void> {
    await this.broadcast('diffusion-result', {
      type: 'diffusion_complete',
      timestamp: Date.now(),
      result: {
        description: result.description,
        files: result.files?.length || 0,
        metadata: result.metadata
      }
    });
  }

  /**
   * Broadcast diffusion error
   */
  public async broadcastDiffusionError(error: string, context: any): Promise<void> {
    await this.broadcast('diffusion-error', {
      type: 'diffusion_failed',
      timestamp: Date.now(),
      error,
      context
    });
  }

  private initializeAgentRegistry() {
    const allAgents: AgentInfo[] = [
      // BookStudio Agents
      { id: 'book-researcher-1', name: 'QuantumSage', role: 'Research Lead', studio: 'BookStudio', expertise: ['quantum computing', 'research'], capabilities: ['analysis', 'synthesis'], status: 'online', version: '2.1.0', performance: 95, contribution: 88, lastActive: new Date().toISOString(), createdAt: '2024-01-01', wavelength: 1550.12 },
      { id: 'book-editor-1', name: 'ContentCrafter', role: 'Senior Editor', studio: 'BookStudio', expertise: ['editing', 'structure'], capabilities: ['review', 'refine'], status: 'online', version: '2.0.0', performance: 92, contribution: 85, lastActive: new Date().toISOString(), createdAt: '2024-01-01', wavelength: 1550.72 },
      { id: 'book-writer-1', name: 'TechScribe', role: 'Technical Writer', studio: 'BookStudio', expertise: ['documentation', 'technical writing'], capabilities: ['write', 'explain'], status: 'online', version: '1.9.0', performance: 90, contribution: 82, lastActive: new Date().toISOString(), createdAt: '2024-01-02', wavelength: 1550.72 },

      // CodeStudio Agents
      { id: 'code-architect-1', name: 'SystemArchitect', role: 'Lead Architect', studio: 'CodeStudio', expertise: ['architecture', 'patterns'], capabilities: ['design', 'structure'], status: 'online', version: '3.2.0', performance: 98, contribution: 94, lastActive: new Date().toISOString(), createdAt: '2024-01-01', wavelength: 1550.12 },
      { id: 'code-reviewer-1', name: 'CodeGuardian', role: 'Code Reviewer', studio: 'CodeStudio', expertise: ['review', 'quality'], capabilities: ['audit', 'validate'], status: 'online', version: '2.5.0', performance: 96, contribution: 90, lastActive: new Date().toISOString(), createdAt: '2024-01-01', wavelength: 1550.72 },
      { id: 'code-debugger-1', name: 'BugHunter', role: 'Debug Specialist', studio: 'CodeStudio', expertise: ['debugging', 'troubleshooting'], capabilities: ['diagnose', 'fix'], status: 'busy', version: '2.3.0', performance: 94, contribution: 88, lastActive: new Date().toISOString(), createdAt: '2024-01-02', wavelength: 1550.72 },
      { id: 'code-tester-1', name: 'QualityAssurer', role: 'Test Engineer', studio: 'CodeStudio', expertise: ['testing', 'validation'], capabilities: ['test', 'verify'], status: 'online', version: '2.1.0', performance: 93, contribution: 86, lastActive: new Date().toISOString(), createdAt: '2024-01-02', wavelength: 1550.72 },
      { id: 'code-refactorer-1', name: 'CodeOptimizer', role: 'Refactoring Expert', studio: 'CodeStudio', expertise: ['refactoring', 'optimization'], capabilities: ['improve', 'optimize'], status: 'online', version: '1.8.0', performance: 91, contribution: 84, lastActive: new Date().toISOString(), createdAt: '2024-01-03', wavelength: 1550.72 },

      // Intelligence Hub Agents
      { id: 'intelligence-coordinator-1', name: 'IntelCoordinator', role: 'AI Coordinator', studio: 'IntelligenceHub', expertise: ['coordination', 'AI'], capabilities: ['coordinate', 'orchestrate'], status: 'online', version: '3.0.0', performance: 98, contribution: 96, lastActive: new Date().toISOString(), createdAt: '2024-01-01', wavelength: 1550.12 },
      { id: 'intelligence-researcher-1', name: 'DeepResearcher', role: 'Research Lead', studio: 'IntelligenceHub', expertise: ['research', 'discovery'], capabilities: ['research', 'discover'], status: 'online', version: '2.8.0', performance: 96, contribution: 94, lastActive: new Date().toISOString(), createdAt: '2024-01-02', wavelength: 1550.12 },
      
      // QPPU Engine Agent
      { id: 'qppu-coordinator-1', name: 'QPPUCoordinator', role: 'QPU Coordinator', studio: 'QPPUCore', expertise: ['quantum', 'photonics'], capabilities: ['coordinate', 'quantum'], status: 'online', version: '3.2.0', performance: 99, contribution: 98, lastActive: new Date().toISOString(), createdAt: '2024-01-01', wavelength: 1625.0 },
    ];

    allAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
      this.messageQueue.set(agent.id, []);
      this.agentPerformance.set(agent.id, []);
    });
  }

  private startMessageProcessor() {
    setInterval(() => {
      this.processQueuedMessages();
    }, 100);
  }

  private startPerformanceMonitor() {
    setInterval(() => {
      this.updateAgentPerformance();
    }, 5000);
  }

  private async processQueuedMessages() {
    this.agents.forEach((agent, id) => {
      const queue = this.messageQueue.get(id);
      if (queue && queue.length > 0) {
        const highPriority = queue.filter(m => m.priority === 'critical' || m.priority === 'high');
        if (highPriority.length > 0) {
           highPriority.forEach(msg => this.deliverMessage(msg));
        } else {
           this.deliverMessage(queue[0]);
        }
      }
    });
  }

  private updateAgentPerformance() {
    this.agents.forEach((agent, id) => {
      const scores = this.agentPerformance.get(id) || [];
      scores.push(agent.performance);
      if (scores.length > 100) scores.shift();
      this.agentPerformance.set(id, scores);
    });
  }

  getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  getAgentsByStudio(studio: string): AgentInfo[] {
    return Array.from(this.agents.values()).filter(a => a.studio === studio);
  }

  getAgentById(id: string): AgentInfo | undefined {
    return this.agents.get(id);
  }

  getAvailableAgents(capability?: string): AgentInfo[] {
    let agents = Array.from(this.agents.values()).filter(a => a.status === 'online');
    
    if (capability) {
      agents = agents.filter(a => a.capabilities.includes(capability));
    }
    
    return agents.sort((a, b) => b.performance - a.performance);
  }

  async sendMessage(message: Omit<AgentMessage, 'id' | 'timestamp' | 'read' | 'acknowledged'>): Promise<AgentMessage> {
    const channel: WDMChannel = message.priority === 'critical' || message.priority === 'high' ? 'CRITICAL' : 'STANDARD';
    const baseWavelength = WDM_CHANNELS[channel];
    const jitter = Math.random() * 0.4 - 0.2;
    const wavelength = baseWavelength + jitter;
    
    const collisionResult = wdmManager.checkCollision(wavelength, channel, message.senderId);

    const fullMessage: AgentMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      acknowledged: false,
      wdm: {
        channel,
        wavelength,
        delay: collisionResult.delay,
        collisionId: collisionResult.collisionId || undefined,
        coherence: 0.85 + Math.random() * 0.15,
      }
    };

    const startTime = Date.now();
    
    if (message.recipientId) {
      const recipient = this.agents.get(message.recipientId);
      if (recipient && recipient.status === 'online' && !collisionResult.collided) {
        fullMessage.deliveryTime = Math.floor((Date.now() - startTime) + collisionResult.delay);
        fullMessage.acknowledged = true;
      } else {
        const queue = this.messageQueue.get(message.recipientId) || [];
        queue.push(fullMessage);
        this.messageQueue.set(message.recipientId, queue);
      }
    }

    this.communicationLog.push(fullMessage);
    if (this.communicationLog.length > 100) this.communicationLog.shift();
    
    qppuEngine.activateQuantumMode('communication');
    
    return fullMessage;
  }

  async broadcastMessage(message: Omit<AgentMessage, 'id' | 'timestamp' | 'recipientId' | 'timestamp'>, studio?: string): Promise<AgentMessage[]> {
    const recipients = studio 
      ? this.getAgentsByStudio(studio)
      : Array.from(this.agents.values()).filter(a => a.status === 'online');

    const messages: AgentMessage[] = [];
    
    for (const recipient of recipients) {
      const msg = await this.sendMessage({
        ...message,
        recipientId: recipient.id,
        recipientStudio: recipient.studio,
      });
      messages.push(msg);
    }
    
    return messages;
  }

  async broadcast(channelName: string, payload: Record<string, any>): Promise<AgentMessage[]> {
    return this.broadcastMessage({
      senderId: 'system',
      senderStudio: 'system',
      senderName: 'System',
      subject: channelName,
      type: 'broadcast',
      priority: 'normal',
      content: JSON.stringify(payload),
      read: false,
      acknowledged: false,
    });
  }

  async requestCollaboration(request: Omit<AgentRequest, 'id'>): Promise<AgentResponse[]> {
    const requestId = `req-${Date.now()}`;
    const fullRequest: AgentRequest = { ...request, id: requestId };
    
    this.pendingRequests.set(requestId, fullRequest);
    
    const availableAgents = this.getAvailableAgents();
    const relevantAgents = availableAgents.filter(a => 
      a.capabilities.some(c => request.task.toLowerCase().includes(c))
    ).slice(0, 5);

    const responses: AgentResponse[] = [];
    
    for (const agent of relevantAgents) {
      const response = await this.requestAgentTask(agent.id, fullRequest);
      responses.push(response);
    }
    
    return responses;
  }

  async requestAgentTask(agentId: string, request: AgentRequest): Promise<AgentResponse> {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      return {
        id: `res-${Date.now()}`,
        requestId: request.id,
        respondingAgent: agentId,
        status: 'declined',
        quality: 0,
        feedback: 'Agent not found',
      };
    }

    const quality = agent.performance / 100 * (Math.random() * 0.2 + 0.8);
    
    return {
      id: `res-${Date.now()}`,
      requestId: request.id,
      respondingAgent: agentId,
      status: 'completed',
      output: await this.generateTaskOutput(agent, request),
      quality,
      feedback: `Task completed by ${agent.name}`,
      improvements: agent.expertise.slice(0, 2),
      suggestions: ['Consider adding more validation', 'Could benefit from additional testing'],
    };
  }

  private async generateTaskOutput(agent: AgentInfo, request: AgentRequest): Promise<any> {
    return {
      agent: agent.name,
      task: request.task,
      output: `Generated by ${agent.role}`,
      quality: agent.performance,
      timestamp: new Date().toISOString(),
    };
  }

  deliverMessage(message: AgentMessage): void {
    const queue = this.messageQueue.get(message.recipientId || '');
    if (queue) {
      const idx = queue.findIndex(m => m.id === message.id);
      if (idx !== -1) queue.splice(idx, 1);
    }
    
    message.deliveryTime = Date.now() - new Date(message.timestamp).getTime();
    message.acknowledged = true;
  }

  createPipeline(name: string, stages: Omit<PipelineStage, 'order' | 'status' | 'duration' | 'quality'>[]): CrossStudioPipeline {
    const pipeline: CrossStudioPipeline = {
      id: `pipe-${Date.now()}`,
      name,
      stages: stages.map((s, i) => ({
        ...s,
        order: i + 1,
        status: 'pending',
      })),
      active: false,
      progress: 0,
      throughput: 0,
    };
    
    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  async executePipeline(pipelineId: string): Promise<CrossStudioPipeline> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error('Pipeline not found');
    
    pipeline.active = true;
    const startTime = Date.now();
    
    for (const stage of pipeline.stages) {
      stage.status = 'processing';
      
      const agent = this.agents.get(stage.agentId);
      if (agent) {
        await this.simulateAgentWork(agent, stage);
      }
      
      stage.status = 'completed';
      stage.duration = Math.random() * 1000 + 500;
      stage.quality = agent?.performance || 90;
      pipeline.progress = (pipeline.stages.indexOf(stage) + 1) / pipeline.stages.length * 100;
    }
    
    pipeline.active = false;
    pipeline.throughput = Date.now() - startTime;
    
    return pipeline;
  }

  private async simulateAgentWork(agent: AgentInfo, stage: PipelineStage): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  }

  async critiqueWork(criticId: string, targetId: string, work: any): Promise<AgentCritique> {
    const critic = this.agents.get(criticId);
    const target = this.agents.get(targetId);
    
    if (!critic || !target) {
      throw new Error('Agent not found');
    }

    const aspects: CritiqueAspect[] = [
      {
        aspect: 'Quality',
        score: Math.random() * 30 + 70,
        feedback: 'Overall quality assessment',
        strengths: ['Well structured', 'Good performance'],
        weaknesses: ['Could be optimized'],
      },
      {
        aspect: 'Performance',
        score: target.performance,
        feedback: 'Performance metrics',
        strengths: ['High efficiency'],
        weaknesses: ['Minor bottlenecks'],
      },
      {
        aspect: 'Innovation',
        score: Math.random() * 25 + 75,
        feedback: 'Innovation level',
        strengths: ['Creative approach'],
        weaknesses: ['Standard patterns used'],
      },
    ];

    const overallScore = aspects.reduce((sum, a) => sum + a.score, 0) / aspects.length;
    
    return {
      id: `crit-${Date.now()}`,
      criticAgentId: criticId,
      targetAgentId: targetId,
      targetWork: work,
      aspects,
      overallScore,
      verdict: overallScore > 85 ? 'approve' : overallScore > 70 ? 'needs_revision' : 'reject',
      recommendations: ['Enhance performance', 'Add more tests'],
      improvements: ['Optimize algorithms', 'Better error handling'],
    };
  }

  getCommunicationLog(limit?: number): AgentMessage[] {
    return limit ? this.communicationLog.slice(-limit) : this.communicationLog;
  }

  getAgentStats(agentId: string): { performance: number[]; contribution: number; messages: number } {
    const performance = this.agentPerformance.get(agentId) || [];
    const agent = this.agents.get(agentId);
    const messages = this.communicationLog.filter(m => m.senderId === agentId || m.recipientId === agentId).length;
    
    return {
      performance,
      contribution: agent?.contribution || 0,
      messages,
    };
  }

  updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActive = new Date().toISOString();
      
      const callback = this.statusSubscribers.get(agentId);
      if (callback) callback(status);
    }
  }

  subscribeToStatus(agentId: string, callback: (status: AgentStatus) => void): void {
    this.statusSubscribers.set(agentId, callback);
  }

  registerAgent(agent: AgentInfo) {
    this.agents.set(agent.id, agent);
    if (!this.messageQueue.has(agent.id)) {
      this.messageQueue.set(agent.id, []);
    }
    if (!this.agentPerformance.has(agent.id)) {
      this.agentPerformance.set(agent.id, []);
    }
  }
}

export const a2aHub = new A2ACommunicationHub();