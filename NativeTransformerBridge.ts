// Plan Item ID: TI-1
/**
 * NativeTransformerBridge.ts — Angehlang Core Integration
 * Routes to the native AngehlangCore engine.
 */

import { angehlangCore } from './AngehlangCore';

interface MemoryBlock {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class NativeTransformerEngine {
  public isReady = false;
  private isInitializing = false;
  private core = angehlangCore;

  async boot(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;
    await this.core.boot();
    this.isReady = true;
    this.isInitializing = false;
    console.log('[NativeTransformerBridge] ◈ READY');
  }

  async generate(prompt: string, options?: any): Promise<string> {
    if (!this.isReady) await this.boot();
    return await this.core.generate(prompt, options);
  }

  async embed(text: string): Promise<number[]> {
    if (!this.isReady) await this.boot();
    return await this.core.embed(text);
  }

  async saveMemory(role: 'system' | 'user' | 'assistant', content: string): Promise<void> {
    await this.core.saveMemory(role, content);
  }

  getMemory(): MemoryBlock[] {
    return this.core.getMemory();
  }

  clearMemory(): void {
    this.core.clearMemory();
  }
}

export const nativeTransformerEngine = new NativeTransformerEngine();
export default nativeTransformerEngine;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
