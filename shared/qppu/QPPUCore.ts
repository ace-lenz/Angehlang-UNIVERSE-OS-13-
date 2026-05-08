/**
 * QPPU Core - Placeholder
 */
export const qppuEngine = {
  activateQuantumMode: (mode: string) => console.log(`[QPPU] Activating ${mode} mode`),
  deactivate: () => {},
};

export interface QPPUConfig {
  mode?: string;
}

export interface ANGHVFrame {
  data: number[];
  timestamp: number;
}

export interface QPPURequest {
  operation: string;
  data: any;
}

export interface QPPUResponse {
  result: any;
  success: boolean;
}