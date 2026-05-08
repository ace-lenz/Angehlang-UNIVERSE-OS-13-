/**
 * IntentAnalyzer.ts - Smart Prompt Intent Detection Engine
 * 
 * Auto-detects category, intent, and language count from user prompt
 * Enables smart template selection without user configuration
 */

export type TemplateCategory = 
  | 'pwa'
  | 'web_extension'
  | 'mobile'
  | 'fullstack'
  | 'agent'
  | 'engine'
  | 'llm'
  | 'system'
  | 'automation'
  | 'universal';

export interface IntentResult {
  category: TemplateCategory;
  categoryName: string;
  intent: string;
  languageCount: number;
  languages: LanguageType[];
  specificLanguage?: LanguageType;
  requirements: IntentRequirement[];
  errorPrevention: boolean;
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise';
}

export interface IntentRequirement {
  type: 'backend' | 'frontend' | 'database' | 'ai' | 'mobile' | 'api' | 'auth' | 'realtime' | 'storage' | 'devops';
  priority: 'required' | 'optional';
}

export type LanguageType = 
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'lua'
  | 'html'
  | 'css'
  | 'sql'
  | 'bash'
  | 'yaml'
  | 'json';

const CATEGORY_TRIGGERS: Record<TemplateCategory, { keywords: string[]; requirements: IntentRequirement[]; languages: LanguageType[] }> = {
  pwa: {
    keywords: ['pwa', 'progressive', 'offline', 'installable', 'mobile web', 'service worker', 'manifest'],
    requirements: [{ type: 'frontend', priority: 'required' }, { type: 'storage', priority: 'required' }, { type: 'devops', priority: 'optional' }],
    languages: ['typescript', 'javascript']
  },
  web_extension: {
    keywords: ['extension', 'browser', 'chrome extension', 'firefox addon', 'browser plugin', 'addon'],
    requirements: [{ type: 'frontend', priority: 'required' }, { type: 'storage', priority: 'required' }],
    languages: ['typescript', 'javascript']
  },
  mobile: {
    keywords: ['mobile', 'android', 'ios', 'apk', 'react native', 'expo', 'app', 'mobile app'],
    requirements: [{ type: 'mobile', priority: 'required' }, { type: 'frontend', priority: 'required' }, { type: 'storage', priority: 'required' }],
    languages: ['typescript']
  },
  fullstack: {
    keywords: ['full stack', 'fullstack', 'backend', 'frontend', 'api', 'database', 'crud', 'web app', 'webapp'],
    requirements: [{ type: 'backend', priority: 'required' }, { type: 'frontend', priority: 'required' }, { type: 'api', priority: 'required' }, { type: 'database', priority: 'required' }],
    languages: ['typescript', 'python']
  },
  agent: {
    keywords: ['agent', 'ai agent', 'bot', 'assistant', 'agentic', 'chatbot', 'llm agent', 'ai assistant'],
    requirements: [{ type: 'ai', priority: 'required' }, { type: 'api', priority: 'required' }, { type: 'frontend', priority: 'optional' }],
    languages: ['python', 'typescript']
  },
  engine: {
    keywords: ['engine', 'game', 'physics', 'rendering', 'graphics', 'physics engine', 'game engine', '3d'],
    requirements: [{ type: 'backend', priority: 'required' }, { type: 'ai', priority: 'optional' }],
    languages: ['cpp', 'typescript', 'python']
  },
  llm: {
    keywords: ['llm', 'neural', 'transformer', 'ai model', 'machine learning', 'deep learning', 'gpt', 'model', 'transformer model', 'ai/ml'],
    requirements: [{ type: 'ai', priority: 'required' }, { type: 'backend', priority: 'optional' }],
    languages: ['python']
  },
  system: {
    keywords: ['system', 'cli', 'daemon', 'kernel', 'driver', 'terminal', 'command line', 'low level'],
    requirements: [{ type: 'backend', priority: 'required' }],
    languages: ['rust', 'c', 'go']
  },
  automation: {
    keywords: ['automation', 'ci/cd', 'pipeline', 'deploy', 'cron', 'script', 'bot', 'workflow', 'devops', 'cicd'],
    requirements: [{ type: 'devops', priority: 'required' }, { type: 'backend', priority: 'optional' }],
    languages: ['bash', 'yaml', 'python']
  },
  universal: {
    keywords: ['default', 'general', 'basic', 'simple', 'template', 'boilerplate', 'starter'],
    requirements: [],
    languages: ['typescript']
  }
};

const LANGUAGE_KEYWORDS: Record<LanguageType, string[]> = {
  typescript: ['typescript', 'ts', 'tsx'],
  javascript: ['javascript', 'js', 'jsx'],
  python: ['python', 'py', 'python3'],
  go: ['go', 'golang'],
  rust: ['rust', 'rs'],
  c: ['c', 'c99', 'c11'],
  cpp: ['c++', 'cpp', 'c++20'],
  csharp: ['c#', 'csharp', '.net'],
  lua: ['lua'],
  html: ['html', 'html5'],
  css: ['css', 'css3', 'style'],
  sql: ['sql', 'postgres', 'mysql', 'database'],
  bash: ['bash', 'shell', 'sh', 'script'],
  yaml: ['yaml', 'yml', 'config'],
  json: ['json', 'config']
};

