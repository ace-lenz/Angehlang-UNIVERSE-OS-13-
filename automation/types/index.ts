// Plan Item ID: TI-1
/**
 * Automation Types Index
 * Exports all automation-related types for the Sovereign Automaton system
 */

// Re-export from sovereign types for backward compatibility
export * from './sovereign-types';

// Legacy compatibility - these were in the original types.ts
export interface AutomationTask {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface AutomationData {
  workflow: string;
  tasks: AutomationTask[];
}

// Additional utility types
export interface ExecutionResult {
  success: boolean;
  executionId: string;
  output?: any;
  error?: string;
  duration: number;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  connections: any[];
  enabled: boolean;
  version: number;
}

export interface TriggerDefinition {
  type: 'webhook' | 'schedule' | 'event' | 'manual';
  config: Record<string, any>;
  enabled: boolean;
}

export interface ConnectorDefinition {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
}

// Queue System Types
export type QueuePriority = 'critical' | 'high' | 'normal' | 'low';

export interface QueuedItem {
  id: string;
  workflowId: string;
  input: Record<string, any>;
  priority: QueuePriority;
  enqueuedAt: number;
  scheduledAt?: number;
  attempts: number;
  maxAttempts: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead';
}

export interface QueueStats {
  totalProcessed: number;
  currentlyQueued: number;
  currentlyProcessing: number;
  averageWaitTime: number;
  averageProcessTime: number;
  successRate: number;
  failureRate: number;
}

export interface QueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  defaultPriority: QueuePriority;
  defaultTimeout: number;
  deadLetterMaxAttempts: number;
  retryDelay: number;
  backoffMultiplier: number;
}

// WebSocket Types
export type WSMessageType = 
  | 'execution_start'
  | 'execution_progress'
  | 'execution_complete'
  | 'execution_error'
  | 'node_status'
  | 'node_complete'
  | 'node_error'
  | 'trigger_fired'
  | 'heartbeat'
  | 'connection_status'
  | 'workflow_update'
  | 'metric_update';

export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: number;
  executionId?: string;
  nodeId?: string;
  workflowId?: string;
}

export interface WSConnectionConfig {
  url: string;
  autoReconnect: boolean;
  reconnectInterval: number;
  reconnectMaxAttempts: number;
  heartbeatInterval: number;
  bufferSize: number;
}

export interface ConnectionState {
  connected: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
  lastMessage: number;
  buffer: WSMessage[];
}

// Circuit Breaker Types
export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
  monitoredOperations: string[];
}

export interface CircuitMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  averageResponseTime: number;
}

export interface CircuitRecord {
  operation: string;
  startTime: number;
  endTime?: number;
  success: boolean;
  error?: string;
}

// Logging Types
export interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  source: string;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  executionId?: string;
  nodeId?: string;
}

export interface LogFilter {
  level?: LogEntry['level'];
  source?: string;
  executionId?: string;
  startTime?: number;
  endTime?: number;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogEntry['level'], number>;
  bySource: Record<string, number>;
  errorRate: number;
}

// Missing types from AutomationEngine
export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  triggers?: TriggerConfig[];
  enabled: boolean;
  version: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  tags: string[];
  metadata: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  config?: any;
  params?: any;
  position?: { x: number, y: number };
  connections?: any[];
  errorHandling?: ErrorHandlingConfig;
  retryConfig?: RetryConfig;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  currentNode?: string;
  variables: Record<string, any>;
  input?: Record<string, any>;
  output?: Record<string, any>;
  history?: ExecutionStep[];
  startTime?: number;
  endTime?: number;
  retryCount?: number;
  error?: string;
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  status: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  input?: any;
  output?: any;
  result?: any;
  error?: string;
}

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TriggerConfig {
  type: 'webhook' | 'schedule' | 'event' | 'manual';
  config: Record<string, any>;
  enabled: boolean;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface AIAgentConfig {
  name?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
  maxIterations?: number;
  timeout?: number;
  memory?: any;
}

export interface ErrorHandlingConfig {
  retryEnabled: boolean;
  maxRetries?: number;
  retryDelay?: number;
  retryOnError?: boolean;
  continueOnError?: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff?: number;
  initialDelay?: number;
  backoffMultiplier?: number;
}

export interface WorkflowVersion {
  version: number;
  workflowId: string;
  snapshot: any;
  createdAt: number;
  createdBy?: string;
  changes?: string;
  comment?: string;
}

export interface WorkflowMetrics {
  totalRuns: number;
  successRate: number;
  avgDuration: number;
}

export interface ExecutionMetrics {
  totalExecutions?: number;
  successfulExecutions?: number;
  failedExecutions?: number;
  averageDuration?: number;
  minDuration?: number;
  maxDuration?: number;
  lastExecutionTime?: number;
  successRate?: number;
  startTime?: number;
  endTime?: number;
  steps?: number;
  errors?: number;
}

export interface NodeMetrics {
  nodeId: string;
  executionCount: number;
  avgDuration: number;
  errorCount: number;
}

export interface Schedule {
  id: string;
  workflowId: string;
  cronExpression?: string;
  cron?: string;
  interval?: number;
  enabled: boolean;
  nextRun?: number;
  lastRun?: number;
  runCount?: number;
}

export interface Condition {
  id?: string;
  nodeId?: string;
  variable?: string;
  operator: string;
  value?: any;
  expression?: string;
  leftOperand?: any;
  rightOperand?: any;
}

export interface CodeNodeConfig {
  language: 'javascript' | 'python' | 'typescript';
  code: string;
  sandbox?: boolean;
  timeout?: number;
}

export interface NodeResult {
  output: any;
  error?: string;
  duration: number;
}

export interface WebhookPayload {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface BatchExecution {
  workflowIds: string[];
  parallel: boolean;
  workflowId?: string; // For compatibility
  status?: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: number;
  endTime?: number;
  items?: BatchItem[];
  results?: BatchItemResult[];
}

export interface BatchItem {
  id: string;
  input: any;
}

export interface BatchItemResult {
  item: any;
  success: boolean;
  output?: any;
  error?: string;
}

export interface BatchResult {
  results: BatchItemResult[];
  item?: any;
  success?: boolean;
  output?: any;
  error?: string;
}

export interface HealingResult {
  success: boolean;
  executionId: string;
  nodeId: string;
  strategy: string;
  details: string;
}

export interface WorkflowMetrics {
  workflowId: string;
  totalRuns: number;
  successRate: number;
  avgDuration: number;
  executions: ExecutionMetrics[];
}

export interface AutomationDashboardData {
  workflows: Workflow[];
  executions: ExecutionContext[];
  metrics: WorkflowMetrics[];
  activeExecutions: ExecutionContext[];
  connectors?: IntegrationConnector[];
  recentExecutions?: ExecutionContext[];
  scheduledTasks?: Schedule[];
  aiAgents?: any[];
  versionHistory?: any[];
}
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
