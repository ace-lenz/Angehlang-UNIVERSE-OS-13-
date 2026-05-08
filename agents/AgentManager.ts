/**
 * AgentManager.ts - Multi-Agent Orchestration System
 * 
 * Features:
 * - Spawn multiple autonomous agents
 * - Parallel execution (up to 8 agents)
 * - Task planning and coordination
 * - Artifact generation
 * - Fractal memory for learning
 */

import { aiOrchestrator } from '@/features/ai/AIOrchestrator';

export interface AgentTask {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  logs: string[];
}

export interface Agent {
  id: string;
  name: string;
  role: 'coder' | 'reviewer' | 'tester' | 'designer' | 'architect';
  status: 'idle' | 'working' | 'completed' | 'failed';
  currentTask?: AgentTask;
  tasks: AgentTask[];
  artifacts: AgentArtifact[];
}

export interface AgentArtifact {
  id: string;
  type: 'code' | 'plan' | 'test' | 'screenshot' | 'documentation';
  content: string;
  path?: string;
  timestamp: number;
}

export interface AgentExecutionPlan {
  goal: string;
  tasks: AgentTask[];
  coordination: 'parallel' | 'sequential' | 'hybrid';
}

class AgentManager {
  private static instance: AgentManager;
  private agents: Map<string, Agent> = new Map();
  private maxParallel: number = 8;
  private fractalMemory: Map<number, { key: string; value: any; timestamp: number }> = new Map();

