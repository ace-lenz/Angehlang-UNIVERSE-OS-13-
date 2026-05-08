// Plan Item ID: TI-1
import { imageSovereignEngine } from './studios/ImageSovereignEngine';
import { webSearch } from '@/tools/WebSearch';

export type ServiceCapability = 
  | 'image_generation' 
  | 'web_search' 
  | 'code_execution' 
  | 'terminal' 
  | 'file_operations'
  | 'audio_generation'
  | 'video_generation'
  | '3d_generation'
  | 'text_processing'
  | 'data_visualization'
  | 'database_operations'
  | 'security_scan'
  | 'network_operations'
  | 'simulation_run'
  | 'fullstack_generation';

export interface StudioServiceRequest {
  capability: ServiceCapability;
  params: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
  timeout?: number;
}

export interface StudioServiceResult {
  success: boolean;
  data?: any;
  error?: string;
  studio: string;
  metadata?: {
    latency: number;
    fallback?: string;
  };
}

export interface StudioStatus {
  studio: string;
  capabilities: ServiceCapability[];
  available: boolean;
  lastUsed?: number;
  load: number;
}

export type StudioCallback = (result: StudioServiceResult) => void;

class CrossStudioOrchestrator {
  private static instance: CrossStudioOrchestrator;
  private serviceRegistry: Map<ServiceCapability, string> = new Map();
  private studioStatuses: Map<string, StudioStatus> = new Map();
  private pendingRequests: Map<string, StudioServiceRequest> = new Map();
  private callbacks: Map<string, StudioCallback[]> = new Map();
  private requestIdCounter = 0;

  private constructor() {
    this.initializeRegistry();
  }

  static getInstance(): CrossStudioOrchestrator {
    if (!CrossStudioOrchestrator.instance) {
      CrossStudioOrchestrator.instance = new CrossStudioOrchestrator();
    }
    return CrossStudioOrchestrator.instance;
  }

