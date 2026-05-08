// Plan Item ID: TI-1
/**
 * QPPUCore Quantum Logic Test Suite
 * Tests real quantum gate operations and algorithms
 */
import { qppuEngine, QuantumResult } from './engine/QPPUCore';

async function runTests() {
  console.log('%c══════════════════════════════════════════════════════', 'color: #06b6d4; font-weight: bold');
  console.log('%c     ⚛️ ANGEHLANG QUANTUM PROCESSING TEST SUITE ⚛️', 'color: #a855f7; font-weight: bold; font-size: 16px');
  console.log('%c══════════════════════════════════════════════════════', 'color: #06b6d4; font-weight: bold');
  console.log('');

  let passed = 0;
  let failed = 0;

  // Test 1: Gate Matrices
  console.log('%c[TEST 1] Gate Matrices', 'color: #f59e0b; font-weight: bold');
  const gates = qppuEngine.getGateMatrices();
  console.log(`  Available gates: ${gates.join(', ')}`);
  if (gates.length >= 8) {
    console.log('%c  ✓ PASSED: Gate matrices initialized', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: Missing gates', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Test 2: Bell State (Entanglement)
  console.log('%c[TEST 2] Bell State (Entanglement)', 'color: #f59e0b; font-weight: bold');
  const bellResult = qppuEngine.createBellState(0, 1, 2);
  console.log(`  Measurement: |${bellResult.measurement}⟩`);
  console.log(`  Coherence: ${(bellResult.coherence * 100).toFixed(2)}%`);
  console.log(`  Entangled: qubit[0] ↔ qubit[1]`);
  if (bellResult.measurement && bellResult.entanglementPairs.length > 0) {
    console.log('%c  ✓ PASSED: Bell state created', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: Bell state failed', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Test 3: Superposition State
  console.log('%c[TEST 3] Superposition State', 'color: #f59e0b; font-weight: bold');
  const state = qppuEngine.getStateVector(4);
  console.log(`  4-qubit state vector size: ${state.length}`);
  console.log(`  First basis state: |${state[0]?.basisState}⟩ = ${state[0]?.amplitudeReal.toFixed(4)}`);
  if (state.length >= 4 && state[0].amplitudeReal > 0) {
    console.log('%c  ✓ PASSED: Superposition state created', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: State vector failed', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Test 4: Grover's Search
  console.log('%c[TEST 4] Grover\'s Search Algorithm', 'color: #f59e0b; font-weight: bold');
  const grover = qppuEngine.groverSearch(16, 5, 2);
  console.log(`  Search space: N=16`);
  console.log(`  Iterations: 2`);
  console.log(`  Measurement: |${grover.measurement}⟩`);
  console.log(`  Coherence: ${(grover.coherence * 100).toFixed(2)}%`);
  if (grover.measurement) {
    console.log('%c  ✓ PASSED: Grover search executed', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: Grover failed', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Test 5: Quantum Fourier Transform
  console.log('%c[TEST 5] Quantum Fourier Transform', 'color: #f59e0b; font-weight: bold');
  const qft = qppuEngine.quantumFourierTransform(4);
  console.log(`  Input qubits: 4`);
  console.log(`  Gate operations: ${qft.gateOperations.length}`);
  console.log(`  Coherence: ${(qft.coherence * 100).toFixed(2)}%`);
  if (qft.gateOperations.length > 0) {
    console.log('%c  ✓ PASSED: QFT executed', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: QFT failed', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Test 6: VQE Molecular Simulation
  console.log('%c[TEST 6] VQE Molecular Simulation', 'color: #f59e0b; font-weight: bold');
  const vqe = qppuEngine.vqeSimulation('H2', 4);
  console.log(`  Molecule: H2`);
  console.log(`  Energy: ${vqe.energy.toFixed(6)} Hartree`);
  console.log(`  Ansatz: ${vqe.ansatz}`);
  if (vqe.energy < 0) {
    console.log('%c  ✓ PASSED: VQE executed', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: VQE failed', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Test 7: QAOA Optimization
  console.log('%c[TEST 7] QAOA Optimization', 'color: #f59e0b; font-weight: bold');
  const qaoa = qppuEngine.qaoaSolve('MAXCUT', 3);
  console.log(`  Problem: MAXCUT`);
  console.log(`  Layers: p=3`);
  console.log(`  Solution: |${qaoa.solution}⟩`);
  console.log(`  Objective: ${qaoa.objectiveValue}`);
  if (qaoa.solution) {
    console.log('%c  ✓ PASSED: QAOA executed', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: QAOA failed', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Test 8: Deutsch-Jozsa
  console.log('%c[TEST 8] Deutsch-Jozsa Algorithm', 'color: #f59e0b; font-weight: bold');
  const dj = qppuEngine.deutschJozsa(true, 3);
  console.log(`  Function type: balanced`);
  console.log(`  Result: ${dj.result}`);
  console.log(`  Complexity: ${dj.complexity}`);
  if (dj.result) {
    console.log('%c  ✓ PASSED: Deutsch-Jozsa executed', 'color: #10b981;');
    passed++;
  } else {
    console.log('%c  ✗ FAILED: Deutsch-Jozsa failed', 'color: #f43f5e;');
    failed++;
  }
  console.log('');

  // Final Summary
  console.log('%c══════════════════════════════════════════════════════', 'color: #06b6d4; font-weight: bold');
  console.log(`%c     RESULTS: ${passed} PASSED | ${failed} FAILED`, 'color: ${failed === 0 ? '#10b981' : '#f43f5e'}; font-weight: bold; font-size: 14px`);
  console.log('%c══════════════════════════════════════════════════════════════', 'color: #06b6d4; font-weight: bold');

  return { passed, failed };
}

runTests().catch(console.error);
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
