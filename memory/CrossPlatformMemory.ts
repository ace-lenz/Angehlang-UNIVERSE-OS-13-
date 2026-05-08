/**
 * CrossPlatformMemory.ts
 * 
 * Links knowledge across platforms and synthesizes cross-platform insights.
 * Tracks relationships between information from different sources.
 * 
 * Features:
 * - Cross-platform knowledge linking
 * - Knowledge synthesis
 * - Source relationships
 * - Insight aggregation
 * 
 * Zeta+ Performance: Real-time cross-platform synthesis
 */

import { sovereignVault } from '@/storage/SovereignVault';
import { PlatformSearchResult } from '@/agents/PlatformSearchAgent';

export interface KnowledgeNode {
  id: string;
  content: string;
  source: string;
  url?: string;
  timestamp: number;
  connections: string[];
  importance: number;
}

export interface CrossPlatformLink {
  id: string;
  sourcePlatforms: string[];
  query: string;
  synthesizedContent: string;
  keyInsights: string[];
  timestamp: number;
  effectiveness: number;
}

export interface KnowledgeSynthesis {
  query: string;
  synthesis: string;
  sources: string[];
  crossPlatformLinks: Record<string, string[]>;
  timestamp: number;
}

export class CrossPlatformMemory {
  private static instance: CrossPlatformMemory;
  private knowledgeNodes: Map<string, KnowledgeNode> = new Map();
  private crossPlatformLinks: Map<string, CrossPlatformLink> = new Map();
  private initialized: boolean = false;
  private readonly MAX_NODES = 2000;
  private readonly MAX_LINKS = 500;

  private constructor() {
    this.loadState();
  }

  static getInstance(): CrossPlatformMemory {
    if (!CrossPlatformMemory.instance) {
      CrossPlatformMemory.instance = new CrossPlatformMemory();
    }
    return CrossPlatformMemory.instance;
  }

  /**
   * Load state from SovereignVault
   */
  private async loadState(): Promise<void> {
    try {
      const nodes = await sovereignVault.get<Record<string, KnowledgeNode>>('knowledge_nodes');
      const links = await sovereignVault.get<Record<string, CrossPlatformLink>>('crossplatform_links');
      
      if (nodes) {
        for (const [key, value] of Object.entries(nodes)) {
          this.knowledgeNodes.set(key, value);
        }
      }
      
      if (links) {
        for (const [key, value] of Object.entries(links)) {
          this.crossPlatformLinks.set(key, value);
        }
      }
      
      this.initialized = true;
      console.log('[CrossPlatformMemory] Hydrated:', {
        nodes: this.knowledgeNodes.size,
        links: this.crossPlatformLinks.size
      });
    } catch (e) {
      console.warn('[CrossPlatformMemory] Load state failed:', e);
      this.initialized = true;
    }
  }

  /**
   * Save state to SovereignVault
   */
  private async saveState(): Promise<void> {
    try {
      const nodesObj: Record<string, KnowledgeNode> = {};
      for (const [key, value] of this.knowledgeNodes) {
        nodesObj[key] = value;
      }
      
      const linksObj: Record<string, CrossPlatformLink> = {};
      for (const [key, value] of this.crossPlatformLinks) {
        linksObj[key] = value;
      }
      
      await sovereignVault.set('knowledge_nodes', nodesObj);
      await sovereignVault.set('crossplatform_links', linksObj);
    } catch (e) {
      console.warn('[CrossPlatformMemory] Save state failed:', e);
    }
  }

