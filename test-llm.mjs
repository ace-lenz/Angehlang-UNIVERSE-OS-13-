/**
 * Quick LLM Test - Test actual LLM generation
 */
import { angehlangCore } from './src/engine/AngehlangCore.js';

async function testLLM() {
  console.log('%c⚡ ANGEHLANG LLM GENERATION TEST ⚡', 'color: #a855f7; font-size: 16px; font-weight: bold');
  console.log('');

  // Boot the core
  await angehlangCore.boot();
  
  console.log('Core ready status:', angehlangCore.isReady);
  console.log('');

  // Test generation
  console.log('Testing: "What is quantum computing?"');
  console.log('---');
  
  try {
    const response = await angehlangCore.generate('What is quantum computing?', { maxTokens: 100 });
    console.log('Response:', response.substring(0, 500));
  } catch (e) {
    console.error('Error:', e.message);
  }

  console.log('');
  console.log('%c✓ Test complete', 'color: #10b981; font-weight: bold');
}

testLLM().catch(console.error);