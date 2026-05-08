import { A2ACommunicationHub } from './A2ACommunicationHub';
import { SovereignLogicCore } from '@/engine/SovereignLogicCore';
import { NeuralPulseTrigger, LatticeWorkflow } from '../types/sovereign-types';
import { nativeNeuralCore } from '@/engine/NativeNeuralCore';

export type StudioName = 
  | 'automation' | 'code' | 'threed' | 'audio' | 'image' | 'video' | 'book' | 'text'
  | 'bio' | 'network' | 'simulation' | 'game' | 'security' | 'database' | 'cloud'
  | 'iot' | 'browser' | 'os' | 'intelligence' | 'all' | 'visualization';

export interface CrossStudioCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  studios: StudioName[];
}

export interface StudioIntegrationConfig {
  sourceStudio: StudioName;
  targetStudio: StudioName;
  capabilities: string[];
  triggerEvents: string[];
  bidirectional: boolean;
}

export interface IntegrationFlow {
  id: string;
  name: string;
  steps: Array<{
    studio: StudioName;
    action: string;
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
    onSuccess?: string;
    onFailure?: string;
  }>;
  enabled: boolean;
}

export interface UniversalContext {
  taskId: string;
  requesterStudio: StudioName;
  timestamp: number;
  data: Record<string, any>;
  metadata: {
    priority: 'low' | 'normal' | 'high' | 'critical';
    timeout?: number;
    retries?: number;
  };
  crossStudioReferences: Record<string, any>;
}

class CrossStudioIntegratorImpl {
  private a2aHub = A2ACommunicationHub.getInstance();
  private logicCore = new SovereignLogicCore();
  private integrations: Map<string, StudioIntegrationConfig> = new Map();
  private flows: Map<string, IntegrationFlow> = new Map();
  private studioCapabilities: Map<StudioName, CrossStudioCapability[]> = new Map();

  private static instance: CrossStudioIntegratorImpl;

  static getInstance(): CrossStudioIntegratorImpl {
    if (!CrossStudioIntegratorImpl.instance) {
      CrossStudioIntegratorImpl.instance = new CrossStudioIntegratorImpl();
    }
    return CrossStudioIntegratorImpl.instance;
  }

  constructor() {
    this.initializeStudioCapabilities();
    this.initializeDefaultIntegrations();
    this.initializeIntegrationFlows();
  }

