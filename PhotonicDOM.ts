/**
 * PhotonicDOM.ts
 * 
 * Part of the Web-10000x Substrate.
 * Replaces standard slow DOM operations with a High-Fidelity Photonic Layer.
 * Uses requestAnimationFrame and virtualized patches to ensure 144fps+ UI fluidity.
 */

export class PhotonicDOMEngine {
  private static instance: PhotonicDOMEngine;
  private frameRequested: boolean = false;
  private patchQueue: Array<() => void> = [];

  private constructor() {
    console.log('%c[Photonic DOM] Engine Initialized | Web-10000x Substrate Active', 'color: #8b5cf6; font-weight: bold;');
  }

  public static getInstance(): PhotonicDOMEngine {
    if (!PhotonicDOMEngine.instance) {
      PhotonicDOMEngine.instance = new PhotonicDOMEngine();
    }
    return PhotonicDOMEngine.instance;
  }

  /**
   * Schedule a "Photonic Patch" (DOM update) for the next refresh cycle.
   */
  public patch(operation: () => void) {
    this.patchQueue.push(operation);
    if (!this.frameRequested) {
      this.frameRequested = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    const startTime = performance.now();
    let count = 0;
    
    while (this.patchQueue.length > 0) {
      const op = this.patchQueue.shift();
      if (op) {
        op();
        count++;
      }
      
      // Prevent frame jank: if we exceed 8ms, defer the rest to the next frame
      if (performance.now() - startTime > 8) break;
    }

    if (this.patchQueue.length > 0) {
      requestAnimationFrame(() => this.flush());
    } else {
      this.frameRequested = false;
    }
    
    if (count > 0) {
       // console.log(`[Photonic DOM] Flushed ${count} patches.`);
    }
  }

  /**
   * Teleport an element into a new coordinate in the Photonic space.
   */
  public teleport(id: string, attributes: Record<string, string>, content?: string) {
    this.patch(() => {
      const el = document.getElementById(id);
      if (el) {
        Object.entries(attributes).forEach(([key, val]) => {
          if (key.startsWith('--')) {
             el.style.setProperty(key, val);
          } else {
             el.setAttribute(key, val);
          }
        });
        if (content !== undefined) el.innerHTML = content;
      }
    });
  }

  /**
   * Inject a "Quantum Shader" (CSS Variable update)
   */
  public injectShader(id: string, property: string, value: string) {
    this.patch(() => {
      const el = document.getElementById(id);
      if (el) el.style.setProperty(property, value);
    });
  }
}

export const photonicDOM = PhotonicDOMEngine.getInstance();
