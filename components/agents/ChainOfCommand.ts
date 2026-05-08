export enum AgentRank {
  COMMANDER = 4,   // Lead Architect
  EXECUTOR = 3,    // Master Synthesizer
  CRITIC = 2,      // Performance Perfectionist
  SCOUT = 1        // Observer
}

export interface RankedAgent {
  rank: AgentRank;
  role: string;
  canDelegateTo: AgentRank[];
  escalationPath?: AgentRank;
}

export class AgentWithEscalation {
  constructor(
    public agentInfo: RankedAgent, 
    public executeTask: (task: string) => Promise<string>, 
    private getHigherRank: () => AgentWithEscalation | null
  ) {}

  async executeWithFallback(task: string, depth = 0): Promise<string> {
    try {
      const result = await this.executeTask(task);
      if (!result || result.trim() === '') throw new Error("Empty response");
      return result;
    } catch (error) {
      if (depth >= 2) throw error;
      const higherRank = this.getHigherRank();
      if (!higherRank) throw new Error("Max escalation reached. Fallback failed.");
      console.warn(`[Escalation] ${this.agentInfo.role} failed. Escalating to ${higherRank.agentInfo.role}`);
      return await higherRank.executeWithFallback(task, depth + 1);
    }
  }
}

// ============ Local Vector Storage Mock ============
export class AgentMemory {
  constructor(private namespace: string) {}

  private getStore(): Record<string, string> {
    const raw = localStorage.getItem(`a2a_mem_${this.namespace}`);
    return raw ? JSON.parse(raw) : {};
  }

  // Naive keyword match simulating cosine similarity
  async recallSimilarTasks(task: string): Promise<string[]> {
    const store = this.getStore();
    const words = task.toLowerCase().split(' ').filter(w => w.length > 3);
    
    if (words.length === 0) return [];

    const scores = Object.entries(store).map(([key, value]) => {
      let score = 0;
      words.forEach(w => { if (key.includes(w)) score++; });
      return { val: value, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    return scores.slice(0, 3).map(s => s.val);
  }

  saveTask(task: string, output: string) {
    const store = this.getStore();
    store[task] = output;
    localStorage.setItem(`a2a_mem_${this.namespace}`, JSON.stringify(store));
  }
}

// ============ Chain Of Command ============
export class ChainOfCommand {
  private memory = new AgentMemory('chain');

  constructor(
    public leadArchitect: (prompt: string) => Promise<string>,
    public perfectionist: (plan: string) => Promise<string>,
    public synthesizer: (planAndSuggestions: string) => Promise<string>
  ) {}

  async execute(task: string): Promise<{
    architectPlan: string;
    perfectionistCritique: string;
    finalCode: string;
  }> {
    const pastSucc = await this.memory.recallSimilarTasks(task);
    let ctx = task;
    if (pastSucc.length) {
      ctx += `\n\nPast Successes to reference: \n${pastSucc.join('\n')}`;
    }

    console.log('[ChainOfCommand] 1. Commander (Architect) creates plan');
    const architectPlan = await this.leadArchitect(ctx);
    if (!architectPlan || architectPlan.length < 5) throw new Error("Architect_Agent_Silence: Failed to generate plan.");

    console.log('[ChainOfCommand] 2. Critic (Perfectionist) reviews plan');
    const perfectionistCritique = await this.perfectionist(architectPlan);
    if (!perfectionistCritique || perfectionistCritique.length < 5) throw new Error("Perfectionist_Agent_Silence: Failed to generate critique.");

    console.log('[ChainOfCommand] 3. Architect adjusts plan based on suggestions');
    // For simplicity, we bypass step 3's independent LLM call and merge directly into step 4
    // or let the Synthesizer resolve the conflict as requested in the Prompt template.
    
    console.log('[ChainOfCommand] 4. Executor (Synthesizer) implements final plan');
    const synthesizerInput = `Task: ${task}\n\nORIGINAL PLAN:\n${architectPlan}\n\nCRITIQUE:\n${perfectionistCritique}\n\nRigorously resolve any logic flaws and generate the final execution module.`;
    const finalCode = await this.synthesizer(synthesizerInput);
    if (!finalCode || finalCode.length < 5) throw new Error("Synthesizer_Agent_Silence: Failed to generate final module.");

    // Save to memory
    this.memory.saveTask(task, finalCode);

    return {
      architectPlan,
      perfectionistCritique,
      finalCode
    };
  }
}
