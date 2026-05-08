import { NeuralPulseTrigger } from '../types/sovereign-types';

export type MessagePriority = 'low' | 'normal' | 'high' | 'critical';
export type ChannelType = 'broadcast' | 'direct' | 'group' | 'neural';

export interface Agent {
  id: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'busy';
  metadata?: Record<string, any>;
}

export interface CrossStudioMessage {
  id: string;
  source: string;
  sourceStudio: string;
  target?: string;
  targetStudio?: string;
  channel: ChannelType;
  channelName?: string;
  type: string;
  payload: Record<string, any>;
  priority: MessagePriority;
  timestamp: number;
  expiresAt?: number;
  correlationId?: string;
}

export interface ChannelSubscription {
  agentId: string;
  studio: string;
  channelName: string;
  filter?: (message: CrossStudioMessage) => boolean;
}

export interface MessageDelivery {
  messageId: string;
  agentId: string;
  status: 'pending' | 'delivered' | 'failed' | 'acknowledged';
  attempts: number;
  lastAttempt: number;
  error?: string;
}

class A2ACommunicationHubImpl {
  private agents: Map<string, Agent> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private subscriptions: Map<string, ChannelSubscription[]> = new Map();
  private messageHistory: CrossStudioMessage[] = [];
  private messageHandlers: Map<string, Array<(message: CrossStudioMessage) => Promise<void>>> = new Map();
  private messageQueue: CrossStudioMessage[] = [];
  private processing = false;
  private maxHistorySize = 10000;

  private static instance: A2ACommunicationHubImpl;

  static getInstance(): A2ACommunicationHubImpl {
    if (!A2ACommunicationHubImpl.instance) {
      A2ACommunicationHubImpl.instance = new A2ACommunicationHubImpl();
    }
    return A2ACommunicationHubImpl.instance;
  }

  constructor() {
    this.initializeDefaultChannels();
    this.initializeSystemAgents();
  }

  private initializeDefaultChannels(): void {
    const studios = [
      'automation', 'code', 'threed', 'audio', 'image', 'video', 'book', 'text',
      'bio', 'network', 'simulation', 'game', 'security', 'database', 'cloud',
      'iot', 'browser', 'os', 'intelligence'
    ];

    for (const studio of studios) {
      this.channels.set(`studio:${studio}`, new Set());
      this.channels.set(`triggers:${studio}`, new Set());
      this.channels.set(`events:${studio}`, new Set());
    }

    this.channels.set('broadcast', new Set());
    this.channels.set('neural-pulse', new Set());
    this.channels.set('emergency', new Set());
  }