  private initializeStudioCapabilities(): void {
    const capabilities: Record<StudioName, CrossStudioCapability[]> = {
      automation: [
        { name: 'workflow-execution', description: 'Execute automated workflows', inputTypes: ['workflow', 'trigger'], outputTypes: ['execution-result'], studios: ['automation'] },
        { name: 'orchestration', description: 'Coordinate multiple studios', inputTypes: ['task'], outputTypes: ['task-result'], studios: ['all'] }
      ],
      code: [
        { name: 'code-execution', description: 'Execute code in sandbox', inputTypes: ['code', 'language'], outputTypes: ['execution-result', 'logs'], studios: ['code', 'browser'] },
        { name: 'code-analysis', description: 'Analyze code quality', inputTypes: ['code'], outputTypes: ['analysis-report'], studios: ['code', 'intelligence'] }
      ],
      threed: [
        { name: '3d-generation', description: 'Generate 3D models', inputTypes: ['prompt', 'specs'], outputTypes: ['3d-model'], studios: ['threed', 'image', 'audio'] },
        { name: 'scene-rendering', description: 'Render 3D scenes', inputTypes: ['scene'], outputTypes: ['render'], studios: ['threed', 'video'] }
      ],
      audio: [
        { name: 'audio-generation', description: 'Generate audio from text', inputTypes: ['text', 'style'], outputTypes: ['audio'], studios: ['audio', 'text'] },
        { name: 'audio-analysis', description: 'Analyze audio content', inputTypes: ['audio'], outputTypes: ['analysis'], studios: ['audio', 'intelligence'] }
      ],
      image: [
        { name: 'image-generation', description: 'Generate images from prompts', inputTypes: ['prompt', 'style'], outputTypes: ['image'], studios: ['image', 'text', 'intelligence'] },
        { name: 'image-analysis', description: 'Analyze image content', inputTypes: ['image'], outputTypes: ['analysis', 'tags'], studios: ['image', 'intelligence', 'browser'] }
      ],
      video: [
        { name: 'video-generation', description: 'Generate video from images', inputTypes: ['images', 'duration'], outputTypes: ['video'], studios: ['video', 'image'] },
        { name: 'video-editing', description: 'Edit and process video', inputTypes: ['video', 'instructions'], outputTypes: ['video'], studios: ['video', 'browser'] }
      ],
      book: [
        { name: 'content-generation', description: 'Generate book content', inputTypes: ['outline', 'style'], outputTypes: ['content'], studios: ['book', 'text', 'intelligence'] },
        { name: 'content-review', description: 'Review and edit content', inputTypes: ['content'], outputTypes: ['review'], studios: ['book', 'intelligence'] }
      ],
      text: [
        { name: 'nlp-processing', description: 'Process natural language', inputTypes: ['text'], outputTypes: ['analysis'], studios: ['text', 'intelligence'] },
        { name: 'translation', description: 'Translate between languages', inputTypes: ['text', 'target-lang'], outputTypes: ['translation'], studios: ['text'] }
      ],
      bio: [
        { name: 'sequence-analysis', description: 'Analyze biological sequences', inputTypes: ['sequence'], outputTypes: ['analysis'], studios: ['bio', 'intelligence'] },
        { name: 'simulation', description: 'Run biological simulations', inputTypes: ['parameters'], outputTypes: ['results'], studios: ['bio', 'simulation'] }
      ],
      network: [
        { name: 'topology-discovery', description: 'Discover network topology', inputTypes: ['cidr'], outputTypes: ['topology'], studios: ['network', 'cloud'] },
        { name: 'security-scan', description: 'Scan for vulnerabilities', inputTypes: ['target'], outputTypes: ['vulnerabilities'], studios: ['network', 'security'] }
      ],
      simulation: [
        { name: 'physics-simulation', description: 'Run physics simulations', inputTypes: ['config'], outputTypes: ['results'], studios: ['simulation', 'threed'] },
        { name: 'data-simulation', description: 'Generate synthetic data', inputTypes: ['schema'], outputTypes: ['data'], studios: ['simulation', 'database'] }
      ],
      game: [
        { name: 'level-generation', description: 'Generate game levels', inputTypes: ['difficulty', 'theme'], outputTypes: ['level'], studios: ['game', 'intelligence', 'threed'] },
        { name: 'ai-opponent', description: 'Create AI game opponents', inputTypes: ['difficulty'], outputTypes: ['ai-behavior'], studios: ['game', 'intelligence'] }
      ],
      security: [
        { name: 'threat-detection', description: 'Detect security threats', inputTypes: ['events'], outputTypes: ['alerts'], studios: ['security', 'network', 'cloud'] },
        { name: 'incident-response', description: 'Respond to security incidents', inputTypes: ['incident'], outputTypes: ['response'], studios: ['security', 'automation'] }
      ],
      database: [
        { name: 'query-execution', description: 'Execute database queries', inputTypes: ['query'], outputTypes: ['results'], studios: ['database', 'code'] },
        { name: 'self-healing', description: 'Auto-heal database issues', inputTypes: ['metrics'], outputTypes: ['actions'], studios: ['database', 'automation'] }
      ],
      cloud: [
        { name: 'resource-provision', description: 'Provision cloud resources', inputTypes: ['specs'], outputTypes: ['resource'], studios: ['cloud', 'os'] },
        { name: 'cost-optimization', description: 'Optimize cloud costs', inputTypes: ['resources'], outputTypes: ['recommendations'], studios: ['cloud', 'intelligence'] }
      ],
      iot: [
        { name: 'device-management', description: 'Manage IoT devices', inputTypes: ['commands'], outputTypes: ['status'], studios: ['iot', 'cloud'] },
        { name: 'edge-compute', description: 'Run edge computations', inputTypes: ['model', 'data'], outputTypes: ['results'], studios: ['iot', 'intelligence'] }
      ],
      browser: [
        { name: 'web-automation', description: 'Automate browser tasks', inputTypes: ['actions'], outputTypes: ['results'], studios: ['browser', 'code'] },
        { name: 'testing', description: 'Run browser tests', inputTypes: ['test-suite'], outputTypes: ['results'], studios: ['browser', 'code'] }
      ],
      os: [
        { name: 'system-management', description: 'Manage OS operations', inputTypes: ['commands'], outputTypes: ['results'], studios: ['os', 'cloud'] },
        { name: 'monitoring', description: 'Monitor system health', inputTypes: ['metrics'], outputTypes: ['status'], studios: ['os', 'automation'] }
      ],
      intelligence: [
        { name: 'model-inference', description: 'Run AI model inference', inputTypes: ['input', 'model'], outputTypes: ['prediction'], studios: ['intelligence', 'all'] },
        { name: 'chain-of-thought', description: 'Execute reasoning chains', inputTypes: ['problem'], outputTypes: ['reasoning'], studios: ['intelligence', 'all'] },
        { name: 'agent-execution', description: 'Execute AI agents', inputTypes: ['task'], outputTypes: ['result'], studios: ['intelligence', 'all'] }
      ],
      all: [],
      visualization: [
        { name: 'create-dashboard', description: 'Create data visualization dashboards', inputTypes: ['data'], outputTypes: ['dashboard'], studios: ['visualization', 'browser'] }
      ]
    };

    this.studioCapabilities = new Map(Object.entries(capabilities) as [StudioName, CrossStudioCapability[]][]);
  }

