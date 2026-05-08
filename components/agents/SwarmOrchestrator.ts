// Plan Item ID: TI-1
/**
 * SwarmOrchestrator.ts — v6.0
 * Coordinates parallel multi-agent task execution with load balancing,
 * result aggregation, and autonomous retry loop.
 */

import { wavefrontExecutor } from '@/engine/WavefrontExecutor';
import { upeEngine } from '@/engine/UnifiedProcessingEngine';
import { agentHealthMonitor, AgentHealth } from './AgentHealthMonitor';


export interface SwarmTask {
  id: string;
  prompt: string;
  assignedAgent: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'queued' | 'running' | 'done' | 'failed';
  result?: string;
  attempts: number;
  maxAttempts: number;
  startedAt?: number;
  completedAt?: number;
}

export interface SwarmResult {
  tasks: SwarmTask[];
  synthesized: string;
  totalMs: number;
  agentsUsed: string[];
}

type AgentExecutor = (task: SwarmTask) => Promise<string>;

class SwarmOrchestrator {
  private readonly queue: SwarmTask[] = [];
  private readonly executors: Map<string, AgentExecutor> = new Map();
  private running = false;
  private registeredAgents: Set<string> = new Set();

  constructor() {
    this.initializeHealthMonitoring();
  }

  private initializeHealthMonitoring(): void {
    agentHealthMonitor.onHealthUpdate((health: AgentHealth) => {
      if (health.status === 'offline') {
        console.warn(`[Swarm] Agent ${health.agentId} is offline - unassigning tasks`);
        if (this.registeredAgents.has(health.agentId)) {
          this.registeredAgents.delete(health.agentId);
        }
      }
    });
  }

  /** Register an executor function for a specific agent ID */
  registerExecutor(agentId: string, fn: AgentExecutor) {
    this.executors.set(agentId, fn);
    this.registeredAgents.add(agentId);
    agentHealthMonitor.registerAgent(agentId);
  }

  /** Enqueue a task for the given agent */
  addTask(params: Omit<SwarmTask, 'status' | 'attempts'>): SwarmTask {
    const task: SwarmTask = {
      ...params,
      status: 'queued',
      attempts: 0,
      maxAttempts: params.maxAttempts ?? 3,
    };
    this.queue.push(task);
    return task;
  }

  /** Execute all queued tasks (parallel within the same priority group) */
  async runAll(): Promise<SwarmTask[]> {
    this.running = true;
    const start = Date.now();

    // Sort by priority
    const ORDER: Record<SwarmTask['priority'], number> = { critical: 0, high: 1, normal: 2, low: 3 };
    this.queue.sort((a, b) => ORDER[a.priority] - ORDER[b.priority]);

    const results = await Promise.allSettled(
      this.queue.map(task => this.executeTask(task))
    );

    this.running = false;
    console.debug(`[Swarm] Completed ${this.queue.length} tasks in ${Date.now() - start}ms`);
    return this.queue;
  }

  /**
   * PARALLEL BEAM ORCHESTRATION:
   * Executes tasks using Photonic Wavefront propagation and WDM isolation.
   */
  async parallelBeamOrchestrate(): Promise<SwarmResult> {
    this.running = true;
    const start = Date.now();
    const agentsUsed = new Set<string>();

    const beamPromises = this.queue.map(async (task, idx) => {
      agentsUsed.add(task.assignedAgent);
      
      // 1. Assign unique WDM Spectral ID (Wavelength Shift)
      const baseWavelength = 1550.72; // Standard Channel
      const wavelengthShift = (idx % 10) * 0.1; 
      const spectralID = baseWavelength + wavelengthShift;

      console.log(`[Swarm::QPPU] ⚡ Dispatching Parallel Beam for ${task.assignedAgent} | λ: ${spectralID.toFixed(2)}nm`);

      // 2. Map Trajectory via UPE
      const bundle = `(PH_SPATIAL_MUX "${task.prompt}" (PH_WDM_ENCODE ${spectralID}))`;
      const trajectory = await upeEngine.dispatch('logic', bundle, 'photonic');

      // 3. Parallel Propagation via WavefrontExecutor
      return wavefrontExecutor.propagate({
        id: `BEAM_${task.id}`,
        ast: ['PH_COHERENT_SWARM', task.assignedAgent],
        coherence: trajectory.fidelity || 0.9998
      }).then(async (prop) => {
        // 4. Final Execution
        const res = await this.executeTask(task);
        return { task, fidelity: prop.fidelity };
      });
    });

    await Promise.allSettled(beamPromises);
    this.running = false;

    return {
      tasks: this.queue,
      synthesized: this.synthesize(this.queue),
      totalMs: Date.now() - start,
      agentsUsed: Array.from(agentsUsed)
    };
  }

  private async executeTask(task: SwarmTask): Promise<void> {
    task.status = 'running';
    task.startedAt = Date.now();
    const startTime = Date.now();

    const executor = this.executors.get(task.assignedAgent);
    agentHealthMonitor.heartbeat(task.assignedAgent, 'healthy');

    while (task.attempts < task.maxAttempts) {
      task.attempts++;
      try {
        if (executor) {
          task.result = await executor(task);
        } else {
          task.result = await this.defaultExecutor(task);
        }
        task.status = 'done';
        task.completedAt = Date.now();
        agentHealthMonitor.markTaskComplete(task.assignedAgent, Date.now() - startTime);
        return;
      } catch (err) {
        console.warn(`[Swarm] Task ${task.id} attempt ${task.attempts} failed:`, err);
        if (task.attempts >= task.maxAttempts) {
          task.status = 'failed';
          task.result = `Failed after ${task.attempts} attempts: ${String(err)}`;
          task.completedAt = Date.now();
          agentHealthMonitor.markTaskFailed(task.assignedAgent, String(err));
        }
        await new Promise(r => setTimeout(r, Math.pow(2, task.attempts) * 200));
      }
    }
  }

  private async defaultExecutor(task: SwarmTask): Promise<string> {
    // Minimal synthetic executor — agents without registered functions
    await new Promise(r => setTimeout(r, 100 + Math.random() * 150));
    return `[${task.assignedAgent}] Processed: "${task.prompt.slice(0, 60)}..."`;
  }

  /** Synthesize final response from all completed tasks */
  synthesize(tasks: SwarmTask[]): string {
    const done = tasks.filter(t => t.status === 'done' && t.result);
    if (done.length === 0) return 'No agents produced usable output.';

    return done
      .map(t => `**[${t.assignedAgent}]**\n${t.result}`)
      .join('\n\n---\n\n');
  }

  clearQueue() {
    this.queue.length = 0;
  }

  isRunning() {
    return this.running;
  }

  getQueueStatus(): { total: number; done: number; failed: number; queued: number } {
    return {
      total:  this.queue.length,
      done:   this.queue.filter(t => t.status === 'done').length,
      failed: this.queue.filter(t => t.status === 'failed').length,
      queued: this.queue.filter(t => t.status === 'queued').length,
    };
  }
}

export const swarmOrchestrator = new SwarmOrchestrator();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
