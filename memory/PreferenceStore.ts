export interface PreferencePair {
  prompt: string;
  accepted: string;
  rejected: string[];
  timestamp: number;
}

/**
 * PreferenceStore - Gathers training data for local DPO fine-tuning.
 * Captures 'Best-of-3' outcomes and user approvals.
 */
export class PreferenceStore {
  private static STORAGE_KEY = 'angeh_preference_store_v4';
  private preferences: PreferencePair[] = [];

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    try {
      const data = localStorage.getItem(PreferenceStore.STORAGE_KEY);
      if (data) {
        this.preferences = JSON.parse(data);
        console.log(`[PreferenceStore] Hydrated ${this.preferences.length} training pairs.`);
      }
    } catch (e) {
      console.warn('[PreferenceStore] Hydration failed:', e);
    }
  }

  private persist() {
    try {
      localStorage.setItem(PreferenceStore.STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (e) {
      console.error('[PreferenceStore] Persistence failed:', e);
    }
  }

  /**
   * Log a preference pair
   */
  public log(prompt: string, accepted: string, rejected: string[]): void {
    const pair: PreferencePair = {
      prompt,
      accepted,
      rejected,
      timestamp: Date.now()
    };
    this.preferences.push(pair);
    this.persist();
    console.log(`[PreferenceStore] Logged DPO pair for prompt: ${prompt.substring(0, 30)}...`);
  }

  /**
   * Export the dataset as JSON
   */
  public exportDataset(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * Get all preferences
   */
  public getHistory(): PreferencePair[] {
    return [...this.preferences];
  }

  /**
   * Clear the store
   */
  public clear(): void {
    this.preferences = [];
    this.persist();
  }
}

export const preferenceStore = new PreferenceStore();
