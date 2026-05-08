/**
 * automation-types.ts - Sovereign Automaton v3.0 Type Definitions
 * 
 * Defines the contract for the Neural Lattice Orchestration system.
 */

import { A2AMessage } from '@/agents/A2ASystem';

export type NodeStatus = 'idle' | 'pulse' | 'processing' | 'completed' | 'failed' | 'cohering';

export interface LatticeNode {
  id: string;
  type: 'agent' | 'logic' | 'input' | 'output' | 'gateway';
  label: string;
  agentId?: string;       // Target agent for 'agent' type
  directive?: string;     // Specialized instruction for the agent/logic
  status: NodeStatus;
  progress: number;
  output?: any;           // Result stored after processing
  error?: string;
  position: { x: number; y: number };
  coherence?: number;     // 0-1 probability of successful path
}

export interface LatticeEdge {
  id: string;
  source: string;
  target: string;
  protocol: 'a2a' | 'dm' | 'logic' | 'neural'; // Handshake protocol
  active: boolean;
}

export interface NeuralTrigger {
  id: string;
  source: string;         // e.g., 'studio:audio', 'agent:perfectionist'
  event: string;          // e.g., 'vitals_shift', 'pattern_detected'
  condition?: string;     // S-expression condition: '(= volume high)'
  workflowId: string;     // Target workflow to trigger
}

export interface SovereignWorkflow {
  id: string;
  name: string;
  goal: string;           // Original natural language directive
  script: string;         // The synthesized .angeh S-expression script
  lattice: {
    nodes: LatticeNode[];
    edges: LatticeEdge[];
  };
  metadata: {
    dnaVersion: string;
    created: number;
    modified: number;
    lastExecuted?: number;
    successRate: number;
  };
}

export interface SovereignExecutionState {
  workflowId: string;
  status: 'initializing' | 'executing' | 'refining' | 'completed' | 'failed';
  activeNodes: string[];  // IDs of nodes currently in 'pulse' state
  telemetry: {
    photonicLoad: number;
    agentCoherence: number;
    startTime: number;
    elapsedMs: number;
  };
  handoverLogs: string[]; // History of A2A handovers
}
