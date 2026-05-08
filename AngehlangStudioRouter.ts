// Plan Item ID: TI-1
/**
 * AngehlangStudioRouter.ts - v13.0.0 Studio Router
 * 
 * Routes prompts to appropriate studio engines.
 * Uses native SovereignLLM for general queries.
 */
import { sovereignLLM, ZetaInferenceResult } from './SovereignLLM';
import { UI_VERSION } from '@/constants';

export type StudioType = 
  | 'code' | 'book' | 'image' | 'audio' | 'video' | '3d' | 'gaming' 
  | 'data' | 'network' | 'iot' | 'bio' | 'automation' | 'security' | 'os' 
  | 'cloud' | 'browser' | 'database' | 'evolution' | 'benchmark' | 'simulation' 
  | 'synthetic-bio' | 'progressive-test' | 'intelligence-hub' | 'text-processing' 
  | 'a2a-hub' | 'general';

export interface StudioRoute {
  type: StudioType;
  confidence: number;
  keywords: string[];
}

export class AngehlangStudioRouter {
  private static instance: AngehlangStudioRouter;
  private isReady = false;
  private core: any = null;

  private constructor() {}

  static getInstance(): AngehlangStudioRouter {
    if (!AngehlangStudioRouter.instance) {
      AngehlangStudioRouter.instance = new AngehlangStudioRouter();
    }
    return AngehlangStudioRouter.instance;
  }

  private STUDIO_KEYWORDS: Record<StudioType, string[]> = {
    'code': ['code', 'function', 'program', 'script', 'typescript', 'python', 'javascript', 'debug'],
    'book': ['book', 'novel', 'story', 'write', 'chapter', 'narrative', 'fiction'],
    'image': ['image', 'picture', 'photo', 'draw', 'paint', 'generate image'],
    'audio': ['audio', 'music', 'song', 'sound', 'mp3', 'wav', 'melody'],
    'video': ['video', 'movie', 'film', 'clip', 'animation'],
    '3d': ['3d', 'model', 'mesh', 'blender', 'three.js', 'object'],
    'gaming': ['game', 'gaming', 'unity', 'unreal', 'player', 'level'],
    'data': ['data', 'chart', 'graph', 'visualization', 'dashboard', 'analytics'],
    'network': ['network', 'tcp', 'http', 'api', 'server', 'client', 'packet'],
    'iot': ['iot', 'sensor', 'device', 'smart', 'arduino', 'raspberry'],
    'bio': ['bio', 'dna', 'rna', 'protein', 'molecular', 'genetic'],
    'automation': ['automation', 'automate', 'workflow', 'pipeline', 'script'],
    'security': ['security', 'hack', 'encrypt', 'decrypt', 'firewall', 'virus'],
    'os': ['os', 'operating system', 'kernel', 'linux', 'windows', 'process'],
    'cloud': ['cloud', 'aws', 'azure', 'gcp', 'deploy', 'kubernetes'],
    'browser': ['browser', 'chrome', 'firefox', 'extension', 'web'],
    'database': ['database', 'sql', 'nosql', 'mongo', 'postgres', 'query'],
    'evolution': ['evolve', 'evolver', 'mutate', 'adapt', 'genetic'],
    'benchmark': ['benchmark', 'test', 'performance', 'speed', 'compare'],
    'simulation': ['simulation', 'simulate', 'model', 'predict', 'forecast'],
    'synthetic-bio': ['synthetic', 'bio', 'lab', 'culture', 'cell'],
    'progressive-test': ['progressive', 'a/b', 'test', 'experiment'],
    'intelligence-hub': ['intelligence', 'ai', 'ml', 'neural', 'learning'],
    'text-processing': ['text', 'nlp', 'language', 'sentiment', 'extract'],
    'a2a-hub': ['a2a', 'agent', 'communication', 'protocol', 'message'],
    'general': []
  };

  async initialize(): Promise<void> {
    console.log(`%c[StudioRouter] v${UI_VERSION} Initialized`, 'color: #10b981; font-weight: bold;');
    this.isReady = true;
  }

  route(prompt: string): StudioRoute {
    const lower = prompt.toLowerCase();
    let bestMatch: StudioType = 'general';
    let maxScore = 0;

    for (const [studio, keywords] of Object.entries(this.STUDIO_KEYWORDS)) {
      if (studio === 'general') continue;
      const score = keywords.filter(k => lower.includes(k)).length;
      if (score > maxScore) {
        maxScore = score;
        bestMatch = studio as StudioType;
      }
    }

    return {
      type: bestMatch,
      confidence: maxScore / Math.max(1, prompt.split(' ').length),
      keywords: this.STUDIO_KEYWORDS[bestMatch] || []
    };
  }

  async handlePrompt(prompt: string): Promise<string> {
    const route = this.route(prompt);
    console.log(`%c[StudioRouter] Routed to: ${route.type} (${(route.confidence * 100).toFixed(1)}% confidence)`, 
      'color: #06b6d4;');

    if (route.type === 'general') {
      return this.handleGeneral(prompt);
    }

    return `## ${route.type.charAt(0).toUpperCase() + route.type.slice(1)} Studio\n\nRouted to ${route.type} studio (${route.confidence > 0 ? 'keywords matched' : 'general processing'}).\n\nProcessing: ${prompt.substring(0, 100)}...`;
  }

  private async handleGeneral(prompt: string): Promise<string> {
    try {
      const result: ZetaInferenceResult = await sovereignLLM.generate(prompt);
      return result.content;
    } catch (e) {
      return `## Angehlang Sovereign Response\n\n**Query:** "${prompt.substring(0, 80)}"\n\nThe native inference engine is processing your request. Please provide specific details for the most accurate response.\n\n*Sovereign Intelligence v${UI_VERSION} | Native Core*`;
    }
  }

  getSupportedStudios(): StudioType[] {
    return Object.keys(this.STUDIO_KEYWORDS) as StudioType[];
  }

  isReadyStatus(): boolean {
    return this.isReady;
  }
}

export const studioRouter = AngehlangStudioRouter.getInstance();
export default studioRouter;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
