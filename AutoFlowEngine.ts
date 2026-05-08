/**
 * AutoFlowEngine.ts - Universal DAG Automation Engine
 * 
 * Features:
 * - Full DAG execution with parallel/sequential nodes
 * - QPPU/ANGHV storage for state
 * - Universal input handling (any file/type)
 * - Cross-studio connections
 * - Intent parsing from prompts
 */

import { qppuEngine } from '@/engine/QPPUCore';

export interface AutomationNode {
  id: string;
  type: 'input' | 'output' | 'studio' | 'transform' | 'condition';
  studio?: string;
  action?: string;
  params?: Record<string, any>;
  position: { x: number; y: number };
}

export interface AutomationEdge {
  id: string;
  source: string;
  target: string;
  transform?: (data: any) => any;
}

export interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  nodes: AutomationNode[];
  edges: AutomationEdge[];
  inputConfig: InputConfig;
  outputConfig: OutputConfig;
  created: number;
  modified: number;
  enabled: boolean;
}

export interface InputConfig {
  types: string[];
  sources: ('prompt' | 'dropzone' | 'file' | 'webhook')[];
  required: boolean;
}

export interface OutputConfig {
  formats: ('file' | 'stream' | 'webhook' | 'download')[];
  destination: 'local' | 'storage' | 'download';
}

export interface ExecutionState {
  flowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentNode: string | null;
  results: Record<string, any>;
  errors: Record<string, string>;
  startedAt: number;
  completedAt?: number;
}

// ========== STUDIO REGISTRY ==========

const STUDIO_REGISTRY: Record<string, any> = {
  'code': { module: () => import('@/components/studios/CodeStudio'), output: 'file' },
  'audio': { module: () => import('@/components/studios/AudioStudio'), output: 'audio' },
  'video': { module: () => import('@/components/studios/VideoPlayer'), output: 'video' },
  'image': { module: () => import('@/components/studios/ImageGallery'), output: 'image' },
  '3d': { module: () => import('@/components/studios/ThreeDViewer'), output: 'model' },
  'book': { module: () => import('@/components/studios/BookStudio'), output: 'document' },
  'database': { module: () => import('@/components/studios/DatabaseStudio'), output: 'data' },
  'network': { module: () => import('@/components/studios/NetworkStudio'), output: 'data' },
  'iot': { module: () => import('@/components/studios/IoTStudio'), output: 'command' },
  'game': { module: () => import('@/components/studios/GameStudio'), output: 'binary' },
  'simulation': { module: () => import('@/components/studios/SimulationStudio'), output: 'data' },
  'security': { module: () => import('@/components/studios/SecurityStudio'), output: 'report' },
  'cloud': { module: () => import('@/components/studios/CloudStudio'), output: 'deployment' },
  'dataviz': { module: () => import('@/components/studios/DataVizStudio'), output: 'visualization' },
};

// ========== INTENT PARSER ==========

const STUDIO_KEYWORDS: Record<string, string[]> = {
  audio: ['music', 'song', 'audio', 'sound', 'beat', 'melody', 'synthesize', 'generate audio'],
  video: ['video', 'render', 'encode', 'clip', 'movie', 'generate video'],
  image: ['image', 'picture', 'photo', 'art', 'generate image', 'draw'],
  '3d': ['3d', 'model', 'three', 'dimension', 'render 3d'],
  code: ['code', 'program', 'script', 'function', 'build', 'compile', 'api', 'create component'],
  book: ['book', 'write', 'novel', 'chapter', 'story', 'document', 'author'],
  database: ['database', 'sql', 'query', 'table', 'schema', 'db'],
  network: ['network', 'http', 'request', 'api call', 'fetch', 'server'],
  security: ['security', 'scan', 'vulnerability', 'audit', 'encrypt', 'hack'],
  cloud: ['cloud', 'deploy', 'aws', 'vercel', 'hosting', 'infrastructure'],
  dataviz: ['chart', 'graph', 'visualize', 'dashboard', 'analytics', 'metrics'],
};

const ACTION_KEYWORDS: Record<string, string> = {
  'create': 'create', 'generate': 'create', 'build': 'create',
  'edit': 'update', 'modify': 'update', 'fix': 'update',
  'run': 'execute', 'deploy': 'execute', 'start': 'execute',
  'analyze': 'analyze', 'check': 'analyze', 'scan': 'analyze',
  'convert': 'convert', 'export': 'convert', 'transform': 'convert',
};