  /**
   * Process and link cross-platform results
   */
  async processCrossPlatform(
    query: string,
    platformResults: Record<string, PlatformSearchResult[]>
  ): Promise<CrossPlatformLink> {
    const timestamp = Date.now();
    const platforms = Object.keys(platformResults).filter(p => platformResults[p]?.length > 0);
    
    if (platforms.length === 0) {
      throw new Error('No results to process');
    }
    
    // Create or update knowledge nodes for each platform
    const nodeIds: string[] = [];
    
    for (const [platform, results] of Object.entries(platformResults)) {
      if (!results || results.length === 0) continue;
      
      for (const result of results.slice(0, 5)) {
        const nodeId = await this.createKnowledgeNode(result, platform);
        nodeIds.push(nodeId);
      }
    }
    
    // Create cross-platform link
    const linkId = `cpl_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    const synthesizedContent = this.synthesizeContent(query, platformResults);
    const keyInsights = this.extractKeyInsights(platformResults);
    const effectiveness = this.calculateLinkEffectiveness(platformResults);
    
    const link: CrossPlatformLink = {
      id: linkId,
      sourcePlatforms: platforms,
      query,
      synthesizedContent,
      keyInsights,
      timestamp,
      effectiveness
    };
    
    this.crossPlatformLinks.set(linkId, link);
    
    // Update knowledge node connections
    for (const nodeId of nodeIds) {
      const node = this.knowledgeNodes.get(nodeId);
      if (node) {
        const otherNodes = nodeIds.filter(id => id !== nodeId);
        node.connections = [...new Set([...node.connections, ...otherNodes])];
      }
    }
    
    // Trim if needed
    if (this.knowledgeNodes.size > this.MAX_NODES) {
      const oldestNodes = Array.from(this.knowledgeNodes.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.knowledgeNodes.size - this.MAX_NODES);
      
      for (const [key] of oldestNodes) {
        this.knowledgeNodes.delete(key);
      }
    }
    
    if (this.crossPlatformLinks.size > this.MAX_LINKS) {
      const oldestLinks = Array.from(this.crossPlatformLinks.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.crossPlatformLinks.size - this.MAX_LINKS);
      
      for (const [key] of oldestLinks) {
        this.crossPlatformLinks.delete(key);
      }
    }
    
    // Save periodically
    if (this.crossPlatformLinks.size % 5 === 0) {
      await this.saveState();
    }
    
    console.log('[CrossPlatformMemory] Created cross-platform link:', {
      platforms: platforms.length,
      nodes: nodeIds.length,
      effectiveness: effectiveness.toFixed(2)
    });
    
    return link;
  }

  /**
   * Create knowledge node from result
   */
  private async createKnowledgeNode(result: PlatformSearchResult, platform: string): Promise<string> {
    const nodeId = `kn_${platform}_${result.link?.substring(0, 30) || Math.random().toString(36).substr(2, 9)}`;
    
    const node: KnowledgeNode = {
      id: nodeId,
      content: `${result.title} ${result.snippet}`.substring(0, 500),
      source: platform,
      url: result.link,
      timestamp: Date.now(),
      connections: [],
      importance: result.score || 0.5
    };
    
    this.knowledgeNodes.set(nodeId, node);
    
    return nodeId;
  }

  /**
   * Synthesize content from results
   */
  private synthesizeContent(query: string, results: Record<string, PlatformSearchResult[]>): string {
    const allResults = Object.values(results).flat().slice(0, 10);
    
    if (allResults.length === 0) {
      return `No results found for "${query}"`;
    }
    
    const titles = allResults.map(r => r.title).join('; ');
    const platforms = Object.keys(results).filter(p => results[p]?.length > 0);
    
    return `Cross-platform synthesis for "${query}": Found ${allResults.length} results across ${platforms.join(', ')}. Key resources: ${titles}`;
  }

  /**
   * Extract key insights from results
   */
  private extractKeyInsights(results: Record<string, PlatformSearchResult[]>): string[] {
    const insights: string[] = [];
    
    // Platform count insight
    const platformCount = Object.keys(results).filter(p => results[p]?.length > 0).length;
    insights.push(`multi_platform_${platformCount}`);
    
    // Content type insights
    for (const [platform, platformResults] of Object.entries(results)) {
      if (!platformResults || platformResults.length === 0) continue;
      
      for (const result of platformResults.slice(0, 3)) {
        if (result.link?.includes('github.com')) {
          insights.push('code_reference');
        }
        if (result.link?.includes('youtube.com')) {
          insights.push('video_reference');
        }
        if (result.link?.includes('stackoverflow.com')) {
          insights.push('qa_reference');
        }
        if (result.link?.includes('reddit.com')) {
          insights.push('community_reference');
        }
      }
    }
    
    return [...new Set(insights)];
  }

  /**
   * Calculate link effectiveness
   */
  private calculateLinkEffectiveness(results: Record<string, PlatformSearchResult[]>): number {
    let score = 0;
    let count = 0;
    
    for (const [platform, platformResults] of Object.entries(results)) {
      if (platformResults && platformResults.length > 0) {
        count++;
        
        // Platform contribution
        score += 0.2;
        
        // Results contribution
        const avgScore = platformResults.reduce((a, r) => a + (r.score || 0.5), 0) / platformResults.length;
        score += avgScore * 0.1;
      }
    }
    
    // Multi-platform bonus
    if (count > 1) {
      score += 0.1;
    }
    
    return Math.min(1, score);
  }

  /**
   * Get knowledge synthesis for query
   */
  async getSynthesis(query: string): Promise<KnowledgeSynthesis | null> {
    // Find matching links
    const links = Array.from(this.crossPlatformLinks.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter(link => link.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
    
    if (links.length === 0) {
      return null;
    }
    
    // Synthesize from links
    const sources = links.flatMap(l => l.sourcePlatforms);
    const crossPlatformLinks: Record<string, string[]> = {};
    
    for (const link of links) {
      for (const platform of link.sourcePlatforms) {
        if (!crossPlatformLinks[platform]) {
          crossPlatformLinks[platform] = [];
        }
        crossPlatformLinks[platform].push(link.synthesizedContent);
      }
    }
    
    return {
      query,
      synthesis: links.map(l => l.synthesizedContent).join('\n---\n'),
      sources: [...new Set(sources)],
      crossPlatformLinks,
      timestamp: links[0].timestamp
    };
  }

  /**
   * Get related knowledge nodes
   */
  getRelatedNodes(nodeId: string, limit: number = 10): KnowledgeNode[] {
    const node = this.knowledgeNodes.get(nodeId);
    if (!node) return [];
    
    const relatedIds = node.connections.slice(0, limit);
    const related: KnowledgeNode[] = [];
    
    for (const id of relatedIds) {
      const relatedNode = this.knowledgeNodes.get(id);
      if (relatedNode) {
        related.push(relatedNode);
      }
    }
    
    return related;
  }

  /**
   * Search knowledge nodes
   */
  searchKnowledgeNodes(query: string, limit: number = 10): KnowledgeNode[] {
    const queryLower = query.toLowerCase();
    
    return Array.from(this.knowledgeNodes.values())
      .filter(node => 
        node.content.toLowerCase().includes(queryLower) ||
        node.source.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  }

  /**
   * Get stats
   */
  getStats(): Record<string, any> {
    const platformCounts = new Map<string, number>();
    
    for (const node of this.knowledgeNodes.values()) {
      const count = platformCounts.get(node.source) || 0;
      platformCounts.set(node.source, count + 1);
    }
    
    return {
      totalNodes: this.knowledgeNodes.size,
      totalLinks: this.crossPlatformLinks.size,
      platformCounts: Object.fromEntries(platformCounts),
      recentLinks: Array.from(this.crossPlatformLinks.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5).map(l => ({ query: l.query, platforms: l.sourcePlatforms }))
    };
  }

  /**
   * Clear all data
   */
  async clear(): Promise<void> {
    this.knowledgeNodes.clear();
    this.crossPlatformLinks.clear();
    await this.saveState();
    
    console.log('[CrossPlatformMemory] Cleared all data');
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
export const crossPlatformMemory = CrossPlatformMemory.getInstance();

export default CrossPlatformMemory;