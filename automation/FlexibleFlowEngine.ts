import { A2ACommunicationHub } from './engines/A2ACommunicationHub';
import type { NeuralPulseTrigger } from './types/sovereign-types';

export type FlowStepAction = 
  | 'generate' | 'analyze' | 'transform' | 'execute' | 'validate' | 'store' | 'notify' | 'wait' | 'branch' | 'loop'
  | 'convert' | 'merge' | 'split' | 'filter' | 'aggregate' | 'call' | 'synthesize'
  | 'scan' | 'collect' | 'deploy' | 'monitor' | 'extract' | 'predict';

export interface FlowStepCondition {
  [key: string]: any;
}

export type FlowStepTransform = any;

export interface FlowStepRetry {
  maxAttempts: number;
  delay: number;
  backoff?: number;
  onRetry?: (attempt: number, error: any) => void;
}

export interface FlowStepTimeout {
  duration: number;
  onTimeout?: () => void;
}

export interface FlowWebhook {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  retryOnFailure?: boolean;
}

export interface CustomFlowStep {
  id?: string;
  name: string;
  studio: string;
  action: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  [key: string]: any;
}

export interface CustomFlowConnection {
  fromStep: string;
  toStep: string;
  condition?: FlowStepCondition;
}

export interface CustomFlowVariable {
  name: string;
  type: string;
  defaultValue: any;
}

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  studios: string[];
  steps: Array<{ name: string; studio: string; action: string; inputMapping: Record<string, string>; outputMapping: Record<string, string> }>;
  variables: Array<{ name: string; type: string; defaultValue: any }>;
}

export interface CustomFlow {
  id?: string;
  name?: string;
  description?: string;
  status?: 'active' | 'paused' | 'draft';
  version?: number;
  connections?: Array<{ fromStep: string; toStep: string; condition?: FlowStepCondition }>;
  settings?: Record<string, any>;
  triggers?: Record<string, any>;
  steps?: any[];
  variables?: Array<{ name: string; type: string; defaultValue: any }>;
  createdAt?: number;
  updatedAt?: number;
}

export interface FlowExecution {
  id: string;
  flowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;
  completedAt?: number;
  duration?: number;
  stepResults: Record<string, any>;
  variables?: Array<{ name: string; value: any }>;
  error?: string;
  currentStep?: string | number;
  logs?: string[];
}

export interface FlowValidationResult {
  valid: boolean;
  errors: Array<{ stepId?: string; message: string; severity: 'error' | 'warning' }>;
}

export class FlexibleFlowEngine {
  private a2aHub = A2ACommunicationHub.getInstance();
  // private logicCore = SovereignLogicCore.getInstance(); // Not used in this class
  private flows: Map<string, CustomFlow> = new Map();
  private executions: Map<string, FlowExecution> = new Map();
  private templates: Map<string, FlowTemplate> = new Map();
  private executionQueue: string[] = [];
  private isProcessing = false;

  private static instance: FlexibleFlowEngine;