  private constructor() {
    this.initializeAgents();
  }

  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  private initializeAgents(): void {
    const agentTypes: Agent['role'][] = ['coder', 'reviewer', 'tester', 'designer', 'architect'];
    
    for (const role of agentTypes) {
      const id = `agent-${role}-${Date.now()}`;
      this.agents.set(id, {
        id,
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} Agent`,
        role,
        status: 'idle',
        tasks: [],
        artifacts: []
      });
    }
  }

  // ========== Execution Planning ==========

  async createExecutionPlan(goal: string): Promise<AgentExecutionPlan> {
    const prompt = `Break down this development goal into specific tasks:
    
Goal: ${goal}

Create a task list with:
1. Each task should be specific and actionable
2. Assign to one of these roles: coder, reviewer, tester, designer, architect
3. Define dependencies between tasks
4. Choose coordination: parallel (independent tasks), sequential (dependent), or hybrid

Respond in JSON:
{
  "goal": "...",
  "tasks": [{"id": "1", "description": "...", "assignee": "coder", "dependsOn": []}],
  "coordination": "parallel|sequential|hybrid"
}`;

    try {
      const response = await aiOrchestrator.generate({
        prompt,
        system: 'You are a software architect. Respond with valid JSON only.',
        maxTokens: 2000
      });

      const plan = JSON.parse(response.content);
      
      return {
        goal: plan.goal,
        tasks: plan.tasks.map((t: any) => ({
          id: t.id,
          description: t.description,
          status: 'pending' as const,
          logs: []
        })),
        coordination: plan.coordination || 'parallel'
      };

    } catch (e) {
      // Fallback simple plan
      return {
        goal,
        tasks: [
          { id: '1', description: `Implement ${goal}`, status: 'pending', logs: [] }
        ],
        coordination: 'sequential'
      };
    }
  }

  // ========== Execute Plan ==========

  async executePlan(plan: AgentExecutionPlan): Promise<AgentArtifact[]> {
    const allArtifacts: AgentArtifact[] = [];

    if (plan.coordination === 'parallel') {
      // Run all tasks in parallel
      const promises = plan.tasks.map(task => this.executeTask(task, plan.goal));
      const results = await Promise.allSettled(promises);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allArtifacts.push(...result.value);
        }
      }

    } else {
      // Sequential execution
      for (const task of plan.tasks) {
        const artifacts = await this.executeTask(task, plan.goal);
        allArtifacts.push(...artifacts);
      }
    }

    return allArtifacts;
  }

  private async executeTask(task: AgentTask, context: string): Promise<AgentArtifact[]> {
    const artifacts: AgentArtifact[] = [];
    
    task.status = 'running';
    task.logs.push(`[${new Date().toISOString()}] Starting task: ${task.description}`);

    try {
      // Generate code based on task
      const response = await aiOrchestrator.generate({
        prompt: task.description,
        system: `You are working on: ${task.description}\n\nContext: ${context}\n\nGenerate complete, production-ready code.`,
        maxTokens: 4096
      });

      task.status = 'completed';
      task.result = response.content;
      task.logs.push(`[${new Date().toISOString()}] Task completed`);

      // Create artifact
      artifacts.push({
        id: `artifact-${Date.now()}`,
        type: 'code',
        content: response.content,
        path: this.inferPath(task.description),
        timestamp: Date.now()
      });

      // Save to fractal memory
      this.saveToMemory(task.description, response.content);

    } catch (error) {
      task.status = 'failed';
      task.logs.push(`[${new Date().toISOString()}] Error: ${error}`);
    }

    return artifacts;
  }

  private inferPath(description: string): string {
    const desc = description.toLowerCase();
    if (desc.includes('component')) return 'components/';
    if (desc.includes('api') || desc.includes('route')) return 'app/api/';
    if (desc.includes('hook')) return 'hooks/';
    if (desc.includes('type')) return 'types/';
    return 'src/';
  }

  // ========== Parallel Multi-Agent ==========

  async executeParallel(goals: string[], maxAgents: number = 4): Promise<AgentArtifact[]> {
    const limitedGoals = goals.slice(0, Math.min(maxAgents, this.maxParallel));
    const promises = limitedGoals.map(goal => this.executeGoal(goal));
    const results = await Promise.allSettled(promises);

    const allArtifacts: AgentArtifact[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allArtifacts.push(...result.value);
      }
    }

    return allArtifacts;
  }

  private async executeGoal(goal: string): Promise<AgentArtifact[]> {
    const artifacts: AgentArtifact[] = [];
    
    try {
      const response = await aiOrchestrator.generate({
        prompt: goal,
        system: 'Generate complete code for this task.',
        maxTokens: 4096
      });

      artifacts.push({
        id: `artifact-${Date.now()}`,
        type: 'code',
        content: response.content,
        timestamp: Date.now()
      });

      // Also generate a plan artifact
      const planResponse = await aiOrchestrator.generate({
        prompt: `Create a task list for: ${goal}`,
        system: 'List specific tasks as bullet points.',
        maxTokens: 500
      });

      artifacts.push({
        id: `artifact-${Date.now()}`,
        type: 'plan',
        content: planResponse.content,
        timestamp: Date.now()
      });

    } catch (e) {
      console.error('[AgentManager] Execution failed:', e);
    }

    return artifacts;
  }

  // ========== Fractal Memory ==========

  private saveToMemory(key: string, value: any): void {
    const memoryKey = this.simpleHash(key);
    this.fractalMemory.set(memoryKey, {
      key,
      value,
      timestamp: Date.now()
    });

    // Persist to localStorage
    try {
      const entries = Array.from(this.fractalMemory.entries()).slice(-100);
      localStorage.setItem('agent_memory', JSON.stringify(entries));
    } catch (e) {
      console.warn('[AgentManager] Memory save failed:', e);
    }
  }

  loadFromMemory(): Map<number, { key: string; value: any; timestamp: number }> {
    try {
      const saved = localStorage.getItem('agent_memory');
      if (saved) {
        const entries = JSON.parse(saved);
        for (const [key, value] of entries) {
          this.fractalMemory.set(key, value);
        }
      }
    } catch (e) {
      console.warn('[AgentManager] Memory load failed:', e);
    }
    return this.fractalMemory;
  }

  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // ========== Compare Results ==========

  compareArtifacts(artifacts: AgentArtifact[]): AgentArtifact {
    // Find the "best" artifact based on length and complexity
    const codeArtifacts = artifacts.filter(a => a.type === 'code');
    
    if (codeArtifacts.length === 0) {
      return artifacts[0];
    }

    // Simple heuristic: prefer longer code
    return codeArtifacts.reduce((best, current) => 
      current.content.length > best.content.length ? current : best
    );
  }

  // ========== Getters ==========

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }
}

export const agentManager = AgentManager.getInstance();
export default agentManager;