  private initializeDefaultIntegrations(): void {
    const defaultIntegrations: StudioIntegrationConfig[] = [
      { sourceStudio: 'text', targetStudio: 'intelligence', capabilities: ['nlp-processing'], triggerEvents: ['text-analyzed'], bidirectional: true },
      { sourceStudio: 'image', targetStudio: 'intelligence', capabilities: ['image-analysis'], triggerEvents: ['image-processed'], bidirectional: true },
      { sourceStudio: 'audio', targetStudio: 'threed', capabilities: ['audio-generation'], triggerEvents: ['audio-generated'], bidirectional: false },
      { sourceStudio: 'video', targetStudio: 'image', capabilities: ['video-generation'], triggerEvents: ['video-created'], bidirectional: false },
      { sourceStudio: 'code', targetStudio: 'security', capabilities: ['code-analysis'], triggerEvents: ['code-scanned'], bidirectional: true },
      { sourceStudio: 'cloud', targetStudio: 'database', capabilities: ['resource-provision'], triggerEvents: ['resource-provisioned'], bidirectional: true },
      { sourceStudio: 'iot', targetStudio: 'cloud', capabilities: ['device-management'], triggerEvents: ['device-updated'], bidirectional: true },
      { sourceStudio: 'simulation', targetStudio: 'game', capabilities: ['physics-simulation'], triggerEvents: ['simulation-completed'], bidirectional: false },
      { sourceStudio: 'bio', targetStudio: 'simulation', capabilities: ['simulation'], triggerEvents: ['analysis-completed'], bidirectional: false },
      { sourceStudio: 'network', targetStudio: 'security', capabilities: ['security-scan'], triggerEvents: ['scan-completed'], bidirectional: true },
      { sourceStudio: 'browser', targetStudio: 'code', capabilities: ['testing'], triggerEvents: ['test-completed'], bidirectional: true },
      { sourceStudio: 'os', targetStudio: 'automation', capabilities: ['monitoring'], triggerEvents: ['alert-triggered'], bidirectional: true }
    ];

    for (const integration of defaultIntegrations) {
      const key = `${integration.sourceStudio}:${integration.targetStudio}`;
      this.integrations.set(key, integration);
    }
  }

