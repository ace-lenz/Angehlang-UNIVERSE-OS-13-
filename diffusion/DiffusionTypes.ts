// Plan Item ID: TI-1
import { VirtualFile } from '@/types';

/**
 * Omni-Diffusion System Types — v13.0 TRILLION-X Edition
 */

export type DiffusionMode = 'aesthetic' | 'temporal' | 'spatial' | 'abstract' | 'sovereign';
export type DiffusionCoreType = DiffusionMode;

export interface ArtifactFile extends VirtualFile {
  size?: number;
  mimeType?: string;
  blob?: Blob | string;
}

export interface DiffusionMetadata {
  core: string;
  mode: DiffusionMode;
  seed: number;
  steps: number;
  timestamp: number;
  version: string;
  parameters?: Record<string, any>;
}

export interface DiffusionTelemetry {
  latencyMs: number;
  synapticLoad: number;
  vramSimulated: number;
  nodeId: string;
}

export interface DiffusionResult {
  description: string;
  files: ArtifactFile[];
  metadata: DiffusionMetadata;
  telemetry: DiffusionTelemetry;
}

export interface DiffusionRequest {
  prompt: string;
  negativePrompt?: string;
  mode: DiffusionMode;
  steps?: number;
  seed?: number;
  guidance?: number;
  strength?: number;
  dimensions?: { width: number; height: number; depth?: number; duration?: number; };
  contextId?: string;
  complexity?: 'standard' | 'extensive' | 'extreme';
}

export interface DiffusionNodeStatus {
  id: string;
  status: 'idle' | 'busy' | 'offline';
  load: number;
  capabilities: DiffusionMode[];
}

export interface DiffusionNode {
  id: string;
  type: 'processing' | 'storage' | 'inference';
  capacity: number;
  status: 'active' | 'idle' | 'busy';
  cores: DiffusionCoreType[];
}

export interface DiffusionTask {
  id: string;
  request: DiffusionRequest;
  priority: number;
  assignedNode?: string;
}

export interface TelemetryReport {
  core: DiffusionCoreType;
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
}

export interface CoreHealth {
  core: DiffusionCoreType;
  status: 'healthy' | 'degraded' | 'unavailable';
  load: number;
  lastUsed: number;
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
