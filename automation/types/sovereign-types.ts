// Sovereign Automaton Types - Lattice Engine Primitives

import { ASTNode } from '@/engine/SovereignLogicCore';
import { AgentInfo, AgentMessage } from '@/agents/A2ACommunicationHub';
import type { RetryConfig, ErrorHandlingConfig } from './index';

// ===================== LATTICE NODE TYPES =====================

export type LatticeNodeType = 
  | 'a2a-call'
  | 'angeh-script'
  | 'neural-trigger'
  | 'synthetic-branch'
  | 'quantum-state'
  | 'memory-sync'
  | 'validation-gate';

export interface LatticeNode {
  id: string;
  type: LatticeNodeType;
  name: string;
  position: { x: number; y: number };
  config: LatticeNodeConfig;
  connections: LatticeConnection[];
  status: 'idle' | 'executing' | 'completed' | 'failed' | 'waiting';
  metadata: Record<string, any>;
}

export interface LatticeNodeConfig {
  // For a2a-call type
  targetAgent?: string;
  task?: string;
  context?: Record<string, any>;
  
  // For angeh-script type
  script?: string;
  parsedAST?: ASTNode;
  
  // For neural-trigger type
  triggerSource?: string;
  eventPattern?: string;
  
  // For synthetic-branch type
  condition?: string;
  uncertainty?: number;
  
  // For quantum-state type
  superposition?: boolean;
  coherence?: number;
  
  // Common
  timeout?: number;
  retryConfig?: RetryConfig;
  errorHandling?: ErrorHandlingConfig;
}

export interface LatticeConnection {
  sourceId: string;
  targetId: string;
  condition?: string;
  probability?: number;
  label?: string;
}

// ===================== NEURAL PULSE TRIGGER TYPES =====================

export type NeuralPulseEventType = 
  | 'audio-detected'
  | 'image-generated'
  | 'video-rendered'
  | 'text-analyzed'
  | 'code-completed'
  | 'data-transformed'
  | '3d-rendered'
  | 'model-trained'
  | 'custom';

export interface NeuralPulseTrigger {
  id: string;
  name: string;
  eventType: NeuralPulseEventType;
  sourceStudio: string;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  enabled: boolean;
  lastTriggered?: number;
  cooldown?: number;
  data?: Record<string, any>;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface TriggerAction {
  targetNode: string;
  inputMapping: Record<string, string>;
  delay?: number;
}

// ===================== SOVEREIGN EXECUTION STATE =====================

export type SovereignExecutionPhase = 
  | 'initializing'
  | 'synthesizing'
  | 'validating'
  | 'executing'
  | 'branching'
  | 'healing'
  | 'completing'
  | 'failed';

export interface SovereignExecutionState {
  executionId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'self-healing';
  phase: SovereignExecutionPhase;
  currentNode: string | null;
  previousNodes: string[];
  nextNodes: string[];
  variables: Record<string, any>;
  context: SovereignContext;
  history: SovereignHistoryEntry[];
  error?: SovereignError;
  startTime: number;
  endTime?: number;
  healingAttempts: number;
}

export interface SovereignContext {
  goal: string;
  originalInput: Record<string, any>;
  processedData: Record<string, any>;
  agentResults: Record<string, any>;
  scriptResults: Record<string, any>;
  quantumStates: Record<string, any>;
}

export interface SovereignHistoryEntry {
  nodeId: string;
  nodeName: string;
  phase: SovereignExecutionPhase;
  input: any;
  output: any;
  timestamp: number;
  duration: number;
  status: 'success' | 'failure' | 'skipped' | 'healed';
  details?: string;
}

export interface SovereignError {
  nodeId: string;
  message: string;
  stack?: string;
  timestamp: number;
  recoverable: boolean;
  suggestedFix?: string;
}

// ===================== UNCERTAINTY PATH TYPES =====================

export interface UncertaintyPath {
  id: string;
  condition: string;
  probability: number;
  fallbackNode: string;
  confidence: number;
  branchingFactor: number;
}

export interface BranchingDecision {
  nodeId: string;
  selectedPath: string;
  reasoning: string;
  confidence: number;
  alternatives: { path: string; probability: number }[];
}

// ===================== AGENTIC SYNTHESIS TYPES =====================

export interface SynthesisRequest {
  goal: string;
  constraints?: string[];
  context?: Record<string, any>;
  model?: string;
  temperature?: number;
}

export interface SynthesisResult {
  success: boolean;
  workflow: LatticeWorkflow;
  script: string;
  confidence: number;
  alternatives?: string[];
  warnings?: string[];
}

export interface LatticeWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: LatticeNode[];
  connections: LatticeConnection[];
  triggers: NeuralPulseTrigger[];
  version: number;
  createdAt: number;
  metadata: Record<string, any>;
}

// ===================== SELF-HEALING TYPES =====================

export interface SelfHealingConfig {
  enabled: boolean;
  maxAttempts: number;
  strategies: HealingStrategy[];
  timeout: number;
}

export type HealingStrategy = 
  | 'retry-node'
  | 'bypass-node'
  | 'regenerate-script'
  | 'escalate-to-agent'
  | 'fallback-branch'
  | 'reconstruct-workflow';

export interface HealingAttempt {
  executionId: string;
  nodeId: string;
  strategy: HealingStrategy;
  startTime: number;
  endTime?: number;
  success: boolean;
  details: string;
}

// ===================== NEURAL LATTICE VISUALIZATION TYPES =====================

export interface LatticeVisualization {
  nodes: LatticeNodeDisplay[];
  edges: LatticeEdgeDisplay[];
  viewport: ViewportState;
  pulseData: PulseData[];
}

export interface LatticeNodeDisplay {
  id: string;
  x: number;
  y: number;
  label: string;
  type: LatticeNodeType;
  status: LatticeNode['status'];
  quantumState?: {
    coherence: number;
    entangled: boolean;
  };
}

export interface LatticeEdgeDisplay {
  id: string;
  source: string;
  target: string;
  label?: string;
  probability?: number;
  active: boolean;
}

export interface ViewportState {
  zoom: number;
  panX: number;
  panY: number;
}

export interface PulseData {
  timestamp: number;
  sourceNode: string;
  targetNode: string;
  intensity: number;
  type: 'data' | 'agent' | 'quantum' | 'trigger';
}

// ===================== AGENT HANDSHAKE TYPES =====================

export interface AgentHandshake {
  id: string;
  fromAgent: string;
  toAgent: string;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout';
  startTime: number;
  endTime?: number;
  context: Record<string, any>;
  result?: any;
}

export interface LivePulseView {
  activeHandshakes: AgentHandshake[];
  recentMessages: AgentMessage[];
  nodeActivity: Record<string, number>;
}

// ===================== GOAL INPUT TYPES =====================

export interface GoalInput {
  text: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  constraints?: string[];
  context?: Record<string, any>;
}

export interface GoalParsingResult {
  workflow: LatticeWorkflow;
  confidence: number;
  explanation: string;
  suggestedNodes: LatticeNodeType[];
}