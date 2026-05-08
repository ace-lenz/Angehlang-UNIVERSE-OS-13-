// Plan Item ID: TI-1
/**
 * QuantumState.ts — High-Frequency State Synchronizer
 * 
 * Optimized for React state synchronization using SovereignVault as the persistence layer.
 * Implements a publish-subscribe pattern with fine-grained reactivity to avoid 
 * unnecessary re-renders in complex studio environments.
 */

import { sovereignVault } from './SovereignVault';

type StateListener<T> = (value: T) => void;

export class QuantumState<T> {
  private value: T;
  private listeners: Set<StateListener<T>> = new Set();
  private key: string;

  constructor(key: string, initialValue: T) {
    this.key = key;
    this.value = initialValue;
    this.hydrate();
  }

  private async hydrate() {
    try {
      const saved = await sovereignVault.get<T>(`quantum_state_${this.key}`);
      if (saved !== undefined) {
        this.value = saved;
        this.notify();
      }
    } catch (e) {
      console.warn(`[QuantumState] Hydration failed for ${this.key}:`, e);
    }
  }

  public get(): T {
    return this.value;
  }

  public async set(newValue: T | ((prev: T) => T)) {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(this.value) 
      : newValue;
    
    if (nextValue === this.value) return;

    this.value = nextValue;
    this.notify();

    // Background persistence
    try {
      await sovereignVault.set(`quantum_state_${this.key}`, nextValue);
    } catch (e) {
      console.error(`[QuantumState] Persistence failed for ${this.key}:`, e);
    }
  }

  public subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.value));
  }

  /**
   * React Hook Integration
   * Returns a hook that can be used within React components to subscribe to this state.
   */
  public useStore() {
    const [state, setState] = (require('react') as typeof import('react')).useState(this.value);
    
    (require('react') as typeof import('react')).useEffect(() => {
      return this.subscribe(setState);
    }, []);

    return [state, (val: T) => this.set(val)] as const;
  }
}

/**
 * Global Quantum State Registry
 */
class StateRegistry {
  private stores: Map<string, QuantumState<any>> = new Map();

  public getStore<T>(key: string, initialValue: T): QuantumState<T> {
    if (!this.stores.has(key)) {
      this.stores.set(key, new QuantumState<T>(key, initialValue));
    }
    return this.stores.get(key) as QuantumState<T>;
  }
}

export const stateRegistry = new StateRegistry();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
