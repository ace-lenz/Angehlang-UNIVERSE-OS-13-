import { FileNode, Artifact, PatchOperation } from '@/types';
import { mcpTools } from '@/tools/MCPipeline';
import { codebaseTopology } from '@/storage/CodebaseTopology';
import { yoloGuard } from '@/components/agents/YoloGuard';
import { artifactStore } from '@/storage/ArtifactStore';
import { nativeNeuralCore } from '@/engine/NativeNeuralCore';

/**
 * ComposerAgent - The multi-file, multi-step code generation powerhouse.
 * Inspired by Cursor's Composer and Google's agentic philosophies.
 * Capable of autonomous patching and self-correction across the codebase.
 */
export class ComposerAgent {
  private yoloMode: boolean = false;

  constructor(yolo = false) {
    this.yoloMode = yolo;
  }

  public setYoloMode(enabled: boolean) {
    this.yoloMode = enabled;
  }

  /**
   * 1. Planning Layer: Determine which files need changing
   */
  public async planPatch(userRequest: string, contextSymbols: string[], llmCall: (prompt: string) => Promise<string>): Promise<PatchOperation[]> {
    console.log('[Composer] Planning patch for:', userRequest);
    
    // Get relevant files from Topology
    const nodes = codebaseTopology.getRelevantNodes(contextSymbols);
    const fileListWithSnippets = nodes.map(n => `PATH: ${n.path}\nSYMBOLS: ${n.exports.join(', ')}`).join('\n\n');

    const prompt = `
<|im_start|>system
You are the Composer – an elite agent that modifies multiple files simultaneously to achieve a mission.
Your authority: SENIOR ARCHITECT.
Context:
${fileListWithSnippets}

Mission: ${userRequest}

Output a strictly valid JSON array of PatchOperation objects:
[{ "file": "string", "operation": "replace" | "insertAfter" | "insertBefore" | "delete", "anchor": "string (optional)", "newCode": "string", "description": "string" }]

Rules:
1. Only target files provided in context.
2. Ensure types are preserved.
3. Be surgical – don't rewrite 1000 lines if 5 suffice.
<|im_end|>
<|im_start|>composer
`;

    const response = await (llmCall || nativeNeuralCore.generate.bind(nativeNeuralCore))(prompt);
    try {
      const jsonStr = response.includes('```json') ? response.split('```json')[1].split('```')[0] : response;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('[Composer] Failed to parse patch plan:', e);
      return [];
    }
  }

  /**
   * 2. Execution Layer: Apply patches to the filesystem
   */
  public async applyPatch(operations: PatchOperation[]): Promise<Artifact[]> {
    const results: Artifact[] = [];
    
    for (const op of operations) {
      console.log(`[Composer] Executing ${op.operation} on ${op.file}`);
      try {
        const { content: oldContent } = await mcpTools.callTool('read_file', { path: op.file });
        let newContent = oldContent;

        switch (op.operation) {
          case 'replace':
            newContent = op.newCode;
            break;
          case 'insertAfter':
            if (op.anchor) {
              const parts = oldContent.split(op.anchor);
              newContent = parts.join(op.anchor + '\n' + op.newCode);
            }
            break;
          case 'insertBefore':
            if (op.anchor) {
              const parts = oldContent.split(op.anchor);
              newContent = parts.join(op.newCode + '\n' + op.anchor);
            }
            break;
          case 'delete':
             if (op.anchor) {
                newContent = oldContent.replace(op.anchor, '');
             }
             break;
        }

        await mcpTools.callTool('write_file', { path: op.file, content: newContent });
        
        results.push({
          id: `patch_${Date.now()}_${op.file.replace(/\//g, '_')}`,
          type: 'code_diff',
          content: { file: op.file, description: op.description, change: op.operation },
          createdBy: 'Composer_Agent',
          timestamp: Date.now()
        });

      } catch (e) {
        console.error(`[Composer] Failed to patch ${op.file}:`, e);
      }
    }
    
    return results;
  }

  /**
   * 3. Verification Layer: Run tests and fix errors (YOLO Mode)
   */
  public async verifyAndFix(
    originalPrompt: string, 
    impactedFiles: string[],
    maxRetries = 2
  ): Promise<{ success: boolean; log: string }> {
    if (!this.yoloMode) return { success: true, log: 'Manual verification required.' };
    
    let currentRetry = 0;
    let lastError = '';

    while (currentRetry <= maxRetries) {
      console.log(`[Composer] YOLO Verification Cycle: ${currentRetry + 1}/${maxRetries + 1}`);
      
      // RUN TEST SUITE (via registered MCP tool)
      const testResult = await mcpTools.callTool('execute_code', { 
        code: `npm test ${impactedFiles.join(' ')}`, 
        language: 'bash' 
      });
      
      if (testResult.success) {
        console.log('[Composer] Verification PASSED.');
        return { success: true, log: testResult.output };
      }

      console.warn('[Composer] Verification FAILED. Activating YoloGuard...');
      lastError = testResult.output;
      
      if (!yoloGuard.isRecoverable(lastError)) {
        console.error('[Composer] Fatal error detected. Aborting repair.');
        return { success: false, log: lastError };
      }

      // Synthesize Repair Patch
      const repairPlan = await yoloGuard.analyzeAndFix(lastError, impactedFiles, originalPrompt);
      if (repairPlan.length === 0) {
        console.warn('[Composer] YoloGuard could not synthesize a repair. Aborting.');
        return { success: false, log: lastError };
      }

      // Apply Repair
      console.log(`[Composer] Applying repair patch (${repairPlan.length} operations)...`);
      const repairArtifacts = await this.applyPatch(repairPlan);
      repairArtifacts.forEach(a => artifactStore.save(a));

      currentRetry++;
    }
    
    return { success: false, log: `Max retries (${maxRetries}) exceeded. Last error: ${lastError}` };
  }
}

export const composerAgent = new ComposerAgent(true); // ENABLED BY DEFAULT PER USER REQUEST
