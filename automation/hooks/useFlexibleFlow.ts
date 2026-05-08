import { useState, useEffect, useCallback } from 'react';
import { 
  flexibleFlowEngine,
  CustomFlow,
  FlowExecution,
  FlowTemplate,
  FlowValidationResult,
  CustomFlowStep,
  CustomFlowConnection,
  CustomFlowVariable,
  FlowStepCondition,
  FlowStepTransform,
  FlowStepRetry,
  FlowStepTimeout,
  FlowWebhook
} from '../FlexibleFlowEngine';

export type { 
  CustomFlow, 
  FlowExecution, 
  FlowTemplate, 
  FlowValidationResult,
  CustomFlowStep,
  CustomFlowConnection,
  CustomFlowVariable,
  FlowStepCondition,
  FlowStepTransform,
  FlowStepRetry,
  FlowStepTimeout,
  FlowWebhook
};

export function useFlexibleFlow() {
  const [flows, setFlows] = useState<CustomFlow[]>([]);
  const [templates, setTemplates] = useState<FlowTemplate[]>([]);
  const [executions, setExecutions] = useState<FlowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    try {
      setFlows(flexibleFlowEngine.getFlows());
      setTemplates(flexibleFlowEngine.getTemplates());
      setExecutions(flexibleFlowEngine.getExecutions());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load flows');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const createFlow = useCallback((flow: Omit<CustomFlow, 'id' | 'version' | 'createdAt' | 'updatedAt'>) => {
    const created = flexibleFlowEngine.createFlow(flow);
    loadData();
    return created;
  }, [loadData]);

  const updateFlow = useCallback((flowId: string, updates: Partial<CustomFlow>) => {
    const updated = flexibleFlowEngine.updateFlow(flowId, updates);
    loadData();
    return updated;
  }, [loadData]);

  const deleteFlow = useCallback((flowId: string) => {
    const deleted = flexibleFlowEngine.deleteFlow(flowId);
    loadData();
    return deleted;
  }, [loadData]);

  const activateFlow = useCallback((flowId: string) => {
    return updateFlow(flowId, { status: 'active' });
  }, [updateFlow]);

  const pauseFlow = useCallback((flowId: string) => {
    return updateFlow(flowId, { status: 'paused' });
  }, [updateFlow]);

  const validateFlow = useCallback((flow: CustomFlow): FlowValidationResult => {
    return flexibleFlowEngine.validateFlow(flow);
  }, []);

  const executeFlow = useCallback(async (flowId: string, initialVariables?: Record<string, any>) => {
    const execution = await flexibleFlowEngine.executeFlow(flowId, initialVariables);
    loadData();
    return execution;
  }, [loadData]);

  const cancelExecution = useCallback((executionId: string) => {
    const cancelled = flexibleFlowEngine.cancelExecution(executionId);
    loadData();
    return cancelled;
  }, [loadData]);

  const createFromTemplate = useCallback((templateId: string, name?: string) => {
    const flow = flexibleFlowEngine.createFlowFromTemplate(templateId, { name });
    loadData();
    return flow;
  }, [loadData]);

  const getFlow = useCallback((flowId: string) => {
    return flexibleFlowEngine.getFlow(flowId);
  }, []);

  const getExecution = useCallback((executionId: string) => {
    return flexibleFlowEngine.getExecution(executionId);
  }, []);

  const getStats = useCallback(() => {
    return flexibleFlowEngine.getFlowStats();
  }, []);

  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  return {
    flows,
    templates,
    executions,
    isLoading,
    error,
    stats: getStats(),
    createFlow,
    updateFlow,
    deleteFlow,
    activateFlow,
    pauseFlow,
    validateFlow,
    executeFlow,
    cancelExecution,
    createFromTemplate,
    getFlow,
    getExecution,
    getStats,
    getTemplatesByCategory,
    refresh: loadData
  };
}

