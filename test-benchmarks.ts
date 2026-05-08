/**
 * Test Runner - Runs all studio benchmarks
 */

import { studioBenchmark, StudioType } from './src/engine/StudioBenchmarkSystem';
import { qppuEngine } from './src/engine/QPPUCore';

async function runTests() {
  console.log('\n🚀 ANGEHLANG UNIVERSE OS - STUDIO BENCHMARK SYSTEM\n');
  console.log('='.repeat(60));
  
  qppuEngine.activateQuantumMode('benchmark');
  
  const studioTypes: StudioType[] = [
    'book', 'code', 'video', 'image', 'audio', '3d', 'bio', 'automation',
    'network', 'dataviz', 'simulation', 'music-production', 'text', 'security',
    'database', 'cloud', 'iot', 'game', 'browser', 'os', 'intelligence', 'a2a'
  ];

  console.log(`\n📊 Testing ${studioTypes.length} Studios...\n`);

  for (let i = 0; i < studioTypes.length; i++) {
    const type = studioTypes[i];
    process.stdout.write(`Testing ${type}...`);
    
    const result = await studioBenchmark.runBenchmark(type);
    
    console.log(` ✓ Score: ${result.score.toFixed(1)}% | Quality: ${result.output.quality} | Latency: ${result.latency.toFixed(0)}ms`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n🏆 LEADERBOARD - TOP 10 PERFORMING STUDIOS\n');

  const leaderboard = studioBenchmark.getLeaderboard(10);
  leaderboard.forEach((result, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(`${medal} #${i + 1} ${result.studio.padEnd(25)} ${result.score.toFixed(1)}% (${result.output.quality})`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n📈 OVERALL STATISTICS\n');

  const avgScores = studioBenchmark.getAverageScores();
  let totalScore = 0;
  let count = 0;

  for (const [studio, scores] of Object.entries(avgScores)) {
    totalScore += scores.score;
    count++;
  }

  const overallAvg = totalScore / count;
  console.log(`Average Score: ${overallAvg.toFixed(1)}%`);
  console.log(`Studios Tested: ${count}`);
  console.log(`QPPU Power: ${qppuEngine.getProcessingPower().toFixed(0)}%`);

  const status = studioBenchmark.getStudioStatus();
  const operational = Object.values(status).filter(s => s === 'operational').length;
  const degraded = Object.values(status).filter(s => s === 'degraded').length;
  console.log(`Operational: ${operational} | Degraded: ${degraded}`);

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ BENCHMARK COMPLETE\n');
}

runTests().catch(console.error);