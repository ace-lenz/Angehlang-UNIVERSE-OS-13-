/**
 * AutonomousOrchestrator.ts
 * 
 * The self-healing center of Angehlang OS. 
 * Detects failures in generated artifacts and autonomously attempts 
 * logical repairs within isolated container environments.
 */

import { containerSystem } from './UniversalContainerSystem';
import { sovereignLogic } from './SovereignLogicCore';
import { neuralTelemetry } from './NeuralTelemetry';

export interface ValidationReport {
  status: 'OPTIMAL' | 'REPAIRED' | 'CRITICAL';
  originalError?: string;
  repairedCode?: string;
  repairAttempted: boolean;
}

class AutonomousOrchestrator {
  private isRepairing: boolean = false;
  private logs: string[] = [];

  /**
   * Orchestrates the full validation and repair cycle for a block of code.
   */
  public async orchestrate(code: string, context: string): Promise<ValidationReport> {
    this.log(`Attempting validation for artifact: "${context.substring(0, 30)}..."`);
    
    // 1. Initial Sandbox Validation
    try {
      await this.validateInSandbox(code);
      this.log('✅ Validation Optimal. No anomalies detected.');
      return { status: 'OPTIMAL', repairAttempted: false };
    } catch (err: any) {
      this.log(`⚠️ Anomalous signal detected: ${err.message}`);
      this.isRepairing = true;
      neuralTelemetry.broadcast({ status: 'LOAD', synapticLoad: 85 });

      // 2. Attempt Autonomous Repair
      try {
        const repairedCode = await this.repairLogic(code, err.message, context);
        
        // 3. Re-validate Repaired Code
        await this.validateInSandbox(repairedCode);
        
        this.log('✨ Autonomous Repair Successful. Logic Restored.');
        this.isRepairing = false;
        neuralTelemetry.broadcast({ status: 'OPTIMAL' });
        
        return { 
          status: 'REPAIRED', 
          originalError: err.message, 
          repairedCode, 
          repairAttempted: true 
        };
      } catch (repairErr: any) {
        this.log(`❌ Recursive failure in repair attempt: ${repairErr.message}`);
        this.isRepairing = false;
        neuralTelemetry.broadcast({ status: 'CRITICAL', synapticLoad: 98 });
        
        return { 
          status: 'CRITICAL', 
          originalError: err.message, 
          repairAttempted: true 
        };
      }
    }
  }

  /**
   * Dispatches code to an isolated container for runtime verification.
   */
  private async validateInSandbox(code: string): Promise<void> {
    await containerSystem.executeTask('EXECUTE_LOGIC', {
      code: `try { ${code}\n return true; } catch(e) { throw e; }`,
      input: {}
    });
  }

  /**
   * Uses the native SovereignLogicCore (Angehlang) to reason and repair.
   */
  private async repairLogic(code: string, error: string, context: string): Promise<string> {
    this.log(`[RepairAgent] Reasoning over failure vector...`);
    
    // The "Zeta+ Quantum" self-correction script
    const repairScript = `
      (begin
        (def error "${error.replace(/"/g, "'")}")
        (def context "${context.replace(/"/g, "'")}")
        
        (a2a-broadcast "SYNAPTIC_SCAN: Analyzing failure vector...")
        
        ; Using new conditional logic and agentic reasoning bridge
        (if (not (= error ""))
            (begin
              (a2a-broadcast "CRITICAL_ANOMALY: Triggering Zeta-Reasoning...")
              (def repair-plan (zeta-reason (begin 
                  "Fix this code error: " error 
                  " in context: " context 
                  " Original code: " "${code.replace(/"/g, "'")}"
              )))
              (a2a-broadcast "REPAIR_MATRIX_SYNTHESIZED")
              repair-plan
            )
            "No error detected. Logic stable.")
      )
    `;

    // In deep production, this leverages the upgraded functional core
    const result = await sovereignLogic.runScript(repairScript);
    
    this.log(`[RepairAgent] Synthesis Result: ${typeof result === 'string' ? result.substring(0, 50) : 'Binary Flow'}...`);
    
    // Fallback if reasoning returns null or hasn't changed
    return typeof result === 'string' ? result : code;
  }

  private log(msg: string) {
    const entry = `[SAO] ${new Date().toLocaleTimeString()} :: ${msg}`;
    console.log(entry);
    this.logs.push(entry);
    if (this.logs.length > 50) this.logs.shift();
  }

  public clearLogs() {
    this.logs = [];
  }

  public getStatus() {
    return {
      isRepairing: this.isRepairing,
      logs: [...this.logs]
    };
  }
}

export const autonomousOrchestrator = new AutonomousOrchestrator();
