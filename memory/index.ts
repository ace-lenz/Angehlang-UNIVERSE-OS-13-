// Plan Item ID: TI-1
/**
 * Memory Module Index — Angehlang Universe OS
 */

export { SovereignWeightsCore, sovereignWeightsCore } from './SovereignWeightsCore';
export type { 
  NativeWeightVector,
  TruthBiasVector,
  SystemKnowledgeBase,
  NativeFact,
  NativeCorrection,
  NativeReasoningChain,
  NativePattern,
  SovereignWeightsConfig,
  SovereignWeightsExport,
  StudioCapability,
  NativeQuantization
} from './SovereignWeightsCore';

export { QuantumBrainStorage } from '../engine/inference/QuantumBrainStorage';
export type { MemoryNode } from '../engine/inference/QuantumBrainStorage';

export { correctionMemory } from './CorrectionMemory';
export type { ErrorRecord, CorrectionSuggestion } from './CorrectionMemory';

export { EvolutionEngine, evolutionCore } from './EvolutionEngine';
export type { SynapticWeights } from './EvolutionEngine';

export { OMNI_SYNAPSE_v8_4_WEIGHTS, SynapticManager } from './SynapticWeights';

export { promptEngine } from './PromptEngine';

export { godPromptTrainer } from './GodPromptSelfTrainer';

export { zetaLightningTrainer } from './ZetaLightningTrainer';

export { omniTrainer } from './OmniTrainerSystem';

export { unifiedTrainingHub } from './UnifiedTrainingHub';

export { systemUpgradeManager } from './SystemUpgradeManager';

export { temporalMemory } from './TemporalMemory';

export { quantumCache } from './QuantumCache';

export { photoRAM } from './PhotoRAM';
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
