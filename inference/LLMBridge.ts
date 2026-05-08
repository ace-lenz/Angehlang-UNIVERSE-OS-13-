// Plan Item ID: TI-1
/**
 * LLMBridge.ts — Native Studio Router Integration
 * Routes all prompts through native Angehlang studsios
 */

import { correctionMemory, sovereignWeightsCore, QuantumBrainStorage } from '@/memory';
import { AngehlangStudioRouter, StudioType } from '../AngehlangStudioRouter';
import { SovereignQuantumProcessingUnit as SovereignQPPU } from './SovereignQPPU';

let isOnline = true;
let lastPingTime = 0;

async function checkOnline(): Promise<boolean> {
  const now = Date.now();
  if (now - lastPingTime < 5000) return isOnline;
  
  lastPingTime = now;
  const router = AngehlangStudioRouter.getInstance();
  isOnline = router.isReadyStatus();
  return isOnline;
}

export async function directLlmGenerate(payload: any) {
  let content = '';
  
  try {
    if (!(await checkOnline())) {
      throw new Error('Angehlang Native Engine offline');
    }

    const promptStr = payload.prompt.toLowerCase();
    
    // ═══ Cognitive Persona ═══
    let mode = 'GENERAL_WISDOM';
    let sysDirectives = 'You are the Sovereign Omni-Prime Kernel. Never hallucinate. Answer based on facts.';
    let temperature = 0.3;

    if (promptStr.includes('calculate') || promptStr.match(/[0-9]+[+\-*/^][0-9]+/)) {
      mode = 'MATH';
      sysDirectives = 'Execute precise mathematical calculations.';
      temperature = 0.05;
    } else if (promptStr.includes('code') || promptStr.includes('function')) {
      mode = 'CODE';
      sysDirectives = 'Generate complete, working code. No stubs.';
      temperature = 0.2;
    } else if (promptStr.includes('image') || promptStr.includes('draw')) {
      mode = 'IMAGE';
      sysDirectives = 'Generate detailed visual descriptions.';
    } else if (promptStr.includes('video') || promptStr.includes('animation')) {
      mode = 'VIDEO';
      sysDirectives = 'Generate video/animation specifications.';
    } else if (promptStr.includes('book') || promptStr.includes('write') || promptStr.includes('article')) {
      mode = 'BOOK';
      sysDirectives = 'Generate complete text, documents, or books.';
    }

    console.log(`[LLMBridge] Mode: ${mode}`);

    // ═══ Get Context from Native Systems ═══
    let context = '';
    
    // Quantum Brain recall
    try {
      const qp = new SovereignQPPU();
      await qp.boot();
      const queryVec = await qp.generateHyperVector(payload.prompt);
      const memories = await QuantumBrainStorage.associativeLookup(payload.prompt, 4, queryVec.data);
      if (memories?.length) {
        context += '\n=== KNOWLEDGE ===\n';
        context += memories.map(m => `• ${m.content}`).join('\n');
        context += '\n';
      }
    } catch(e) {}
    
    // Corrections
    try {
      const corrections = await correctionMemory.retrieveRelevantExamples(payload.prompt, 2);
      if (corrections?.length) {
        context += '\n=== AVOID ===\n';
        context += corrections.join('\n');
        context += '\n';
      }
    } catch(e) {}
    
    // Weights core knowledge
    try {
      if (sovereignWeightsCore?.isReady?.()) {
        const { enhancedInput } = sovereignWeightsCore.process(payload.prompt);
        if (enhancedInput !== payload.prompt) {
          context += '\n' + enhancedInput;
        }
      }
    } catch(e) {}

    const fullPrompt = context + '\nQuery: ' + payload.prompt;

    // ═══ Route to Native Studio ═══
    const router = AngehlangStudioRouter.getInstance();
    const routeInfo = router.route(fullPrompt);
    const outputText = await router.handlePrompt(fullPrompt);
    
    content = outputText;

    // ═══ Store to Memory ═══
    try {
      const qp = new SovereignQPPU();
      await qp.boot();
      const vec = await qp.generateHyperVector(`Query: ${payload.prompt}\nResponse: ${content}`);
      await QuantumBrainStorage.indexContent(
        `mem_${Date.now()}`,
        `Query: ${payload.prompt}\nResponse: ${content}`,
        { mode, studio: routeInfo.type },
        vec.data
      );
    } catch(e) {}

  } catch(e) {
    console.warn('[LLMBridge] Error:', e);
    isOnline = false;
    content = `[Native Error] ${e}`;
  }

  // Clean response
  if (content) {
    content = content.replace(/^```[\w]*\n/i, '').replace(/\n```\s*$/i, '');
  }
  
  return { ok: true, json: async () => ({ content, response: content }) };
}
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
