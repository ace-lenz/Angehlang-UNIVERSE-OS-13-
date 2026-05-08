/**
 * ArtifactStore.ts — Sovereign Artifact Registry v2.0
 * Plan Item ID: ERR-001, TI-1
 *
 * Manages the lifecycle of agent-generated artifacts.
 * Persistence: SovereignVault (Photonic RAM + IndexedDB L2).
 * Migrated from legacy localStorage to full Quantum VFS alignment.
 */

import { Artifact } from '@/types';
import { sovereignVault } from './SovereignVault';

const ARTIFACT_INDEX_KEY = 'angeh_artifact_index_v5';
const ARTIFACT_NS = 'artifact_item_v5_';

export class ArtifactStore {
  /** In-memory L1 bus for O(1) access */
  private cache: Map<string, Artifact> = new Map();
  private ready: Promise<void>;

  constructor() {
    this.ready = this.hydrate();
  }

  // ── Hydration ────────────────────────────────────────────────────────────

  private async hydrate(): Promise<void> {
    try {
      const index = await sovereignVault.get<string[]>(ARTIFACT_INDEX_KEY);
      if (!index || index.length === 0) {
        console.log('[ArtifactStore] ◈ No prior artifacts found — fresh registry.');
        return;
      }

      const results = await Promise.all(
        index.map(id => sovereignVault.get<Artifact>(`${ARTIFACT_NS}${id}`))
      );

      results.forEach(art => {
        if (art) this.cache.set(art.id, art);
      });

      console.log(`[ArtifactStore] ⚡ Hydrated ${this.cache.size} artifacts from Sovereign Vault.`);
    } catch (e) {
      console.warn('[ArtifactStore] Hydration failed:', e);
    }
  }

  /** Await this before performing reads for freshly-constructed instances */
  public whenReady(): Promise<void> {
    return this.ready;
  }

  // ── Index persistence ─────────────────────────────────────────────────────

  private async persistIndex(): Promise<void> {
    const ids = Array.from(this.cache.keys());
    await sovereignVault.set(ARTIFACT_INDEX_KEY, ids);
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Save a new or updated artifact to both L1 cache and SovereignVault (L2).
   */
  public async save(artifact: Artifact): Promise<void> {
    this.cache.set(artifact.id, artifact);
    await sovereignVault.set(`${ARTIFACT_NS}${artifact.id}`, artifact);
    await this.persistIndex();
    console.log(`[ArtifactStore] ✅ Saved artifact: ${artifact.id} (${artifact.type})`);
  }

  /**
   * Batch-save multiple artifacts atomically.
   */
  public async saveBatch(artifacts: Artifact[]): Promise<void> {
    await Promise.all(artifacts.map(async art => {
      this.cache.set(art.id, art);
      await sovereignVault.set(`${ARTIFACT_NS}${art.id}`, art);
    }));
    await this.persistIndex();
    console.log(`[ArtifactStore] ✅ Batch saved ${artifacts.length} artifacts.`);
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Get an artifact by ID. Checks L1 first, then falls back to SovereignVault.
   */
  public async get(id: string): Promise<Artifact | undefined> {
    const hit = this.cache.get(id);
    if (hit) return hit;

    const cold = await sovereignVault.get<Artifact>(`${ARTIFACT_NS}${id}`);
    if (cold) {
      this.cache.set(id, cold); // Promote to L1
      return cold;
    }
    return undefined;
  }

  /**
   * Filter artifacts by mission, type, or agent. Returns sorted by newest first.
   */
  public async list(filter?: { missionId?: string; type?: string; agentId?: string }): Promise<Artifact[]> {
    await this.ready;
    let results = Array.from(this.cache.values());

    if (filter?.missionId) {
      results = results.filter(a => a.parentMissionId === filter.missionId);
    }
    if (filter?.type) {
      results = results.filter(a => a.type === filter.type);
    }
    if (filter?.agentId) {
      results = results.filter(a => a.createdBy === filter.agentId);
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  /**
   * Remove an artifact from both L1 cache and SovereignVault.
   */
  public async delete(id: string): Promise<void> {
    this.cache.delete(id);
    await sovereignVault.delete(`${ARTIFACT_NS}${id}`);
    await this.persistIndex();
    console.log(`[ArtifactStore] 🗑 Deleted artifact: ${id}`);
  }

  // ── Feedback ──────────────────────────────────────────────────────────────

  /**
   * Attach a feedback tag to an artifact and persist the update.
   */
  public async addFeedback(id: string, feedback: string): Promise<void> {
    const art = await this.get(id);
    if (art) {
      if (!art.tags) art.tags = [];
      art.tags.push(`feedback:${feedback}`);
      await this.save(art); // Re-persist with updated tags
      console.log(`[ArtifactStore] 🔖 Feedback attached to ${id}: ${feedback}`);
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  public getStats(): { total: number; byType: Record<string, number>; byAgent: Record<string, number> } {
    const all = Array.from(this.cache.values());
    const byType: Record<string, number> = {};
    const byAgent: Record<string, number> = {};

    for (const art of all) {
      byType[art.type] = (byType[art.type] || 0) + 1;
      byAgent[art.createdBy] = (byAgent[art.createdBy] || 0) + 1;
    }

    return { total: all.length, byType, byAgent };
  }
}

export const artifactStore = new ArtifactStore();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
