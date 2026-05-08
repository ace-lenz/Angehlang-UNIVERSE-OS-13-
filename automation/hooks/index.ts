// Plan Item ID: TI-1
/**
 * Automation Hooks - React hooks for Sovereign Automaton
 * 
 * Provides reactive access to automation engines and workflows
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { automationAgentCore } from '@/agents/AutomationAgent';
import { automationEngine } from '@/features/automation/engines/AutomationEngine';
import { sovereignAutomaton } from '@/features/automation/engines/SovereignAutomatonEngine';
import {
  LatticeWorkflow,
  SovereignExecutionState,
  NeuralPulseTrigger,
  LivePulseView,
  GoalInput,
  SynthesisResult
} from '@/features/automation/types/sovereign-types';
import {
  ExecutionResult,
  HealingResult,
  WorkflowVersion,
  Schedule,
  ExecutionContext,
  BatchExecution,
  BatchResult
} from '@/features/automation/types';

// ===================== USE AUTOMATION ENGINE =====================

export function useAutomationEngine() {
  const [workflows, setWorkflows] = useState<LatticeWorkflow[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<SovereignExecutionState[]>([]);
  const [neuralTriggers, setNeuralTriggers] = useState<NeuralPulseTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allWorkflows, triggers] = await Promise.all([
        automationAgentCore.getAllWorkflows(),
        automationAgentCore.getNeuralTriggers()
      ]);
      setWorkflows(allWorkflows);
      setNeuralTriggers(triggers);
      setActiveExecutions(automationAgentCore.getActiveExecutions());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load engine data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const createWorkflow = useCallback(async (workflow: LatticeWorkflow) => {
    await automationAgentCore.createWorkflow(workflow);
    await refresh();
  }, [refresh]);

  const deleteWorkflow = useCallback(async (id: string) => {
    await automationAgentCore.deleteWorkflow(id);
    await refresh();
  }, [refresh]);

  return {
    workflows,
    activeExecutions,
    neuralTriggers,
    isLoading,
    error,
    refresh,
    createWorkflow,
    deleteWorkflow
  };
}

// ===================== USE SOVEREIGN AUTOMATON =====================

export function useSovereignAutomaton() {
  const [mode, setMode] = useState<'sovereign' | 'legacy'>('sovereign');
  const [livePulse, setLivePulse] = useState<LivePulseView | null>(null);
  const [healingLog, setHealingLog] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulse(automationAgentCore.getLivePulseView());
      setHealingLog(automationAgentCore.getHealingLog());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const setSovereignMode = useCallback((enabled: boolean) => {
    automationAgentCore.setMode(enabled);
    setMode(enabled ? 'sovereign' : 'legacy');
  }, []);

  const executeFromGoal = useCallback(async (goal: GoalInput): Promise<SynthesisResult> => {
    return await automationAgentCore.executeFromGoal(goal);
  }, []);

  const parseGoal = useCallback((goal: string) => {
    return automationAgentCore.parseGoal(goal);
  }, []);

  const registerTrigger = useCallback((trigger: NeuralPulseTrigger) => {
    automationAgentCore.registerNeuralTrigger(trigger);
  }, []);

  const fireTrigger = useCallback(async (eventType: string, sourceStudio: string, eventData: Record<string, any>) => {
    await automationAgentCore.fireNeuralTrigger(eventType as any, sourceStudio, eventData);
  }, []);

  return {
    mode,
    livePulse,
    healingLog,
    setSovereignMode,
    executeFromGoal,
    parseGoal,
    registerTrigger,
    fireTrigger
  };
}

// ===================== USE WORKFLOW =====================

export function useWorkflow(workflowId: string | null) {
  const [workflow, setWorkflow] = useState<LatticeWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowId) {
      setWorkflow(null);
      return;
    }

    const loadWorkflow = async () => {
      setIsLoading(true);
      try {
        const wf = await automationAgentCore.getWorkflow(workflowId);
        setWorkflow(wf);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load workflow');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [workflowId]);

  const updateWorkflow = useCallback(async (updates: Partial<LatticeWorkflow>) => {
    if (!workflow) return;
    const updated = { ...workflow, ...updates };
    await automationAgentCore.updateWorkflow(updated);
    setWorkflow(updated);
  }, [workflow]);

  const saveVersion = useCallback(async (comment: string) => {
    if (!workflowId) return null;
    return await automationAgentCore.saveWorkflowVersion(workflowId, comment);
  }, [workflowId]);

  const getVersions = useCallback(async () => {
    if (!workflowId) return [];
    return await automationAgentCore.getWorkflowVersions(workflowId);
  }, [workflowId]);

  const restoreVersion = useCallback(async (version: number) => {
    if (!workflowId) return;
    await automationAgentCore.restoreWorkflowVersion(workflowId, version);
  }, [workflowId]);

  return {
    workflow,
    isLoading,
    error,
    updateWorkflow,
    saveVersion,
    getVersions,
    restoreVersion
  };
}

// ===================== USE EXECUTION =====================

export function useExecution(workflowId: string | null) {
  const [execution, setExecution] = useState<SovereignExecutionState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const execute = useCallback(async (input: Record<string, any> = {}) => {
    if (!workflowId) return null;

    setIsExecuting(true);
    try {
      const execResult = await automationAgentCore.executeWorkflow(workflowId, input);
      setResult(execResult);
      return execResult;
    } finally {
      setIsExecuting(false);
    }
  }, [workflowId]);

  const executeBatch = useCallback(async (items: Record<string, any>[]) => {
    if (!workflowId) return null;
    return await automationAgentCore.executeBatch(workflowId, items);
  }, [workflowId]);

  const getMetrics = useCallback((executionId: string) => {
    return automationAgentCore.getExecutionMetrics(executionId);
  }, []);

  return {
    execution,
    isExecuting,
    result,
    execute,
    executeBatch,
    getMetrics
  };
}

// ===================== USE NEURAL TRIGGERS =====================

export function useNeuralTriggers() {
  const [triggers, setTriggers] = useState<NeuralPulseTrigger[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const load = () => {
      const all = automationAgentCore.getNeuralTriggers();
      setTriggers(all);
      setActiveCount(all.filter(t => t.enabled).length);
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  const registerTrigger = useCallback((trigger: NeuralPulseTrigger) => {
    automationAgentCore.registerNeuralTrigger(trigger);
    setTriggers(prev => [...prev, trigger]);
  }, []);

  const toggleTrigger = useCallback((triggerId: string, enabled: boolean) => {
    setTriggers(prev => prev.map(t => 
      t.id === triggerId ? { ...t, enabled } : t
    ));
  }, []);

  const fireTrigger = useCallback(async (
    eventType: string, 
    sourceStudio: string, 
    data: Record<string, any>
  ) => {
    await automationAgentCore.fireNeuralTrigger(eventType as any, sourceStudio, data);
  }, []);

  return {
    triggers,
    activeCount,
    registerTrigger,
    toggleTrigger,
    fireTrigger
  };
}

// ===================== USE LIVE PULSE =====================

export function useLivePulse(refreshInterval: number = 1000) {
  const [pulse, setPulse] = useState<LivePulseView | null>(null);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPulse = automationAgentCore.getLivePulseView();
      setPulse(newPulse);
      setActivityHistory(prev => [...prev.slice(-50), {
        timestamp: Date.now(),
        handshakes: newPulse.activeHandshakes.length,
        messages: newPulse.recentMessages.length
      }]);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getNodeActivity = useCallback((nodeId: string): number => {
    return pulse?.nodeActivity[nodeId] || 0;
  }, [pulse]);

  return {
    pulse,
    activityHistory,
    getNodeActivity
  };
}

// ===================== USE SYNTHESIS =====================

export function useSynthesis() {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [lastResult, setLastResult] = useState<SynthesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const synthesize = useCallback(async (options: {
    goal: string;
    constraints?: string[];
    context?: Record<string, any>;
    model?: string;
    temperature?: number;
  }): Promise<SynthesisResult> => {
    setIsSynthesizing(true);
    setError(null);

    try {
      const result = await automationAgentCore.synthesizeWorkflow(options);
      setLastResult(result);
      return result;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Synthesis failed';
      setError(errMsg);
      throw e;
    } finally {
      setIsSynthesizing(false);
    }
  }, []);

  const synthesizeFromGoal = useCallback(async (goalInput: GoalInput): Promise<SynthesisResult> => {
    setIsSynthesizing(true);
    setError(null);

    try {
      const result = await automationAgentCore.executeFromGoal(goalInput);
      setLastResult(result);
      return result;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Goal execution failed';
      setError(errMsg);
      throw e;
    } finally {
      setIsSynthesizing(false);
    }
  }, []);

  return {
    isSynthesizing,
    lastResult,
    error,
    synthesize,
    synthesizeFromGoal
  };
}

// ===================== USE SELF-HEALING =====================

export function useSelfHealing() {
  const [healingLog, setHealingLog] = useState<any[]>([]);
  const [isHealing, setIsHealing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHealingLog(automationAgentCore.getHealingLog());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selfHeal = useCallback(async (executionError: any): Promise<HealingResult> => {
    setIsHealing(true);
    try {
      const result = await automationAgentCore.selfHeal(executionError);
      setHealingLog(prev => [...prev, result]);
      return result;
    } finally {
      setIsHealing(false);
    }
  }, []);

  const getHealingStats = useCallback(() => {
    const total = healingLog.length;
    const successful = healingLog.filter(h => h.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? (successful / total) * 100 : 0;

    return { total, successful, failed, successRate };
  }, [healingLog]);

  return {
    healingLog,
    isHealing,
    selfHeal,
    getHealingStats
  };
}

// ===================== USE SCHEDULER =====================

export function useScheduler() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchedules = () => {
      setSchedules(automationEngine.getSchedules());
      setIsLoading(false);
    };

    loadSchedules();
    const interval = setInterval(loadSchedules, 5000);
    return () => clearInterval(interval);
  }, []);

  const scheduleWorkflow = useCallback(async (schedule: Schedule) => {
    await automationEngine.scheduleWorkflow(schedule);
    setSchedules(prev => [...prev, schedule]);
  }, []);

  const cancelSchedule = useCallback((scheduleId: string) => {
    automationEngine.cancelSchedule(scheduleId);
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
  }, []);

  const getNextRun = useCallback((scheduleId: string): number | undefined => {
    const schedule = schedules.find(s => s.id === scheduleId);
    return schedule?.nextRun;
  }, [schedules]);

  return {
    schedules,
    isLoading,
    scheduleWorkflow,
    cancelSchedule,
    getNextRun
  };
}

// ===================== USE DASHBOARD DATA =====================

export function useDashboardData() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const dashboardData = await automationEngine.getDashboardData();
        setData(dashboardData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getWorkflowStats = useCallback(() => {
    if (!data) return { total: 0, active: 0, completed: 0, failed: 0 };

    const workflows = data.workflows || [];
    const executions = data.activeExecutions || [];

    return {
      total: workflows.length,
      active: executions.filter(e => e.status === 'running').length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length
    };
  }, [data]);

  const getConnectorStats = useCallback(() => {
    if (!data) return { total: 0, active: 0 };
    const connectors = data.connectors || [];
    return {
      total: connectors.length,
      active: connectors.filter(c => c.enabled).length
    };
  }, [data]);

  return {
    data,
    isLoading,
    getWorkflowStats,
    getConnectorStats
  };
}

// ===================== USE LATTICE VISUALIZATION =====================

export function useLatticeVisualization(workflowId: string | null) {
  const [visualization, setVisualization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workflowId) {
      setVisualization(null);
      return;
    }

    setIsLoading(true);
    const viz = sovereignAutomaton.getLatticeVisualization(workflowId);
    setVisualization(viz);
    setIsLoading(false);
  }, [workflowId]);

  const refresh = useCallback(() => {
    if (workflowId) {
      const viz = sovereignAutomaton.getLatticeVisualization(workflowId);
      setVisualization(viz);
    }
  }, [workflowId]);

  return {
    visualization,
    isLoading,
    refresh,
    nodes: visualization?.nodes || [],
    edges: visualization?.edges || [],
    pulseData: visualization?.pulseData || []
  };
}

// ===================== EXPORT DEFAULT =====================

export default {
  useAutomationEngine,
  useSovereignAutomaton,
  useWorkflow,
  useExecution,
  useNeuralTriggers,
  useLivePulse,
  useSynthesis,
  useSelfHealing,
  useScheduler,
  useDashboardData,
  useLatticeVisualization
};

export * from './useFlexibleFlow';
export { studioBridge, createStudioHook } from '../StudioIntegrationBridge';
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
