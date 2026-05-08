import { DiffusionRequest, DiffusionResult, DiffusionMode } from '../DiffusionTypes';
import { sovereignDiffusionHub } from '../SovereignDiffusionHub';

/**
 * StudioDiffusionAdapter — Base contract for integrating studios with Omni-Diffusion System.
 * Includes mandatory verification for Law XIV compliance.
 */

export interface AdapterManifest {
  studioId: string;
  studioName: string;
  supportedCores: DiffusionMode[];
  inputModalities: {
    text: boolean;
    image: boolean;
    video: boolean;
    audio: boolean;
    code: boolean;
    sensorData: boolean;
  };
  maxInputSize: {
    text?: number | { maxChars: number };
    image?: { width: number; height: number };
    audio?: { durationSeconds: number };
    video?: { width: number; height: number; durationSeconds: number };
    code?: { maxTokens: number };
  };
  outputFormat: string;
  progressiveOutput: boolean;
  maxLatencyMs: number;
  subMillisecondRequired: boolean;
  asyncStreaming: boolean;
  peakMemoryMB: number;
  needsGPU: boolean;
  webWorkerCompatible: boolean;
  offlineFallback: boolean;
  fullySelfHosted: boolean;
  binaryDNAStorage: boolean;
  a2aBridge: 'direct-memory' | 'shared-arraybuffer' | 'message-passing' | 'message-channel' | 'none';
  multiNodeSupport: boolean;
  broadcastStatus: boolean;
  errorHandling: 'retry' | 'fallback' | 'notify';
  telemetryEvents: string[];
  signOutput: boolean;
}

export abstract class StudioDiffusionAdapter {
  abstract readonly studioId: string;
  abstract readonly defaultMode: DiffusionMode;
  protected abstract readonly studioName: string;
  protected abstract readonly primaryCore: string;

  public abstract verify(): AdapterManifest;

  public async requestSynthesis(prompt: string, options: Partial<DiffusionRequest> = {}): Promise<DiffusionResult> {
    console.log(`[DiffusionAdapter:${this.studioId}] Synthesis request — ${prompt.substring(0, 30)}...`);
    const request: DiffusionRequest = {
      prompt,
      mode: options.mode ?? this.defaultMode,
      ...options,
      contextId: this.studioId
    };
    return sovereignDiffusionHub.diffuse(request);
  }

  public validate(input: any): boolean {
    if (!input) return false;
    if (typeof input === 'string' && input.trim().length === 0) return false;
    return true;
  }

  protected handleError(error: Error, context?: any): DiffusionResult {
    console.error(`[${this.studioName}] Error:`, error.message);
    return {
      description: `[${this.studioName}] Diffusion failed: ${error.message}`,
      files: [],
      metadata: { core: this.primaryCore, mode: this.defaultMode, seed: 0, steps: 0, timestamp: Date.now(), version: '1.0.0' },
      telemetry: { latencyMs: 0, synapticLoad: 0, vramSimulated: 0, nodeId: 'ERROR_HANDLER' }
    };
  }

  protected formatOutput(result: DiffusionResult): any {
    return { studio: this.studioName, description: result.description, files: result.files, metadata: result.metadata, telemetry: result.telemetry };
  }

  public getStudioName(): string { return this.studioName; }
  public getPrimaryCore(): string { return this.primaryCore; }

  public abstract process(input: any): Promise<DiffusionResult>;
  protected abstract mapToStudioData(result: DiffusionResult): any;
}

export function validateAdapter(adapter: StudioDiffusionAdapter): AdapterManifest {
  const manifest = adapter.verify();
  
  if (!manifest.supportedCores.length) {
    throw new Error(`Adapter ${manifest.studioName} supports no diffusion core`);
  }
  
  if (!manifest.fullySelfHosted) {
    throw new Error(`Adapter ${manifest.studioName} is not fully self-hosted - violates Law XIV`);
  }
  
  if (!manifest.binaryDNAStorage) {
    throw new Error(`Adapter ${manifest.studioName} does not support Binary DNA Storage`);
  }
  
  return manifest;
}

export function validateAllAdapters(adapters: StudioDiffusionAdapter[]): AdapterManifest[] {
  const reports: AdapterManifest[] = [];
  for (const adapter of adapters) {
    const report = validateAdapter(adapter);
    console.log(`[Validation] ${report.studioName}: ${report.supportedCores.join(', ')}`);
    reports.push(report);
  }
  return reports;
}