  static getInstance(): FlexibleFlowEngine {
    if (!FlexibleFlowEngine.instance) {
      FlexibleFlowEngine.instance = new FlexibleFlowEngine();
    }
    return FlexibleFlowEngine.instance;
  }

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    const templates: FlowTemplate[] = [
      {
        id: 'tpl-content-generation',
        name: 'AI Content Generation',
        description: 'Generate content using AI models across multiple studios',
        category: 'Content',
        studios: ['text', 'intelligence', 'image', 'video'],
        steps: [
          { name: 'Analyze Request', studio: 'intelligence', action: 'analyze', inputMapping: { input: 'request' }, outputMapping: { analysis: 'analysis' } },
          { name: 'Generate Text', studio: 'text', action: 'generate', inputMapping: { prompt: 'analysis' }, outputMapping: { content: 'text-content' } },
          { name: 'Enhance with AI', studio: 'intelligence', action: 'synthesize', inputMapping: { content: 'text-content' }, outputMapping: { enhanced: 'enhanced-content' } },
          { name: 'Generate Images', studio: 'image', action: 'generate', inputMapping: { prompt: 'enhanced-content' }, outputMapping: { images: 'generated-images' } },
          { name: 'Create Video', studio: 'video', action: 'generate', inputMapping: { images: 'generated-images' }, outputMapping: { video: 'final-video' } }
        ],
        variables: [
          { name: 'request', type: 'string', defaultValue: '' }
        ]
      },
      {
        id: 'tpl-security-scan',
        name: 'Full Security Scan',
        description: 'Complete security vulnerability scanning and remediation',
        category: 'Security',
        studios: ['network', 'security', 'code', 'automation'],
        steps: [
          { name: 'Discover Network', studio: 'network', action: 'analyze', inputMapping: {}, outputMapping: { topology: 'network-map' } },
          { name: 'Scan Vulnerabilities', studio: 'security', action: 'scan', inputMapping: { target: 'network-map' }, outputMapping: { vulnerabilities: 'findings' } },
          { name: 'Analyze Impact', studio: 'intelligence', action: 'analyze', inputMapping: { data: 'findings' }, outputMapping: { impact: 'risk-assessment' } },
          { name: 'Fix Issues', studio: 'code', action: 'execute', inputMapping: { fixes: 'risk-assessment' }, outputMapping: { result: 'fixes-applied' } },
          { name: 'Verify Fixes', studio: 'security', action: 'validate', inputMapping: { fixes: 'fixes-applied' }, outputMapping: { status: 'verification-status' } }
        ],
        variables: []
      },
      {
        id: 'tpl-data-pipeline',
        name: 'Data Processing Pipeline',
        description: 'Extract, transform, and load data across studios',
        category: 'Data',
        studios: ['browser', 'code', 'database', 'intelligence'],
        steps: [
          { name: 'Extract Data', studio: 'browser', action: 'collect', inputMapping: {}, outputMapping: { data: 'raw-data' } },
          { name: 'Transform Data', studio: 'code', action: 'transform', inputMapping: { data: 'raw-data' }, outputMapping: { transformed: 'clean-data' } },
          { name: 'Analyze Data', studio: 'intelligence', action: 'analyze', inputMapping: { data: 'clean-data' }, outputMapping: { insights: 'analysis-results' } },
          { name: 'Store Results', studio: 'database', action: 'store', inputMapping: { data: 'analysis-results' }, outputMapping: { status: 'storage-status' } }
        ],
        variables: []
      },
      {
        id: 'tpl-iot-monitoring',
        name: 'IoT Monitoring & Analytics',
        description: 'Monitor IoT devices and trigger automated actions',
        category: 'IoT',
        studios: ['iot', 'intelligence', 'simulation', 'automation'],
        steps: [
          { name: 'Collect Sensor Data', studio: 'iot', action: 'collect', inputMapping: {}, outputMapping: { sensorData: 'measurements' } },
          { name: 'Analyze Patterns', studio: 'intelligence', action: 'analyze', inputMapping: { data: 'measurements' }, outputMapping: { patterns: 'detected-patterns' } },
          { name: 'Predict Trends', studio: 'simulation', action: 'predict', inputMapping: { patterns: 'detected-patterns' }, outputMapping: { predictions: 'trend-predictions' } },
          { name: 'Trigger Actions', studio: 'automation', action: 'execute', inputMapping: { predictions: 'trend-predictions' }, outputMapping: { actions: 'automated-actions' } }
        ],
        variables: []
      },
      {
        id: 'tpl-ci-cd',
        name: 'CI/CD Pipeline',
        description: 'Build, test, and deploy applications',
        category: 'DevOps',
        studios: ['code', 'browser', 'security', 'cloud', 'os'],
        steps: [
          { name: 'Build', studio: 'code', action: 'execute', inputMapping: {}, outputMapping: { artifacts: 'build-output' } },
          { name: 'Run Tests', studio: 'browser', action: 'execute', inputMapping: { artifacts: 'build-output' }, outputMapping: { results: 'test-results' } },
          { name: 'Security Scan', studio: 'security', action: 'scan', inputMapping: { artifacts: 'build-output' }, outputMapping: { security: 'security-report' } },
          { name: 'Deploy', studio: 'cloud', action: 'deploy', inputMapping: { artifacts: 'build-output' }, outputMapping: { deployment: 'deployment-info' } },
          { name: 'Monitor', studio: 'os', action: 'monitor', inputMapping: { deployment: 'deployment-info' }, outputMapping: { metrics: 'health-metrics' } }
        ],
        variables: []
      },
      {
        id: 'tpl-research-analysis',
        name: 'Research & Analysis',
        description: 'Automated research and data analysis workflow',
        category: 'Research',
        studios: ['browser', 'text', 'intelligence', 'database', 'simulation'],
        steps: [
          { name: 'Gather Data', studio: 'browser', action: 'collect', inputMapping: {}, outputMapping: { data: 'web-data' } },
          { name: 'Extract Text', studio: 'text', action: 'extract', inputMapping: { data: 'web-data' }, outputMapping: { text: 'extracted-text' } },
          { name: 'Analyze Content', studio: 'intelligence', action: 'analyze', inputMapping: { input: 'extracted-text' }, outputMapping: { analysis: 'analysis-results' } },
          { name: 'Simulate Predictions', studio: 'simulation', action: 'predict', inputMapping: { data: 'analysis-results' }, outputMapping: { predictions: 'future-predictions' } },
          { name: 'Store Findings', studio: 'database', action: 'store', inputMapping: { data: 'future-predictions' }, outputMapping: { status: 'storage-status' } }
        ],
        variables: []
      }
    ];

