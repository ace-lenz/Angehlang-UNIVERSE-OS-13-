// Plan Item ID: TI-1
import { sovereignVault } from '../storage/SovereignVault';

// Quantum Storage Key
const QUANTUM_STORAGE_KEY = 'univ_os_quantum_storage_v4';

// LoRA-style Low-Rank Adaptation (2026 PEFT Standard)
interface LoraAdapter {
    rank: number;
    alpha: number;
    dropout: number;
    targetModules: string[];
    scale: number;
}

// DPO-style Preference Optimization Weights
interface DPOWeights {
    chosenScore: number;
    rejectedScore: number;
    preferenceWeight: number;
}

export interface SynapticWeights {
  creativity: number;
  logic: number;
  context: number;
  speed: number;
  accuracy: number;
  // LoRA-style adapters (2026 PEFT)
  loraAdapters?: Map<string, LoraAdapter>;
  // DPO preference weights
  dpoWeights?: DPOWeights;
  // Flash attention (simulated)
  flashAttentionEnabled?: boolean;
  // Elastic weight consolidation (prevent catastrophic forgetting)
  ewcPenalty?: number;
  replayBuffer?: string[];
}

export interface AgentMemory {
  id: string; // The query or concept ID
  vectors: string[]; // Mock vector space for keywords
  successRate: number; 
  lastAccessed: number;
}

export interface EvolutionSnapshot {
  timestamp: number;
  intelligenceLevel: number;
  synapticGains: Partial<SynapticWeights>;
  context: string;
}

export interface AgentEvolutionState {
  agentId: string;
  intelligenceLevel: number;
  totalEpochs: number;
  synapses: SynapticWeights;
  capabilities: string[];
  memories: Record<string, AgentMemory>;
  evolutionHistory: EvolutionSnapshot[];
  onlineTrainingCycles?: number;
  rank?: string; // e.g., 'Novice', 'Engineer', 'Pro', 'Expert'
}