  private initializeSystemAgents(): void {
    this.registerAgent({
      id: 'automation-agent',
      type: 'automation',
      capabilities: ['workflow-execution', 'orchestration', 'monitoring'],
      status: 'active'
    });

    this.registerAgent({
      id: 'sovereign-core',
      type: 'sovereign',
      capabilities: ['logic-processing', 'synthesis', 'healing'],
      status: 'active'
    });
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    console.log(`[A2AHub] Agent registered: ${agent.id} (${agent.type})`);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    for (const [channel, subscribers] of this.channels.entries()) {
      subscribers.delete(agentId);
    }
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAgentsByType(type: string): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.type === type);
  }

  subscribeToChannel(agentId: string, studio: string, channelName: string, filter?: (message: CrossStudioMessage) => boolean): void {
    const key = `${studio}:${channelName}`;
    
    if (!this.channels.has(key)) {
      this.channels.set(key, new Set());
    }
    
    this.channels.get(key)!.add(agentId);

    const subKey = `${agentId}:${studio}`;
    if (!this.subscriptions.has(subKey)) {
      this.subscriptions.set(subKey, []);
    }
    
    this.subscriptions.get(subKey)!.push({ agentId, studio, channelName, filter });
    console.log(`[A2AHub] ${agentId} subscribed to ${key}`);
  }

  unsubscribeFromChannel(agentId: string, studio: string, channelName: string): void {
    const key = `${studio}:${channelName}`;
    this.channels.get(key)?.delete(agentId);

    const subKey = `${agentId}:${studio}`;
    const subs = this.subscriptions.get(subKey) || [];
    this.subscriptions.set(subKey, subs.filter(s => !(s.channelName === channelName)));
  }

  async sendMessage(message: Omit<CrossStudioMessage, 'id' | 'timestamp'>): Promise<string> {
    const fullMessage: CrossStudioMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    this.messageHistory.push(fullMessage);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }

    if (message.priority === 'critical' || message.priority === 'high') {
      await this.deliverMessage(fullMessage);
    } else {
      this.messageQueue.push(fullMessage);
      this.processQueue();
    }

    return fullMessage.id;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.deliverMessage(message);
      }
    }

    this.processing = false;
  }

  private async deliverMessage(message: CrossStudioMessage): Promise<void> {
    const targetChannels = this.getTargetChannels(message);

    for (const channelKey of targetChannels) {
      const subscribers = this.channels.get(channelKey);
      if (!subscribers) continue;

      for (const agentId of subscribers) {
        const agent = this.agents.get(agentId);
        if (!agent || agent.status === 'inactive') continue;

        const subKey = `${agentId}:${message.sourceStudio}`;
        const subscriptions = this.subscriptions.get(subKey) || [];
        const subscription = subscriptions.find(s => s.channelName === channelKey.split(':')[1]);

        if (subscription?.filter && !subscription.filter(message)) {
          continue;
        }

        await this.deliverToAgent(agentId, message);
      }
    }

    const handlers = this.messageHandlers.get(`${message.sourceStudio}:${message.type}`) || [];
    for (const handler of handlers) {
      try {
        await handler(message);
      } catch (error) {
        console.error(`[A2AHub] Handler error:`, error);
      }
    }
  }

  private getTargetChannels(message: CrossStudioMessage): string[] {
    const channels: string[] = [];

    if (message.channel === 'broadcast') {
      channels.push('broadcast');
    } else if (message.channel === 'neural') {
      channels.push('neural-pulse');
    } else if (message.targetStudio) {
      channels.push(`studio:${message.targetStudio}`);
      channels.push(`events:${message.targetStudio}`);
    } else if (message.channelName) {
      channels.push(`${message.sourceStudio}:${message.channelName}`);
      channels.push(`triggers:${message.sourceStudio}`);
    }

    return channels;
  }

  private async deliverToAgent(agentId: string, message: CrossStudioMessage): Promise<void> {
    console.log(`[A2AHub] Delivering message ${message.id} to ${agentId}`);
  }

  async broadcastToChannel(studio: string, channelName: string, payload: Record<string, any>): Promise<string> {
    return this.sendMessage({
      source: 'system',
      sourceStudio: studio,
      channel: 'broadcast',
      channelName,
      type: 'broadcast',
      payload,
      priority: 'normal'
    });
  }

  async broadcast(channelName: string, payload: Record<string, any>): Promise<string> {
    return this.broadcastToChannel('system', channelName, payload);
  }

  async sendToAgent(sourceStudio: string, targetAgent: string, type: string, payload: Record<string, any>): Promise<string> {
    return this.sendMessage({
      source: sourceStudio,
      sourceStudio,
      target: targetAgent,
      channel: 'direct',
      type,
      payload,
      priority: 'normal'
    });
  }

  async triggerNeuralPulse(trigger: NeuralPulseTrigger): Promise<void> {
    const message: CrossStudioMessage = {
      id: `pulse-${Date.now()}`,
      source: trigger.id,
      sourceStudio: trigger.sourceStudio,
      channel: 'neural',
      channelName: 'neural-pulse',
      type: 'neural-trigger',
      payload: {
        triggerId: trigger.id,
        eventType: trigger.eventType,
        data: trigger.data
      },
      priority: 'high',
      timestamp: Date.now(),
      expiresAt: Date.now() + 60000
    };

    await this.sendMessage(message);
  }

  onMessage(studio: string, type: string, handler: (message: CrossStudioMessage) => Promise<void>): void {
    const key = `${studio}:${type}`;
    if (!this.messageHandlers.has(key)) {
      this.messageHandlers.set(key, []);
    }
    this.messageHandlers.get(key)!.push(handler);
  }

  getMessageHistory(filter?: { sourceStudio?: string; targetStudio?: string; type?: string; since?: number }): CrossStudioMessage[] {
    let messages = this.messageHistory;

    if (filter?.sourceStudio) {
      messages = messages.filter(m => m.sourceStudio === filter.sourceStudio);
    }
    if (filter?.targetStudio) {
      messages = messages.filter(m => m.targetStudio === filter.targetStudio);
    }
    if (filter?.type) {
      messages = messages.filter(m => m.type === filter.type);
    }
    if (filter?.since) {
      messages = messages.filter(m => m.timestamp >= filter.since);
    }

    return messages;
  }

  getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  getChannelSubscribers(channelKey: string): string[] {
    return Array.from(this.channels.get(channelKey) || []);
  }

  getStats(): {
    totalAgents: number;
    activeAgents: number;
    totalChannels: number;
    totalMessages: number;
    queueSize: number;
  } {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
      totalChannels: this.channels.size,
      totalMessages: this.messageHistory.length,
      queueSize: this.messageQueue.length
    };
  }
}

export const A2ACommunicationHub = A2ACommunicationHubImpl;