/**
 * SovereignVault.ts
 * 
 * High-performance browser-native storage layer.
 * Shifted completely to Photonic RAM (In-Memory Map) 
 * to bypass physical SSD bottlenecks as requested.
 */

import { neuralTelemetry } from '@/engine/NeuralTelemetry';

export class SovereignVault {
  // Pure Photonic RAM / In-Memory Map (L1 Cache)
  private vault: Map<string, any> = new Map();
  private dbName = 'sovereign_quantum_db_v1';
  private storeName = 'quantum_store';
  private isHydrated = false;

  constructor() {
    this.hydrate();
  }

  static getInstance(): SovereignVault {
    return sovereignVault;
  }

  /**
   * Safe persistence of any data object to the Photonic RAM vault and L2 IndexedDB.
   */
  public async set(key: string, val: any): Promise<void> {
    this.vault.set(key, val);
    
    // Asynchronously sync to L2 Persistence with Quantization
    try {
      let finalVal = val;
      if (typeof val === 'string' && val.length > 512) {
        finalVal = {
          _isQuantized: true,
          _data: await this.compress(val)
        };
      } else if (typeof val === 'object' && val !== null) {
        // Quantize JSON blobs
        const str = JSON.stringify(val);
        if (str.length > 1024) {
           finalVal = {
             _isQuantized: true,
             _isJson: true,
             _data: await this.compress(str)
           };
        }
      }

      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.put(finalVal, key);
    } catch (e: any) {
      console.warn('[SovereignVault] Persistence sync failed:', e);
      neuralTelemetry.logFault('Vault', `Persistence sync failed for [${key}]: ${e.message || String(e)}`, 'warn');
    }
  }

  /**
   * Retrieves data from the vault (L1 -> L2 Fallback).
   */
  public async get<T>(key: string): Promise<T | null> {
    const val = this.vault.get(key);
    if (val !== undefined) return val as T;

    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      let res = await this.requestToPromise<any>(store.get(key));

      if (res && res._isQuantized) {
        const decompressed = await this.decompress(res._data);
        res = res._isJson ? JSON.parse(decompressed) : decompressed;
      }

      if (res) {
        this.vault.set(key, res);
        return res as T;
      }
    } catch (e: any) {
      console.warn('[SovereignVault] L2 retrieval failed:', e);
      neuralTelemetry.logFault('Vault', `L2 retrieval failed for [${key}]: ${e.message || String(e)}`, 'error');
    }
    return null;
  }

  /**
   * Deletes a specific entry from both L1 and L2.
   */
  public async delete(key: string): Promise<void> {
    this.vault.delete(key);
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.delete(key);
    } catch (e) {
      console.warn('[SovereignVault] Deletion sync failed:', e);
    }
  }

  /**
   * Returns all keys in the L1 Photonic RAM vault.
   */
  public getKeys(): string[] {
    return Array.from(this.vault.keys());
  }

  /**
   * Lightspeed Quantization (CompressionStream)
   */
  private async compress(text: string): Promise<ArrayBuffer> {
     const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
     return await new Response(stream).arrayBuffer();
  }

  private async decompress(buffer: ArrayBuffer): Promise<string> {
     const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream('gzip'));
     return await new Response(stream).text();
  }

  private async hydrate() {
    if (this.isHydrated) return;
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const keysReq = store.getAllKeys();
      const valsReq = store.getAll();
      const keys = await this.requestToPromise<string[]>(keysReq);
      const vals = await this.requestToPromise<any[]>(valsReq);
      
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let val = vals[i];
        if (val && val._isQuantized) {
           const decompressed = await this.decompress(val._data);
           val = val._isJson ? JSON.parse(decompressed) : decompressed;
        }
        this.vault.set(key, val);
      }
      this.isHydrated = true;
      console.log(`[SovereignVault] ◈ Photonic RAM Hydrated [QUANTIZED]. ${this.vault.size} nodes manifested.`);
    } catch (e) {
      console.warn('[SovereignVault] Hydration sequence failed.', e);
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private requestToPromise<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async listKeys(): Promise<string[]> {
    return Array.from(this.vault.keys());
  }

  public async getOrSet<T>(key: string, defaultFn: () => T): Promise<T> {
    const existing = await this.get<T>(key);
    if (existing !== null) return existing;
    const fresh = defaultFn();
    await this.set(key, fresh);
    return fresh;
  }

  public async getAll(): Promise<Record<string, any>> {
    return Object.fromEntries(this.vault);
  }

  public async getSize(): Promise<{ keys: number; estimatedBytes: number }> {
    const all = await this.getAll();
    const json = JSON.stringify(all);
    return {
      keys: this.vault.size,
      estimatedBytes: new Blob([json]).size
    };
  }
}

export const sovereignVault = new SovereignVault();