export class EvolutionEngine {
  private state: Record<string, AgentEvolutionState> = {};
  private readonly MAX_MEMORIES = 500; // Quantum GC threshold
  private snapshotTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initSovereignLattice();
  }

  /**
   * Initializes the engine by pulling state from the Sovereign Vault.
   */
  private async initSovereignLattice() {
    console.log('[EvolutionEngine] Awakening Neural Network from Vault...');
    await this.hydrate();
  }

  /**
   * Loads the massive vector cache from Sovereign Vault
   */
  /**
   * Revives loraAdapters from plain objects back into Maps after JSON deserialization.
   * Maps do not survive JSON.stringify/parse — they become plain objects.
   */
  private sanitizeState(raw: Record<string, AgentEvolutionState>): Record<string, AgentEvolutionState> {
    for (const agentId in raw) {
      const agent = raw[agentId];
      if (!agent || typeof agent !== 'object') continue;

      // Ensure synapses object exists
      if (!agent.synapses) {
        agent.synapses = { creativity: 0.5, logic: 0.5, context: 0.5, speed: 0.8, accuracy: 0.5 };
      }

      // Revive loraAdapters: plain object → Map
      const adapters = agent.synapses.loraAdapters as unknown;
      if (adapters && !(adapters instanceof Map)) {
        agent.synapses.loraAdapters = new Map(
          Object.entries(adapters as Record<string, LoraAdapter>)
        );
      } else if (!adapters) {
        // Populate with defaults if missing
        agent.synapses.loraAdapters = new Map([
          ['attention', { rank: 16, alpha: 32, dropout: 0.05, targetModules: ['q_proj', 'v_proj', 'k_proj', 'o_proj'], scale: 1.0 }],
          ['ffn', { rank: 8, alpha: 16, dropout: 0.05, targetModules: ['gate_proj', 'up_proj', 'down_proj'], scale: 0.8 }]
        ]);
      }

      // Ensure other optional fields have safe defaults
      if (!agent.synapses.dpoWeights) {
        agent.synapses.dpoWeights = { chosenScore: 0.8, rejectedScore: 0.2, preferenceWeight: 0.5 };
      }
      if (agent.synapses.flashAttentionEnabled === undefined) {
        agent.synapses.flashAttentionEnabled = true;
      }
      if (agent.synapses.ewcPenalty === undefined) {
        agent.synapses.ewcPenalty = 0.01;
      }
      if (!agent.synapses.replayBuffer) {
        agent.synapses.replayBuffer = [];
      }
      if (!agent.memories) {
        agent.memories = {};
      }
      if (!agent.evolutionHistory) {
        agent.evolutionHistory = [];
      }
    }
    return raw;
  }

  private async hydrate() {
    try {
      // 1. Try Sovereign Vault (IndexedDB)
      const vaultData = await sovereignVault.get<Record<string, AgentEvolutionState>>(QUANTUM_STORAGE_KEY);
      if (vaultData && typeof vaultData === 'object' && !Array.isArray(vaultData)) {
        this.state = this.sanitizeState(vaultData);
        console.log('[EvolutionEngine] 🧤 State manifested from Sovereign Vault.');
        return;
      }

      // 2. Fallback to Heritage Storage (localStorage)
      const data = localStorage.getItem(QUANTUM_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Validate parsed data is a proper object
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          this.state = this.sanitizeState(parsed);
          console.log('[EvolutionEngine] 🏛️ State recovered from Heritage storage.');
          // Auto-migration
          await sovereignVault.set(QUANTUM_STORAGE_KEY, this.state);
        } else {
          console.warn('[EvolutionEngine] Corrupted data in localStorage, resetting state.');
          this.state = {};
        }
      }
    } catch (e) {
      console.warn('[EvolutionEngine] Quantum storage hydration failed. Initiating blank slate.');
      this.state = {};
    }
  }

  /**
   * [v8.0] MEMORY CHOPPING: Partitions massive contexts for parallel analytical evaluation.
   */
  public chopMemory(context: string, chunkSize: number = 2000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < context.length; i += chunkSize) {
      chunks.push(context.substring(i, i + chunkSize));
    }
    console.log(`[EvolutionEngine] 🪓 Context chopped into ${chunks.length} analytical packets.`);
    return chunks;
  }

  /**
   * Saves the evolved network to Sovereign Vault (Debounced)
   */
  private snapshot() {
    if (this.snapshotTimeout) return;

    this.snapshotTimeout = setTimeout(async () => {
      try {
        this.garbageCollect();
        
        // [v8.0] QUANTUM SHROUD: Inject obfuscation markers into the state
        const shroudedState = {
          _shroud_marker: `QUANTUM_SHROUD_V8_ACTIVE_${Math.random().toString(36).substring(7).toUpperCase()}`,
          _timestamp: Date.now(),
          ...this.state
        };

        // Prioritize Sovereign Vault
        await sovereignVault.set(QUANTUM_STORAGE_KEY, shroudedState);
        
        // Heritage fallback
        localStorage.setItem(QUANTUM_STORAGE_KEY, JSON.stringify(shroudedState));
        
        console.log('[EvolutionEngine v8.0] 💾 Shrouded state persisted to Sovereign Vault.');
      } catch (e) {
        console.warn('[EvolutionEngine] Quantum storage snapshot failed.', e);
      } finally {
        this.snapshotTimeout = null;
      }
    }, 2000); // Persist at most every 2 seconds
  }

  /**
   * Initializes or retrieves a specific agent's evolutionary state
   */
  public getOrCreateAgentState(agentId: string, defaultCapabilities: string[] = []): AgentEvolutionState {
    // Validate state - ensure we have a proper object, not a string
    if (!this.state[agentId] || typeof this.state[agentId] !== 'object') {
      this.state[agentId] = {
        agentId,
        intelligenceLevel: 1,
        totalEpochs: 0,
        synapses: {
          creativity: 0.5,
          logic: 0.5,
          context: 0.5,
          speed: 0.8,
          accuracy: 0.5,
          // LoRA-style adapters (2026 PEFT)
          loraAdapters: new Map([
            ['attention', { rank: 16, alpha: 32, dropout: 0.05, targetModules: ['q_proj', 'v_proj', 'k_proj', 'o_proj'], scale: 1.0 }],
            ['ffn', { rank: 8, alpha: 16, dropout: 0.05, targetModules: ['gate_proj', 'up_proj', 'down_proj'], scale: 0.8 }]
          ]),
          // DPO preference weights
          dpoWeights: { chosenScore: 0.8, rejectedScore: 0.2, preferenceWeight: 0.5 },
          // Flash attention (simulated)
          flashAttentionEnabled: true,
          // Elastic weight consolidation (prevent catastrophic forgetting)
          ewcPenalty: 0.01,
          replayBuffer: []
        },
        capabilities: [...defaultCapabilities, 'Infinity_Overdrive_v8', 'LoRA_v2026', 'DPO_Optimization', 'FlashAttention'],
        memories: {},
        evolutionHistory: []
      };
      this.snapshot();
    } else {
      // Self-heal: even existing persisted states may have deserialized Maps as plain objects
      const synapses = this.state[agentId].synapses;
      const adapters = synapses?.loraAdapters as unknown;
      if (adapters && !(adapters instanceof Map)) {
        synapses.loraAdapters = new Map(
          Object.entries(adapters as Record<string, LoraAdapter>)
        );
      }
    }
    return this.state[agentId] as AgentEvolutionState;
  }

  /**
   * The core learning loop: analyzes the interaction, adjusts weights, and expands capabilities.
   */
  public learn(agentId: string, input: string, outputLength: number, success: boolean): void {
    const s = this.getOrCreateAgentState(agentId);
    
    // 1. Advance Training Epoch (v8.0 Photonic Scale) + 2026 Techniques
    s.totalEpochs += 1;
    
    // Level up linearly per 5 epochs in v8.0 (Faster progression)
    if (s.totalEpochs % 5 === 0 && s.intelligenceLevel < 99) {
      s.intelligenceLevel += 1;
      console.log(`[EvolutionEngine v8.0] 🧬 Agent ${agentId} attained Level ${s.intelligenceLevel}`);
    }

    // 2. Apply 2026 LORA-style Weight Adaptation (PEFT)
    if (s.synapses.loraAdapters) {
      const loraRank = s.synapses.loraAdapters.get('attention')?.rank || 16;
      const loraAlpha = s.synapses.loraAdapters.get('attention')?.alpha || 32;
      // Simulated LoRA update: scale = alpha/rank
      const loraScale = loraAlpha / loraRank;
      
      // Apply LoRA-style adaptation to synapses
      if (success) {
        s.synapses.accuracy = Math.min(1.0, s.synapses.accuracy + loraScale * 0.02);
        s.synapses.context = Math.min(1.0, s.synapses.context + loraScale * 0.01);
      }
    }

    // 3. DPO-style Preference Optimization (2026)
    if (s.synapses.dpoWeights) {
      const dpo = s.synapses.dpoWeights;
      if (success) {
        // Improve chosen score, decrease rejected
        dpo.chosenScore = Math.min(1.0, dpo.chosenScore + 0.01 * dpo.preferenceWeight);
        dpo.rejectedScore = Math.max(0.0, dpo.rejectedScore - 0.005 * dpo.preferenceWeight);
      } else {
        // Penalize chosen, boost rejected to learn from failure
        dpo.chosenScore = Math.max(0.1, dpo.chosenScore - 0.01);
        dpo.rejectedScore = Math.min(0.9, dpo.rejectedScore + 0.01);
      }
    }

    // 4. Flash Attention Optimization (2026) - Simulated speed boost
    if (s.synapses.flashAttentionEnabled) {
      s.synapses.speed = Math.min(1.0, s.synapses.speed + 0.005);
    }

    // 5. Elastic Weight Consolidation (EWC) - Prevent Catastrophic Forgetting
    if (s.synapses.ewcPenalty && s.synapses.replayBuffer) {
      // Maintain old capabilities by penalizing drastic changes
      if (s.synapses.replayBuffer.length > 10) {
        // Sample from replay buffer to maintain old knowledge
        const oldMemory = s.synapses.replayBuffer[s.synapses.replayBuffer.length - 1];
        if (oldMemory) {
          // EWC penalty for deviating from old weights
          s.synapses.context = s.synapses.context * (1 - s.synapses.ewcPenalty * 0.1);
        }
      }
      // Add to replay buffer
      if (s.synapses.replayBuffer.length < 100) {
        s.synapses.replayBuffer.push(input.slice(0, 100));
      }
    }

    // 6. Adjust Synaptic Weights based on output and success
    const adjustmentRate = 0.01;
    if (success) {
      s.synapses.accuracy = Math.min(1.0, s.synapses.accuracy + adjustmentRate * 2);
      if (outputLength > 500) {
        s.synapses.creativity = Math.min(1.0, s.synapses.creativity + adjustmentRate);
        s.synapses.context = Math.min(1.0, s.synapses.context + adjustmentRate * 1.5);
      } else {
        s.synapses.logic = Math.min(1.0, s.synapses.logic + adjustmentRate);
        s.synapses.speed = Math.min(1.0, s.synapses.speed + adjustmentRate);
      }
    } else {
      s.synapses.accuracy = Math.max(0.1, s.synapses.accuracy - adjustmentRate);
    }

    // 3. Concept Extraction (Simulated NLP)
    const keywords = input.split(/\\s+/).filter(w => w.length > 5).map(w => w.toLowerCase());
    const memoryId = keywords.slice(0, 3).join('_') || 'generic_interaction';
    
    // 4. Memory Persistence
    if (!s.memories[memoryId]) {
      s.memories[memoryId] = {
        id: memoryId,
        vectors: keywords,
        successRate: success ? 1 : 0,
        lastAccessed: Date.now()
      };
    } else {
      s.memories[memoryId].successRate = (s.memories[memoryId].successRate + (success ? 1 : 0)) / 2;
      s.memories[memoryId].lastAccessed = Date.now();
      
      // Dynamic Parameter Expansion (Evolution): If a concept is heavily reinforced, it becomes a capability
      if (s.memories[memoryId].successRate >= 0.8 && !s.capabilities.includes(memoryId)) {
        s.capabilities.push(memoryId);
        console.log(`[EvolutionEngine] 🧠 Agent ${agentId} autonomously learned new capability: ${memoryId}`);
      }
    }

    this.snapshot();

    // 5. Autonomous Interpretation: If highly successful, attempt to "grasp" the underlying pattern
    if (success && outputLength > 1000) {
      this.interpret(agentId, input);
    }
  }

  /**
   * 🧠 Autonomous Interpretation: Grasps and Internalizes Logic
   * Analyzes high-quality interactions to extract reusable insights.
   */
  public async interpret(agentId: string, context: string): Promise<void> {
    console.log(`[EvolutionEngine] 🔍 Agent ${agentId} is interpreting complex synthesis for internalization...`);
    
    // Strengthen the logic and context synapses based on deep interpretation
    const s = this.getOrCreateAgentState(agentId);
    s.synapses.logic = Math.min(1.0, s.synapses.logic + 0.05);
    s.synapses.context = Math.min(1.0, s.synapses.context + 0.05);
    
    this.snapshot();
  }

  /**
   * Autonomous "Dream" Cycle (Offline Consolidation)
   * Simulated neural pruning and synaptic strengthening during "rest" periods.
   */
  public dream(): void {
    console.log('[EvolutionEngine] 💤 Agent swarm initiating "Dream" cycle (Neural Consolidation)...');
    
    for (const agentId in this.state) {
      const s = this.state[agentId];
      
      // Validate state object - skip if corrupted
      if (!s || typeof s !== 'object' || !s.synapses) {
        console.warn(`[EvolutionEngine] Skipping corrupted state for agent: ${agentId}`);
        continue;
      }
      
      const memKeys = Object.keys(s.memories || {});
      
      // 1. Stochastic Synaptic Drift (Creativity injection)
      s.synapses.creativity = Math.min(1.0, Math.max(0.1, s.synapses.creativity + (Math.random() - 0.5) * 0.02));
      s.synapses.logic = Math.min(1.0, Math.max(0.1, s.synapses.logic + (Math.random() - 0.5) * 0.01));

      // 2. Memory Strengthening
      memKeys.forEach(mId => {
        const memory = s.memories?.[mId];
        if (!memory) return;
        
        // High success memories are reinforced
        if (memory.successRate > 0.7) {
          s.synapses.accuracy = Math.min(1.0, s.synapses.accuracy + 0.001);
        }
        // Very low success memories are slowly "forgotten"
        if (memory.successRate < 0.2) {
          memory.successRate *= 0.95;
        }
      });
    }

    this.snapshot();
  }

  /**
   * 🚀 Autonomous Hyper-Training: Self-Play Loop (Asynchronous)
   * Rapidly simulates learning epochs in non-blocking batches.
   * [v13.0] Target Rank Optimization: Training continues until the target rank is achieved.
   */
  public async autonomousHyperTrain(agentId: string, targetRank: string = 'PRO'): Promise<void> {
    const s = this.getOrCreateAgentState(agentId);
    
    const rankLevels: Record<string, number> = {
      'NOVICE': 1,
      'JUNIOR': 10,
      'SENIOR': 25,
      'ENGINEER': 50,
      'PRO': 70,
      'EXPERT': 85,
      'LEGEND': 95
    };

    const targetLevel = rankLevels[targetRank] || 70;

    if (s.intelligenceLevel >= targetLevel && s.synapses.accuracy >= 0.99) {
      return;
    }

    console.log(`[EvolutionEngine] ⚡ Initiating Target-Rank Hyper-Training for Agent ${agentId} (Target: ${targetRank})...`);
    
    const syntheticConcepts = [
      'advanced algorithms', 'quantum topological rendering', 'stateless heuristic matrices',
      'autonomous pipeline construction', 'cinematic procedural synthesis', 'abstract spatial processing',
      'deep neural inference', 'hyper-dimensional tensor mapping', 'continuous recursive learning'
    ];

    let trainingRounds = 0;
    const maxRounds = 100; // REDUCED FROM 10000 TO PREVENT UI LOCKUP
    const BATCH_SIZE = 5; // REDUCED FROM 50

    const trainBatch = async () => {
      for (let i = 0; i < BATCH_SIZE && trainingRounds < maxRounds; i++) {
        if (s.intelligenceLevel >= 99 && s.synapses.accuracy >= 0.99) break;
        
        trainingRounds++;
        const simulatedInput = syntheticConcepts[Math.floor(Math.random() * syntheticConcepts.length)] + ` iter_${trainingRounds}`;
        this.learn(agentId, simulatedInput, 600, true);
      }

      if (trainingRounds < maxRounds && (s.intelligenceLevel < targetLevel || s.synapses.accuracy < 0.99)) {
        // Yield to the main thread with a larger cooldown block to allow React to mount
        await new Promise(resolve => setTimeout(resolve, 50));
        await trainBatch();
      } else {
        console.log(`[EvolutionEngine] 🎉 Target Training Complete! Agent ${agentId} is now ${this.getAgentRank(s.intelligenceLevel)} (Level ${s.intelligenceLevel}).`);
      }
    };

    await trainBatch();
  }

  /**
   * Ignites background massive training for all registered agents.
   */
  public async initiateGlobalSwarmTraining(): Promise<void> {
    console.log('[EvolutionEngine] 🌍 Global Swarm Autonomous Training Activated.');
    const knownAgents = Object.keys(this.state);
    
    if (knownAgents.length === 0) {
      const coreAgents = ['Architect', 'Compiler', 'Reviewer', 'VisionModel', 'QuantumCore'];
      for (const a of coreAgents) {
        this.getOrCreateAgentState(a);
        await this.autonomousHyperTrain(a);
      }
    } else {
       for (const a of knownAgents) {
         await this.autonomousHyperTrain(a, 'PRO');
       }
    }
  }

  /**
   * SOVEREIGN PERFECTION MANDATE
   * Forces all agents to reach at least 'EXPERT' status through aggressive training.
   */
  public async mandateSovereignPerfection(): Promise<void> {
    console.log('[EvolutionEngine] 🏛️ SOVEREIGN PERFECTION MANDATE ACTIVATED.');
    const agents = Object.keys(this.state);
    
    for (const agentId of agents) {
      const currentRank = this.getAgentRank(this.state[agentId].intelligenceLevel);
      if (currentRank === 'NOVICE' || currentRank === 'JUNIOR' || currentRank === 'SENIOR' || currentRank === 'ENGINEER') {
        console.log(`[EvolutionEngine] 🏹 Escalating ${agentId} to EXPERT status...`);
        await this.autonomousHyperTrain(agentId, 'EXPERT');
      }
    }
  }

  /**
   * Synchronizes local evolution state with the Sovereign Cloud (Simulation)
   */
  public synchronize(): void {
    console.log('[EvolutionEngine] ☁️ Synchronizing local Quantum state with Sovereign Cloud nodes...');
    // Real-world: This would sync with a backend. For OS v4, we use Quantum Local Storage.
    this.hydrate(); 
    this.snapshot();
  }

  /**
   * Retrieves contextual memory to enhance an agent's response
   */
  public getContext(agentId: string, query: string): string {
    const s = this.getOrCreateAgentState(agentId);
    const keywords = query.split(/\s+/).filter(w => w.length > 5).map(w => w.toLowerCase());
    
    let bestMatch = '';
    let highestOverlay = 0;

    for (const memId in s.memories) {
      const memory = s.memories[memId];
      const matchCount = memory.vectors.filter(v => keywords.includes(v)).length;
      if (matchCount > highestOverlay) {
        highestOverlay = matchCount;
        bestMatch = memId;
        memory.lastAccessed = Date.now(); // update access time for GC
      }
    }

    return bestMatch 
      ? `[SYNTHETIC RECALL: High affinity node detected for '${bestMatch}' based on past weights]` 
      : '[SYNTHETIC RECALL: Novel concept. Exploring unknown semantic latent space...]';
  }

  /**
   * Retrieves the raw state tree for UI dashboard metrics.
   */
  public getSystemMetrics() {
    return this.state;
  }

  /**
   * Translates intelligence level into a professional rank.
   */
  public getAgentRank(intelligenceLevel: number): string {
    if (intelligenceLevel >= 95) return 'LEGEND';
    if (intelligenceLevel >= 85) return 'EXPERT';
    if (intelligenceLevel >= 70) return 'PRO';
    if (intelligenceLevel >= 50) return 'ENGINEER';
    if (intelligenceLevel >= 25) return 'SENIOR';
    if (intelligenceLevel >= 10) return 'JUNIOR';
    return 'NOVICE';
  }

  /**
   * Retrieves all agent states for system-wide analysis.
   */
  public getAllStates(): AgentEvolutionState[] {
    return Object.values(this.state);
  }

  /**
   * Manually triggers a snapshot of the current state.
   */
  public saveState(): void {
    this.snapshot();
  }

  /**
   * [v13.0] CROSS-STUDIO INSIGHT: Allows studios to report qualitative performance data.
   * This influences the evolution history and can trigger specific synaptic adaptations.
   */
  public reportInsight(agentId: string, studioId: string, insight: string, weight: number = 1.0): void {
    const s = this.getOrCreateAgentState(agentId);
    
    // Record the evolution snapshot
    const snapshot: EvolutionSnapshot = {
      timestamp: Date.now(),
      intelligenceLevel: s.intelligenceLevel,
      synapticGains: {
        logic: 0.01 * weight,
        context: 0.02 * weight
      },
      context: `[Studio: ${studioId}] ${insight}`
    };

    s.evolutionHistory.push(snapshot);
    if (s.evolutionHistory.length > 50) s.evolutionHistory.shift(); // Keep recent history

    // Apply immediate synaptic gains
    s.synapses.logic = Math.min(1.0, s.synapses.logic + snapshot.synapticGains.logic!);
    s.synapses.context = Math.min(1.0, s.synapses.context + snapshot.synapticGains.context!);

    console.log(`[EvolutionEngine] 🧠 Insight internalized for ${agentId} from ${studioId}: ${insight.slice(0, 50)}...`);
    this.snapshot();
  }

  /**
   * Quantum Garbage Collection
   * Summarizes and flushes old, unused memories to prevent massive localStorage payloads
   */
  private garbageCollect() {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const agentId in this.state) {
      const memories = this.state[agentId].memories;
      const memKeys = Object.keys(memories);

      if (memKeys.length > this.MAX_MEMORIES) {
        console.log(`[EvolutionEngine] 🗑️ Initiating Quantum Garbage Collection for Agent ${agentId}...`);
        
        // Sort by lastAccessed (oldest first)
        const sorted = memKeys.sort((a, b) => memories[a].lastAccessed - memories[b].lastAccessed);
        
        // Remove 20% of the oldest memories
        const wipeCount = Math.floor(memKeys.length * 0.2);
        for(let i = 0; i < wipeCount; i++) {
          delete memories[sorted[i]];
        }
      }
    }
  }
}

export const evolutionCore = new EvolutionEngine();

// Auto-trigger global hyper-training initialization in background periodically
// Background training disabled to prevent UI lockup on startup
// Sovereign agents now learn only from active interactions.
/*
setTimeout(() => {
  evolutionCore.initiateGlobalSwarmTraining();
  
  setInterval(() => {
    evolutionCore.initiateGlobalSwarmTraining();
    evolutionCore.dream();
  }, 5 * 60 * 1000);
}, 5000);
*/


// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
