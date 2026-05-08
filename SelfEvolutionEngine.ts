/**
 * SelfEvolutionEngine.ts - Advanced Self-Learning and Evolution Engine
 * 
 * Features:
 * - Autonomous learning from search results
 * - Pattern recognition across platforms
 * - Predictive knowledge synthesis
 * - Continuous self-improvement
 * - Zeta+ cognitive evolution
 * 
 * This enhances the existing EvolutionEngine with platform-specific learning
 */

import { sovereignVault } from '@/storage/SovereignVault';
import { evolutionCore } from '@/memory/EvolutionEngine';
import { PlatformSearchResult } from '@/agents/PlatformSearchAgent';

export interface LearningRecord {
  id: string;
  source: string;
  query: string;
  results: PlatformSearchResult[];
  timestamp: number;
  relevanceScores: number[];
  insights: string[];
  selfScore: number;
}

export interface EvolutionPattern {
  id: string;
  type: 'query' | 'platform' | 'content' | 'temporal';
  frequency: number;
  lastSeen: number;
  successRate: number;
  associatedQueries: string[];
}

export interface EvolutionStats {
  totalLearningRecords: number;
  activePatterns: number;
  avgRelevanceScore: number;
  platformEffectiveness: Record<string, number>;
  selfImprovementRate: number;
}

export class SelfEvolutionEngine {
  private static instance: SelfEvolutionEngine;
  private learningRecords: LearningRecord[] = [];
  private patterns: Map<string, EvolutionPattern> = new Map();
  private maxRecords: number = 1000;
  private decayFactor: number = 0.95;
  private improvementThreshold: number = 0.7;

  private constructor() {
    this.loadState();
  }

  static getInstance(): SelfEvolutionEngine {
    if (!SelfEvolutionEngine.instance) {
      SelfEvolutionEngine.instance = new SelfEvolutionEngine();
    }
    return SelfEvolutionEngine.instance;
  }

  /**
   * Load state from SovereignVault
   */
  private async loadState(): Promise<void> {
    try {
      const records = await sovereignVault.get<LearningRecord[]>('self_evolution_records');
      const patterns = await sovereignVault.get<Record<string, EvolutionPattern>>('self_evolution_patterns');
      
      if (records) this.learningRecords = records;
      if (patterns) {
        for (const [key, value] of Object.entries(patterns)) {
          this.patterns.set(key, value);
        }
      }
    } catch (e) {
      console.warn('[SelfEvolutionEngine] Load state failed:', e);
    }
  }

  /**
   * Save state to SovereignVault
   */
  private async saveState(): Promise<void> {
    try {
      await sovereignVault.set('self_evolution_records', this.learningRecords.slice(-this.maxRecords));
      
      const patternObj: Record<string, EvolutionPattern> = {};
      for (const [key, value] of this.patterns) {
        patternObj[key] = value;
      }
      await sovereignVault.set('self_evolution_patterns', patternObj);
    } catch (e) {
      console.warn('[SelfEvolutionEngine] Save state failed:', e);
    }
  }

  /**
   * Learn from search results - core self-improvement function
   */
  async learnFromResults(
    source: string,
    query: string,
    results: PlatformSearchResult[],
    context?: Record<string, any>
  ): Promise<void> {
    if (results.length === 0) return;

    const timestamp = Date.now();
    
    // Calculate relevance scores for each result
    const relevanceScores = this.calculateRelevanceScores(query, results);
    
    // Extract insights from results
    const insights = this.extractInsights(query, results);
    
    // Calculate self-score based on result quality
    const avgRelevance = relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length;
    const selfScore = this.calculateSelfScore(avgRelevance, results.length, insights.length);

    // Create learning record
    const record: LearningRecord = {
      id: `lr_${timestamp}`,
      source,
      query,
      results: results.slice(0, 10), // Store top 10
      timestamp,
      relevanceScores,
      insights,
      selfScore
    };

    // Add to records
    this.learningRecords.push(record);
    
    // Trim if needed
    if (this.learningRecords.length > this.maxRecords) {
      this.learningRecords = this.learningRecords.slice(-this.maxRecords);
    }

    // Update patterns
    this.updatePatterns(source, query, relevanceScores, insights);

    // Record in evolution core
    evolutionCore.learn(`SelfEvolution_${source}`, query, Math.round(selfScore * 100), true);

    // Save state periodically
    if (this.learningRecords.length % 10 === 0) {
      await this.saveState();
    }

    console.log(`[SelfEvolutionEngine] Learned from ${source}: "${query}" (score: ${selfScore.toFixed(2)})`);
  }

