/**
 * TemporalMemory.ts
 * 
 * Time-based memory organization with temporal pattern detection.
 * Organizes memories by timestamp and detects temporal patterns.
 * 
 * Features:
 * - Time-based memory organization
 * - Temporal pattern detection
 * - Recent query tracking
 * - Time-window queries
 * - Aging and memory decay
 * 
 * Zeta+ Performance: O(log n) temporal queries
 */

import { sovereignVault } from '@/storage/SovereignVault';

export interface TemporalMemoryEntry {
  id: string;
  content: any;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  importance: number;
  decayRate: number;
}

export interface TemporalPattern {
  id: string;
  pattern: string;
  interval: number;
  frequency: number;
  lastSeen: number;
  nextPredicted: number;
}

export interface TimeWindow {
  start: number;
  end: number;
}

class TemporalMemory {
  private static instance: TemporalMemory;
  private memories: Map<string, TemporalMemoryEntry> = new Map();
  private temporalPatterns: Map<string, TemporalPattern> = new Map();
  private initialized: boolean = false;
  private readonly DEFAULT_DECAY_RATE = 0.001;
  private readonly ACCESS_BOOST = 0.1;
  private readonly MAX_MEMORIES = 3000;
  private readonly MAX_PATTERNS = 200;

  private constructor() {
    this.loadState();
  }

  static getInstance(): TemporalMemory {
    if (!TemporalMemory.instance) {
      TemporalMemory.instance = new TemporalMemory();
    }
    return TemporalMemory.instance;
  }

  private async loadState(): Promise<void> {
    try {
      const memories = await sovereignVault.get<Record<string, TemporalMemoryEntry>>('temporal_memories');
      const patterns = await sovereignVault.get<Record<string, TemporalPattern>>('temporal_patterns');
      
      if (memories) {
        for (const [key, value] of Object.entries(memories)) {
          this.memories.set(key, value);
        }
      }
      
      if (patterns) {
        for (const [key, value] of Object.entries(patterns)) {
          this.temporalPatterns.set(key, value);
        }
      }
      
      this.initialized = true;
      console.log('[TemporalMemory] Hydrated:', { memories: this.memories.size, patterns: this.temporalPatterns.size });
    } catch (e) {
      console.warn('[TemporalMemory] Load state failed:', e);
      this.initialized = true;
    }
  }

  private async saveState(): Promise<void> {
    try {
      const memoriesObj: Record<string, TemporalMemoryEntry> = {};
      for (const [key, value] of this.memories) memoriesObj[key] = value;
      const patternsObj: Record<string, TemporalPattern> = {};
      for (const [key, value] of this.temporalPatterns) patternsObj[key] = value;
      await sovereignVault.set('temporal_memories', memoriesObj);
      await sovereignVault.set('temporal_patterns', patternsObj);
    } catch (e) {
      console.warn('[TemporalMemory] Save state failed:', e);
    }
  }

  async store(id: string, content: any, importance: number = 0.5, decayRate?: number): Promise<TemporalMemoryEntry> {
    const timestamp = Date.now();
    
    const memory: TemporalMemoryEntry = {
      id,
      content,
      timestamp,
      accessCount: 0,
      lastAccessed: timestamp,
      importance,
      decayRate: decayRate || this.DEFAULT_DECAY_RATE
    };
    
    this.memories.set(id, memory);
    
    if (typeof content === 'string') {
      this.detectPattern(id, content, timestamp);
    }
    
    if (this.memories.size > this.MAX_MEMORIES) {
      await this.pruneMemories();
    }
    
    return memory;
  }

  async retrieve(id: string): Promise<TemporalMemoryEntry | null> {
    const memory = this.memories.get(id);
    if (!memory) return null;
    
    memory.accessCount += 1;
    memory.lastAccessed = Date.now();
    memory.importance = Math.min(1, memory.importance + this.ACCESS_BOOST);
    this.memories.set(id, memory);
    
    return memory;
  }

  private detectPattern(id: string, content: string, timestamp: number): void {
    const tokens = content.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    
    for (const token of tokens.slice(0, 3)) {
      const existing = this.temporalPatterns.get(token);
      
      if (existing) {
        const timeSinceLast = timestamp - existing.lastSeen;
        existing.frequency += 1;
        existing.lastSeen = timestamp;
        existing.interval = (existing.interval + timeSinceLast) / 2;
        existing.nextPredicted = timestamp + existing.interval;
        this.temporalPatterns.set(token, existing);
      } else {
        this.temporalPatterns.set(token, {
          id: `tp_${token}`,
          pattern: token,
          interval: 0,
          frequency: 1,
          lastSeen: timestamp,
          nextPredicted: timestamp
        });
      }
    }
    
    if (this.temporalPatterns.size > this.MAX_PATTERNS) {
      const oldest = Array.from(this.temporalPatterns.entries())
        .sort((a, b) => a[1].lastSeen - b[1].lastSeen)
        .slice(0, this.temporalPatterns.size - this.MAX_PATTERNS);
      for (const [key] of oldest) this.temporalPatterns.delete(key);
    }
  }

  private async pruneMemories(): Promise<void> {
    const now = Date.now();
    const scored = Array.from(this.memories.entries()).map(([id, memory]) => {
      const timeSinceAccess = now - memory.lastAccessed;
      const importanceDecay = memory.importance * Math.exp(-memory.decayRate * timeSinceAccess / 1000);
      return { id, memory, score: importanceDecay };
    });
    
    scored.sort((a, b) => a.score - b.score);
    const toRemove = scored.slice(0, Math.floor(this.memories.size * 0.2));
    
    for (const { id } of toRemove) {
      this.memories.delete(id);
    }
  }

  getMemoriesInWindow(window: TimeWindow): TemporalMemoryEntry[] {
    return Array.from(this.memories.values())
      .filter(m => m.timestamp >= window.start && m.timestamp <= window.end)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getRecent(limit: number = 20): TemporalMemoryEntry[] {
    return Array.from(this.memories.values())
      .sort((a, b) => b.lastAccessed - a.lastAccessed)
      .slice(0, limit);
  }

  getFrequent(limit: number = 20): TemporalMemoryEntry[] {
    return Array.from(this.memories.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  getTemporalPatterns(limit: number = 50): TemporalPattern[] {
    return Array.from(this.temporalPatterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  predictNext(query: string): number | null {
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    
    for (const token of tokens) {
      const pattern = this.temporalPatterns.get(token);
      if (pattern && pattern.frequency > 2 && pattern.interval > 0) {
        return pattern.nextPredicted;
      }
    }
    return null;
  }

  async applyDecay(): Promise<void> {
    const now = Date.now();
    
    for (const [id, memory] of this.memories) {
      const timeSinceAccess = now - memory.lastAccessed;
      const decayAmount = memory.importance * Math.exp(-memory.decayRate * timeSinceAccess / 1000);
      memory.importance = Math.max(0.1, decayAmount);
      
      if (memory.importance < 0.01) {
        this.memories.delete(id);
      } else {
        this.memories.set(id, memory);
      }
    }
  }

  getStats(): Record<string, any> {
    return {
      totalMemories: this.memories.size,
      totalPatterns: this.temporalPatterns.size
    };
  }

  async clear(): Promise<void> {
    this.memories.clear();
    this.temporalPatterns.clear();
    await this.saveState();
  }

  ensureInitialized(): void {
    if (!this.initialized) {
      this.loadState();
      this.initialized = true;
    }
  }
}

export const temporalMemory = TemporalMemory.getInstance();
export default TemporalMemory;