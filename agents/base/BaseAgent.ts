// Plan Item ID: TI-1
/**
 * BaseAgent.ts - Foundation Agent Classes for QPPU System
 * 
 * Provides base classes for all studio agents including:
 * - Architectural Engineers
 * - Advanced Engineers
 * - Perfectionists
 * - Critics
 * - Research Scientists
 */

import { qppuEngine, ANGHVFrame, ProcessingResult } from '@/engine/QPPUCore';

// ============================================================================
// BASE TYPES
// ============================================================================

// AgentRole const object for dot-notation usage (e.g. AgentRole.ARCHITECT)
export type AgentRole = string;
export const AgentRole = {
  ARCHITECT: 'architect' as const,
  ENGINEER: 'engineer' as const,
  PERFECTIONIST: 'perfectionist' as const,
  CRITIC: 'critic' as const,
  RESEARCHER: 'researcher' as const,
  SPECIALIST: 'specialist' as const,
  OPTIMIZER: 'optimizer' as const,
  DESIGNER: 'designer' as const,
  ANALYST: 'analyst' as const,
  ADMIN: 'admin' as const,
  SECURITY: 'security' as const,
};

export enum AgentCapability {
  CODE_GENERATION = 'code_generation',
  CODE_REFACTORING = 'code_refactoring',
  CODE_ANALYSIS = 'code_analysis',
  DATA_ANALYSIS = 'data_analysis',
  PERFORMANCE_TUNING = 'performance_tuning',
  SYSTEM_ADMIN = 'system_admin',
  RESEARCH = 'research',
  DESIGN = 'design',
  TESTING = 'testing',
  SECURITY = 'security',
  AUTOMATION = 'automation',
  VISUALIZATION = 'visualization',
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text',
  NETWORK = 'network',
  DATABASE = 'database',
  CLOUD = 'cloud',
  IOT = 'iot',
  GAME = 'game',
  BIOLOGY = 'biology',
  SIMULATION = 'simulation',
  INTELLIGENCE = 'intelligence',
  COMMUNICATION = 'communication',
  NETWORK_OPTIMIZATION = 'network_optimization',
  GAME_PHYSICS = 'game_physics',
  HARDWARE_INTEGRATION = 'hardware_integration',
  CODE_REVIEW = 'code_review',
  SEARCH = 'search',
}

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface AgentConfig {
  name: string;
  role: AgentRole | string;
  studio?: string;
  specialty?: string;
  domain?: string;
  description?: string;
  capability?: AgentCapability | string;
  maxConcurrentTasks?: number;
  timeout?: number;
  retryAttempts?: number;
}

export interface AgentTask {
  id: string;
  type: string;
  input: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: AgentStatus;
  result?: any;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  lastActiveAt: number;
}

// ============================================================================
// BASE AGENT CLASS
// ============================================================================

export abstract class BaseAgent {
  public readonly id: string;
  public readonly name: string;
  public readonly role: string;
  public readonly studio: string;
  public readonly specialty: string;
  
  protected status: AgentStatus = 'idle';
  protected config: AgentConfig;
  protected metrics: AgentMetrics;
  protected activeTasks: Map<string, AgentTask> = new Map();

  constructor(config: AgentConfig) {
    this.id = `AGENT_${config.studio ?? config.domain ?? 'unknown'}_${String(config.role)}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.name = config.name;
    this.role = String(config.role);
    this.studio = config.studio ?? config.domain ?? 'unknown';
    this.specialty = config.specialty ?? String(config.capability) ?? 'general';
    this.config = config;
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageExecutionTime: 0,
      lastActiveAt: Date.now()
    };

    console.log(`%c[Agent] ${this.name} (${this.role}) initialized for ${this.studio}`, 
      'color: #8b5cf6; font-weight: bold;');
  }

  // ============================================================================
  // CORE METHODS
  // ============================================================================

  /**
   * Process a task - must be implemented by subclasses
   */
  public abstract process(input: any): Promise<any>;

  /**
   * Validate input - can be overridden
   */
  public validate(input: any): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }

  /**
   * Execute task with error handling and retry logic
   */
  public async execute(task: AgentTask): Promise<any> {
    const startTime = Date.now();
    this.status = 'processing';
    this.activeTasks.set(task.id, { ...task, status: 'processing' });

    try {
      // Validate input
      const validation = this.validate(task.input);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Create ANGHV frame for QPPU processing
      const frame = qppuEngine.createFrame(this.studio, task.input, task.priority);

      // Process through QPPU
      const result = await this.process(task.input);
      
      // Update metrics
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, true);
      
      // Mark task complete
      task.status = 'completed';
      task.result = result;
      task.completedAt = Date.now();
      this.activeTasks.set(task.id, task);
      
      this.status = 'idle';
      this.metrics.lastActiveAt = Date.now();

      console.log(`%c[Agent] ${this.name} completed task ${task.id} in ${executionTime}ms`, 
        'color: #10b981;');

      return result;

    } catch (error) {
      // Handle error with retry logic
      const executionTime = Date.now() - startTime;
      this.updateMetrics(executionTime, false);
      
      task.status = 'error';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = Date.now();
      this.activeTasks.set(task.id, task);
      
      this.status = 'idle';

      console.error(`%c[Agent] ${this.name} failed task ${task.id}: ${task.error}`, 
        'color: #f43f5e;');

      throw error;
    }
  }

  /**
   * Create and queue a new task
   */
  public queueTask(type: string, input: any, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): AgentTask {
    const task: AgentTask = {
      id: `TASK_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      input,
      priority,
      status: 'idle',
      createdAt: Date.now()
    };

