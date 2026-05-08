// Plan Item ID: TI-1
import { sovereignVault } from './SovereignVault';
import { mcpTools } from '@/tools/MCPipeline';
import { DimensionMapper, vectorToDimensions } from './DimensionMapper';
import { upeEngine } from '@/engine/UnifiedProcessingEngine';

export interface WikiNode {
  id: string;
  title: string;
  content: string;
  tags: string[];
  outboundLinks: string[];
  createdAt: number;
  lastEdited: number;
}

export class SovereignWikiEngine {
  private static WIKI_PREFIX = 'obsidian_v1_';
  private static TOC_KEY = 'obsidian_v1_TOC'; // Master Index

  /**
   * Automatically parses [[Link]] syntax from a markdown payload
   */
  private extractLinks(content: string): string[] {
    const rx = /\[\[(.*?)\]\]/g;
    const links: string[] = [];
    let match;
    while ((match = rx.exec(content)) !== null) {
      links.push(match[1].trim());
    }
    return Array.from(new Set(links));
  }

  /**
   * Persists or updates a markdown node.
   */
  public async upsertNode(title: string, content: string, tags: string[] = []): Promise<WikiNode> {
    const safeId = title.toLowerCase().replace(/\s+/g, '-');
    const key = `${SovereignWikiEngine.WIKI_PREFIX}${safeId}`;
    
    // Auto-link context before saving
    const linkedContent = await this.applyAutoLinks(content);
    
    const node: WikiNode = {
      id: safeId,
      title,
      content: linkedContent,
      tags,
      outboundLinks: this.extractLinks(linkedContent),
      createdAt: Date.now(),
      lastEdited: Date.now()
    };

    const existing = await sovereignVault.get<WikiNode>(key);
    if (existing) {
      node.createdAt = existing.createdAt;
      if (existing.content === linkedContent && JSON.stringify(existing.tags) === JSON.stringify(tags)) {
        return existing; 
      }
    }

    await sovereignVault.set(key, node);
    await this.updateTOC(safeId, title);
    
    return node;
  }

  /**
   * Deletes a node and prunes it from the TOC
   */
  public async deleteNode(title: string): Promise<void> {
    const safeId = title.toLowerCase().replace(/\s+/g, '-');
    const key = `${SovereignWikiEngine.WIKI_PREFIX}${safeId}`;
    await sovereignVault.delete(key);
    
    const toc = await sovereignVault.get<Record<string, string>>(SovereignWikiEngine.TOC_KEY) || {};
    delete toc[safeId];
    await sovereignVault.set(SovereignWikiEngine.TOC_KEY, toc);
    console.log(`[WikiEngine] Pruned node: [[${title}]]`);
  }

  /**
   * Automatically wraps known node titles in [[Links]]
   */
  private async applyAutoLinks(content: string): Promise<string> {
    const toc = await sovereignVault.get<Record<string, string>>(SovereignWikiEngine.TOC_KEY) || {};
    let processed = content;
    
    // Sort keys by length descending to prevent partial matches (e.g. 'React' inside 'React Hooks')
    const titles = Object.values(toc).sort((a, b) => b.length - a.length);
    
    for (const title of titles) {
      // Regex to find title not already inside [[ ]] or [ ]()
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(`(?<!\\[\\[|\\()${escapedTitle}(?!\\]\\]|\\))`, 'gi');
      processed = processed.replace(rx, `[[${title}]]`);
    }
    
    return processed;
  }

  /**
   * Reads a Markdown node. If it doesn't exist in Vault, it falls back to native filesystem defaults.
   */
  public async getNode(title: string): Promise<WikiNode | null> {
    const safeId = title.toLowerCase().replace(/\s+/g, '-');
    const key = `${SovereignWikiEngine.WIKI_PREFIX}${safeId}`;
    
    let node = await sovereignVault.get<WikiNode>(key);
    
    // Fallback bootstrapper: Load physical files if vault misses
    if (!node) {
      try {
         const { content } = await mcpTools.callTool('read_file', { path: `src/wiki/${safeId}.md` });
         if (content) {
            node = await this.upsertNode(title, content, ['system-seed']);
         }
      } catch (e) {
         // Silently fail if explicitly not found natively
      }
    }
    return node || null;
  }

  /**
   * Manage the Master Index (Table of Contents) for O(1) Graph mapping
   */
  private async updateTOC(id: string, title: string) {
    const toc = await sovereignVault.get<Record<string, string>>(SovereignWikiEngine.TOC_KEY) || {};
    toc[id] = title;
    await sovereignVault.set(SovereignWikiEngine.TOC_KEY, toc);
  }

  /**
   * Get all available Nodes for the Graph View
   */
  public async getAllNodesMetadata() {
    const toc = await sovereignVault.get<Record<string, string>>(SovereignWikiEngine.TOC_KEY) || {};
    return Object.entries(toc).map(([id, title]) => ({ id, title }));
  }

  /**
   * Search within the Markdown Vault explicitly
   */
  public async searchVault(query: string): Promise<WikiNode[]> {
    const toc = await sovereignVault.get<Record<string, string>>(SovereignWikiEngine.TOC_KEY) || {};
    const results: WikiNode[] = [];
    const qLower = query.toLowerCase();

    for (const id of Object.keys(toc)) {
      const node = await sovereignVault.get<WikiNode>(`${SovereignWikiEngine.WIKI_PREFIX}${id}`);
      if (node && (node.content.toLowerCase().includes(qLower) || node.title.toLowerCase().includes(qLower))) {
        results.push(node);
      }
    }
    return results;
  }