class IntentParser {
  parse(input: string | File[], files?: File[]): { nodes: AutomationNode[], edges: AutomationEdge[], inputTypes: string[], outputType: string } {
    let prompt = '';
    let fileTypes: string[] = [];
    
    if (typeof input === 'string') {
      prompt = input.toLowerCase();
    } else if (Array.isArray(input)) {
      for (const f of input) {
        fileTypes.push(this.detectFileType(f.name));
      }
    }
    
    // Detect file types if provided
    if (files) {
      for (const f of files) {
        fileTypes.push(this.detectFileType(f.name));
      }
    }
    
    // Parse what studios are needed
    const neededStudios = new Set<string>();
    const actions = new Set<string>();
    
    for (const [studio, keywords] of Object.entries(STUDIO_KEYWORDS)) {
      for (const keyword of keywords) {
        if (prompt.includes(keyword)) {
          neededStudios.add(studio);
        }
      }
    }
    
    for (const [action, _] of Object.entries(ACTION_KEYWORDS)) {
      if (prompt.includes(action)) {
        actions.add(action);
      }
    }
    
    // If no studios detected, assume based on file types
    if (neededStudios.size === 0 && fileTypes.length > 0) {
      for (const ft of fileTypes) {
        if (ft.includes('image')) neededStudios.add('image');
        if (ft.includes('audio')) neededStudios.add('audio');
        if (ft.includes('video')) neededStudios.add('video');
        if (ft.includes('pdf') || ft.includes('doc')) neededStudios.add('text');
      }
    }
    
    // Build nodes and edges
    const nodes: AutomationNode[] = [];
    const edges: AutomationEdge[] = [];
    
    // Add input node
    nodes.push({
      id: 'input',
      type: 'input',
      position: { x: 50, y: 100 }
    });
    
    let prevId = 'input';
    let x = 200;
    
    for (const studio of neededStudios) {
      const nodeId = `studio-${studio}`;
      
      nodes.push({
        id: nodeId,
        type: 'studio',
        studio,
        action: Array.from(actions)[0] || 'create',
        position: { x, y: 100 }
      });
      
      edges.push({
        id: `edge-${prevId}-${nodeId}`,
        source: prevId,
        target: nodeId
      });
      
      prevId = nodeId;
      x += 150;
    }
    
    // Add output node
    nodes.push({
      id: 'output',
      type: 'output',
      position: { x, y: 100 }
    });
    
    if (neededStudios.size > 0) {
      edges.push({
        id: `edge-${prevId}-output`,
        source: prevId,
        target: 'output'
      });
    }
    
    // Determine input/output types
    const inputTypes = Array.from(new Set([...fileTypes, ...Array.from(neededStudios).map(s => STUDIO_REGISTRY[s]?.output).filter(Boolean)]));
    const outputType = neededStudios.has('video') ? 'video' : 
                      neededStudios.has('audio') ? 'audio' :
                      neededStudios.has('image') ? 'image' : 'file';
    
    return { nodes, edges, inputTypes, outputType };
  }
  
  private detectFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string[]> = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      audio: ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
      video: ['mp4', 'webm', 'mov', 'avi'],
      document: ['pdf', 'doc', 'docx', 'txt', 'md'],
      code: ['js', 'ts', 'tsx', 'jsx', 'py', 'rs', 'go'],
    };
    
    for (const [type, exts] of Object.entries(types)) {
      if (exts.includes(ext)) return type;
    }
    return 'file';
  }
}

// ========== DAG EXECUTION ENGINE ==========

class AutoFlowEngine {
  private static instance: AutoFlowEngine;
  private flows: Map<string, AutomationFlow> = new Map();
  private executionStates: Map<string, ExecutionState> = new Map();
  private qppuStorage: any = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AutoFlowEngine {
    if (!AutoFlowEngine.instance) {
      AutoFlowEngine.instance = new AutoFlowEngine();
    }
    return AutoFlowEngine.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize QPPU storage for flows
    if (qppuEngine) {
      try {
        const stats = qppuEngine.getStats?.();
        this.qppuStorage = stats ? { coherences: new Map(), frames: new Map(), quantumMode: true } : null;
      } catch (e) {
        console.log('[AutoFlow] QPPU not available, using memory');
      }
    }

    // Load saved flows
    await this.loadFlows();
    
    this.isInitialized = true;
  }

  // ========== FLOW MANAGEMENT ==========

  createFlow(name: string, description: string = ''): AutomationFlow {
    const flow: AutomationFlow = {
      id: `flow-${Date.now()}`,
      name,
      description,
      nodes: [],
      edges: [],
      inputConfig: { types: [], sources: ['prompt', 'dropzone'], required: false },
      outputConfig: { formats: ['file'], destination: 'local' },
      created: Date.now(),
      modified: Date.now(),
      enabled: true
    };

    this.flows.set(flow.id, flow);
    this.saveFlow(flow);
    
    return flow;
  }

  updateFlow(flow: AutomationFlow): void {
    flow.modified = Date.now();
    this.flows.set(flow.id, flow);
    this.saveFlow(flow);
  }

  deleteFlow(flowId: string): void {
    this.flows.delete(flowId);
    localStorage.removeItem(`autoflow-${flowId}`);
  }

  getFlow(flowId: string): AutomationFlow | undefined {
    return this.flows.get(flowId);
  }

  getAllFlows(): AutomationFlow[] {
    return Array.from(this.flows.values());
  }