    this.activeTasks.set(task.id, task);
    return task;
  }

  /**
   * Get agent status
   */
  public getStatus(): { status: AgentStatus; activeTasks: number; metrics: AgentMetrics } {
    return {
      status: this.status,
      activeTasks: this.activeTasks.size,
      metrics: { ...this.metrics }
    };
  }

  // ============================================================================
  // PROTECTED METHODS
  // ============================================================================

  protected updateMetrics(executionTime: number, success: boolean): void {
    if (success) {
      this.metrics.tasksCompleted++;
      
      // Update average execution time
      const totalTasks = this.metrics.tasksCompleted + this.metrics.tasksFailed;
      this.metrics.averageExecutionTime = 
        ((this.metrics.averageExecutionTime * (totalTasks - 1)) + executionTime) / totalTasks;
    } else {
      this.metrics.tasksFailed++;
    }
  }

  protected async processWithQPPU(studio: string, operation: string, data: any): Promise<any> {
    const result = await qppuEngine.process(studio, operation, data);
    return result.output;
  }

  protected createANGHVFrame(payload: any, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): ANGHVFrame {
    return qppuEngine.createFrame(this.studio, payload, priority);
  }

  /**
   * THINK: Full SwarmV2-powered reasoning. Routes to the correct cognitive cluster.
   * This is the primary intelligence method for all agents in the OS.
   */
  protected async think(prompt: string, context: string = ''): Promise<string> {
    console.log(`%c[Synapse] ${this.name} initiating SwarmV2 reasoning (${this.role})...`, 'color: #f59e0b;');
    try {
      const { sovereignSwarmV2 } = await import('@/engine/SovereignSwarmConsensusV2');
      // Route to appropriate cluster based on agent role
      const clusterMap: Record<string, any> = {
        'security': 'SECURITY',
        'critic': 'SECURITY',
        'code': 'TECHNICAL',
        'executor': 'TECHNICAL',
        'engineer': 'TECHNICAL',
        'creative': 'CREATIVE',
        'creator': 'CREATIVE',
        'designer': 'CREATIVE',
        'researcher': 'RESEARCH',
        'analyst': 'RESEARCH',
        'specialist': 'RESEARCH',
      };
      const cluster = clusterMap[this.role.toLowerCase()] ?? 'LOGIC';
      const result = await sovereignSwarmV2.solve(
        `[AGENT: ${this.name}]\n${context ? `[CONTEXT]: ${context}\n` : ''}${prompt}`,
        { cluster, maxRounds: 1 }
      );
      return result.answer;
    } catch (e) {
      console.warn(`[Synapse] SwarmV2 unavailable for ${this.name}, using NativeNeuralCore:`, e);
      const { nativeNeuralCore } = await import('@/engine/NativeNeuralCore');
      return await nativeNeuralCore.generate(`[AGENT_${this.role.toUpperCase()}] ${prompt}`, context);
    }
  }

  /**
   * DEBATE: Run a full multi-round debate between this agent's cluster and the LOGIC cluster.
   * Use for high-stakes decisions that need cross-domain verification.
   */
  protected async debate(question: string, rounds: number = 2): Promise<string> {
    try {
      const { sovereignSwarmV2 } = await import('@/engine/SovereignSwarmConsensusV2');
      const result = await sovereignSwarmV2.solve(question, { maxRounds: rounds, requireVerification: true });
      return result.answer;
    } catch (e) {
      return this.think(question);
    }
  }

  /**
   * CRITIQUE: Run an adversarial critique of a given answer using the SECURITY cluster.
   */
  protected async critique(answerToReview: string, originalTask: string): Promise<string> {
    return this.think(
      `Critically evaluate this answer for flaws, errors, or incomplete reasoning.\nTask: "${originalTask}"\nAnswer: "${answerToReview}"\nProvide specific critique or say "PASSES_REVIEW" if correct.`
    );
  }

  /**
   * PARALLEL_THINK: Run multiple independent thoughts simultaneously.
   * Returns array of results in the same order.
   */
  protected async parallelThink(prompts: string[]): Promise<string[]> {
    try {
      const { sovereignSwarmV2 } = await import('@/engine/SovereignSwarmConsensusV2');
      const results = await sovereignSwarmV2.parallelSolve(prompts);
      return results.map(r => r.answer);
    } catch (e) {
      // Sequential fallback
      return Promise.all(prompts.map(p => this.think(p)));
    }
  }
}

