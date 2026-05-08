import { sovereignTrainingHub } from '../src/engine/SovereignTrainingHub';

async function runFullTraining() {
  console.log('--- STARTING GLOBAL WEIGHT SYNTHESIS ---');
  await sovereignTrainingHub.igniteDeepSynthesis();
  console.log('--- TRAINING COMPLETE ---');
  console.log('Metrics:', JSON.stringify(sovereignTrainingHub.getMetrics(), null, 2));
}

runFullTraining();
