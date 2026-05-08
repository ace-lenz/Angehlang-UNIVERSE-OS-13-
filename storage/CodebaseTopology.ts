import { FileNode } from '@/types';
import { mcpTools } from '@/tools/MCPipeline';
import { DimensionMapper, vectorToDimensions } from './DimensionMapper';

/**
 * CodebaseTopology - A lightweight project symbol indexer.
 * Maps symbols (exports, imports, classes, functions) across the project.
 * Implements Optical Correlation: Maps folder structure to 50D spatial lattice (D1-D3).
 */
export interface SpatialLatticeEntry {
  x: number;
  y: number;
  z: number;
  density: number;
  churn: number;
}

export class CodebaseTopology {
  private static STORAGE_KEY = 'angeh_topology_v4';
  private nodes: Map<string, FileNode> = new Map();
  private spatialLattice: Map<string, SpatialLatticeEntry> = new Map();
  private churnMap: Map<string, number> = new Map(); // path -> modification count

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      const data = localStorage.getItem(CodebaseTopology.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        Object.entries(parsed).forEach(([path, node]) => {
          this.nodes.set(path, node as FileNode);
        });
        console.log(`[Topology] Hydrated ${this.nodes.size} file nodes.`);
      }
    } catch (e) {
      console.warn('[Topology] Hydration failed:', e);
    }
  }

  private persist() {
    try {
      const obj = Object.fromEntries(this.nodes);
      localStorage.setItem(CodebaseTopology.STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error('[Topology] Persistence failed:', e);
    }
  }

  /**
   * Scan the codebase recursively to build the topology
   */
  public async scanCodebase(root = 'src'): Promise<void> {
    console.log(`[Topology] Starting scan from: ${root}`);
    const directory = await mcpTools.callTool('list_directory', { path: root });
    
    for (const entry of directory.entries) {
      const fullPath = `${root}/${entry.name}`;
      if (entry.type === 'folder') {
        await this.scanCodebase(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        await this.indexFile(fullPath);
      }
    }
    
    this.persist();
    console.log(`[Topology] Scan complete. Total nodes: ${this.nodes.size}`);
  }

  /**
   * Index a single file using regex-based extraction
   */
  private async indexFile(path: string): Promise<void> {
    try {
      const { content } = await mcpTools.callTool('read_file', { path });
      
      const node: FileNode = {
        path,
        exports: this.extractMatches(content, /export\s+(?:function|class|const|interface|type|enum)\s+([a-zA-Z0-9_]+)/g),
        imports: this.extractMatches(content, /import\s+.*?\s+from\s+['"](.+?)['"]/g),
        classes: this.extractMatches(content, /class\s+([a-zA-Z0-9_]+)/g),
        functions: this.extractMatches(content, /function\s+([a-zA-Z0-9_]+)/g)
      };

      this.nodes.set(path, node);
      
      // Update Churn (D5: Frequency)
      const currentChurn = this.churnMap.get(path) || 0;
      this.churnMap.set(path, currentChurn + 1);
      
      console.log(`[Topology] Indexed: ${path} (${node.exports.length} exports) | Churn: ${currentChurn + 1}`);
    } catch (e) {
      console.warn(`[Topology] Failed to index ${path}:`, e);
    }
  }

  private extractMatches(content: string, regex: RegExp): string[] {
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) matches.push(match[1]);
    }
    return [...new Set(matches)];
  }

  /**
   * Find files that export a specific symbol
   */
  public findExporters(symbol: string): string[] {
    return Array.from(this.nodes.values())
      .filter(n => n.exports.includes(symbol))
      .map(n => n.path);
  }

  /**
   * Find files that import a specific module
   */
  public findImporters(modulePath: string): string[] {
    return Array.from(this.nodes.values())
      .filter(n => n.imports.some(i => i.includes(modulePath)))
      .map(n => n.path);
  }

  /**
   * Get all symbols for a task
   */
  public getRelevantNodes(symbols: string[]): FileNode[] {
    const relevant: Set<string> = new Set();
    symbols.forEach(s => {
      this.findExporters(s).forEach(p => relevant.add(p));
      this.findImporters(s).forEach(p => relevant.add(p));
    });
    return Array.from(relevant).map(p => this.nodes.get(p)!).filter(Boolean);
  }

  /**
   * Determine the transitive dependency cascade of changing a symbol
   */
  public getBlastRadius(symbol: string): string[] {
    const visited = new Set<string>();
    const queue: string[] = [symbol];
    
    while (queue.length) {
      const current = queue.shift()!;
      const exportingFiles = this.findExporters(current);
      
      for (const file of exportingFiles) {
        if (!visited.has(file)) {
          visited.add(file);
          
          const filename = file.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') || file;
          const importingFiles = this.findImporters(filename);
          
          for (const importer of importingFiles) {
            if (!visited.has(importer)) {
              visited.add(importer);
              const node = this.nodes.get(importer);
              if (node) {
                for (const sym of node.exports) {
                  if (sym !== current) queue.push(sym);
                }
              }
            }
          }
        }
      }
    }
    
    return Array.from(visited);
  }


  /**
   * Map folder structure to 50D spatial lattice (D1-D3) for dependency density visualization
   */
  public mapToSpatialLattice(folderPath: string): SpatialLatticeEntry {
    const vector = DimensionMapper.createSemanticVector({
      intentDomain: 'topology',
      promptKey: folderPath,
      moteScore: 0.8,
      zetaScalar: 1.0,
      coherence: 0.85,
      quality: 0.9,
      performance: 0.8,
      latency: 10,
      entropy: 5 + (folderPath.split('/').length * 2)
    });

    const dims = vectorToDimensions(vector);
    
    const x = dims.X_Spatial || 0;
    const y = dims.Y_Spatial || 0;
    const z = dims.Z_Spatial || 0;
    
    const filesInFolderArray = Array.from(this.nodes.values()).filter(n => n.path.startsWith(folderPath));
    const density = Math.min(filesInFolderArray.length / 50, 1);
    
    // Average churn in folder
    const avgChurn = filesInFolderArray.reduce((acc, n) => acc + (this.churnMap.get(n.path) || 0), 0) / (filesInFolderArray.length || 1);
    const churnScore = this.mapChurnColor(avgChurn);

    const latticeKey = folderPath;
    this.spatialLattice.set(latticeKey, { x, y, z, density, churn: churnScore });
    
    console.log(`[Topology] 📍 Spatial Mapping: ${folderPath} -> (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}) | Density: ${(density * 100).toFixed(1)}% | ChurnScore: ${churnScore.toFixed(2)}`);
    
    return { x, y, z, density, churn: churnScore };
  }

  /**
   * mapChurnColor: Maps average modification frequency to a color intensity score using D5 (Frequency)
   */
  public mapChurnColor(churn: number): number {
    const vector = DimensionMapper.createSemanticVector({
      intentDomain: 'churn',
      promptKey: `churn_${churn}`,
      moteScore: 0.8,
      zetaScalar: 1.0,
      coherence: 0.9,
      quality: 0.9,
      performance: 0.8,
      latency: 5,
      entropy: churn // Entropy maps to churn frequency
    });

    const dims = vectorToDimensions(vector);
    return dims.Frequency || 0.5;
  }

  /**
   * Get optical correlation between folders based on their spatial positions
   */
  public getOpticalCorrelation(pathA: string, pathB: string): number {
    const posA = this.spatialLattice.get(pathA) || this.mapToSpatialLattice(pathA);
    const posB = this.spatialLattice.get(pathB) || this.mapToSpatialLattice(pathB);
    
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    const dz = posA.z - posB.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    const correlation = Math.max(0, 1 - (distance / 1000));
    console.log(`[Topology] 🔗 Correlation: ${pathA} <-> ${pathB} = ${correlation.toFixed(4)}`);
    
    return correlation;
  }

  /**
   * Get all spatial lattice positions for visualization
   */
  public getSpatialLatticeMap(): Map<string, SpatialLatticeEntry> {
    return new Map(this.spatialLattice);
  }

  /**
   * Calculate dependency density for monitoring panel flux view
   */
  public getDependencyDensity(folderPath: string): number {
    const folderNodes = Array.from(this.nodes.values()).filter(n => n.path.startsWith(folderPath));
    let totalDeps = 0;
    
    for (const node of folderNodes) {
      totalDeps += node.imports.length + node.exports.length;
    }
    
    const fileCount = folderNodes.length || 1;
    const density = totalDeps / fileCount;
    
    return Math.min(density / 20, 1);
  }
}

export const codebaseTopology = new CodebaseTopology();