export function useFlowBuilder(initialFlow?: CustomFlow) {
  const [flow, setFlow] = useState<Partial<CustomFlow>>(initialFlow || {
    name: '',
    description: '',
    status: 'draft',
    variables: [],
    steps: [],
    connections: [],
    triggers: { manual: true },
    settings: { errorHandling: 'stop', logging: true }
  });

  const [validation, setValidation] = useState<FlowValidationResult>({ valid: true, errors: [] });

  const updateFlowInfo = useCallback((updates: Partial<CustomFlow>) => {
    setFlow(prev => ({ ...prev, ...updates }));
  }, []);

  const addVariable = useCallback((variable: CustomFlowVariable) => {
    setFlow(prev => ({
      ...prev,
      variables: [...(prev.variables || []), variable]
    }));
  }, []);

  const updateVariable = useCallback((index: number, updates: Partial<CustomFlowVariable>) => {
    setFlow(prev => {
      const vars = [...(prev.variables || [])];
      vars[index] = { ...vars[index], ...updates };
      return { ...prev, variables: vars };
    });
  }, []);

  const removeVariable = useCallback((index: number) => {
    setFlow(prev => ({
      ...prev,
      variables: (prev.variables || []).filter((_, i) => i !== index)
    }));
  }, []);

  const addStep = useCallback((step: CustomFlowStep) => {
    setFlow(prev => ({
      ...prev,
      steps: [...(prev.steps || []), step]
    }));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<CustomFlowStep>) => {
    setFlow(prev => ({
      ...prev,
      steps: (prev.steps || []).map(s => s.id === stepId ? { ...s, ...updates } : s)
    }));
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setFlow(prev => ({
      ...prev,
      steps: (prev.steps || []).filter(s => s.id !== stepId),
      connections: (prev.connections || []).filter(c => c.fromStep !== stepId && c.toStep !== stepId)
    }));
  }, []);

  const addConnection = useCallback((connection: CustomFlowConnection) => {
    setFlow(prev => ({
      ...prev,
      connections: [...(prev.connections || []), connection]
    }));
  }, []);

  const removeConnection = useCallback((fromStep: string, toStep: string) => {
    setFlow(prev => ({
      ...prev,
      connections: (prev.connections || []).filter(c => 
        !(c.fromStep === fromStep && c.toStep === toStep)
      )
    }));
  }, []);

  const validate = useCallback(() => {
    if (!flow.name || !flow.steps?.length) {
      setValidation({ valid: false, errors: [{ message: 'Flow needs name and at least one step', severity: 'error' }] });
      return false;
    }
    
    const flowValidation = flexibleFlowEngine.validateFlow(flow as CustomFlow);
    setValidation(flowValidation);
    return flowValidation.valid;
  }, [flow]);

  const save = useCallback(() => {
    if (!validate()) return null;
    
    const saved = flexibleFlowEngine.createFlow(flow as Omit<CustomFlow, 'id' | 'version' | 'createdAt' | 'updatedAt'>);
    setFlow({
      name: '',
      description: '',
      status: 'draft',
      variables: [],
      steps: [],
      connections: [],
      triggers: { manual: true },
      settings: { errorHandling: 'stop', logging: true }
    });
    return saved;
  }, [flow, validate]);

  return {
    flow,
    validation,
    updateFlowInfo,
    addVariable,
    updateVariable,
    removeVariable,
    addStep,
    updateStep,
    removeStep,
    addConnection,
    removeConnection,
    validate,
    save
  };
}

export function useFlowExecution(flowId: string | null) {
  const [execution, setExecution] = useState<FlowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (!flowId) return;

    const loadExecution = () => {
      const execs = flexibleFlowEngine.getExecutions(flowId);
      if (execs.length > 0) {
        setExecution(execs[0]);
      }
    };

    loadExecution();
    const interval = setInterval(loadExecution, 1000);
    return () => clearInterval(interval);
  }, [flowId]);

  const startExecution = useCallback(async (initialVariables?: Record<string, any>) => {
    if (!flowId) return null;

    setIsExecuting(true);
    try {
      const exec = await flexibleFlowEngine.executeFlow(flowId, initialVariables);
      setExecution(exec);
      return exec;
    } finally {
      setIsExecuting(false);
    }
  }, [flowId]);

  const cancel = useCallback(async () => {
    if (!execution?.id) return false;
    return flexibleFlowEngine.cancelExecution(execution.id);
  }, [execution]);

  return {
    execution,
    isExecuting,
    startExecution,
    cancel
  };
}

export default useFlexibleFlow;