import { mcpTools } from '@/tools/MCPipeline';

interface Chunk {
  path: string;
  text: string;
  index: number;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
}

/**
 * SemanticIndex - Local codebase search and retrieval engine.
 * Supports keyword retrieval and acts as a foundation for RAG.
 * Persistence: LocalStorage (Quantum Brain Layer).
 */
export class SemanticIndex {
  private static STORAGE_KEY = 'angeh_semantic_index_v4';
  private chunks: Chunk[] = [];
  private invertedIndex: Map<string, number[]> = new Map(); // word -> [chunk_indices]

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      const data = localStorage.getItem(SemanticIndex.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.chunks = parsed.chunks || [];
        // Rebuild word map from chunks if not persisted
        this.rebuildInvertedIndex();
        console.log(`[SemanticIndex] Hydrated ${this.chunks.length} chunks.`);
      }
    } catch (e) {
      console.warn('[SemanticIndex] Hydration failed:', e);
    }
  }

  private persist() {
    try {
      const obj = { chunks: this.chunks };
      localStorage.setItem(SemanticIndex.STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error('[SemanticIndex] Persistence failed:', e);
    }
  }

  private rebuildInvertedIndex() {
    this.invertedIndex.clear();
    this.chunks.forEach((chunk, idx) => {
      const words = this.tokenize(chunk.text);
      words.forEach(word => {
        if (!this.invertedIndex.has(word)) this.invertedIndex.set(word, []);
        this.invertedIndex.get(word)!.push(idx);
      });
    });
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/[^a-z0-9]/).filter(w => w.length > 2);
  }

  /**
   * Index the entire codebase
   */
  public async indexProject(root = 'src'): Promise<void> {
    console.log(`[SemanticIndex] Indexing project from: ${root}`);
    this.chunks = [];
    await this.scanDir(root);
    this.rebuildInvertedIndex();
    this.persist();
    console.log(`[SemanticIndex] Project indexing complete. ${this.chunks.length} chunks generated.`);
  }

  private async scanDir(path: string) {
    const directory = await mcpTools.callTool('list_directory', { path });
    for (const entry of directory.entries) {
      const fullPath = `${path}/${entry.name}`;
      if (entry.type === 'folder') {
        await this.scanDir(fullPath);
      } else if (/\.(ts|tsx|js|jsx|py|md|html)$/.test(entry.name)) {
        await this.indexFile(fullPath);
      }
    }
  }

  private async indexFile(path: string) {
    try {
        const { content } = await mcpTools.callTool('read_file', { path });
        // Chunking by segments of ~500 words with 10% overlap
        const words = content.split(/\s+/);
        const chunkSize = 400;
        const overlap = 50;

        for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
            const segment = words.slice(i, i + chunkSize).join(' ');
            if (segment.length > 20) {
                this.chunks.push({
                    path,
                    text: segment,
                    index: this.chunks.length
                });
            }
        }
    } catch (e) {
        console.warn(`[SemanticIndex] Failed to index ${path}:`, e);
    }
  }

  /**
   * Search for top-k relevant snippets
   */
  public search(query: string, k = 5): SearchResult[] {
    const queryWords = this.tokenize(query);
    const scores: Map<number, number> = new Map();

    queryWords.forEach(word => {
        const matchingIndices = this.invertedIndex.get(word);
        if (matchingIndices) {
            matchingIndices.forEach(idx => {
                scores.set(idx, (scores.get(idx) || 0) + 1);
            });
        }
    });

    const sortedIndices = Array.from(scores.keys())
        .sort((a, b) => (scores.get(b) || 0) - (scores.get(a) || 0))
        .slice(0, k);

    return sortedIndices.map(idx => ({
        chunk: this.chunks[idx],
        score: (scores.get(idx) || 0) / (queryWords.length || 1)
    }));
  }
}

export const semanticIndex = new SemanticIndex();