  private initializeIntegrationFlows(): void {
    const defaultFlows: IntegrationFlow[] = [
      {
        id: 'content-pipeline',
        name: 'Content Generation Pipeline',
        steps: [
          { studio: 'text', action: 'generate-content', inputMapping: {}, outputMapping: { content: 'text' } },
          { studio: 'intelligence', action: 'enhance-content', inputMapping: { text: 'content' }, outputMapping: { enhanced: 'enhanced-text' } },
          { studio: 'image', action: 'generate-illustration', inputMapping: { prompt: 'enhanced-text' }, outputMapping: { image: 'illustration' } },
          { studio: 'video', action: 'create-video', inputMapping: { images: 'illustration' }, outputMapping: { video: 'final-video' } }
        ],
        enabled: true
      },
      {
        id: 'security-scan-pipeline',
        name: 'Security Scan Pipeline',
        steps: [
          { studio: 'network', action: 'discover-topology', inputMapping: {}, outputMapping: { topology: 'network-map' } },
          { studio: 'security', action: 'vulnerability-scan', inputMapping: { target: 'network-map' }, outputMapping: { vulnerabilities: 'vulns' } },
          { studio: 'code', action: 'fix-vulnerabilities', inputMapping: { issues: 'vulns' }, outputMapping: { fixes: 'code-fixes' } },
          { studio: 'automation', action: 'deploy-fixes', inputMapping: { fixes: 'code-fixes' }, outputMapping: { status: 'deployment-status' } }
        ],
        enabled: true
      },
      {
        id: 'ai-analysis-pipeline',
        name: 'AI Analysis Pipeline',
        steps: [
          { studio: 'browser', action: 'collect-data', inputMapping: {}, outputMapping: { data: 'web-data' } },
          { studio: 'intelligence', action: 'analyze-data', inputMapping: { input: 'web-data' }, outputMapping: { analysis: 'analysis-results' } },
          { studio: 'database', action: 'store-results', inputMapping: { data: 'analysis-results' }, outputMapping: { status: 'storage-status' } },
          { studio: 'visualization', action: 'create-dashboard', inputMapping: { data: 'analysis-results' }, outputMapping: { dashboard: 'dashboard-url' } }
        ],
        enabled: true
      },
      {
        id: 'devops-pipeline',
        name: 'DevOps Pipeline',
        steps: [
          { studio: 'code', action: 'build', inputMapping: {}, outputMapping: { artifacts: 'build-artifacts' } },
          { studio: 'browser', action: 'run-tests', inputMapping: { artifacts: 'build-artifacts' }, outputMapping: { results: 'test-results' } },
          { studio: 'security', action: 'security-scan', inputMapping: { artifacts: 'build-artifacts' }, outputMapping: { security: 'security-report' } },
          { studio: 'cloud', action: 'deploy', inputMapping: { artifacts: 'build-artifacts' }, outputMapping: { deployment: 'deployment-info' } },
          { studio: 'os', action: 'monitor', inputMapping: { deployment: 'deployment-info' }, outputMapping: { metrics: 'health-metrics' } }
        ],
        enabled: true
      },
      {
        id: 'iot-analytics-pipeline',
        name: 'IoT Analytics Pipeline',
        steps: [
          { studio: 'iot', action: 'collect-sensor-data', inputMapping: {}, outputMapping: { sensorData: 'raw-data' } },
          { studio: 'intelligence', action: 'analyze-patterns', inputMapping: { input: 'raw-data' }, outputMapping: { patterns: 'detected-patterns' } },
          { studio: 'simulation', action: 'predict-trends', inputMapping: { data: 'detected-patterns' }, outputMapping: { predictions: 'trend-predictions' } },
          { studio: 'automation', action: 'trigger-actions', inputMapping: { predictions: 'trend-predictions' }, outputMapping: { actions: 'automated-actions' } }
        ],
        enabled: true
      }
    ];

    for (const flow of defaultFlows) {
      this.flows.set(flow.id, flow);
    }
  }