  /**
   * Calculate relevance scores for results
   */
  private calculateRelevanceScores(query: string, results: PlatformSearchResult[]): number[] {
    const queryTokens = new Set(query.toLowerCase().split(/\s+/));
    
    return results.map(result => {
      let score = 0;
      const content = `${result.title} ${result.snippet}`.toLowerCase();
      
      // Token overlap
      for (const token of queryTokens) {
        if (content.includes(token)) score += 0.3;
      }
      
      // Title match (higher weight)
      if (result.title.toLowerCase().includes(query.toLowerCase())) {
        score += 0.4;
      }
      
      // Snippet quality
      if (result.snippet && result.snippet.length > 50) {
        score += 0.2;
      }
      
      return Math.min(1, score);
    });
  }

  /**
   * Extract insights from results
   */
  private extractInsights(query: string, results: PlatformSearchResult[]): string[] {
    const insights: string[] = [];
    
    // Platform insight
    const platforms = new Set(results.map(r => r.platform));
    if (platforms.size > 1) insights.push('multi_platform');
    if (platforms.has('youtube')) insights.push('video_content');
    if (platforms.has('github')) insights.push('code_content');
    if (platforms.has('wiki')) insights.push('knowledge_content');
    
    // Result count insight
    if (results.length >= 5) insights.push('high_results');
    else if (results.length >= 1) insights.push('moderate_results');
    else insights.push('low_results');
    
    // Content type insight
    for (const result of results.slice(0, 3)) {
      if (result.link?.includes('github.com')) {
        const isCode = result.title?.match(/\.(js|ts|py|rs|go|java|cpp)$/i);
        if (isCode) insights.push('code_reference');
      }
      if (result.link?.includes('youtube.com')) {
        insights.push('video_reference');
      }
    }
    
    return [...new Set(insights)];
  }

  /**
   * Calculate self-score
   */
  private calculateSelfScore(avgRelevance: number, resultCount: number, insightCount: number): number {
    let score = avgRelevance * 0.5;
    
    // Result count factor
    score += Math.min(0.2, resultCount * 0.04);
    
    // Insight diversity factor
    score += Math.min(0.3, insightCount * 0.05);
    
    return Math.min(1, score);
  }

  /**
   * Update patterns from learning
   */
  private updatePatterns(
    source: string,
    query: string,
    relevanceScores: number[],
    insights: string[]
  ): void {
    const timestamp = Date.now();
    
    // Platform pattern
    const platformKey = `platform_${source}`;
    this.updatePattern(platformKey, 'platform', timestamp, relevanceScores);
    
    // Query pattern (first token)
    const firstToken = query.split(/\s+/)[0]?.toLowerCase();
    if (firstToken) {
      const queryKey = `query_${firstToken}`;
      this.updatePattern(queryKey, 'query', timestamp, relevanceScores);
    }
    
    // Content patterns from insights
    for (const insight of insights) {
      const insightKey = `insight_${insight}`;
      this.updatePattern(insightKey, 'content', timestamp, relevanceScores);
    }
  }

  /**
   * Update individual pattern
   */
  private updatePattern(
    key: string,
    type: EvolutionPattern['type'],
    timestamp: number,
    relevanceScores: number[]
  ): void {
    const existing = this.patterns.get(key);
    const avgScore = relevanceScores.reduce((a, b) => a + b, 0) / relevanceScores.length;
    
    if (existing) {
      existing.frequency += 1;
      existing.lastSeen = timestamp;
      existing.successRate = existing.successRate * this.decayFactor + avgScore * (1 - this.decayFactor);
    } else {
      this.patterns.set(key, {
        id: key,
        type,
        frequency: 1,
        lastSeen: timestamp,
        successRate: avgScore,
        associatedQueries: []
      });
    }
  }