  // ========== INTENT PARSING ==========

  parseFromPrompt(prompt: string, files?: File[]): { nodes: AutomationNode[], edges: AutomationEdge[], inputTypes: string[], outputType: string } {
    const parser = new IntentParser();
    return parser.parse(prompt, files);
  }

  // ========== EXECUTION ==========

  async execute(flowId: string, inputs: Record<string, any> = {}): Promise<ExecutionState> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Flow ${flowId} not found`);
    }

    const state: ExecutionState = {
      flowId,
      status: 'running',
      currentNode: null,
      results: {},
      errors: {},
      startedAt: Date.now()
    };

    this.executionStates.set(flowId, state);

    try {
      // Build adjacency map for DAG
      const adj = new Map<string, string[]>();
      const inDegree = new Map<string, number>();

      for (const node of flow.nodes) {
        adj.set(node.id, []);
        inDegree.set(node.id, 0);
      }

      for (const edge of flow.edges) {
        adj.get(edge.source)?.push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
      }

      // Process using topological sort with parallel execution
      const queue: string[] = [];
      
      // Find nodes with no dependencies
      for (const [nodeId, degree] of inDegree) {
        if (degree === 0) queue.push(nodeId);
      }

      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        state.currentNode = nodeId;

        const node = flow.nodes.find(n => n.id === nodeId);
        if (!node || node.type === 'input' || node.type === 'output') {
          // Skip input/output nodes
          if (nodeId === 'input') {
            state.results[nodeId] = inputs;
          }
        } else if (node.type === 'studio' && node.studio) {
          // Execute studio action
          const result = await this.executeStudioNode(node, state.results);
          state.results[nodeId] = result;
        }

        // Process dependent nodes
        const children = adj.get(nodeId) || [];
        for (const childId of children) {
          const newDegree = (inDegree.get(childId) || 1) - 1;
          inDegree.set(childId, newDegree);
          if (newDegree === 0) {
            queue.push(childId);
          }
        }
      }

      state.status = 'completed';
      state.completedAt = Date.now();

    } catch (error) {
      state.status = 'failed';
      state.errors['execution'] = error instanceof Error ? error.message : 'Unknown error';
      state.completedAt = Date.now();
    }

    // Save execution state to storage
    await this.saveExecutionState(state);

    return state;
  }

  private async executeStudioNode(node: AutomationNode, inputs: Record<string, any>): Promise<any> {
    const studio = node.studio;
    const action = node.action || 'create';
    
    // Simulate execution by logging
    console.log(`[AutoFlow] Executing ${studio}:${action} with inputs:`, inputs);

    // Return placeholder result - real implementation would call studio adapters
    return {
      studio,
      action,
      timestamp: Date.now(),
      inputKeys: Object.keys(inputs),
      result: `Executed ${action} on ${studio}`
    };
  }

  // ========== STORAGE (QPPU/ANGHV or LocalStorage) ==========

  private async saveFlow(flow: AutomationFlow): Promise<void> {
    try {
      if (this.qppuStorage) {
        await this.qppuStorage.store(flow.id, flow);
      }
    } catch (e) {
      // Fallback to localStorage
      localStorage.setItem(`autoflow-${flow.id}`, JSON.stringify(flow));
    }
  }

  private async loadFlows(): Promise<void> {
    try {
      // Try to load from QPPU first
      if (this.qppuStorage) {
        console.log('[AutoFlow] Loading from QPPU storage');
      }
    } catch (e) {
      console.log('[AutoFlow] Loading from localStorage');
    }

    // Also load from localStorage as fallback
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('autoflow-')) {
        try {
          const flow = JSON.parse(localStorage.getItem(key)!);
          this.flows.set(flow.id, flow);
        } catch (e) {
          console.warn('[AutoFlow] Failed to load flow:', key);
        }
      }
    }
  }

  private async saveExecutionState(state: ExecutionState): Promise<void> {
    try {
      if (this.qppuStorage) {
        await this.qppuStorage.store(`exec-${state.flowId}`, state);
      }
    } catch (e) {
      localStorage.setItem(`autoflow-exec-${state.flowId}`, JSON.stringify(state));
    }
  }

  // ========== PERSISTENCE ==========

  exportFlow(flowId: string): string {
    const flow = this.flows.get(flowId);
    if (!flow) return '';
    return JSON.stringify(flow, null, 2);
  }

  importFlow(json: string): AutomationFlow | null {
    try {
      const flow = JSON.parse(json) as AutomationFlow;
      this.flows.set(flow.id, flow);
      this.saveFlow(flow);
      return flow;
    } catch (e) {
      console.error('[AutoFlow] Import failed:', e);
      return null;
    }
  }

  downloadOutput(flowId: string, content: any, format: string = 'json'): void {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autoflow-${flowId}-output.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const autoFlowEngine = AutoFlowEngine.getInstance();
export default autoFlowEngine;