  async executeCrossStudio(
    sourceStudio: StudioName,
    targetStudio: StudioName,
    action: string,
    data: Record<string, any>,
    context?: Partial<UniversalContext>
  ): Promise<any> {
    const integrationKey = `${sourceStudio}:${targetStudio}`;
    const integration = this.integrations.get(integrationKey);

    if (!integration) {
      throw new Error(`No integration found between ${sourceStudio} and ${targetStudio}`);
    }

    const requestId = `xstudio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullContext: UniversalContext = {
      taskId: requestId,
      requesterStudio: sourceStudio,
      timestamp: Date.now(),
      data,
      metadata: context?.metadata || { priority: 'normal' },
      crossStudioReferences: {}
    };

    await this.a2aHub.broadcastToChannel(sourceStudio, 'cross-studio-start', {
      requestId,
      targetStudio,
      action,
      timestamp: Date.now()
    });

    const result = await this.routeAction(targetStudio, action, data, fullContext);

    await this.a2aHub.broadcastToChannel(sourceStudio, 'cross-studio-complete', {
      requestId,
      targetStudio,
      result,
      timestamp: Date.now()
    });

    return result;
  }

  private async routeAction(studio: StudioName, action: string, data: any, context: UniversalContext): Promise<any> {
    const capabilities = this.studioCapabilities.get(studio) || [];
    const capability = capabilities.find(c => c.name.toLowerCase().includes(action.toLowerCase()));

    if (!capability) {
      return { error: `No capability found for action: ${action} in studio: ${studio}` };
    }

    const synthesized = await nativeNeuralCore.generate(
      `Execute ${action} in ${studio} studio with input: ${JSON.stringify(data)}`
    );

    return {
      studio,
      action,
      result: `Executed ${action} in ${studio}`,
      context: context.taskId
    };
  }

  async executeFlow(flowId: string, initialData?: Record<string, any>): Promise<{
    flowId: string;
    success: boolean;
    results: Array<{ studio: StudioName; action: string; result: any; success: boolean }>;
    totalDuration: number;
  }> {
    const flow = this.flows.get(flowId);
    if (!flow || !flow.enabled) {
      throw new Error(`Flow not found or disabled: ${flowId}`);
    }

    const startTime = Date.now();
    const results: Array<{ studio: StudioName; action: string; result: any; success: boolean }> = [];
    let currentData: Record<string, any> = initialData || {};

    for (const step of flow.steps) {
      try {
        const inputData: Record<string, any> = {};
        
        for (const [outputKey, inputKey] of Object.entries(step.inputMapping)) {
          inputData[inputKey] = currentData[outputKey] || currentData[inputKey];
        }

        const result = await this.executeCrossStudio(
          flow.steps[0].studio,
          step.studio,
          step.action,
          inputData
        );

        const outputData: Record<string, any> = {};
        for (const [outputKey, mapping] of Object.entries(step.outputMapping)) {
          outputData[mapping] = result[mapping] || result;
        }

        currentData = { ...currentData, ...outputData };
        
        results.push({ studio: step.studio, action: step.action, result, success: true });

        if (step.onFailure && !result.success) {
          console.log(`[CrossStudio] Flow ${flowId} failed at step ${step.studio}:${step.action}`);
          break;
        }
      } catch (error) {
        results.push({
          studio: step.studio,
          action: step.action,
          result: { error: (error as Error).message },
          success: false
        });

        if (!step.onFailure) break;
      }
    }

    const success = results.every(r => r.success);

    return {
      flowId,
      success,
      results,
      totalDuration: Date.now() - startTime
    };
  }

  async executeNeuralTrigger(trigger: NeuralPulseTrigger): Promise<void> {
    await this.a2aHub.triggerNeuralPulse(trigger);

    const affectedIntegrations = Array.from(this.integrations.values())
      .filter(i => i.sourceStudio === trigger.sourceStudio || i.targetStudio === trigger.sourceStudio);

    for (const integration of affectedIntegrations) {
      if (integration.triggerEvents.includes(trigger.eventType)) {
        const targetStudio = integration.sourceStudio === trigger.sourceStudio 
          ? integration.targetStudio 
          : integration.sourceStudio;

        await this.executeCrossStudio(
          integration.sourceStudio,
          targetStudio,
          'respond-to-trigger',
          { trigger, eventType: trigger.eventType },
          { requesterStudio: integration.sourceStudio, timestamp: Date.now(), data: {}, metadata: { priority: 'high' }, crossStudioReferences: {} }
        );
      }
    }
  }

  createIntegration(config: StudioIntegrationConfig): void {
    const key = `${config.sourceStudio}:${config.targetStudio}`;
    this.integrations.set(key, config);

    this.a2aHub.broadcastToChannel('automation', 'integration-created', {
      sourceStudio: config.sourceStudio,
      targetStudio: config.targetStudio,
      timestamp: Date.now()
    });
  }

  createFlow(flow: IntegrationFlow): void {
    this.flows.set(flow.id, flow);
  }

  enableFlow(flowId: string): void {
    const flow = this.flows.get(flowId);
    if (flow) {
      flow.enabled = true;
      this.flows.set(flowId, flow);
    }
  }

  disableFlow(flowId: string): void {
    const flow = this.flows.get(flowId);
    if (flow) {
      flow.enabled = false;
      this.flows.set(flowId, flow);
    }
  }

  getIntegrations(): StudioIntegrationConfig[] {
    return Array.from(this.integrations.values());
  }

  getFlows(): IntegrationFlow[] {
    return Array.from(this.flows.values());
  }

  getFlow(flowId: string): IntegrationFlow | undefined {
    return this.flows.get(flowId);
  }

  getStudioCapabilities(studio: StudioName): CrossStudioCapability[] {
    return this.studioCapabilities.get(studio) || [];
  }

  getAllCapabilities(): Record<StudioName, CrossStudioCapability[]> {
    return {
      automation: this.studioCapabilities.get('automation') || [],
      code: this.studioCapabilities.get('code') || [],
      threed: this.studioCapabilities.get('threed') || [],
      audio: this.studioCapabilities.get('audio') || [],
      image: this.studioCapabilities.get('image') || [],
      video: this.studioCapabilities.get('video') || [],
      book: this.studioCapabilities.get('book') || [],
      text: this.studioCapabilities.get('text') || [],
      bio: this.studioCapabilities.get('bio') || [],
      network: this.studioCapabilities.get('network') || [],
      simulation: this.studioCapabilities.get('simulation') || [],
      game: this.studioCapabilities.get('game') || [],
      security: this.studioCapabilities.get('security') || [],
      database: this.studioCapabilities.get('database') || [],
      cloud: this.studioCapabilities.get('cloud') || [],
      iot: this.studioCapabilities.get('iot') || [],
      browser: this.studioCapabilities.get('browser') || [],
      os: this.studioCapabilities.get('os') || [],
      intelligence: this.studioCapabilities.get('intelligence') || [],
      all: this.studioCapabilities.get('all') || [],
      visualization: this.studioCapabilities.get('visualization') || [],
    };
  }

  getStats(): {
    totalIntegrations: number;
    totalFlows: number;
    enabledFlows: number;
    totalCapabilities: number;
    hubStats: any;
  } {
    return {
      totalIntegrations: this.integrations.size,
      totalFlows: this.flows.size,
      enabledFlows: Array.from(this.flows.values()).filter(f => f.enabled).length,
      totalCapabilities: Array.from(this.studioCapabilities.values()).flat().length,
      hubStats: this.a2aHub.getStats()
    };
  }
}

export const CrossStudioIntegrator = CrossStudioIntegratorImpl;
export const crossStudioIntegrator = CrossStudioIntegratorImpl.getInstance();