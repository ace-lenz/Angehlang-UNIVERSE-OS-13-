/**
 * ContextOptimizer.ts - Intelligent Context Management
 * 
 * Based on 2026 research:
 * - Dynamic Context Switching (on-demand injection)
 * - Observation Masking (trim old observations for long tasks)
 * - Context Pruning (prevent "context bloat")
 */

import { semanticEmbeddingEngine } from './SemanticEmbeddingEngine';

export interface ContextWindow {
  id: string;
  messages: ContextMessage[];
  tokens: number;
  maxTokens: number;
  createdAt: number;
  lastUpdated: number;
}

export interface ContextMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  masked?: boolean;
}

export interface ContextConfig {
  maxTokens: number;
  pruneThreshold: number;
  enableDynamicInjection: boolean;
  enableObservationMasking: boolean;
}

const DEFAULT_CONFIG: ContextConfig = {
  maxTokens: 8000,
  pruneThreshold: 0.9,
  enableDynamicInjection: true,
  enableObservationMasking: true
};

export class ContextOptimizer {
  private contexts: Map<string, ContextWindow> = new Map();
  private config: ContextConfig;
  private keywordContextMap: Map<string, string[]> = new Map();

  constructor(config: Partial<ContextConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeKeywordContexts();
  }

  private initializeKeywordContexts() {
    this.keywordContextMap = new Map([
      ['quantum', ['quantum computing', 'photonics', 'qpu', 'lpu', 'gpu']],
      ['code', ['code', 'programming', 'function', 'class', 'algorithm']],
      ['image', ['image', 'photo', 'visual', 'art', 'design']],
      ['video', ['video', 'animation', 'clip', 'movie', 'frame']],
      ['3d', ['3d', 'mesh', 'scene', 'render', 'geometry']],
      ['audio', ['audio', 'sound', 'music', 'wave', 'frequency']],
      ['security', ['security', 'encrypt', 'protect', 'secure', 'auth']],
      ['network', ['network', 'server', 'api', 'connection', 'protocol']]
    ]);
  }

  createContext(id: string): ContextWindow {
    const context: ContextWindow = {
      id,
      messages: [],
      tokens: 0,
      maxTokens: this.config.maxTokens,
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };
    this.contexts.set(id, context);
    return context;
  }

  addMessage(contextId: string, role: 'user' | 'assistant' | 'system', content: string): void {
    const context = this.contexts.get(contextId);
    if (!context) {
      this.createContext(contextId);
      return this.addMessage(contextId, role, content);
    }

    const message: ContextMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      role,
      content,
      timestamp: Date.now()
    };

    context.messages.push(message);
    context.tokens += this.estimateTokens(content);
    context.lastUpdated = Date.now();

    this.checkAndPrune(context);
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.split(/\s+/).length * 1.3);
  }

  private checkAndPrune(context: ContextWindow): void {
    const usageRatio = context.tokens / context.maxTokens;
    
    if (usageRatio > this.config.pruneThreshold && this.config.enableObservationMasking) {
      this.pruneContext(context);
    }
  }

  private pruneContext(context: ContextWindow): void {
    const systemMessages = context.messages.filter(m => m.role === 'system');
    const otherMessages = context.messages.filter(m => m.role !== 'system');
    
    if (otherMessages.length <= 2) return;

    const recentCount = Math.ceil(otherMessages.length * 0.3);
    const keepRecent = otherMessages.slice(-recentCount);
    const maskOlder = otherMessages.slice(0, -recentCount).map(m => ({
      ...m,
      masked: true,
      content: m.content.substring(0, 50) + '... [masked for context optimization]'
    }));

    context.messages = [...systemMessages, ...maskOlder, ...keepRecent];
    
    let totalTokens = 0;
    context.messages.forEach(m => {
      if (!m.masked) totalTokens += this.estimateTokens(m.content);
      else totalTokens += 60;
    });
    context.tokens = totalTokens;

    console.log(`[ContextOptimizer] Pruned context ${context.id}: ${otherMessages.length} -> ${context.messages.length} messages`);
  }

  async injectRelevantContext(contextId: string, query: string): Promise<string> {
    if (!this.config.enableDynamicInjection) return '';

    const results = await semanticEmbeddingEngine.search(query, 3);
    if (results.length === 0 || results[0].score < 0.3) return '';

    const contextData = results.map(r => `[Context: ${r.text.substring(0, 100)}...]`).join('\n');
    
    this.addMessage(contextId, 'system', `Relevant context: ${contextData}`);
    
    return contextData;
  }

  getContextSummary(contextId: string): { messages: number; tokens: number; masked: number } {
    const context = this.contexts.get(contextId);
    if (!context) return { messages: 0, tokens: 0, masked: 0 };
    
    return {
      messages: context.messages.length,
      tokens: context.tokens,
      masked: context.messages.filter(m => m.masked).length
    };
  }

  exportContext(contextId: string): ContextWindow | null {
    const context = this.contexts.get(contextId);
    if (!context) return null;
    
    return {
      ...context,
      messages: context.messages.filter(m => !m.masked)
    };
  }

  deleteContext(contextId: string): boolean {
    return this.contexts.delete(contextId);
  }

  getStats() {
    return {
      activeContexts: this.contexts.size,
      config: this.config,
      totalTokens: Array.from(this.contexts.values()).reduce((s, c) => s + c.tokens, 0)
    };
  }
}

export const contextOptimizer = new ContextOptimizer();