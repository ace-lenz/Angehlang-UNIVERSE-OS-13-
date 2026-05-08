/**
 * PromptAuditEngine.ts — STRICT FIDELITY & RESPONSE AUDITOR
 * 
 * Intercepts agent responses to training prompts and audits them for
 * strict compliance with the 'Perfection' mandate.
 * 
 * Plan Item ID: TI-1
 */

import { neuralTelemetry } from './NeuralTelemetry';
import { perfectionistAgent } from '../agents/PerfectionistAgent';

export interface AuditResult {
  agentId: string;
  prompt: string;
  response: string;
  fidelityScore: number; // 0.0 to 1.0
  compliant: boolean;
  timestamp: number;
}

class PromptAuditEngine {
  private static instance: PromptAuditEngine;
  private auditHistory: AuditResult[] = [];
  private STRICT_THRESHOLD = 0.95; // Only 95%+ fidelity is accepted

  private constructor() {
    console.log('%c[PromptAudit] 🔍 STRICT FIDELITY MONITORING ACTIVE', 
      'color: #f43f5e; font-weight: bold;');
  }

  static getInstance(): PromptAuditEngine {
    if (!PromptAuditEngine.instance) {
      PromptAuditEngine.instance = new PromptAuditEngine();
    }
    return PromptAuditEngine.instance;
  }

  /**
   * Audits an agent's response to a specific training prompt.
   * If fidelity is below the threshold, it flags for immediate re-training.
   */
  public async auditResponse(agentId: string, prompt: string, response: string): Promise<AuditResult> {
    console.log(`[PromptAudit] ⚖️ Auditing ${agentId} response for strict compliance...`);
    
    // 1. Structural and Semantic Analysis
    const critique = await perfectionistAgent.enhancedCritique(response);
    const fidelityScore = critique.overallScore / 10; // Normalize 0-10 to 0-1
    
    const isCompliant = fidelityScore >= this.STRICT_THRESHOLD;

    const result: AuditResult = {
      agentId,
      prompt,
      response,
      fidelityScore,
      compliant: isCompliant,
      timestamp: Date.now()
    };

    this.auditHistory.push(result);
    if (this.auditHistory.length > 200) this.auditHistory.shift();

    if (!isCompliant) {
      console.warn(`[PromptAudit] ❌ STRICT COMPLIANCE FAILURE for ${agentId}. Fidelity: ${(fidelityScore * 100).toFixed(1)}%`);
      
      neuralTelemetry.recordFault({
        source: `PromptAudit:${agentId}`,
        severity: 'HIGH',
        message: `Strict fidelity audit failed (${(fidelityScore * 100).toFixed(1)}%). Response rejected.`,
        recoverable: true
      });
      
      // TRIGGER AUTOMATIC RETRY/RE-TRAINING (Simulation)
      this.triggerRecursiveRefinement(agentId, prompt);
    } else {
      console.log(`[PromptAudit] ✅ STRICT COMPLIANCE ACHIEVED for ${agentId}. Fidelity: ${(fidelityScore * 100).toFixed(1)}%`);
    }

    return result;
  }

  private triggerRecursiveRefinement(agentId: string, prompt: string) {
    // In a live system, this would call the agent's re-generation logic with the audit feedback
    console.log(`[PromptAudit] 🔄 Triggering Recursive Refinement for ${agentId}...`);
  }

  public getAuditHistory() {
    return this.auditHistory;
  }

  public getGlobalFidelity() {
    if (this.auditHistory.length === 0) return 1.0;
    return this.auditHistory.reduce((sum, r) => sum + r.fidelityScore, 0) / this.auditHistory.length;
  }
}

export const promptAuditEngine = PromptAuditEngine.getInstance();
