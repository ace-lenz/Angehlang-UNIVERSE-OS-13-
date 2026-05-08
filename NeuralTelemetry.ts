// Plan Item ID: TI-1
/**
 * NeuralTelemetry.ts
 * 
 * Real-time event stream for Sovereign Omni-Prime architecture.
 * Bridges core inference metrics to the high-fidelity UI dashboards.
 */

import { sovereignVault } from '../storage/SovereignVault';

export interface FaultEntry {
  id: string;
  timestamp: number;
  service: string;
  message: string;
  severity: 'warn' | 'error' | 'critical';
  resolved: boolean;
  cureAttempted?: boolean;
}

export interface NeuralVitals {
  synapticLoad: number;
  quantumFlux: number;
  photonicUsage: number;
  latencyMs: number;
  activeNeurons: number;
  vaultKeys: number;
  vaultSizeKB: number;
  status: 'OPTIMAL' | 'LOAD' | 'CRITICAL';
  faultLogs: FaultEntry[];
}

type TelemetryListener = (vitals: NeuralVitals) => void;

class NeuralTelemetryHub {
  private listeners: Set<TelemetryListener> = new Set();
  private currentVitals: NeuralVitals = {
    synapticLoad: 12,
    quantumFlux: 432.1,
    photonicUsage: 18,
    latencyMs: 45,
    activeNeurons: 1024,
    vaultKeys: 0,
    vaultSizeKB: 0,
    status: 'OPTIMAL',
    faultLogs: []
  };

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Subscribes to the real-time telemetry stream.
   */
  public subscribe(listener: TelemetryListener) {
    this.listeners.add(listener);
    listener(this.currentVitals); // Initial pulse
    return () => { this.listeners.delete(listener); };
  }

  /**
   * Propagates a new neural pulse to all listeners.
   */
  public broadcast(update: Partial<NeuralVitals>) {
    this.currentVitals = { ...this.currentVitals, ...update };
    
    // Evaluate status
    if (this.currentVitals.synapticLoad > 90 || this.currentVitals.faultLogs.some(f => f.severity === 'critical' && !f.resolved)) {
      this.currentVitals.status = 'CRITICAL';
    }
    else if (this.currentVitals.synapticLoad > 70 || this.currentVitals.faultLogs.some(f => f.severity === 'error' && !f.resolved)) {
      this.currentVitals.status = 'LOAD';
    }
    else {
      this.currentVitals.status = 'OPTIMAL';
    }

    this.listeners.forEach(l => l(this.currentVitals));
  }

  /**
   * Centralized Fault Logger
   */
  public logFault(service: string, message: string, severity: FaultEntry['severity'] = 'error') {
    const fault: FaultEntry = {
      id: `FAULT_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      service,
      message,
      severity,
      resolved: false
    };

    console.warn(`[NeuralTelemetry::FAULT] [${service}] (${severity}): ${message}`);
    
    const updatedFaults = [fault, ...this.currentVitals.faultLogs].slice(0, 50);
    this.broadcast({ faultLogs: updatedFaults });
    
    return fault.id;
  }

  public recordFault(serviceOrFault: string | any, message?: string, severity: any = 'error') {
    if (typeof serviceOrFault === 'object' && serviceOrFault !== null) {
      const { service, source, message: msg, severity: sev } = serviceOrFault;
      return this.logFault(service || source || 'unknown', msg || 'No message', this.mapSeverity(sev));
    }
    return this.logFault(String(serviceOrFault), message || '', this.mapSeverity(severity));
  }

  private mapSeverity(sev: any): FaultEntry['severity'] {
    if (!sev) return 'error';
    const s = String(sev).toLowerCase();
    if (s === 'low' || s === 'warn' || s === 'warning') return 'warn';
    if (s === 'critical' || s === 'high') return 'critical';
    return 'error';
  }

  /**
   * Generic Neural Activity Logger
   */
  public log(service: string, message: string) {
    console.log(`[NeuralTelemetry::LOG] [${service}]: ${message}`);
    // Optionally broadcast if we want this in the UI later
  }

  public resolveFault(id: string) {
    const updatedFaults = this.currentVitals.faultLogs.map(f => 
       f.id === id ? { ...f, resolved: true } : f
    );
    this.broadcast({ faultLogs: updatedFaults });
  }

  public clearFaults() {
    this.broadcast({ faultLogs: [] });
  }

  /**
   * Simulated Photonic Heartbeat
   */
  private startHeartbeat() {
    setInterval(() => {
      this.broadcast({
        synapticLoad: 10 + Math.random() * 8,
        quantumFlux: 432.1 + (Math.random() * 2 - 1),
        photonicUsage: 15 + Math.random() * 5
      });
    }, 3000);

    // Vault diagnostics every 30 seconds
    setInterval(async () => {
      const { keys, estimatedBytes } = await sovereignVault.getSize();
      this.broadcast({
        vaultKeys: keys,
        vaultSizeKB: Math.round(estimatedBytes / 1024)
      });
    }, 30000);

    // Initial vault read on startup
    sovereignVault.getSize().then(({ keys, estimatedBytes }) => {
      this.broadcast({
        vaultKeys: keys,
        vaultSizeKB: Math.round(estimatedBytes / 1024)
      });
    });
  }

  public getSnapshot() {
    return { ...this.currentVitals };
  }
}

export const neuralTelemetry = new NeuralTelemetryHub();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