  /**
   * Get evolution statistics
   */
  getStats(): EvolutionStats {
    const platformEffectiveness: Record<string, number> = {};
    let totalScore = 0;
    let count = 0;

    // Calculate platform effectiveness
    for (const record of this.learningRecords) {
      const avgScore = record.relevanceScores.reduce((a, b) => a + b, 0) / record.relevanceScores.length;
      platformEffectiveness[record.source] = 
        (platformEffectiveness[record.source] || 0) * 0.9 + avgScore * 0.1;
      totalScore += record.selfScore;
      count++;
    }

    const avgRelevance = count > 0 ? totalScore / count : 0;

    return {
      totalLearningRecords: this.learningRecords.length,
      activePatterns: this.patterns.size,
      avgRelevanceScore: avgRelevance,
      platformEffectiveness,
      selfImprovementRate: this.calculateImprovementRate()
    };
  }

  /**
   * Calculate improvement rate
   */
  private calculateImprovementRate(): number {
    if (this.learningRecords.length < 10) return 0;

    const recent = this.learningRecords.slice(-10);
    const old = this.learningRecords.slice(-20, -10);

    if (old.length === 0) return 0;

    const recentAvg = recent.reduce((a, r) => a + r.selfScore, 0) / recent.length;
    const oldAvg = old.reduce((a, r) => a + r.selfScore, 0) / old.length;

    return recentAvg - oldAvg;
  }

  /**
   * Get best performing platform
   */
  getBestPlatform(): string {
    const stats = this.getStats();
    let best = 'web';
    let bestScore = 0;

    for (const [platform, score] of Object.entries(stats.platformEffectiveness)) {
      if (score > bestScore) {
        bestScore = score;
        best = platform;
      }
    }

    return best;
  }

  /**
   * Get top queries for a platform
   */
  getTopQueries(platform: string, limit: number = 5): string[] {
    return this.learningRecords
      .filter(r => r.source === platform)
      .sort((a, b) => b.selfScore - a.selfScore)
      .slice(0, limit)
      .map(r => r.query);
  }

  /**
   * Get predictions for next search
   */
  async predictNextQuery(context: string): Promise<string[]> {
    const contextTokens = context.toLowerCase().split(/\s+/);
    const predictions: string[] = [];

    // Match against patterns
    for (const [key, pattern] of this.patterns) {
      if (pattern.type === 'query' && pattern.successRate > this.improvementThreshold) {
        const queryToken = key.replace('query_', '');
        
        // Check if token is related to context
        for (const token of contextTokens) {
          if (token.length > 3 && queryToken.includes(token)) {
            predictions.push(queryToken);
          }
        }
      }
    }

    return [...new Set(predictions)].slice(0, 5);
  }

  /**
   * Get knowledge synthesis
   */
  async synthesizeKnowledge(query: string): Promise<Record<string, any>> {
    const relevantRecords = this.learningRecords
      .filter(r => r.query.toLowerCase().includes(query.toLowerCase()))
      .slice(-20);

    if (relevantRecords.length === 0) {
      return { synthesis: 'No learning data available', confidence: 0 };
    }

    // Synthesize insights
    const allInsights = relevantRecords.flatMap(r => r.insights);
    const insightCounts = new Map<string, number>();
    
    for (const insight of allInsights) {
      insightCounts.set(insight, (insightCounts.get(insight) || 0) + 1);
    }

    // Get top insights
    const topInsights = Array.from(insightCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([insight]) => insight);

    const avgScore = relevantRecords.reduce((a, r) => a + r.selfScore, 0) / relevantRecords.length;

    return {
      synthesis: `Cross-platform analysis reveals: ${topInsights.join(', ')}`,
      confidence: avgScore,
      insights: topInsights,
      sources: relevantRecords.map(r => r.source),
      queryCount: relevantRecords.length
    };
  }

  /**
   * Clear learning data
   */
  async clear(): Promise<void> {
    this.learningRecords = [];
    this.patterns.clear();
    await this.saveState();
  }
}

// Export singleton
export const selfEvolutionEngine = SelfEvolutionEngine.getInstance();

export default SelfEvolutionEngine;