  private initializeRegistry(): void {
    this.serviceRegistry.set('image_generation', 'ImageStudio');
    this.serviceRegistry.set('web_search', 'BrowserStudio');
    this.serviceRegistry.set('code_execution', 'CodeStudio');
    this.serviceRegistry.set('terminal', 'CodeStudio');
    this.serviceRegistry.set('file_operations', 'CodeStudio');
    this.serviceRegistry.set('audio_generation', 'AudioStudio');
    this.serviceRegistry.set('video_generation', 'VideoStudio');
    this.serviceRegistry.set('3d_generation', 'ThreeDStudio');
    this.serviceRegistry.set('text_processing', 'TextStudio');
    this.serviceRegistry.set('data_visualization', 'DataVizStudio');
    this.serviceRegistry.set('database_operations', 'DatabaseStudio');
    this.serviceRegistry.set('security_scan', 'SecurityStudio');
    this.serviceRegistry.set('network_operations', 'NetworkStudio');
    this.serviceRegistry.set('simulation_run', 'SimulationStudio');
    this.serviceRegistry.set('fullstack_generation', 'CodeStudio');

    this.studioStatuses.set('ImageStudio', {
      studio: 'ImageStudio',
      capabilities: ['image_generation'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('BrowserStudio', {
      studio: 'BrowserStudio',
      capabilities: ['web_search'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('CodeStudio', {
      studio: 'CodeStudio',
      capabilities: ['code_execution', 'terminal', 'file_operations', 'fullstack_generation'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('AudioStudio', {
      studio: 'AudioStudio',
      capabilities: ['audio_generation'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('VideoStudio', {
      studio: 'VideoStudio',
      capabilities: ['video_generation'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('ThreeDStudio', {
      studio: 'ThreeDStudio',
      capabilities: ['3d_generation'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('TextStudio', {
      studio: 'TextStudio',
      capabilities: ['text_processing'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('DataVizStudio', {
      studio: 'DataVizStudio',
      capabilities: ['data_visualization'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('DatabaseStudio', {
      studio: 'DatabaseStudio',
      capabilities: ['database_operations'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('SecurityStudio', {
      studio: 'SecurityStudio',
      capabilities: ['security_scan'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('NetworkStudio', {
      studio: 'NetworkStudio',
      capabilities: ['network_operations'],
      available: true,
      load: 0
    });
    this.studioStatuses.set('SimulationStudio', {
      studio: 'SimulationStudio',
      capabilities: ['simulation_run'],
      available: true,
      load: 0
    });
  }

  getStudioForCapability(capability: ServiceCapability): string {
    return this.serviceRegistry.get(capability) || 'Unknown';
  }

  getAllCapabilities(): ServiceCapability[] {
    return Array.from(this.serviceRegistry.keys());
  }

  getStudiosForCapabilities(capabilities: ServiceCapability[]): string[] {
    const studios = new Set<string>();
    capabilities.forEach(cap => {
      const studio = this.serviceRegistry.get(cap);
      if (studio) studios.add(studio);
    });
    return Array.from(studios);
  }

  getAllStudios(): StudioStatus[] {
    return Array.from(this.studioStatuses.values());
  }

  async executeService(request: StudioServiceRequest): Promise<StudioServiceResult> {
    const startTime = Date.now();
    const studio = this.getStudioForCapability(request.capability);
    const status = this.studioStatuses.get(studio);

    if (!status || !status.available) {
      return {
        success: false,
        error: `Studio ${studio} is not available`,
        studio
      };
    }

    status.load = Math.min(status.load + 10, 100);
    status.lastUsed = Date.now();

    try {
      let result: any;

      switch (request.capability) {
        case 'image_generation':
          result = await this.executeImageGeneration(request.params);
          break;
        case 'web_search':
          result = await this.executeWebSearch(request.params);
          break;
        case 'code_execution':
          result = await this.executeCodeExecution(request.params);
          break;
        case 'terminal':
          result = await this.executeTerminal(request.params);
          break;
        case 'fullstack_generation':
          result = await this.executeFullstackGeneration(request.params);
          break;
        case 'text_processing':
          result = await this.executeTextProcessing(request.params);
          break;
        case 'data_visualization':
          result = await this.executeDataVisualization(request.params);
          break;
        case 'security_scan':
          result = await this.executeSecurityScan(request.params);
          break;
        default:
          result = { error: `Capability ${request.capability} not implemented` };
      }

      status.load = Math.max(status.load - 5, 0);

      return {
        success: !result.error,
        data: result,
        studio,
        metadata: {
          latency: Date.now() - startTime
        }
      };
    } catch (error: any) {
      status.load = Math.max(status.load - 5, 0);
      return {
        success: false,
        error: error.message,
        studio,
        metadata: {
          latency: Date.now() - startTime
        }
      };
    }
  }

  private async executeImageGeneration(params: any): Promise<any> {
    try {
      const asset = await imageSovereignEngine.synthesize(params.prompt);
      return {
        id: asset.id,
        url: asset.url,
        prompt: params.prompt
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private async executeWebSearch(params: any): Promise<any> {
    try {
      const results = await webSearch.search(params.query, 10);
      return { results: results.results.map((r: any) => ({ title: r.title, snippet: r.snippet, url: r.url })) };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  private async executeCodeExecution(params: any): Promise<any> {
    return {
      output: 'Code execution requires CodeStudio sandbox',
      params
    };
  }

  private async executeTerminal(params: any): Promise<any> {
    return {
      output: 'Terminal execution requires CodeStudio',
      command: params.command
    };
  }

  private async executeFullstackGeneration(params: any): Promise<any> {
    return {
      output: 'Fullstack generation requires CodeStudio',
      prompt: params.prompt
    };
  }

  private async executeTextProcessing(params: any): Promise<any> {
    return {
      result: params.text,
      operation: params.operation
    };
  }

  private async executeDataVisualization(params: any): Promise<any> {
    return {
      chart: 'DataVizStudio required',
      data: params.data
    };
  }

  private async executeSecurityScan(params: any): Promise<any> {
    return {
      scan: 'SecurityStudio required',
      target: params.target
    };
  }

  detectRequiredCapabilities(prompt: string): ServiceCapability[] {
    const capabilities: ServiceCapability[] = [];
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.match(/generate|create|build|make|design|logo|icon|image|picture|photo|visual/)) {
      capabilities.push('image_generation');
    }
    if (lowerPrompt.match(/search|find|lookup|google|web|internet|browse|research/)) {
      capabilities.push('web_search');
    }
    if (lowerPrompt.match(/run|execute|terminal|shell|command|npm|git|build|deploy/)) {
      capabilities.push('terminal');
    }
    if (lowerPrompt.match(/code|script|function|class|component|api|backend|frontend/)) {
      capabilities.push('code_execution');
      capabilities.push('fullstack_generation');
    }
    if (lowerPrompt.match(/music|audio|sound|song|voice/)) {
      capabilities.push('audio_generation');
    }
    if (lowerPrompt.match(/video|animation|movie/)) {
      capabilities.push('video_generation');
    }
    if (lowerPrompt.match(/3d|model|threejs|scene|render/)) {
      capabilities.push('3d_generation');
    }
    if (lowerPrompt.match(/analyze|chart|graph|visualize|data/)) {
      capabilities.push('data_visualization');
    }
    if (lowerPrompt.match(/database|sql|query|schema/)) {
      capabilities.push('database_operations');
    }
    if (lowerPrompt.match(/security|scan|vulnerability|audit/)) {
      capabilities.push('security_scan');
    }
    if (lowerPrompt.match(/network|api|request|connection/)) {
      capabilities.push('network_operations');
    }
    if (lowerPrompt.match(/simulate|simulation|test/)) {
      capabilities.push('simulation_run');
    }

    return [...new Set(capabilities)];
  }

  async autoExecuteFromPrompt(prompt: string): Promise<StudioServiceResult[]> {
    const capabilities = this.detectRequiredCapabilities(prompt);
    const results: StudioServiceResult[] = [];

    for (const capability of capabilities) {
      const result = await this.executeService({
        capability,
        params: { prompt, originalPrompt: prompt }
      });
      results.push(result);
    }

    return results;
  }
}

export const crossStudioOrchestrator = CrossStudioOrchestrator.getInstance();
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
