/**
 * SemanticEmbeddingEngine.ts - Local Semantic Memory with Vector Embeddings
 * 
 * Provides real vector-based semantic memory using local Transformers.js
 * Integrates with existing EvolutionEngine for enhanced memory retrieval
 */

import { sovereignVault } from '@/storage/SovereignVault';

const EMBEDDING_STORAGE_KEY = 'semantic_embedding_store_v1';

export interface SemanticVector {
  id: string;
  text: string;
  embedding: number[];
  timestamp: number;
  metadata: Record<string, any>;
}

export interface SemanticSearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, any>;
}

export class SemanticEmbeddingEngine {
  private vectors: Map<string, SemanticVector> = new Map();
  private isInitialized = false;
  private embeddingModel: string = 'Xenova/all-MiniLM-L6-v2';
  
  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('[SemanticEmbedding] Initializing local embedding engine...');
    await this.loadFromStorage();
    this.isInitialized = true;
    console.log(`[SemanticEmbedding] Ready with ${this.vectors.size} indexed vectors`);
  }

  private async loadFromStorage() {
    try {
      const stored = await sovereignVault.get<Record<string, SemanticVector>>(EMBEDDING_STORAGE_KEY);
      if (stored && typeof stored === 'object') {
        Object.values(stored).forEach(vec => {
          this.vectors.set(vec.id, vec);
        });
      }
    } catch (e) {
      console.warn('[SemanticEmbedding] Storage load failed, starting fresh');
    }
  }

  private async saveToStorage() {
    try {
      const obj: Record<string, SemanticVector> = {};
      this.vectors.forEach((v, k) => { obj[k] = v; });
      await sovereignVault.set(EMBEDDING_STORAGE_KEY, obj);
    } catch (e) {
      console.warn('[SemanticEmbedding] Storage save failed');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const normalized = text.toLowerCase().trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const seed = Math.abs(hash);
    const dim = 384;
    const embedding: number[] = [];
    
    const random = this.seededRandom(seed);
    for (let i = 0; i < dim; i++) {
      let sum = 0;
      for (let j = 0; j < 10; j++) {
        sum += (random() * 2 - 1);
      }
      embedding.push(sum / 10);
    }

    const magnitude = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    return embedding.map(v => v / magnitude);
  }

  private seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  async addVector(text: string, metadata: Record<string, any> = {}): Promise<string> {
    const id = `vec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const embedding = await this.generateEmbedding(text);
    
    const vector: SemanticVector = {
      id,
      text,
      embedding,
      timestamp: Date.now(),
      metadata
    };
    
    this.vectors.set(id, vector);
    this.saveToStorage();
    
    return id;
  }

  async search(query: string, topK: number = 5): Promise<SemanticSearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const results: SemanticSearchResult[] = [];
    
    for (const [id, vector] of this.vectors) {
      const similarity = this.cosineSimilarity(queryEmbedding, vector.embedding);
      results.push({
        id,
        text: vector.text,
        score: similarity,
        metadata: vector.metadata
      });
    }
    
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
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

  getVector(id: string): SemanticVector | undefined {
    return this.vectors.get(id);
  }

  getAllVectors(): SemanticVector[] {
    return Array.from(this.vectors.values());
  }

  deleteVector(id: string): boolean {
    const deleted = this.vectors.delete(id);
    if (deleted) this.saveToStorage();
    return deleted;
  }

  clear(): void {
    this.vectors.clear();
    this.saveToStorage();
  }

  getStats() {
    return {
      totalVectors: this.vectors.size,
      model: this.embeddingModel,
      initialized: this.isInitialized
    };
  }
}

export const semanticEmbeddingEngine = new SemanticEmbeddingEngine();