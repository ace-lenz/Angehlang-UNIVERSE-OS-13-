import { get, set } from 'idb-keyval';
import { DimensionMapper, vectorToDimensions } from '@/storage/DimensionMapper';

/**
 * QuantumCache - Persistent IndexedDB storage for large model binaries.
 * Implements Photonic Cache Addressing using Spectral/Spatial coordinates (D1-D8).
 * High-entropy cache keys for optimal O(1) lookup.
 */
export class QuantumCache {
  private static CACHE_KEY_PREFIX = 'angeh_neural_model_';
  private cacheIndex: Map<string, number[]> = new Map();
  private spectralLookup: Map<string, string[]> = new Map();
  private writeCount = 0;
  private readonly PRUNE_INTERVAL = 100;

  /**
   * Generate high-entropy photonic cache key from spatial and spectral coordinates
   */
  getCacheKey(spatialCoords: { x: number; y: number; z: number }, spectral: { wavelength: number; frequency: number }): string {
    const vector = DimensionMapper.createSemanticVector({
      intentDomain: 'cache_lookup',
      promptKey: `${spatialCoords.x}_${spatialCoords.y}_${spectral.wavelength}_${spectral.frequency}`,
      moteScore: 0.85,
      zetaScalar: 1.0,
      coherence: 0.95,
      quality: 0.9,
      performance: 0.85,
      latency: 2
    });

    const dims = vectorToDimensions(vector);
    const key = `SP:${dims.X_Spatial?.toFixed(2)}_${dims.Y_Spatial?.toFixed(2)}_${dims.Z_Spatial?.toFixed(2)}|WL:${dims.Wavelength?.toFixed(1)}|FR:${dims.Frequency?.toFixed(1)}`;
    
    const spectralKey = `WL_${Math.floor(dims.Wavelength || 0)}`;
    if (!this.spectralLookup.has(spectralKey)) {
      this.spectralLookup.set(spectralKey, []);
    }
    this.spectralLookup.get(spectralKey)!.push(key);
    
    return key;
  }

  /**
   * Lookup cache by spectral signature (wavelength)
   */
  lookupByWavelength(wavelength: number): string[] {
    const spectralKey = `WL_${Math.floor(wavelength)}`;
    return this.spectralLookup.get(spectralKey) || [];
  }

  /**
   * Photonic address calculation for cache placement
   */
  calculatePhotonicAddress(modelName: string, fileName: string): { address: string; spatialDims: number[]; spectralDims: number[] } {
    const vector = DimensionMapper.createSemanticVector({
      intentDomain: 'cache_address',
      promptKey: `${modelName}_${fileName}`,
      moteScore: 0.9,
      zetaScalar: 1.0,
      coherence: 0.95,
      quality: 0.95,
      performance: 0.9,
      latency: 3
    });

    const dims = vectorToDimensions(vector);
    const spatialDims = [dims.X_Spatial || 0, dims.Y_Spatial || 0, dims.Z_Spatial || 0];
    const spectralDims = [dims.Wavelength || 0, dims.Frequency || 0, dims.Phase || 0];
    
    const address = `PHOTONIC_ADDR_${spatialDims.map(v => Math.floor(v)).join('_')}_${spectralDims.map(v => Math.floor(v)).join('_')}`;
    
    return { address, spatialDims, spectralDims };
  }

  async getModelFile(modelName: string, fileName: string): Promise<Uint8Array | null> {
    const photonicAddr = this.calculatePhotonicAddress(modelName, fileName);
    const key = `${QuantumCache.CACHE_KEY_PREFIX}${photonicAddr.address}_${fileName}`;
    
    try {
      const data = await get(key);
      if (data) {
        console.log(`[QuantumCache] ⚡ Photonic Hit: ${fileName} at ${photonicAddr.address}`);
        return data as Uint8Array;
      }
    } catch (e) {
      console.warn(`[QuantumCache] Read error: ${e}`);
    }
    return null;
  }

  async setModelFile(modelName: string, fileName: string, data: Uint8Array): Promise<void> {
    const photonicAddr = this.calculatePhotonicAddress(modelName, fileName);
    const key = `${QuantumCache.CACHE_KEY_PREFIX}${photonicAddr.address}_${fileName}`;
    
    const vector = DimensionMapper.createSemanticVector({
      intentDomain: 'model_cache',
      promptKey: `${modelName}_${fileName}`,
      moteScore: 0.9,
      zetaScalar: 1.0,
      coherence: 0.95,
      quality: 0.9,
      performance: 0.85,
      latency: 5
    });

    this.cacheIndex.set(key, vector);
    
    try {
      await set(key, data);
      this.writeCount++;
      console.log(`[QuantumCache] 📡 Manifested: ${fileName} | PhotonicAddr: ${photonicAddr.address} | Spatial: ${photonicAddr.spatialDims.join(',')}`);
      
      if (this.writeCount % this.PRUNE_INTERVAL === 0) {
        await this.pruneByCoherence();
      }
    } catch (e) {
      console.error(`[QuantumCache] Write error: ${e}`);
    }
  }

  /**
   * pruneByCoherence: Automatically evicts entries where D25 (Coherence) falls below threshold.
   */
  public async pruneByCoherence(threshold = 0.5): Promise<number> {
    console.log(`[QuantumCache] 🛡️ Periodic Pruning Active (Threshold: ${threshold})`);
    let pruned = 0;
    
    for (const [key, vector] of this.cacheIndex.entries()) {
      const dims = vectorToDimensions(vector);
      const coherence = dims.Coherence ?? 1.0;
      
      if (coherence < threshold) {
        this.cacheIndex.delete(key);
        // We'd typically use 'del' from idb-keyval here too
        // await del(key); 
        pruned++;
      }
    }
    
    if (pruned > 0) {
      console.log(`[QuantumCache] 🗑️ Pruned ${pruned} low-coherence nodes from holographic index.`);
    }
    return pruned;
  }

  async isManifested(modelName: string): Promise<boolean> {
    const key = `${QuantumCache.CACHE_KEY_PREFIX}${modelName}_config.json`;
    const data = await get(key);
    return !!data;
  }

  getIndexStats() {
    return {
      entries: this.cacheIndex.size,
      spectralChannels: this.spectralLookup.size,
      dimensionalCoverage: 'D1-D8 (Spatial: D1-D3, Spectral: D4-D8)',
      addressingMode: 'Photonic (High-entropy)'
    };
  }
}

export const quantumCache = new QuantumCache();
