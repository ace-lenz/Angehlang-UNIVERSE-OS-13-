import { PatchOperation, Artifact } from '@/types';
import { nativeNeuralCore } from '@/engine/NativeNeuralCore';

/**
 * YoloGuard - The Autonomous Error Repair Agent.
 * Specialized in parsing terminal output and synthesizing correction patches.
 */
export class YoloGuard {
  /**
   * Analyze an error log and propose a fix.
   */
  public async analyzeAndFix(
    errorLog: string, 
    contextFiles: string[], 
    originalPrompt: string
  ): Promise<PatchOperation[]> {
    console.log('[YoloGuard] Analyzing failure trace...');

    const prompt = `
<|im_start|>system
You are the YoloGuard – an elite autonomous repair agent.
Your mission: Analyze the following error log/stack trace and generate a REPAIR PATCH to fix the issue.
You have access to the codebase topology and recent artifacts.

Context Files: ${contextFiles.join(', ')}
Original Goal: ${originalPrompt}

Error Log:
${errorLog}

Output a strictly valid JSON array of PatchOperation objects to fix the error:
[{ "file": "string", "operation": "replace" | "insertAfter" | "insertBefore" | "delete", "anchor": "string", "newCode": "string", "description": "string" }]
<|im_end|>
<|im_start|>repair_agent
`;

    const response = await nativeNeuralCore.generate(prompt);

    try {
      if (!response || typeof response !== 'string') return [];
      const jsonStr = response.includes('```json') ? response.split('```json')[1].split('```')[0] : response;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('[YoloGuard] Failed to parse repair plan:', e);
      return [];
    }
  }

  /**
   * Determine if an error is "Recoverable" vs "Fatal".
   */
  public isRecoverable(errorLog: string): boolean {
    const fatalKeywords = ['Disk Full', 'Network Error', 'Out of Memory', 'Authentication Failed'];
    return !fatalKeywords.some(k => errorLog.includes(k));
  }
}

export const yoloGuard = new YoloGuard();
