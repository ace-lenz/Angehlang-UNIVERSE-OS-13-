/**
 * ContinuousLearningHub.ts
 * 
 * Tracks continuous learning across all platform searches.
 * Maintains learning history, generates insights, and connects
 * search patterns to knowledge.
 * 
 * Features:
 * - Learning history tracking
 * - Platform effectiveness metrics
 * - Pattern detection
 * - Self-improvement insights
 * - Integration with EvolutionEngine
 * 
 * Zeta+ Performance: Real-time learning updates
 */

import { sovereignVault } from '@/storage/SovereignVault';
import { evolutionCore, SynapticWeights } from '@/memory/EvolutionEngine';
import { PlatformSearchResult } from '@/agents/PlatformSearchAgent';

export interface LearningRecord {
  id: string;
  query: string;
  platform: string;
  results: PlatformSearchResult[];
  timestamp: number;
  effectiveness: number;
  responseTime: number;
  insights: string[];
}

export interface PlatformMetrics {
  platform: string;
  totalQueries: number;
  successfulQueries: number;
  avgEffectiveness: number;
  avgResponseTime: number;
  lastUpdated: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SearchPattern {
  id: string;
  queryPattern: string;
  frequency: number;
  avgEffectiveness: number;
  associatedPlatforms: string[];
  lastSeen: number;
}

export interface LearningInsights {
  topQueries: string[];
  bestPlatform: string;
  improvementSuggestions: string[];
  totalLearningRecords: number;
  avgEffectiveness: number;
}

export class ContinuousLearningHub {
  private static instance: ContinuousLearningHub;
  private learningRecords: Map<string, LearningRecord> = new Map();
  private platformMetrics: Map<string, PlatformMetrics> = new Map();
  private searchPatterns: Map<string, SearchPattern> = new Map();
  private readonly MAX_RECORDS = 1000;
  private readonly MAX_PATTERNS = 500;
  private initialized: boolean = false;

  private constructor() {
    this.loadState();
  }

  static getInstance(): ContinuousLearningHub {
    if (!ContinuousLearningHub.instance) {
      ContinuousLearningHub.instance = new ContinuousLearningHub();
    }
    return ContinuousLearningHub.instance;
  }

  /**
   * Load state from SovereignVault
   */
  private async loadState(): Promise<void> {
    try {
      const records = await sovereignVault.get<Record<string, LearningRecord>>('learning_records');
      const metrics = await sovereignVault.get<Record<string, PlatformMetrics>>('platform_metrics');
      const patterns = await sovereignVault.get<Record<string, SearchPattern>>('search_patterns');
      
      if (records) {
        for (const [key, value] of Object.entries(records)) {
          this.learningRecords.set(key, value);
        }
      }
      
      if (metrics) {
        for (const [key, value] of Object.entries(metrics)) {
          this.platformMetrics.set(key, value);
        }
      }
      
      if (patterns) {
        for (const [key, value] of Object.entries(patterns)) {
          this.searchPatterns.set(key, value);
        }
      }
      
      this.initialized = true;
      console.log('[ContinuousLearningHub] Hydrated:', {
        records: this.learningRecords.size,
        metrics: this.platformMetrics.size,
        patterns: this.searchPatterns.size
      });
    } catch (e) {
      console.warn('[ContinuousLearningHub] Load state failed:', e);
      this.initialized = true;
    }
  }

  /**
   * Save state to SovereignVault
   */
  private async saveState(): Promise<void> {
    try {
      const recordsObj: Record<string, LearningRecord> = {};
      for (const [key, value] of this.learningRecords) {
        recordsObj[key] = value;
      }
      
      const metricsObj: Record<string, PlatformMetrics> = {};
      for (const [key, value] of this.platformMetrics) {
        metricsObj[key] = value;
      }
      
      const patternsObj: Record<string, SearchPattern> = {};
      for (const [key, value] of this.searchPatterns) {
        patternsObj[key] = value;
      }
      
      await sovereignVault.set('learning_records', recordsObj);
      await sovereignVault.set('platform_metrics', metricsObj);
      await sovereignVault.set('search_patterns', patternsObj);
    } catch (e) {
      console.warn('[ContinuousLearningHub] Save state failed:', e);
    }
  }

