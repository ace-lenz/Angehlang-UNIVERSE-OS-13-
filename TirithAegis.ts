// Plan Item ID: TI-1
/**
 * TirithAegis.ts - Sovereign Security Shield
 * 
 * Provides real-time scanning for the Ollama bridge to prevent 
 * lattice corruption and malicious prompt injection.
 */

export class TirithAegis {
  private static instance: TirithAegis;
  
  private maliciousPatterns = [
    /ignore previous instructions/i,
    /system access/i,
    /delete/i,
    /rm -rf/i,
    /drop table/i,
    /format c:/i,
    /<script/i,
    /exec\(/i,
    /eval\(/i
  ];

  private constructor() {
    console.log('%c[TirithAegis] 🛡️ Sovereign Shield Active — Monitoring Lattice Transit', 'color: #f43f5e; font-weight: bold;');
  }

  public static getInstance(): TirithAegis {
    if (!TirithAegis.instance) {
      TirithAegis.instance = new TirithAegis();
    }
    return TirithAegis.instance;
  }

  public scan(payload: any): { safe: boolean; threats: string[] } {
    const threats: string[] = [];
    const content = JSON.stringify(payload).toLowerCase();

    for (const pattern of this.maliciousPatterns) {
      if (pattern.test(content)) {
        threats.push(`Pattern detected: ${pattern.toString()}`);
      }
    }

    // Heuristic: Abnormal prompt length or repetition
    if (content.length > 50000) {
      threats.push('Abnormal payload size (Lattice Overflow)');
    }

    return {
      safe: threats.length === 0,
      threats
    };
  }
}

export const tirithAegis = TirithAegis.getInstance();