// ============================================================================
// ARCHITECTURAL ENGINEER - Designs system architectures
// ============================================================================

export abstract class ArchitecturalEngineer extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'architect' });
  }

  /**
   * Design architecture - must be implemented
   */
  public abstract design(input: any): Promise<any>;

  /**
   * Plan implementation
   */
  public abstract plan(architecture: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const architecture = await this.design(input);
    const plan = await this.plan(architecture);
    return { architecture, plan };
  }
}

// ============================================================================
// ADVANCED ENGINEER - Implements solutions
// ============================================================================

export abstract class AdvancedEngineer extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'engineer' });
  }

  /**
   * Implement solution
   */
  public abstract implement(specification: any): Promise<any>;

  /**
   * Optimize implementation
   */
  public abstract optimize(implementation: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const implementation = await this.implement(input);
    const optimized = await this.optimize(implementation);
    return optimized;
  }
}

// ============================================================================
// PERFECTIONIST AGENT - Quality assurance and validation
// ============================================================================

export abstract class PerfectionistAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'perfectionist' });
  }

  /**
   * Quality check
   */
  public abstract qualityCheck(output: any): Promise<any>;

  /**
   * Validate against standards - must return sync { valid, errors }
   */
  public validate(input: any): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }

  /**
   * Perfect the output
   */
  public abstract perfect(output: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const checked = await this.qualityCheck(input);
    const validated = await this.validate(checked);
    const perfected = await this.perfect(validated);
    return perfected;
  }
}

// ============================================================================
// CRITIC AGENT - Expert analysis and evaluation
// ============================================================================

export abstract class CriticAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'critic' });
  }

  /**
   * Analyze output
   */
  public abstract analyze(input: any): Promise<any>;

  /**
   * Evaluate quality
   */
  public abstract evaluate(analysis: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const analysis = await this.analyze(input);
    const evaluation = await this.evaluate(analysis);
    return evaluation;
  }
}

// ============================================================================
// RESEARCH SCIENTIST - Innovation and research
// ============================================================================

export abstract class ResearchAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'researcher' });
  }

  /**
   * Research topic
   */
  public abstract research(topic: any): Promise<any>;

  /**
   * Find innovations
   */
  public abstract findInnovations(research: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const research = await this.research(input);
    const innovations = await this.findInnovations(research);
    return innovations;
  }
}

// ============================================================================
// SPECIALIST AGENT - Domain-specific expertise
// ============================================================================

export abstract class SpecialistAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'specialist' });
  }

  /**
   * Apply specialized knowledge
   */
  public abstract specialize(input: any): Promise<any>;

  public async process(input: any): Promise<any> {
    return await this.specialize(input);
  }
}

// ============================================================================
// OPTIMIZER AGENT - Performance optimization
// ============================================================================

export abstract class OptimizerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'optimizer' });
  }

  /**
   * Analyze performance
   */
  public abstract analyzePerformance(input: any): Promise<any>;

  /**
   * Optimize
   */
  public abstract optimize(analysis: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const analysis = await this.analyzePerformance(input);
    const optimized = await this.optimize(analysis);
    return optimized;
  }
}

// ============================================================================
// DESIGNER AGENT - Creative design
// ============================================================================

export abstract class DesignerAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'designer' });
  }

  /**
   * Design output
   */
  public abstract design(input: any): Promise<any>;

  /**
   * Refine design
   */
  public abstract refine(design: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const design = await this.design(input);
    const refined = await this.refine(design);
    return refined;
  }
}

// ============================================================================
// ANALYST AGENT - Data analysis
// ============================================================================

export abstract class AnalystAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'analyst' });
  }

  /**
   * Analyze data
   */
  public abstract analyzeData(input: any): Promise<any>;

  /**
   * Generate insights
   */
  public abstract generateInsights(analysis: any): Promise<any>;

  public async process(input: any): Promise<any> {
    const analysis = await this.analyzeData(input);
    const insights = await this.generateInsights(analysis);
    return insights;
  }
}

// ============================================================================
// ADMIN AGENT - Administrative tasks
// ============================================================================

export abstract class AdminAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super({ ...config, role: 'admin' });
  }

  /**
   * Administer
   */
  public abstract administer(input: any): Promise<any>;

  public async process(input: any): Promise<any> {
    return await this.administer(input);
  }
}

// Export all base classes
export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  studio: string;
  expertise: string[];
  capabilities: string[];
  status: 'online' | 'busy' | 'offline' | 'thinking';
  version: string;
  performance: number;
  contribution: number;
  lastActive?: string;
  createdAt?: string;
}

// Note: all classes are already exported with 'export abstract class' declarations above.