  /**
   * Quantum-Accelerated Vault Search
   * Bridges the Wiki Vault with QuantumBrainStorage for O(√N) retrieval.
   */
  public async quantumSearchVault(query: string): Promise<WikiNode[]> {
    console.log('%c[WikiEngine] ⚛️ Quantum-Accelerated Vault Search Triggered...', 'color: #f59e0b;');
    try {
      const { QuantumBrainStorage } = await import('@/engine/inference/QuantumBrainStorage');
      const memories = await QuantumBrainStorage.quantumAcceleratedLookup(query, 10);
      
      const results: WikiNode[] = [];
      for (const m of memories) {
        const node = await this.getNode(m.id);
        if (node) results.push(node);
      }
      
      return results.length > 0 ? results : this.searchVault(query);
    } catch (e) {
      console.warn('[WikiEngine] Quantum search failed:', e);
      return this.searchVault(query);
    }
  }

  /**
   * Photonic Wiki Search: Use UPE logic trajectory for high-speed cross-linking
   */
  public async photonicSearch(query: string): Promise<{ results: WikiNode[]; trajectory: any }> {
    const vector = DimensionMapper.createSemanticVector({
      intentDomain: 'wiki_search',
      promptKey: query,
      moteScore: 0.85,
      zetaScalar: 1.0,
      coherence: 0.95,
      quality: 0.9,
      performance: 0.85,
      latency: 3
    });

    const dims = vectorToDimensions(vector);
    
    const bundle = `(PH_ENTANGLE_MAP "${query}" (PH_WDM_ENCODE ${dims.Wavelength || 1550}))`;
    const trajectory = await upeEngine.dispatch('logic', bundle, 'photonic');

    const toc = await sovereignVault.get<Record<string, string>>(SovereignWikiEngine.TOC_KEY) || {};
    const results: WikiNode[] = [];
    const qLower = query.toLowerCase();

    for (const id of Object.keys(toc)) {
      const node = await sovereignVault.get<WikiNode>(`${SovereignWikiEngine.WIKI_PREFIX}${id}`);
      if (node) {
        const score = this.calculateRelevanceScore(node, query, dims);
        if (score > 0.3) {
          (node as any).relevanceScore = score;
          results.push(node);
        }
      }
    }

    results.sort((a, b) => ((b as any).relevanceScore || 0) - ((a as any).relevanceScore || 0));
    
    console.log(`[WikiEngine] ⚡ Photonic Search: ${results.length} matches | Trajectory: ${trajectory.fidelity?.toFixed(4)}`);
    
    return { results: results.slice(0, 10), trajectory };
  }

  private calculateRelevanceScore(node: WikiNode, query: string, dims: Record<string, number>): number {
    const qLower = query.toLowerCase();
    let score = 0;
    
    if (node.title.toLowerCase().includes(qLower)) score += 0.4;
    if (node.content.toLowerCase().includes(qLower)) score += 0.3;
    if (node.tags.some(t => qLower.includes(t))) score += 0.2;
    
    score *= (dims.Coherence || 0.8);
    
    return score;
  }

  /**
   * Efficiently discover all nodes linking TO a specific title.
   */
  public async getBacklinks(targetTitle: string): Promise<string[]> {
    const toc = await sovereignVault.get<Record<string, string>>(SovereignWikiEngine.TOC_KEY) || {};
    const backlinks: string[] = [];
    
    // In a real Zeta+ v13.0, we'd use a dedicated inverted index, 
    // but for now we'll do an optimized map scan.
    for (const id of Object.keys(toc)) {
      const node = await sovereignVault.get<WikiNode>(`${SovereignWikiEngine.WIKI_PREFIX}${id}`);
      if (node && node.title !== targetTitle && node.outboundLinks.includes(targetTitle)) {
        backlinks.push(node.title);
      }
    }
    return backlinks;
  }

  /**
   * Same as saveNode but with new naming convention
   */
  public async saveNode(title: string, content: string, tags: string[] = []): Promise<WikiNode> {
     return this.upsertNode(title, content, tags);
  }

  /**
   * L3 MASSIVE INGESTION (Zeta+ Protocol)
   * Recursively crawls a FileSystemDirectoryHandle and manifests nodes.
   */
  public async ingestExternalFolder(dirHandle: FileSystemDirectoryHandle, path: string = ''): Promise<number> {
    let count = 0;
    try {
      for await (const entry of (dirHandle as any).values()) {
        const fullPath = path ? `${path}/${entry.name}` : entry.name;
        
        if (entry.kind === 'file') {
          // Filter for knowledge-rich formats
          if (entry.name.endsWith('.md') || entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.json')) {
            const file = await (entry as FileSystemFileHandle).getFile();
            const text = await file.text();
            
            // Manifest as a Sovereign Node
            const nodeTitle = entry.name.endsWith('.md') ? entry.name.replace('.md', '') : fullPath;
            await this.upsertNode(nodeTitle, text, ['l3-ingested', 'external-ref']);
            count++;
          }
        } else if (entry.kind === 'directory') {
          count += await this.ingestExternalFolder(entry, fullPath);
        }
      }
    } catch (e) {
      console.error('[WikiEngine] L3 Ingestion Failed for path:', path, e);
    }
    return count;
  }
}

export const sovereignWiki = new SovereignWikiEngine();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
