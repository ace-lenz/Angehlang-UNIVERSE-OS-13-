// Plan Item ID: TI-1
/**
 * QPPU Types
 */

export interface QPPUConfig {
  dimensions: number;
  executionMode: 'quantum' | 'photonic' | 'classical' | 'adaptive';
  maxWorkers: number;
  workerThreads?: number;
}

export interface ANGHVFrame {
  id: string;
  dimensions: number[];
  data: any;
  timestamp: number;
  mode: string;
}

export interface QPPURequest {
  type: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high';
}

export interface QPPUResponse {
  success: boolean;
  frame?: ANGHVFrame;
  timing: number;
  mode: string;
  error?: string;
}

export type { ANGHVFrame as default };
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
