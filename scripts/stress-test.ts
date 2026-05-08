import { stressOrchestrator } from '../src/engine/StressCascadeOrchestrator';

async function runCascade() {
  console.log('--- STARTING OMNI-STUDIO STRESS CASCADE ---');
  await stressOrchestrator.executeCascade();
  console.log('--- CASCADE COMPLETE ---');
  console.log('Final Metrics:', JSON.stringify(stressOrchestrator.getMetrics(), null, 2));
}

runCascade();
