/**
 * PlatformSearchAgent.ts - Base class for Multi-Platform Search Agents
 * 
 * Extends A2A System for autonomous platform-specific search.
 * Supports: YouTube, GitHub, Wikipedia, Twitter, Reddit, StackOverflow
 * 
 * Features:
 * - Unified search interface for all platforms
 * - Result normalization and caching
 * - Self-learning from search results
 * - Fallback chains for reliability
 * - Retry logic with exponential backoff
 * - Intelligent result scoring
 */

import { sovereignVault } from '@/storage/SovereignVault';
import { evolutionCore } from '@/memory/EvolutionEngine';

export interface PlatformSearchResult {
  title: string;
  snippet: string;
  link: string;
  platform: string;
  metadata?: Record<string, any>;
  timestamp: number;
  score?: number; // Intelligent relevance score
}

export interface PlatformConfig {
  platformName: string;
  apiEndpoint: string;
  fallbackEndpoints: string[];
  cacheExpiry: number;
  rateLimit: number;
  authRequired: boolean;
  maxRetries?: number;
}

export interface SearchQuery {
  text: string;
  filters?: {
    limit?: number;
    language?: string;
    dateRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    sortBy?: 'relevance' | 'date' | 'popularity';
  };
}

export abstract class PlatformSearchAgent {
  protected platformName: string;
  protected config: PlatformConfig;
  protected searchCache: Map<string, { results: PlatformSearchResult[]; timestamp: number }> = new Map();
  protected cacheExpiry: number;
  protected apiKey: string | null = null;
  protected requestCount: number = 0;
  protected lastRequestTime: number = 0;

  constructor(config: PlatformConfig) {
    this.platformName = config.platformName;
    this.config = config;
    this.cacheExpiry = config.cacheExpiry;
    this.loadApiKey();
  }

  /**
   * Load API key from localStorage
   */
  private loadApiKey(): void {
    const keyName = `api_${this.platformName.toLowerCase()}`;
    this.apiKey = localStorage.getItem(keyName) || null;
  }

  /**
   * Get API key (reloads if needed)
   */
  protected getApiKey(): string | null {
    if (!this.apiKey) {
      this.loadApiKey();
    }
    return this.apiKey;
  }

  /**
   * Check if API key is available
   */
  protected hasApiKey(): boolean {
    return !!this.getApiKey();
  }

  /**
   * Main search interface
   */
  async search(query: string, filters?: SearchQuery['filters']): Promise<PlatformSearchResult[]> {
    console.log(`[${this.platformName}SearchAgent] Processing query:`, query);

    try {
      // Check cache first
      const cached = this.getFromCache(query);
      if (cached) {
        console.log(`[${this.platformName}SearchAgent] Cache hit`);
        return cached;
      }

      // Perform search
      let results = await this.performSearch(query);

      // Apply filters if provided
      if (filters?.limit) {
        results = results.slice(0, filters.limit);
      }

      // Cache results
      this.setToCache(query, results);

      // Self-learning: record search pattern
      this.learnFromResults(query, results);

      return results;
    } catch (error: any) {
      console.error(`[${this.platformName}SearchAgent] Search error:`, error);
      
      // Try fallback
      const fallbackResults = await this.performFallbackSearch(query);
      if (fallbackResults.length > 0) {
        return fallbackResults;
      }

      return [];
    }
  }

  /**
   * Abstract method - implement in subclasses
   */
  protected abstract performSearch(query: string): Promise<PlatformSearchResult[]>;

  /**
   * Fallback search when primary fails
   */
  protected async performFallbackSearch(query: string): Promise<PlatformSearchResult[]> {
    console.log(`[${this.platformName}SearchAgent] Attempting fallback search`);
    
    for (const fallbackUrl of this.config.fallbackEndpoints) {
      try {
        const results = await this.fetchFromFallback(fallbackUrl, query);
        if (results.length > 0) {
          return results;
        }
      } catch (e) {
        console.warn(`[${this.platformName}SearchAgent] Fallback failed:`, fallbackUrl);
      }
    }
    
    return [];
  }

