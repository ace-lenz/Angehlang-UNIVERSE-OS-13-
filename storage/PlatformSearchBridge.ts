/**
 * PlatformSearchBridge.ts
 * 
 * Bridges platform search agents with memory systems.
 * Connects all search functionality with learning, temporal, and cross-platform memory.
 * 
 * Features:
 * - Unified search with memory integration
 * - Learning from results
 * - Cross-platform memory linking
 * - Temporal memory storage
 * - Intelligent result caching
 * 
 * Zeta+ Performance: Integrated multi-system learning
 */

import { PlatformSearchResult } from '@/agents/PlatformSearchAgent';
import { continuousLearningHub } from '@/memory/ContinuousLearningHub';
import { crossPlatformMemory } from '@/memory/CrossPlatformMemory';
import { temporalMemory } from '@/memory/TemporalMemory';
import { youtubeSearchAgent } from '@/agents/YouTubeSearchAgent';
import { githubSearchAgent } from '@/agents/GitHubSearchAgent';
import { wikiSearchAgent } from '@/agents/WikiSearchAgent';
import { redditSearchAgent } from '@/agents/RedditSearchAgent';
import { stackOverflowSearchAgent } from '@/agents/StackOverflowSearchAgent';
import { twitterSearchAgent } from '@/agents/TwitterSearchAgent';

declare function performRealSearch(query: string): Promise<{ title: string; snippet: string; link: string }[]>;

export interface BridgeConfig {
  enableLearning: boolean;
  enableCrossPlatform: boolean;
  enableTemporal: boolean;
  cacheEnabled: boolean;
  cacheExpiry: number;
  platforms: string[];
}

export const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  enableLearning: true,
  enableCrossPlatform: true,
  enableTemporal: true,
  cacheEnabled: true,
  cacheExpiry: 1000 * 60 * 15, // 15 minutes
  platforms: ['youtube', 'github', 'wiki', 'reddit', 'stackoverflow', 'twitter', 'web']
};

export interface BridgeSearchResult {
  platform: string;
  results: PlatformSearchResult[];
  latency: number;
  fromCache: boolean;
  linkedKnowledge?: any;
}

export interface BridgeSearchOptions {
  platforms?: string[];
  enableLearning?: boolean;
  enableCrossPlatform?: boolean;
  enableTemporal?: boolean;
  cacheEnabled?: boolean;
}

class PlatformSearchBridge {
  private static instance: PlatformSearchBridge;
  private config: BridgeConfig;
  private searchCache: Map<string, { results: BridgeSearchResult[]; timestamp: number }> = new Map();
  private initialized: boolean = false;

  private constructor(config: Partial<BridgeConfig> = {}) {
    this.config = { ...DEFAULT_BRIDGE_CONFIG, ...config };
  }

  static getInstance(config?: Partial<BridgeConfig>): PlatformSearchBridge {
    if (!PlatformSearchBridge.instance) {
      PlatformSearchBridge.instance = new PlatformSearchBridge(config);
    }
    return PlatformSearchBridge.instance;
  }

  /**
   * Initialize all connected systems
   */
  async initialize(): Promise<void> {
    console.log('[PlatformSearchBridge] Initializing...');
    
    // Ensure memory systems are initialized
    continuousLearningHub.ensureInitialized();
    crossPlatformMemory.ensureInitialized();
    temporalMemory.ensureInitialized();
    
    this.initialized = true;
    console.log('[PlatformSearchBridge] Initialized');
  }

  /**
   * Search across platforms with full memory integration
   */
  async search(query: string, options?: BridgeSearchOptions): Promise<BridgeSearchResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const startTime = performance.now();
    const config = { ...this.config, ...options };
    const platforms = config.platforms || this.config.platforms;
    
    // Check cache first
    if (config.cacheEnabled) {
      const cached = this.getFromCache(query);
      if (cached) {
        console.log('[PlatformSearchBridge] Cache hit');
        return cached;
      }
    }
    
    const results: BridgeSearchResult[] = [];
    
    // Search all platforms in parallel
    const searchPromises = platforms.map(async (platform) => {
      const platformStart = performance.now();
      let platformResults: PlatformSearchResult[] = [];
      let error: string | undefined;
      
      try {
        platformResults = await this.searchPlatform(platform, query);
      } catch (e: any) {
        error = e.message;
        console.warn(`[PlatformSearchBridge] ${platform} failed:`, e.message);
      }
      
      return {
        platform,
        results: platformResults,
        latency: performance.now() - platformStart,
        fromCache: false
      } as BridgeSearchResult;
    });
    
