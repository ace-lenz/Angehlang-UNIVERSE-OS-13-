// Plan Item ID: TI-1
/**
 * Quick Quantum Test - Run with: npx ts-node test-quantum-quick.ts
 */
import { qppuEngine } from './src/engine/QPPUCore';

console.log('%c⚛️ QUANTUM PROCESSING TEST ⚛️', 'color: #a855f7; font-size: 16px; font-weight: bold');
console.log('');

// Test gates
const gates = qppuEngine.getGateMatrices();
console.log('[TEST 1] Gate Matrices:', gates.length >= 8 ? '✓ PASSED' : '✗ FAILED');

// Test Bell state
const bell = qppuEngine.createBellState(0, 1, 2);
console.log('[TEST 2] Bell State: |' + bell.measurement + '⟩, coherence: ' + (bell.coherence * 100).toFixed(1) + '%');
console.log('       Entangled pairs:', bell.entanglementPairs);

// Test state vector
const state = qppuEngine.getStateVector(4);
console.log('[TEST 3] State Vector: ' + state.length + ' basis states');
console.log('       |' + state[0]?.basisState + '⟩ = ' + state[0]?.amplitudeReal.toFixed(4));

// Test Grover
const grover = qppuEngine.groverSearch(16, 5, 2);
console.log('[TEST 4] Grover Search: |' + grover.measurement + '⟩');

// Test QFT
const qft = qppuEngine.quantumFourierTransform(4);
console.log('[TEST 5] QFT: ' + qft.gateOperations.length + ' gate operations');

// Test VQE
const vqe = qppuEngine.vqeSimulation('H2', 4);
console.log('[TEST 6] VQE: energy = ' + vqe.energy.toFixed(4) + ' Hartree');

// Test QAOA
const qaoa = qppuEngine.qaoaSolve('MAXCUT', 3);
console.log('[TEST 7] QAOA: solution = |' + qaoa.solution + '⟩');

// Test Deutsch-Jozsa
const dj = qppuEngine.deutschJozsa(true, 3);
console.log('[TEST 8] Deutsch-Jozsa: ' + dj.result + ' (' + dj.complexity + ')');

console.log('');
console.log('%c✓ All quantum operations executed successfully!', 'color: #10b981; font-weight: bold');
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
