/**
 * Test Native Fallback - When no external Ollama model is available,
 * the system should use native SovereignWeightsCore and QPPU
 */

import { angehlangCore } from './src/engine/AngehlangCore.js';

async function testNativeFallback() {
  console.log('%c⚡ NATIVE FALLBACK TEST ⚡', 'color: #a855f7; font-size: 16px; font-weight: bold');
  console.log('');

  // Boot the core
  console.log('Booting AngehlangCore...');
  await angehlangCore.boot();
  
  console.log('isReady:', angehlangCore.isReady);
  console.log('');

  // Test with a simple prompt
  const prompt = 'Explain quantum entanglement in one sentence.';
  console.log('Prompt:', prompt);
  console.log('---');

  const response = await angehlangCore.generate(prompt, { maxTokens: 100 });
  console.log('Response:');
  console.log(response);
  console.log('');
  
  // Check memory
  console.log('Memory trace length:', angehlangCore.getMemory().length);
  console.log('%c✓ Test complete', 'color: #10b981; font-weight: bold');
}

testNativeFallback().catch(e => {
  console.error('Test failed:', e.message);
});