  /**
   * Fetch from fallback endpoint
   */
  protected async fetchFromFallback(url: string, query: string): Promise<PlatformSearchResult[]> {
    const encodedQuery = encodeURIComponent(query);
    const fetchUrl = url.replace('{query}', encodedQuery);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const response = await fetch(fetchUrl, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) return [];
      
      return await this.parseFallbackResults(await response.json());
    } catch (e) {
      clearTimeout(timeoutId);
      return [];
    }
  }

  /**
   * Parse fallback results - override in subclasses
   */
  protected parseFallbackResults(data: any): PlatformSearchResult[] {
    return [];
  }

  /**
   * Get from cache
   */
  protected getFromCache(query: string): PlatformSearchResult[] | null {
    const cached = this.searchCache.get(query.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.results;
    }
    return null;
  }

  /**
   * Set to cache
   */
  protected setToCache(query: string, results: PlatformSearchResult[]): void {
    this.searchCache.set(query.toLowerCase(), {
      results,
      timestamp: Date.now()
    });

    // Also persist to SovereignVault
    const cacheKey = `${this.platformName.toLowerCase()}_search_${query.toLowerCase()}`;
    sovereignVault.set(cacheKey, { results, timestamp: Date.now() });

    // Limit cache size
    if (this.searchCache.size > 100) {
      const oldestKey = Array.from(this.searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.searchCache.delete(oldestKey);
    }
  }

  /**
   * Learn from search results - self-improvement
   */
  protected learnFromResults(query: string, results: PlatformSearchResult[]): void {
    if (results.length > 0) {
      evolutionCore.learn(`${this.platformName}_Search`, query, results.length, true);
      this.requestCount++;
      this.lastRequestTime = Date.now();
    }
  }

  /**
   * Rate limiting check
   */
  protected checkRateLimit(): boolean {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    return timeSinceLastRequest >= this.config.rateLimit;
  }

  /**
   * Update rate limit
   */
  protected updateRateLimit(): void {
    this.lastRequestTime = Date.now();
  }

  /**
   * Normalize result format with intelligent scoring
   */
  protected normalizeResult(
    title: string, 
    snippet: string, 
    link: string, 
    metadata?: Record<string, any>
  ): PlatformSearchResult {
    // Calculate relevance score
    const score = this.calculateResultScore(title, snippet, link, metadata);
    
    return {
      title: title?.substring(0, 200) || '',
      snippet: snippet?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
      link: link || '',
      platform: this.platformName,
      metadata,
      timestamp: Date.now(),
      score
    };
  }

  /**
   * Calculate result relevance score (0-1)
   */
  protected calculateResultScore(
    title: string, 
    snippet: string, 
    link: string, 
    metadata?: Record<string, any>
  ): number {
    let score = 0.3; // Base score
    
    const content = `${title} ${snippet}`.toLowerCase();
    
    // Presence of key metadata increases score
    if (metadata) {
      // Popularity metrics
      if (metadata.score || metadata.likes || metadata.stars) {
        const popularity = metadata.score || metadata.likes || metadata.stars || 0;
        score += Math.min(0.3, Math.log10(popularity + 1) * 0.1);
      }
      
      // Answer/response count
      if (metadata.answerCount || metadata.numComments || metadata.replies) {
        score += 0.1;
      }
      
      // Is answered (for Q&A platforms)
      if (metadata.isAnswered) {
        score += 0.15;
      }
      
      // View count
      if (metadata.viewCount) {
        score += Math.min(0.1, Math.log10(metadata.viewCount) * 0.05);
      }
    }
    
    // Title quality
    if (title && title.length > 10) score += 0.1;
    if (title && title.includes('?')) score += 0.05; // Question mark suggests Q&A
    
    // Link quality
    if (link?.includes('http')) score += 0.05;
    
    return Math.min(1, score);
  }

  /**
   * Retry search with exponential backoff
   */
  protected async searchWithRetry(
    query: string, 
    maxRetries: number = 3
  ): Promise<PlatformSearchResult[]> {
    const maxAttempts = maxRetries || this.config.maxRetries || 3;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const results = await this.performSearch(query);
        return results;
      } catch (e: any) {
        lastError = e;
        
        // Exponential backoff: 1s, 2s, 4s...
        if (attempt < maxAttempts - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[${this.platformName}SearchAgent] Retry ${attempt + 1}/${maxAttempts} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`[${this.platformName}SearchAgent] All retries failed:`, lastError);
    return [];
  }

  /**
   * Sort results by score
   */
  protected sortByScore(results: PlatformSearchResult[]): PlatformSearchResult[] {
    return [...results].sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  /**
   * Get agent status
   */
  getStatus(): Record<string, any> {
    return {
      platform: this.platformName,
      apiKey: this.hasApiKey(),
      cacheSize: this.searchCache.size,
      requestCount: this.requestCount,
      rateLimit: this.config.rateLimit,
      lastRequest: this.lastRequestTime,
      maxRetries: this.config.maxRetries || 3
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }

  getName(): string {
    return this.platformName;
  }
}

/**
 * Factory for creating platform search agents
 */
export class PlatformSearchAgentFactory {
  private static agentClasses: Map<string, new (config: PlatformConfig) => PlatformSearchAgent> = new Map();

  static register(platform: string, agentClass: new (config: PlatformConfig) => PlatformSearchAgent): void {
    this.agentClasses.set(platform.toLowerCase(), agentClass);
  }

  static create(platform: string, config?: PlatformConfig): PlatformSearchAgent | null {
    const AgentClass = this.agentClasses.get(platform.toLowerCase());
    if (AgentClass && config) {
      return new AgentClass(config);
    }
    return null;
  }

  static getAvailablePlatforms(): string[] {
    return Array.from(this.agentClasses.keys());
  }
}

export default PlatformSearchAgent;