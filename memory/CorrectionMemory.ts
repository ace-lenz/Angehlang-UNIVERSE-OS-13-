// Plan Item ID: TI-1
/**
 * CorrectionMemory.ts — v6.0
 * Error pattern memory system. Records failure cases, tracks recurring bugs,
 * and provides pre-emptive warnings before similar issues re-occur.
 */

export interface ErrorRecord {
  id: string;
  pattern: string;     // brief description of what went wrong
  context: string;     // instruction or query that caused the error
  resolution: string;  // how it was fixed (if known)
  severity: 'low' | 'medium' | 'high' | 'critical';
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  tags: string[];
}

export interface CorrectionSuggestion {
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  warning?: string;
  relatedErrors: ErrorRecord[];
}

const STORAGE_KEY = 'angehl_correction_memory_v6';

export class CorrectionMemory {
  private records: Map<string, ErrorRecord> = new Map();

  constructor() {
    this.load();
  }

  /** Record a new error or increment an existing one */
  record(params: {
    pattern: string;
    context: string;
    resolution?: string;
    severity?: ErrorRecord['severity'];
    tags?: string[];
  }): ErrorRecord {
    const key = this.makeKey(params.pattern);
    const existing = this.records.get(key);

    if (existing) {
      existing.occurrences++;
      existing.lastSeen = Date.now();
      if (params.resolution) existing.resolution = params.resolution;
      if (params.severity === 'critical' || params.severity === 'high') existing.severity = params.severity;
      this.persist();
      return existing;
    }

    const record: ErrorRecord = {
      id: crypto.randomUUID(),
      pattern: params.pattern,
      context: params.context.slice(0, 300),
      resolution: params.resolution ?? 'Unknown — under investigation.',
      severity: params.severity ?? 'medium',
      occurrences: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      tags: params.tags ?? [],
    };

    this.records.set(key, record);
    this.persist();
    return record;
  }

  /** Check if the current input matches any known error patterns */
  checkInput(input: string): CorrectionSuggestion {
    const matches: ErrorRecord[] = [];
    const inputLower = input.toLowerCase();

    this.records.forEach(rec => {
      const patternLower = rec.pattern.toLowerCase();
      const contextLower = rec.context.toLowerCase();
      // Simple heuristic: check for substring overlap
      const words = patternLower.split(/\s+/).filter(w => w.length > 4);
      const hit = words.some(w => inputLower.includes(w));
      if (hit) matches.push(rec);
    });

    if (matches.length === 0) return { riskLevel: 'none', relatedErrors: [] };

    const topSeverity = matches.map(m => m.severity)
      .sort((a, b) => ['critical','high','medium','low'].indexOf(a) - ['critical','high','medium','low'].indexOf(b))[0];

    const riskMap: Record<string, CorrectionSuggestion['riskLevel']> = {
      critical: 'high',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    return {
      riskLevel: riskMap[topSeverity],
      warning: `⚠️ Similar pattern to ${matches.length} known error(s). Review before proceeding.`,
      relatedErrors: matches.slice(0, 5),
    };
  }

  getTopErrors(limit = 10): ErrorRecord[] {
    return Array.from(this.records.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, limit);
  }

  /** Retrieve formatted strings of relevant past errors and their resolutions */
  async retrieveRelevantExamples(prompt: string, limit = 3): Promise<string[]> {
    const suggestion = this.checkInput(prompt);
    let matches = suggestion.relatedErrors;
    
    if (matches.length === 0) {
      // If no direct matches, return some top recurring errors as general context
      matches = this.getTopErrors(limit).filter(e => e.severity === 'high' || e.severity === 'critical');
    }
    
    return matches.slice(0, limit).map(m => 
      `ERROR PATTERN: ${m.pattern}\nCONTEXT: ${m.context}\nRESOLUTION: ${m.resolution}`
    );
  }

  getById(id: string): ErrorRecord | null {
    return Array.from(this.records.values()).find(r => r.id === id) ?? null;
  }

  clear(): void {
    this.records.clear();
    localStorage.removeItem(STORAGE_KEY);
  }

  stats(): { total: number; critical: number; recurring: number } {
    const all = Array.from(this.records.values());
    return {
      total: all.length,
      critical: all.filter(r => r.severity === 'critical').length,
      recurring: all.filter(r => r.occurrences > 2).length,
    };
  }

  private makeKey(pattern: string): string {
    return pattern.toLowerCase().replace(/\s+/g, '_').slice(0, 64);
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.records.entries())));
    } catch (_) {}
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      this.records = new Map(JSON.parse(raw));
    } catch (_) {
      this.records = new Map();
    }
  }
}

export const correctionMemory = new CorrectionMemory();

export function getSimilarFailures(pattern: string, limit = 5): ErrorRecord[] {
  return correctionMemory.checkInput(pattern).relatedErrors.slice(0, limit);
}

export function addFix(pattern: string, context: string, resolution: string): ErrorRecord {
  return correctionMemory.record({ pattern, context, resolution, severity: 'high' });
}

export function getMemory(): ErrorRecord[] {
  return Array.from((correctionMemory as any).records.values());
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