class IntentAnalyzer {
  analyzePrompt(prompt: string): IntentResult {
    const lowerPrompt = prompt.toLowerCase();
    const category = this.detectCategory(lowerPrompt);
    const categoryData = CATEGORY_TRIGGERS[category];
    const requirements = this.detectRequirements(lowerPrompt, categoryData.requirements);
    const languages = this.selectLanguages(category, requirements, lowerPrompt);
    const specificLanguage = this.detectSpecificLanguage(lowerPrompt);
    const languageCount = this.calculateLanguageCount(requirements, specificLanguage);
    const complexity = this.detectComplexity(requirements);

    return {
      category,
      categoryName: this.getCategoryName(category),
      intent: this.extractIntent(prompt),
      languageCount,
      languages,
      specificLanguage: specificLanguage || undefined,
      requirements,
      errorPrevention: true,
      complexity
    };
  }

  private detectCategory(prompt: string): TemplateCategory {
    let bestMatch: TemplateCategory = 'universal';
    let bestScore = 0;

    for (const [category, data] of Object.entries(CATEGORY_TRIGGERS)) {
      let score = 0;
      for (const keyword of data.keywords) {
        if (prompt.includes(keyword)) {
          score += keyword.split(' ').length;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category as TemplateCategory;
      }
    }

    return bestMatch;
  }

  private detectRequirements(prompt: string, baseRequirements: IntentRequirement[]): IntentRequirement[] {
    const requirements = [...baseRequirements];
    
    if (prompt.includes('auth') || prompt.includes('login') || prompt.includes('user')) {
      requirements.push({ type: 'auth', priority: 'required' });
    }
    if (prompt.includes('real-time') || prompt.includes('websocket') || prompt.includes('live')) {
      requirements.push({ type: 'realtime', priority: 'required' });
    }
    if (prompt.includes('database') || prompt.includes('db') || prompt.includes('sql')) {
      requirements.push({ type: 'database', priority: 'required' });
    }
    
    return requirements;
  }

  private selectLanguages(category: TemplateCategory, requirements: IntentRequirement[], prompt: string): LanguageType[] {
    const categoryData = CATEGORY_TRIGGERS[category];
    const selectedLanguages: LanguageType[] = [];
    
    for (const req of requirements) {
      switch (req.type) {
        case 'frontend':
          selectedLanguages.push('typescript');
          break;
        case 'backend':
          selectedLanguages.push('typescript', 'python');
          break;
        case 'ai':
          selectedLanguages.push('python');
          break;
        case 'mobile':
          selectedLanguages.push('typescript');
          break;
        case 'database':
          selectedLanguages.push('sql', 'typescript');
          break;
        case 'devops':
          selectedLanguages.push('bash', 'yaml');
          break;
        default:
          break;
      }
    }

    const uniqueLanguages = [...new Set(selectedLanguages)];
    return uniqueLanguages.length > 0 ? uniqueLanguages : categoryData.languages;
  }

  private detectSpecificLanguage(prompt: string): LanguageType | null {
    for (const [lang, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (prompt.includes(keyword)) {
          return lang as LanguageType;
        }
      }
    }
    return null;
  }

  private calculateLanguageCount(requirements: IntentRequirement[], specificLanguage: LanguageType | null): number {
    if (specificLanguage) return 1;
    
    const requiredTypes = new Set(requirements.map(r => r.type));
    let count = 0;
    
    if (requiredTypes.has('frontend')) count++;
    if (requiredTypes.has('backend') || requiredTypes.has('ai')) count++;
    if (requiredTypes.has('database')) count++;
    if (requiredTypes.has('mobile')) count++;
    
    return Math.min(Math.max(count, 1), 4);
  }

  private detectComplexity(requirements: IntentRequirement[]): 'simple' | 'medium' | 'complex' | 'enterprise' {
    const requiredCount = requirements.filter(r => r.priority === 'required').length;
    
    if (requiredCount <= 2) return 'simple';
    if (requiredCount <= 4) return 'medium';
    if (requiredCount <= 6) return 'complex';
    return 'enterprise';
  }

  private extractIntent(prompt: string): string {
    const words = prompt.split(' ').filter(w => w.length > 3);
    return words.slice(0, 5).join(' ');
  }

  private getCategoryName(category: TemplateCategory): string {
    const names: Record<TemplateCategory, string> = {
      pwa: 'Progressive Web App',
      web_extension: 'Web Extension',
      mobile: 'Mobile Application',
      fullstack: 'Full Stack Application',
      agent: 'AI Agent',
      engine: 'Engine',
      llm: 'LLM/AI Model',
      system: 'System/CLI',
      automation: 'Automation',
      universal: 'Universal Template'
    };
    return names[category];
  }

  getCategoryById(id: string): TemplateCategory | null {
    return id as TemplateCategory in CATEGORY_TRIGGERS ? id as TemplateCategory : null;
  }

  getAllCategories(): { id: TemplateCategory; name: string; description: string }[] {
    return Object.entries(CATEGORY_TRIGGERS).map(([id, data]) => ({
      id: id as TemplateCategory,
      name: this.getCategoryName(id as TemplateCategory),
      description: data.keywords.slice(0, 3).join(', ')
    }));
  }
}

export const intentAnalyzer = new IntentAnalyzer();
export default intentAnalyzer;