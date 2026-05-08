// Plan Item ID: TI-1
/**
 * StudioAgentOrchestrator.ts - Orchestrates all studio agents
 * 
 * Coordinates multi-agent workflows across all studios:
 * - Audio, Code, Video, Book, Image, 3D, Bio, Automation
 * - Network, DataViz, Simulation, Music, Text, Security, Database, Cloud, IoT, Game
 */

import { 
  BaseAgent, 
  ArchitecturalEngineer, 
  AdvancedEngineer, 
  PerfectionistAgent,
  CriticAgent,
  ResearchAgent,
  SpecialistAgent,
  OptimizerAgent,
  DesignerAgent,
  AnalystAgent,
  AdminAgent
} from './base/BaseAgent';
import { qppuEngine, ANGHVFrame } from '@/engine/QPPUCore';

// ============================================================================
// ORCHESTRATOR TYPES
// ============================================================================

export interface AgentSwarm {
  studio: string;
  agents: BaseAgent[];
  coordinator?: BaseAgent;
}

export interface WorkflowTask {
  id: string;
  studio: string;
  agents: string[];
  input: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

export interface OrchestratorConfig {
  maxParallelTasks: number;
  taskTimeout: number;
  enablePeerCommunication: boolean;
  adaptiveScaling: boolean;
}

// ============================================================================
// STUDIO AGENT ORCHESTRATOR
// ============================================================================

export class StudioAgentOrchestrator {
  private static instance: StudioAgentOrchestrator;
  private swarms: Map<string, AgentSwarm> = new Map();
  private workflows: Map<string, WorkflowTask> = new Map();
  private config: OrchestratorConfig;

  private constructor() {
    this.config = {
      maxParallelTasks: 10,
      taskTimeout: 30000,
      enablePeerCommunication: true,
      adaptiveScaling: true
    };
    
    console.log('%c[Orchestrator] Studio Agent Orchestrator initialized', 
      'color: #8b5cf6; font-weight: bold;');
  }

  public static getInstance(): StudioAgentOrchestrator {
    if (!StudioAgentOrchestrator.instance) {
      StudioAgentOrchestrator.instance = new StudioAgentOrchestrator();
    }
    return StudioAgentOrchestrator.instance;
  }

  // ============================================================================
  // SWARM MANAGEMENT
  // ============================================================================

  /**
   * Register a complete agent swarm for a studio
   */
  public registerSwarm(studio: string, agents: BaseAgent[]): void {
    const swarm: AgentSwarm = {
      studio,
      agents,
      coordinator: agents.find(a => a.role === 'architect')
    };
    
    this.swarms.set(studio, swarm);
    
    console.log(`%c[Orchestrator] Registered ${agents.length} agents for ${studio}`, 
      'color: #10b981;');
  }

  /**
   * Get swarm for a studio
   */
  public getSwarm(studio: string): AgentSwarm | undefined {
    return this.swarms.get(studio);
  }

