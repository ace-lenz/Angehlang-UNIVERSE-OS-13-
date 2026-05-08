/**
 * Direct LLM Test - Uses fetch to call Ollama directly
 */

async function testOllama() {
  console.log('%c⚡ OLLAMA LLM DIRECT TEST ⚡', 'color: #a855f7; font-size: 16px; font-weight: bold');
  console.log('');

  const endpoint = 'http://localhost:11434';

  // Check what models are available
  console.log('Checking Ollama endpoint:', endpoint);
  
  try {
    const tagsRes = await fetch(`${endpoint}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    const tagsData = await tagsRes.json();
    console.log('Available models:', JSON.stringify(tagsData.models, null, 2));
  } catch (e) {
    console.error('Error getting models:', e.message);
    return;
  }

  console.log('');
  console.log('Testing generation...');
  console.log('---');

  // Try each available model
  const models = ['qwen2.5-coder:0.5b', 'llama3.2:1b', 'llama3:8b', 'mistral:7b'];
  
  for (const model of models) {
    console.log(`\nTrying model: ${model}`);
    try {
      const genRes = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: 'What is 2+2? Answer in one sentence.',
          stream: false,
          options: { num_predict: 50 }
        }),
        signal: AbortSignal.timeout(10000)
      });
      
      if (genRes.ok) {
        const data = await genRes.json();
        console.log(`✓ Response: ${data.response}`);
        break;
      } else {
        const err = await genRes.text();
        console.log(`✗ Error: ${err.substring(0, 100)}`);
      }
    } catch (e) {
      console.log(`✗ Failed: ${e.message}`);
    }
  }

  console.log('%c✓ Test complete', 'color: #10b981; font-weight: bold');
}

testOllama().catch(console.error);