    for (const template of templates) {
      this.templates.set(template.id, template);
    }
  }

  createFlow(flow: Omit<CustomFlow, 'id' | 'version' | 'createdAt' | 'updatedAt'>): CustomFlow {
    const fullFlow: CustomFlow = {
      ...flow,
      id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.flows.set(fullFlow.id, fullFlow);
    return fullFlow;
  }

  updateFlow(flowId: string, updates: Partial<CustomFlow>): CustomFlow | null {
    const flow = this.flows.get(flowId);
    if (!flow) return null;

    const updatedFlow: CustomFlow = {
      ...flow,
      ...updates,
      version: flow.version + 1,
      updatedAt: Date.now()
    };

    this.flows.set(flowId, updatedFlow);
    return updatedFlow;
  }

  deleteFlow(flowId: string): boolean {
    return this.flows.delete(flowId);
  }

  getFlow(flowId: string): CustomFlow | undefined {
    return this.flows.get(flowId);
  }

  getFlows(filter?: { status?: CustomFlow['status']; category?: string }): CustomFlow[] {
    let result = Array.from(this.flows.values());

    if (filter?.status) {
      result = result.filter(f => f.status === filter.status);
    }

    return result;
  }

  validateFlow(flow: CustomFlow): FlowValidationResult {
    const errors: Array<{ stepId?: string; message: string; severity: 'error' | 'warning' }> = [];

    if (!flow.name?.trim()) {
      errors.push({ message: 'Flow name is required', severity: 'error' });
    }

    if (flow.steps.length === 0) {
      errors.push({ message: 'Flow must have at least one step', severity: 'error' });
    }

    const stepIds = new Set<string>();
    for (const step of flow.steps) {
      if (stepIds.has(step.id)) {
        errors.push({ stepId: step.id, message: `Duplicate step ID: ${step.id}`, severity: 'error' });
      }
      stepIds.add(step.id);

      if (!step.studio) {
        errors.push({ stepId: step.id, message: 'Step studio is required', severity: 'error' });
      }

      if (!step.action) {
        errors.push({ stepId: step.id, message: 'Step action is required', severity: 'error' });
      }

      if (step.onSuccess && !flow.steps.find(s => s.id === step.onSuccess)) {
        errors.push({ stepId: step.id, message: `Invalid success target: ${step.onSuccess}`, severity: 'error' });
      }

      if (step.onFailure && !flow.steps.find(s => s.id === step.onFailure)) {
        errors.push({ stepId: step.id, message: `Invalid failure target: ${step.onFailure}`, severity: 'error' });
      }
    }

    for (const conn of flow.connections || []) {
      if (!flow.steps.find(s => s.id === conn.fromStep)) {
        errors.push({ message: `Invalid connection source: ${conn.fromStep}`, severity: 'error' });
      }
      if (!flow.steps.find(s => s.id === conn.toStep)) {
        errors.push({ message: `Invalid connection target: ${conn.toStep}`, severity: 'error' });
      }
    }

    const usedVariables = new Set<string>();
    for (const step of flow.steps) {
      for (const input of Object.values(step.inputMapping || {}) as string[]) {
        usedVariables.add(input);
      }
    }

    for (const variable of flow.variables || []) {
      if (!usedVariables.has(variable.name)) {
        errors.push({ message: `Unused variable: ${variable.name}`, severity: 'warning' });
      }
    }

    return { valid: errors.filter(e => e.severity === 'error').length === 0, errors };
  }

  async executeFlow(flowId: string, initialVariables?: Record<string, any>): Promise<FlowExecution> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    if (flow.status !== 'active') {
      throw new Error(`Flow is not active: ${flow.status}`);
    }

    const execution: FlowExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      flowId,
      status: 'running',
      variables: (flow.variables || []).map(v => ({ name: v.name, value: v.defaultValue })),
      stepResults: {},
      logs: [`Flow execution started: ${flow.name}`],
      startedAt: Date.now()
    };

    this.executions.set(execution.id, execution);
    this.executionQueue.push(execution.id);
    this.processQueue();

    return execution;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.executionQueue.length === 0) return;
    this.isProcessing = true;

    while (this.executionQueue.length > 0) {
      const executionId = this.executionQueue.shift()!;
      const execution = this.executions.get(executionId);
      
      if (!execution || execution.status !== 'running') continue;

      try {
        await this.executeFlowSteps(execution);
        execution.status = 'completed';
        execution.completedAt = Date.now();
        execution.duration = execution.completedAt - execution.startedAt;
        
        this.log(execution, 'info', `Flow completed in ${execution.duration}ms`);
      } catch (error) {
        execution.status = 'failed';
        execution.completedAt = Date.now();
        execution.duration = execution.completedAt - execution.startedAt;
        execution.error = `Flow failed: ${(error as Error).message}`;
        
        this.log(execution, 'error', `Flow failed: ${(error as Error).message}`);
      }

      this.executions.set(executionId, execution);

      await this.a2aHub.broadcastToChannel('automation', 'flow-execution-complete', {
        executionId,
        flowId: execution.flowId,
        status: execution.status,
        duration: execution.duration,
        timestamp: Date.now()
      });
    }

    this.isProcessing = false;
  }

  private async executeFlowSteps(execution: FlowExecution): Promise<void> {
    const flow = this.flows.get(execution.flowId);
    if (!flow) return;

    const stepsMap = new Map(flow.steps.map(s => [s.id, s]));
    const connectionsMap = new Map<string, string[]>();

    for (const conn of flow.connections || []) {
      if (!connectionsMap.has(conn.fromStep)) {
        connectionsMap.set(conn.fromStep, []);
      }
      connectionsMap.get(conn.fromStep)!.push(conn.toStep);
    }

    const getNextSteps = (currentStepId: string): string[] => {
      const step = stepsMap.get(currentStepId);
      const nextSteps: string[] = [];

      if (step?.condition) {
        const conditionMet = this.evaluateCondition(step.condition, execution.variables);
        if (conditionMet && step.onSuccess) {
          nextSteps.push(step.onSuccess);
        } else if (!conditionMet && step.onFailure) {
          nextSteps.push(step.onFailure);
        }
      } else if (step?.onSuccess) {
        nextSteps.push(step.onSuccess);
      }

      const connNextSteps = connectionsMap.get(currentStepId) || [];
      for (const connNext of connNextSteps) {
        if (connNext && !nextSteps.includes(connNext)) {
          if (!connNext || !stepsMap.has(connNext)) continue;
          
          const conn = flow.connections?.find(c => c.fromStep === currentStepId && c.toStep === connNext);
          if (!conn?.condition || this.evaluateCondition(conn.condition, execution.variables)) {
            nextSteps.push(connNext);
          }
        }
      }

      return nextSteps;
    };

    const findStartSteps = (): string[] => {
      const allTargets = new Set<string>();
      
      for (const step of flow.steps) {
        if (step.onSuccess) allTargets.add(step.onSuccess);
        if (step.onFailure) allTargets.add(step.onFailure);
      }
      
      for (const conn of flow.connections || []) {
        allTargets.add(conn.toStep);
      }
      
      return flow.steps
        .filter(s => !allTargets.has(s.id))
        .map(s => s.id);
    };

    const visitedSteps = new Set<string>();
    let currentSteps = findStartSteps();

    while (currentSteps.length > 0) {
      const nextSteps: string[] = [];

      for (const stepId of currentSteps) {
        if (visitedSteps.has(stepId)) continue;
        
        const step = stepsMap.get(stepId);
        if (!step) continue;

        visitedSteps.add(stepId);
        execution.currentStep = stepId;
        this.executions.set(execution.id, execution);

        this.log(execution, 'info', `Executing step: ${step.name} (${step.studio}.${step.action})`);

        try {
          const result = await this.executeStep(step, execution);
          
          execution.stepResults[stepId] = result;

          for (const [outputKey, mapping] of Object.entries(step.outputMapping || {}) as [string, string][]) {
            execution.variables[mapping] = result[outputKey] ?? result;
          }

          if (step.transform) {
            for (const transform of step.transform) {
              execution.variables[transform.output] = this.applyTransform(transform, execution.variables[transform.input]);
            }
          }

          this.log(execution, 'info', `Step completed: ${step.name}`, result);
        } catch (error) {
          this.log(execution, 'error', `Step failed: ${step.name}`, { error: (error as Error).message });

          if (step.retry) {
            const retryResult = await this.handleRetry(step, execution, error as Error);
            if (retryResult.success) {
              nextSteps.push(...getNextSteps(stepId));
              continue;
            }
          }

          if (flow.settings.errorHandling === 'stop') {
            throw error;
          } else if (flow.settings.errorHandling === 'continue') {
            const failureTarget = step.onFailure;
            if (failureTarget && stepsMap.has(failureTarget)) {
              nextSteps.push(failureTarget);
            }
          }
        }

        nextSteps.push(...getNextSteps(stepId));
      }

      currentSteps = [...new Set(nextSteps)];
    }
  }

  private async executeStep(step: CustomFlowStep, execution: FlowExecution): Promise<any> {
    const input: Record<string, any> = {};
    
    for (const [param, varName] of Object.entries(step.inputMapping || {})) {
      input[param] = execution.variables[varName];
    }

    const result = await this.a2aHub.sendToAgent(
      step.studio,
      `${step.studio}-agent`,
      step.action,
      { ...input, ...step.metadata }
    );

    return typeof result === 'object' ? (result as any)?.payload || result : result;
  }

  private async handleRetry(step: CustomFlowStep, execution: FlowExecution, error: Error): Promise<{ success: boolean; result?: any }> {
    if (!step.retry) return { success: false };

    const { maxAttempts, delayMs, backoffMultiplier = 1 } = step.retry;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.log(execution, 'warn', `Retry attempt ${attempt}/${maxAttempts} for step ${step.name}`);
      
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(backoffMultiplier, attempt - 1)));
      
      try {
        const result = await this.executeStep(step, execution);
        return { success: true, result };
      } catch (attemptError) {
        if (attempt === maxAttempts) {
          return { success: false };
        }
      }
    }

    return { success: false };
  }

  private evaluateCondition(condition: FlowStepCondition, variables: Record<string, any>): boolean {
    const value = variables[condition.variable];
    const targetValue = condition.value;

    switch (condition.operator) {
      case 'eq': return value === targetValue;
      case 'neq': return value !== targetValue;
      case 'gt': return value > targetValue;
      case 'gte': return value >= targetValue;
      case 'lt': return value < targetValue;
      case 'lte': return value <= targetValue;
      case 'contains': return String(value).includes(String(targetValue));
      case 'exists': return value !== undefined && value !== null;
      case 'not_exists': return value === undefined || value === null;
      default: return false;
    }
  }

  private applyTransform(transform: FlowStepTransform, data: any): any {
    switch (transform.type) {
      case 'map': return data?.map((item: any) => this.mapObject(item, transform.config));
      case 'filter': return data?.filter((item: any) => this.filterObject(item, transform.config));
      case 'merge': return { ...data, ...transform.config };
      case 'split': return Array.isArray(data) ? data : [data];
      case 'convert': return this.convertType(data, transform.config);
      case 'validate': return this.validateData(data, transform.config);
      default: return data;
    }
  }

  private mapObject(item: any, config: Record<string, string>): any {
    const result: any = {};
    for (const [newKey, oldKey] of Object.entries(config)) {
      result[newKey] = item[oldKey];
    }
    return result;
  }

  private filterObject(item: any, config: Record<string, any>): boolean {
    for (const [key, value] of Object.entries(config)) {
      if (item[key] !== value) return false;
    }
    return true;
  }

  private convertType(data: any, config: Record<string, any>): any {
    const targetType = config.targetType;
    switch (targetType) {
      case 'string': return String(data);
      case 'number': return Number(data);
      case 'boolean': return Boolean(data);
      case 'object': return typeof data === 'object' ? data : JSON.parse(data);
      default: return data;
    }
  }

  private validateData(data: any, config: Record<string, any>): any {
    const required = config.required as string[];
    if (required) {
      for (const field of required) {
        if (!data[field]) {
          throw new Error(`Validation failed: required field ${field} is missing`);
        }
      }
    }
    return data;
  }

  private log(execution: FlowExecution, level: 'info' | 'error' | 'warn', message: string, data?: any): void {
    execution.logs = execution.logs || [];
    execution.logs.push(`[${level.toUpperCase()}] ${message}`);
    this.executions.set(execution.id, execution);
  }

  createFlowFromTemplate(templateId: string, overrides?: Partial<CustomFlow>): CustomFlow | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const flowId = `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const steps: CustomFlowStep[] = template.steps.map((step, index) => ({
      ...step,
      id: `step-${index + 1}`,
      onSuccess: template.steps[index + 1] ? `step-${index + 2}` : undefined,
      onFailure: undefined
    }));

    return this.createFlow({
      name: overrides?.name || template.name,
      description: overrides?.description || template.description,
      status: 'draft',
      variables: (template.variables || []).map((v, i) => ({ ...v, name: `var${i + 1}` })),
      steps,
      connections: [],
      triggers: { manual: true },
      settings: { errorHandling: 'stop', logging: true }
    });
  }

  getTemplates(category?: string): FlowTemplate[] {
    let result = Array.from(this.templates.values());
    if (category) {
      result = result.filter(t => t.category === category);
    }
    return result;
  }

  getExecution(executionId: string): FlowExecution | undefined {
    return this.executions.get(executionId);
  }

  getExecutions(flowId?: string): FlowExecution[] {
    let result = Array.from(this.executions.values());
    if (flowId) {
      result = result.filter(e => e.flowId === flowId);
    }
    return result.sort((a, b) => b.startedAt - a.startedAt);
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (!execution || execution.status !== 'running') return false;

    execution.status = 'cancelled';
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    this.executions.set(executionId, execution);

    this.log(execution, 'info', 'Execution cancelled by user');
    return true;
  }

  getFlowStats(): {
    totalFlows: number;
    activeFlows: number;
    draftFlows: number;
    pausedFlows: number;
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    avgDuration: number;
    templatesCount: number;
  } {
    const flows = Array.from(this.flows.values());
    const executions = Array.from(this.executions.values());

    return {
      totalFlows: flows.length,
      activeFlows: flows.filter(f => f.status === 'active').length,
      draftFlows: flows.filter(f => f.status === 'draft').length,
      pausedFlows: flows.filter(f => f.status === 'paused').length,
      totalExecutions: executions.length,
      completedExecutions: executions.filter(e => e.status === 'completed').length,
      failedExecutions: executions.filter(e => e.status === 'failed').length,
      avgDuration: executions.length > 0 
        ? executions.reduce((a, e) => a + (e.duration || 0), 0) / executions.length 
        : 0,
      templatesCount: this.templates.size
    };
  }
}

export const flexibleFlowEngine = FlexibleFlowEngine.getInstance();
export default flexibleFlowEngine;