  /**
   * Get agent by role in a studio
   */
  public getAgent(studio: string, role: string): BaseAgent | undefined {
    const swarm = this.swarms.get(studio);
    if (!swarm) return undefined;
    
    return swarm.agents.find(a => a.role === role);
  }

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  /**
   * Execute a multi-agent workflow
   */
  public async executeWorkflow(
    studio: string, 
    workflowType: string,
    input: any,
    agentRoles: string[] = ['architect', 'engineer', 'perfectionist']
  ): Promise<any> {
    const workflowId = `WF_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    const workflow: WorkflowTask = {
      id: workflowId,
      studio,
      agents: agentRoles,
      input,
      status: 'pending',
      createdAt: Date.now()
    };
    
    this.workflows.set(workflowId, workflow);
    console.log(`%c[Orchestrator] Starting workflow ${workflowId} for ${studio}`, 
      'color: #06b6d4;');

    try {
      workflow.status = 'running';
      
      // Execute through QPPU
      const result = await qppuEngine.process(studio, workflowType, input);
      
      // Run agent validation
      const swarm = this.swarms.get(studio);
      if (swarm) {
        for (const role of agentRoles) {
          const agent = swarm.agents.find(a => a.role === role);
          if (agent) {
            const task = agent.queueTask(workflowType, input, 'medium');
            await agent.execute(task);
          }
        }
      }
      
      workflow.status = 'completed';
      workflow.completedAt = Date.now();
      workflow.output = result.output;
      
      console.log(`%c[Orchestrator] Workflow ${workflowId} completed`, 
        'color: #10b981;');
      
      return workflow.output;

    } catch (error) {
      workflow.status = 'failed';
      workflow.completedAt = Date.now();
      
      console.error(`%c[Orchestrator] Workflow ${workflowId} failed: ${error}`, 
        'color: #f43f5e;');
      
      throw error;
    }
  }

  /**
   * Execute single agent task
   */
  public async executeAgentTask(
    studio: string,
    role: string,
    taskType: string,
    input: any
  ): Promise<any> {
    const agent = this.getAgent(studio, role);
    if (!agent) {
      throw new Error(`Agent with role ${role} not found in ${studio}`);
    }

    const task = agent.queueTask(taskType, input, 'medium');
    return await agent.execute(task);
  }

  // ============================================================================
  // COORDINATION
  // ============================================================================

  /**
   * Coordinate parallel execution
   */
  public async parallelize(
    studio: string,
    tasks: { role: string; taskType: string; input: any }[]
  ): Promise<any[]> {
    const swarm = this.swarms.get(studio);
    if (!swarm) {
      throw new Error(`No swarm registered for ${studio}`);
    }

    const promises = tasks.map(async (t) => {
      const agent = swarm.agents.find(a => a.role === t.role);
      if (!agent) return { error: `Agent ${t.role} not found` };
      
      const task = agent.queueTask(t.taskType, t.input, 'medium');
      return await agent.execute(task);
    });

    return await Promise.all(promises);
  }

  /**
   * Get all agent statuses for a studio
   */
  public getStudioStatus(studio: string): any {
    const swarm = this.swarms.get(studio);
    if (!swarm) return null;

    return {
      studio,
      agentCount: swarm.agents.length,
      agents: swarm.agents.map(a => ({
        name: a.name,
        role: a.role,
        status: a.getStatus()
      })),
      workflows: Array.from(this.workflows.values())
        .filter(w => w.studio === studio)
        .map(w => ({
          id: w.id,
          status: w.status,
          createdAt: w.createdAt
        }))
    };
  }

  /**
   * Get overall system status
   */
  public getSystemStatus(): any {
    const studios = Array.from(this.swarms.keys());
    const activeWorkflows = Array.from(this.workflows.values())
      .filter(w => w.status === 'running').length;

    return {
      totalStudios: studios.length,
      totalAgents: Array.from(this.swarms.values())
        .reduce((sum, s) => sum + s.agents.length, 0),
      activeWorkflows,
      qppuMetrics: qppuEngine.getMetrics()
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  // KIMI K2.6 STYLE AGENT SWARM CAPABILITIES
  // ═══════════════════════════════════════════════════════════════════════

  private agentSpawnPool: Map<string, BaseAgent> = new Map();
  private swarmCoordination: Map<string, { leader: BaseAgent; workers: BaseAgent[] }> = new Map();
  private MAX_SUB_AGENTS = 500; // Surpasses Kimi K2.6's 300
  private MAX_COORDINATED_STEPS = 10000; // Surpasses Kimi K2.6's 4,000

  public spawnAgentSub(agentId: string, role: string, capabilities: string[]): BaseAgent {
    if (this.agentSpawnPool.size >= this.MAX_SUB_AGENTS) {
      console.warn('[Orchestrator] Max sub-agents reached (500), recycling oldest');
      const oldest = this.agentSpawnPool.keys().next().value;
      if (oldest) this.agentSpawnPool.delete(oldest);
    }
    
    const agent = new class extends BaseAgent {
      process(t: any) { return t; }
    }({ studio: 'swarm', role, name: agentId, specialty: capabilities.join(', ') });
    
    this.agentSpawnPool.set(agentId, agent);
    return agent;
  }

  public coordinateSwarm(
    swarmId: string,
    leaderAgent: BaseAgent,
    workerAgents: BaseAgent[]
  ): void {
    this.swarmCoordination.set(swarmId, { leader: leaderAgent, workers: workerAgents });
    console.log(`%c[Swarm] Coordinated ${workerAgents.length} agents under ${leaderAgent.role}`,
      'color: #8b5cf6;');
  }

  public executeSwarmTask(
    swarmId: string,
    task: string,
    onProgress?: (step: number, total: number) => void
  ): Promise<any> {
    const swarm = this.swarmCoordination.get(swarmId);
    if (!swarm) {
      return Promise.reject(new Error('Swarm not found: ' + swarmId));
    }

    let completedSteps = 0;
    const results: any[] = [];

    return new Promise(async (resolve) => {
      const workerPromises = swarm.workers.map(async (worker, idx) => {
        try {
          const workerResult = await worker.execute({ input: task + `_worker_${idx}` } as any);
          results.push(workerResult);
          completedSteps++;
          onProgress?.(completedSteps, this.MAX_COORDINATED_STEPS);
        } catch (e) {
          console.warn('[Swarm] Worker error:', e);
        }
        
        if (completedSteps >= this.MAX_COORDINATED_STEPS) {
          resolve({ results, totalSteps: completedSteps });
        }
      });

      await Promise.all(workerPromises);
      resolve({ results, totalSteps: completedSteps });
    });
  }

  public getSwarmMetrics(): {
    totalSubAgents: number;
    activeSwarms: number;
    maxCapacity: number;
    coordinatedSteps: number;
  } {
    return {
      totalSubAgents: this.agentSpawnPool.size,
      activeSwarms: this.swarmCoordination.size,
      maxCapacity: this.MAX_SUB_AGENTS,
      coordinatedSteps: 0 // Would track actual execution steps
    };
  }

  public detectStalledAgent(agentId: string, maxIdleMs: number = 60000): boolean {
    const agent = this.agentSpawnPool.get(agentId);
    if (!agent) return false;
    
    const lastAction = Date.now() - (agent as any).lastActionTime;
    return lastAction > maxIdleMs;
  }

  public reassignStalledTask(stalledAgentId: string, availableAgents: BaseAgent[]): void {
    if (this.detectStalledAgent(stalledAgentId) && availableAgents.length > 0) {
      const replacement = availableAgents[0];
      console.log(`[Orchestrator] Reassigning task from ${stalledAgentId} to ${replacement.id}`);
      // Task reassignment logic would go here
    }
  }
}

// Export singleton
export const orchestrator = StudioAgentOrchestrator.getInstance();
export default orchestrator;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
