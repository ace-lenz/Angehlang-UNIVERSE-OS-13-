import { 
  A2ACommunicationHub, 
  CrossStudioIntegrator,
  sovereignLogicCore,
  NeuralPulseTrigger,
  sovereignAutomaton
} from './engines';
import { StudioName } from './engines/CrossStudioIntegrator';

export interface StudioContext {
  studio: StudioName;
  taskId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CrossStudioCallOptions {
  targetStudio: StudioName;
  action: string;
  timeout?: number;
  retries?: number;
  fallback?: (error: any) => any;
}

export interface NeuralTriggerOptions {
  eventType: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export class StudioIntegrationBridge {
  private a2aHub = A2ACommunicationHub.getInstance();
  private crossStudio = CrossStudioIntegrator.getInstance();
  private logicCore = sovereignLogicCore;
  private currentStudio: StudioName = 'automation';
  private integrationCache: Map<string, any> = new Map();

  private static instance: StudioIntegrationBridge;

  static getInstance(): StudioIntegrationBridge {
    if (!StudioIntegrationBridge.instance) {
      StudioIntegrationBridge.instance = new StudioIntegrationBridge();
    }
    return StudioIntegrationBridge.instance;
  }

  setCurrentStudio(studio: StudioName): void {
    this.currentStudio = studio;
  }

  getCurrentStudio(): StudioName {
    return this.currentStudio;
  }

  async callStudio<T = any>(options: CrossStudioCallOptions, data?: Record<string, any>): Promise<T> {
    const { targetStudio, action, timeout = 30000, retries = 3 } = options;
    
    let lastError: any;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          this.crossStudio.executeCrossStudio(
            this.currentStudio,
            targetStudio,
            action,
            data || {},
            {
              taskId: `bridge-${Date.now()}`,
              requesterStudio: this.currentStudio,
              timestamp: Date.now(),
              data: data || {},
              metadata: { priority: 'normal' },
              crossStudioReferences: {}
            }
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);

        return result as T;
      } catch (error) {
        lastError = error;
        console.log(`[StudioBridge] Attempt ${attempt}/${retries} failed:`, error);
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    if (options.fallback) {
      return options.fallback(lastError);
    }

    throw lastError;
  }

  async callIntelligence<T = any>(action: string, input: any): Promise<T> {
    return this.callStudio({ targetStudio: 'intelligence', action, timeout: 60000 }, input);
  }

  async callAutomation<T = any>(action: string, input: any): Promise<T> {
    return this.callStudio({ targetStudio: 'automation', action }, input);
  }

  async callDatabase<T = any>(action: string, input: any): Promise<T> {
    return this.callStudio({ targetStudio: 'database', action }, input);
  }

  async callSecurity<T = any>(action: string, input: any): Promise<T> {
    return this.callStudio({ targetStudio: 'security', action }, input);
  }

  async synthesize(goal: string, options?: {
    constraints?: string[];
    context?: Record<string, any>;
    availableStudios?: string[];
  }): Promise<any> {
    return this.logicCore.synthesize({
      goal,
      constraints: options?.constraints,
      context: options?.context,
      availableStudios: options?.availableStudios
    });
  }

  async executeFlow(flowId: string, initialData?: Record<string, any>): Promise<any> {
    return this.crossStudio.executeFlow(flowId, initialData);
  }

  async triggerNeuralPulse(options: NeuralTriggerOptions): Promise<void> {
    const trigger: NeuralPulseTrigger = {
      id: `pulse-${Date.now()}`,
      name: `trigger-${Date.now()}`,
      sourceStudio: this.currentStudio,
      eventType: 'custom',
      conditions: [],
      actions: [],
      enabled: true,
    };

    await this.crossStudio.executeNeuralTrigger(trigger);
  }

  async broadcastEvent(channel: string, payload: Record<string, any>): Promise<string> {
    return this.a2aHub.broadcastToChannel(this.currentStudio, channel, payload);
  }

  subscribeToStudio(studio: StudioName, channel: string, handler: (message: any) => void): void {
    this.a2aHub.onMessage(studio, channel, handler as any);
  }

  async selfHeal(error: any, context?: Record<string, any>): Promise<any> {
    return this.logicCore.selfHeal(error, context);
  }

  getAvailableStudios(): StudioName[] {
    return [
      'automation', 'code', 'threed', 'audio', 'image', 'video', 'book', 'text',
      'bio', 'network', 'simulation', 'game', 'security', 'database', 'cloud',
      'iot', 'browser', 'os', 'intelligence'
    ];
  }

  getStudioCapabilities(studio: StudioName): any[] {
    return this.crossStudio.getStudioCapabilities(studio);
  }

  getIntegrationFlows(): any[] {
    return this.crossStudio.getFlows();
  }

  getIntegrationStats(): any {
    return this.crossStudio.getStats();
  }

  getHubStats(): any {
    return this.a2aHub.getStats();
  }

  cache(key: string, value: any): void {
    this.integrationCache.set(key, value);
  }

  getCached(key: string): any | undefined {
    return this.integrationCache.get(key);
  }

  clearCache(): void {
    this.integrationCache.clear();
  }
}

export const studioBridge = StudioIntegrationBridge.getInstance();

export function createStudioHook(studio: StudioName) {
  const bridge = StudioIntegrationBridge.getInstance();
  bridge.setCurrentStudio(studio);
  
  return {
    studio,
    call: bridge.callStudio.bind(bridge),
    synthesize: bridge.synthesize.bind(bridge),
    executeFlow: bridge.executeFlow.bind(bridge),
    trigger: bridge.triggerNeuralPulse.bind(bridge),
    broadcast: bridge.broadcastEvent.bind(bridge),
    subscribe: bridge.subscribeToStudio.bind(bridge),
    selfHeal: bridge.selfHeal.bind(bridge)
  };
}

export default studioBridge;