    const searchResults = await Promise.all(searchPromises);
    results.push(...searchResults);
    
    // Process learning
    if (config.enableLearning) {
      for (const result of searchResults) {
        if (result.results.length > 0) {
          await continuousLearningHub.recordLearning(
            query,
            result.platform,
            result.results,
            result.latency
          );
        }
      }
    }
    
    // Process cross-platform memory
    if (config.enableCrossPlatform && searchResults.length > 1) {
      const platformResultsMap: Record<string, PlatformSearchResult[]> = {};
      for (const result of searchResults) {
        platformResultsMap[result.platform] = result.results;
      }
      
      try {
        await crossPlatformMemory.processCrossPlatform(query, platformResultsMap);
      } catch (e) {
        console.warn('[PlatformSearchBridge] Cross-platform processing failed:', e);
      }
    }
    
    // Store in temporal memory
    if (config.enableTemporal) {
      try {
        await temporalMemory.store(
          `search_${query}_${Date.now()}`,
          { query, results: searchResults },
          0.5
        );
      } catch (e) {
        console.warn('[PlatformSearchBridge] Temporal storage failed:', e);
      }
    }
    
    // Cache results
    if (config.cacheEnabled) {
      this.setToCache(query, results);
    }
    
    const totalLatency = performance.now() - startTime;
    console.log(`[PlatformSearchBridge] Search completed in ${totalLatency.toFixed(0)}ms`);
    
    return results;
  }

  /**
   * Search individual platform
   */
  private async searchPlatform(platform: string, query: string): Promise<PlatformSearchResult[]> {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return await youtubeSearchAgent.search(query);
      case 'github':
        return await githubSearchAgent.search(query);
      case 'wiki':
      case 'wikipedia':
        return await wikiSearchAgent.search(query);
      case 'reddit':
        return await redditSearchAgent.search(query);
      case 'stackoverflow':
        return await stackOverflowSearchAgent.search(query);
      case 'twitter':
        return await twitterSearchAgent.search(query);
      case 'web':
        try {
          const webResults = await performRealSearch(query);
          return webResults.map(r => ({
            title: r.title,
            snippet: r.snippet,
            link: r.link,
            platform: 'web',
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn(`[PlatformSearchBridge] Web search failed:`, e);
          return [];
        }
      default:
        console.warn(`[PlatformSearchBridge] Unknown platform: ${platform}`);
        return [];
    }
  }

  /**
   * Get cache
   */
  private getFromCache(query: string): BridgeSearchResult[] | null {
    const cached = this.searchCache.get(query.toLowerCase());
    if (cached && Date.now() - cached.timestamp < this.config.cacheExpiry) {
      return cached.results.map(r => ({ ...r, fromCache: true }));
    }
    return null;
  }

  /**
   * Set cache
   */
  private setToCache(query: string, results: BridgeSearchResult[]): void {
    this.searchCache.set(query.toLowerCase(), {
      results,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (this.searchCache.size > 100) {
      const oldest = Array.from(this.searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.searchCache.delete(oldest[0]);
    }
  }

  /**
   * Get learning insights
   */
  getInsights(): any {
    return continuousLearningHub.getInsights();
  }

  /**
   * Get platform metrics
   */
  getPlatformMetrics(): any {
    return continuousLearningHub.getPlatformMetrics();
  }

  /**
   * Get cross-platform knowledge synthesis
   */
  async getSynthesis(query: string): Promise<any> {
    return await crossPlatformMemory.getSynthesis(query);
  }

  /**
   * Get recent searches from temporal memory
   */
  getRecentSearches(limit: number = 20): any {
    return temporalMemory.getRecent(limit);
  }

  /**
   * Predict best platform for query
   */
  predictBestPlatform(query: string): string {
    return continuousLearningHub.predictBestPlatform(query);
  }

  /**
   * Clear all caches and memories
   */
  async clearAll(): Promise<void> {
    this.searchCache.clear();
    await continuousLearningHub.clear();
    await crossPlatformMemory.clear();
    await temporalMemory.clear();
    
    console.log('[PlatformSearchBridge] Cleared all data');
  }

  /**
   * Get all stats
   */
  getStats(): Record<string, any> {
    return {
      cacheSize: this.searchCache.size,
      learning: continuousLearningHub.getStats(),
      crossPlatform: crossPlatformMemory.getStats(),
      temporal: temporalMemory.getStats(),
      config: this.config
    };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<BridgeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get config
   */
  getConfig(): BridgeConfig {
    return { ...this.config };
  }
}

export const platformSearchBridge = PlatformSearchBridge.getInstance();
export default PlatformSearchBridge;