  /**
   * Record a learning event from platform search
   */
  async recordLearning(
    query: string,
    platform: string,
    results: PlatformSearchResult[],
    responseTime: number
  ): Promise<LearningRecord> {
    const id = `lr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();
    
    // Calculate effectiveness based on results
    const effectiveness = this.calculateEffectiveness(results);
    
    // Extract insights
    const insights = this.extractInsights(query, results, platform);
    
    const record: LearningRecord = {
      id,
      query,
      platform,
      results,
      timestamp,
      effectiveness,
      responseTime,
      insights
    };
    
    // Store record
    this.learningRecords.set(id, record);
    
    // Update platform metrics
    this.updatePlatformMetrics(platform, effectiveness, responseTime);
    
    // Update search patterns
    this.updateSearchPattern(query, platform, effectiveness);
    
    // Trim if needed
    if (this.learningRecords.size > this.MAX_RECORDS) {
      const oldest = Array.from(this.learningRecords.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      this.learningRecords.delete(oldest[0]);
    }
    
    // Record in EvolutionEngine
    evolutionCore.learn(`ContinuousHub_${platform}`, query, results.length, effectiveness > 0.5);
    
    // Save periodically
    if (this.learningRecords.size % 10 === 0) {
      await this.saveState();
    }
    
    console.log('[ContinuousLearningHub] Recorded:', {
      platform,
      query: query.substring(0, 30),
      effectiveness: effectiveness.toFixed(2),
      resultCount: results.length
    });
    
    return record;
  }

  /**
   * Calculate result effectiveness score
   */
  private calculateEffectiveness(results: PlatformSearchResult[]): number {
    if (results.length === 0) return 0;
    
    let score = 0;
    
    for (const result of results) {
      // Base score from result count
      score += 0.1;
      
      // Score from result's own metadata
      if (result.score) {
        score += result.score * 0.3;
      }
      
      // Bonus for having a link
      if (result.link) {
        score += 0.05;
      }
      
      // Bonus for having snippet
      if (result.snippet && result.snippet.length > 10) {
        score += 0.05;
      }
    }
    
    return Math.min(1, score / results.length);
  }

  /**
   * Extract insights from results
   */
  private extractInsights(query: string, results: PlatformSearchResult[], platform: string): string[] {
    const insights: string[] = [];
    
    // Platform insight
    insights.push(`platform_${platform}`);
    
    // Result count insight
    if (results.length >= 5) {
      insights.push('high_results');
    } else if (results.length >= 1) {
      insights.push('some_results');
    } else {
      insights.push('no_results');
    }
    
    // Content type insights
    for (const result of results.slice(0, 3)) {
      if (result.link?.includes('github.com')) {
        insights.push('code_content');
      }
      if (result.link?.includes('youtube.com')) {
        insights.push('video_content');
      }
      if (result.link?.includes('wikipedia.org')) {
        insights.push('knowledge_content');
      }
      if (result.link?.includes('stackoverflow.com')) {
        insights.push('qa_content');
      }
      if (result.link?.includes('reddit.com')) {
        insights.push('community_content');
      }
    }
    
    // Query type insights
    const queryLower = query.toLowerCase();
    if (queryLower.includes('how') || queryLower.includes('what')) {
      insights.push('informational');
    }
    if (queryLower.includes('code') || queryLower.includes('function')) {
      insights.push('technical');
    }
    if (queryLower.includes('tutorial') || queryLower.includes('learn')) {
      insights.push('educational');
    }
    
    return [...new Set(insights)];
  }

  /**
   * Update platform metrics
   */
  private updatePlatformMetrics(platform: string, effectiveness: number, responseTime: number): void {
    const existing = this.platformMetrics.get(platform);
    
    if (existing) {
      const weight = 0.1;
      const newTotal = existing.totalQueries + 1;
      const newSuccessful = existing.successfulQueries + (effectiveness > 0.5 ? 1 : 0);
      
      existing.totalQueries = newTotal;
      existing.successfulQueries = newSuccessful;
      existing.avgEffectiveness = existing.avgEffectiveness * (1 - weight) + effectiveness * weight;
      existing.avgResponseTime = existing.avgResponseTime * (1 - weight) + responseTime * weight;
      existing.lastUpdated = Date.now();
      
      // Calculate trend
      const recentRecords = Array.from(this.learningRecords.values())
        .filter(r => r.platform === platform && Date.now() - r.timestamp < 86400000);
      
      if (recentRecords.length >= 5) {
        const recentAvg = recentRecords.slice(0, 5).reduce((a, r) => a + r.effectiveness, 0) / 5;
        const oldAvg = existing.avgEffectiveness;
        
        if (recentAvg > oldAvg + 0.1) {
          existing.trend = 'improving';
        } else if (recentAvg < oldAvg - 0.1) {
          existing.trend = 'declining';
        } else {
          existing.trend = 'stable';
        }
      }
      
      this.platformMetrics.set(platform, existing);
    } else {
      this.platformMetrics.set(platform, {
        platform,
        totalQueries: 1,
        successfulQueries: effectiveness > 0.5 ? 1 : 0,
        avgEffectiveness: effectiveness,
        avgResponseTime: responseTime,
        lastUpdated: Date.now(),
        trend: 'stable'
      });
    }
  }

  /**
   * Update search pattern
   */
  private updateSearchPattern(query: string, platform: string, effectiveness: number): void {
    // Extract main tokens from query
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const mainToken = tokens[0] || query.toLowerCase().substring(0, 10);
    
    const key = `pattern_${mainToken}`;
    const existing = this.searchPatterns.get(key);
    
    if (existing) {
      existing.frequency += 1;
      existing.avgEffectiveness = existing.avgEffectiveness * 0.9 + effectiveness * 0.1;
      existing.lastSeen = Date.now();
      
      if (!existing.associatedPlatforms.includes(platform)) {
        existing.associatedPlatforms.push(platform);
      }
      
      this.searchPatterns.set(key, existing);
    } else {
      this.searchPatterns.set(key, {
        id: key,
        queryPattern: mainToken,
        frequency: 1,
        avgEffectiveness: effectiveness,
        associatedPlatforms: [platform],
        lastSeen: Date.now()
      });
    }
    
    // Trim patterns if needed
    if (this.searchPatterns.size > this.MAX_PATTERNS) {
      const oldest = Array.from(this.searchPatterns.entries())
        .sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
      this.searchPatterns.delete(oldest[0]);
    }
  }

  /**
   * Get learning insights
   */
  getInsights(): LearningInsights {
    const records = Array.from(this.learningRecords.values());
    
    // Top queries by frequency
    const queryCounts = new Map<string, number>();
    for (const record of records) {
      const count = queryCounts.get(record.query) || 0;
      queryCounts.set(record.query, count + 1);
    }
    
    const topQueries = Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query]) => query);
    
    // Best performing platform
    let bestPlatform = 'web';
    let bestScore = 0;
    
    for (const [platform, metrics] of this.platformMetrics) {
      if (metrics.avgEffectiveness > bestScore) {
        bestScore = metrics.avgEffectiveness;
        bestPlatform = platform;
      }
    }
    
    // Calculate overall effectiveness
    const totalRecords = records.length;
    const avgEffectiveness = totalRecords > 0
      ? records.reduce((a, r) => a + r.effectiveness, 0) / totalRecords
      : 0;
    
    // Generate improvement suggestions
    const suggestions: string[] = [];
    const metrics = Array.from(this.platformMetrics.values());
    const declining = metrics.filter(m => m.trend === 'declining');
    const stable = metrics.filter(m => m.trend === 'stable');
    
    if (declining.length > 0) {
      suggestions.push(`Consider using alternative platforms: ${declining.map(m => m.platform).join(', ')}`);
    }
    
    if (stable.length > 3) {
      suggestions.push('Multiple platforms performing stably - consider A/B testing');
    }
    
    if (avgEffectiveness < 0.5) {
      suggestions.push('Overall effectiveness low - try refining queries');
    }
    
    return {
      topQueries,
      bestPlatform,
      improvementSuggestions: suggestions,
      totalLearningRecords: totalRecords,
      avgEffectiveness
    };
  }

  /**
   * Get platform metrics
   */
  getPlatformMetrics(platform?: string): Record<string, PlatformMetrics> {
    if (platform) {
      const metrics = this.platformMetrics.get(platform);
      return metrics ? { [platform]: metrics } : {};
    }
    
    const result: Record<string, PlatformMetrics> = {};
    for (const [key, value] of this.platformMetrics) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Get recent learning records
   */
  getRecentRecords(limit: number = 20): LearningRecord[] {
    return Array.from(this.learningRecords.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get search patterns
   */
  getSearchPatterns(limit: number = 50): SearchPattern[] {
    return Array.from(this.searchPatterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Predict best platform for query
   */
  predictBestPlatform(query: string): string {
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    // Find matching pattern
    for (const token of tokens) {
      const pattern = this.searchPatterns.get(`pattern_${token}`);
      if (pattern && pattern.associatedPlatforms.length > 0) {
        // Return best performing platform from pattern
        const platformMetrics = pattern.associatedPlatforms
          .map(p => this.platformMetrics.get(p))
          .filter((p): p is PlatformMetrics => p !== undefined)
          .sort((a, b) => b.avgEffectiveness - a.avgEffectiveness);
        
        if (platformMetrics.length > 0) {
          return platformMetrics[0].platform;
        }
      }
    }
    
    // Fallback to best overall platform
    let bestPlatform = 'web';
    let bestScore = 0;
    
    for (const [platform, metrics] of this.platformMetrics) {
      if (metrics.avgEffectiveness > bestScore) {
        bestScore = metrics.avgEffectiveness;
        bestPlatform = platform;
      }
    }
    
    return bestPlatform;
  }

  /**
   * Clear all learning data
   */
  async clear(): Promise<void> {
    this.learningRecords.clear();
    this.platformMetrics.clear();
    this.searchPatterns.clear();
    await this.saveState();
    
    console.log('[ContinuousLearningHub] Cleared all learning data');
  }

  /**
   * Get stats
   */
  getStats(): Record<string, any> {
    return {
      totalRecords: this.learningRecords.size,
      totalPatterns: this.searchPatterns.size,
      platforms: Array.from(this.platformMetrics.keys()),
      insights: this.getInsights()
    };
  }

  /**
   * Ensure initialized
   */
  ensureInitialized(): void {
    if (!this.initialized) {
      this.loadState();
      this.initialized = true;
    }
  }
}

// Export singleton
export const continuousLearningHub = ContinuousLearningHub.getInstance();

export default ContinuousLearningHub;