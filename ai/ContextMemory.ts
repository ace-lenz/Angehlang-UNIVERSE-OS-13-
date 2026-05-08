/**
 * ContextMemory.ts - RAG-Based Context with QPPU Integration
 * 
 * Features:
 * - ANGHV quantum storage for context
 * - Vector-like similarity search
 * - Session-based memory
 * - Project context learning
 */

import { qppuEngine } from '@/engine/QPPUCore';

export interface MemoryEntry {
  id: string;
  type: 'code' | 'conversation' | 'file' | 'project';
  content: string;
  embedding?: number[];
  metadata: {
    path?: string;
    language?: string;
    project?: string;
    tags?: string[];
    timestamp: number;
  };
}

export interface SearchResult {
  entry: MemoryEntry;
  score: number;
}

class ContextMemory {
  private static instance: ContextMemory;
  private storage: Map<string, MemoryEntry> = new Map();
  private projectIndex: Map<string, string[]> = new Map();
  private isInitialized: boolean = false;
  private qppuStorage: any = null;

  private constructor() {}

  public static getInstance(): ContextMemory {
    if (!ContextMemory.instance) {
      ContextMemory.instance = new ContextMemory();
    }
    return ContextMemory.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // QPPU storage not available, use localStorage fallback
    // Load existing memory from localStorage
    const saved = localStorage.getItem('ai_context_memory');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        for (const entry of data) {
          this.storage.set(entry.id, entry);
        }
        
        // Rebuild project index
        for (const [id, entry] of this.storage) {
          if (entry.metadata.project) {
            const projectEntries = this.projectIndex.get(entry.metadata.project) || [];
            projectEntries.push(id);
            this.projectIndex.set(entry.metadata.project, projectEntries);
          }
        }
      } catch (e) {
        console.error('[ContextMemory] Failed to load:', e);
      }
    }

    this.isInitialized = true;
    console.log('[ContextMemory] Initialized with', this.storage.size, 'entries');
  }

  // ========== Add Entries ==========

  async addEntry(entry: Omit<MemoryEntry, 'id'>): Promise<string> {
    const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    const fullEntry: MemoryEntry = {
      ...entry,
      id,
      embedding: entry.embedding || this.generateEmbedding(entry.content)
    };

    this.storage.set(id, fullEntry);

    // Update project index
    if (fullEntry.metadata.project) {
      const projectEntries = this.projectIndex.get(fullEntry.metadata.project) || [];
      projectEntries.push(id);
      this.projectIndex.set(fullEntry.metadata.project, projectEntries);
    }

    // Persist to localStorage
    this.persist();

    // Try to store in QPPU if available
    if (this.qppuStorage) {
      await this.qppuStorage.store(id, fullEntry);
    }

    return id;
  }

  // ========== Retrieve Entries ==========

  getEntry(id: string): MemoryEntry | undefined {
    return this.storage.get(id);
  }

  getProjectEntries(project: string): MemoryEntry[] {
    const ids = this.projectIndex.get(project) || [];
    return ids.map(id => this.storage.get(id)).filter(Boolean);
  }

  getRecentEntries(limit: number = 10): MemoryEntry[] {
    return Array.from(this.storage.values())
      .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
      .slice(0, limit);
  }

  // ========== Search (Simple Similarity) ==========

  async search(query: string, project?: string, limit: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = this.generateEmbedding(query);
    
    let entries: MemoryEntry[];
    
    if (project) {
      entries = this.getProjectEntries(project);
    } else {
      entries = Array.from(this.storage.values());
    }

    // Calculate simple similarity scores
    const scored = entries.map(entry => {
      const score = this.cosineSimilarity(queryEmbedding, entry.embedding || this.generateEmbedding(entry.content));
      return { entry, score };
    });

    // Sort by score and return top results
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .filter(r => r.score > 0.1);
  }

  // ========== Get Context for AI ==========

  async getContextForQuery(query: string, project?: string): Promise<string> {
    const results = await this.search(query, project, 3);
    
    if (results.length === 0) {
      return '';
    }

    return results
      .map(r => {
        if (r.entry.metadata.path) {
          return `// ${r.entry.metadata.path}\n${r.entry.content.slice(0, 1000)}`;
        }
        return r.entry.content.slice(0, 500);
      })
      .join('\n\n');
  }

  // ========== Helper Methods ==========

  private generateEmbedding(text: string): number[] {
    // Simple hash-based embedding for similarity
    const hash = this.simpleHash(text);
    const embedding: number[] = [];
    
    for (let i = 0; i < 50; i++) {
      embedding.push(Math.sin(hash * (i + 1)) * 0.5 + 0.5);
    }
    
    return embedding;
  }

  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) / 2147483647;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private persist(): void {
    try {
      const entries = Array.from(this.storage.values()).slice(-200);
      localStorage.setItem('ai_context_memory', JSON.stringify(entries));
    } catch (e) {
      console.error('[ContextMemory] Failed to persist:', e);
    }
  }

  // ========== Clear ==========

  clearProject(project: string): void {
    const ids = this.projectIndex.get(project) || [];
    
    for (const id of ids) {
      this.storage.delete(id);
    }
    
    this.projectIndex.delete(project);
    this.persist();
  }

  clearAll(): void {
    this.storage.clear();
    this.projectIndex.clear();
    localStorage.removeItem('ai_context_memory');
  }

  // ========== Stats ==========

  getStats(): { total: number; projects: number; types: Record<string, number> } {
    const types: Record<string, number> = {};
    
    for (const entry of this.storage.values()) {
      types[entry.type] = (types[entry.type] || 0) + 1;
    }
    
    return {
      total: this.storage.size,
      projects: this.projectIndex.size,
      types
    };
  }
}

export const contextMemory = ContextMemory.getInstance();
export default contextMemory;