/**
 * WikiGenerator.ts - Conversation Recall Wiki System
 * 
 * Creates topic-specific wiki for each conversation
 * Enables full conversation recall and context retention
 */

import type { TemplateCategory } from './IntentAnalyzer';
import type { LanguageConfig } from './LanguageSelector';
import type { TemplateFile } from './TemplateGeneratorEngine';

export interface WikiContent {
  id: string;
  topic: string;
  timestamp: string;
  category: TemplateCategory;
  languages: string[];
  overview: string;
  usage: UsageGuide[];
  examples: CodeExample[];
  errors: ErrorSolution[];
  bestPractices: string[];
  related: string[];
}

export interface UsageGuide {
  title: string;
  command: string;
  description: string;
}

export interface CodeExample {
  filename: string;
  language: string;
  code: string;
  description: string;
}

export interface ErrorSolution {
  error: string;
  solution: string;
  category: 'syntax' | 'runtime' | 'security' | 'configuration';
}

class WikiGenerator {
  private wikiStore: Map<string, WikiContent> = new Map();
  private conversationKey: string = '';

  startConversation(topic: string, category: TemplateCategory): string {
    this.conversationKey = `wiki-${Date.now()}-${topic.replace(/\s+/g, '-').toLowerCase()}`;
    return this.conversationKey;
  }

  generateWiki(
    topic: string,
    category: TemplateCategory,
    languages: LanguageConfig[],
    files: TemplateFile[]
  ): WikiContent {
    const wiki: WikiContent = {
      id: this.conversationKey || `wiki-${Date.now()}`,
      topic,
      timestamp: new Date().toISOString(),
      category,
      languages: languages.map(l => l.fullName),
      overview: this.generateOverview(topic, category, languages),
      usage: this.generateUsageGuides(category, languages[0]),
      examples: this.generateExamples(files),
      errors: this.generateErrorSolutions(category),
      bestPractices: this.generateBestPractices(category, languages),
      related: this.findRelatedTopics(category),
    };

    this.wikiStore.set(wiki.id, wiki);
    return wiki;
  }

  private generateOverview(topic: string, category: TemplateCategory, languages: LanguageConfig[]): string {
    return `
# ${topic}

## Project Overview
Generated: ${new Date().toLocaleString()}
Category: ${category}
Languages: ${languages.map(l => l.fullName).join(', ')}

## Technology Stack
${languages.map(l => `- **${l.fullName}**: ${l.primaryUse.join(', ')}`).join('\n')}

## Key Features
- ✅ Error Prevention Enabled
- ✅ Type Safety
- ✅ Production Ready
- ✅ Best Practices Included
`.trim();
  }

  private generateUsageGuides(category: TemplateCategory, language?: LanguageConfig): UsageGuide[] {
    const guides: UsageGuide[] = [
      {
        title: 'Installation',
        command: this.getInstallCommand(category),
        description: 'Install project dependencies',
      },
      {
        title: 'Development',
        command: this.getDevCommand(category),
        description: 'Start development server',
      },
      {
        title: 'Build',
        command: this.getBuildCommand(category),
        description: 'Build for production',
      },
    ];

    if (category === 'system' || category === 'automation') {
      guides.push({
        title: 'Execution',
        command: this.getRunCommand(category),
        description: 'Run the application',
      });
    }

    return guides;
  }

  private generateExamples(files: TemplateFile[]): CodeExample[] {
    return files.slice(0, 5).map(file => ({
      filename: file.name,
      language: file.language,
      code: file.content.split('\n').slice(0, 15).join('\n'),
      description: file.description,
    }));
  }

  private generateErrorSolutions(category: TemplateCategory): ErrorSolution[] {
    const commonSolutions: ErrorSolution[] = [
      {
        error: 'Module not found',
        solution: 'Run: npm install OR pip install -r requirements.txt',
        category: 'runtime',
      },
      {
        error: 'TypeScript errors',
        solution: 'Check tsconfig.json strict mode settings',
        category: 'configuration',
      },
      {
        error: 'Import errors',
        solution: 'Verify import paths and exports match',
        category: 'syntax',
      },
    ];

    const categorySolutions: Record<TemplateCategory, ErrorSolution[]> = {
      pwa: [
        { error: 'Service worker not registered', solution: 'Add to index.html: navigator.serviceWorker.register()', category: 'runtime' },
        { error: 'PWA not installable', solution: 'Verify manifest.json has all required fields', category: 'configuration' },
      ],
      mobile: [
        { error: 'Native module not found', solution: 'Run: npx expo install or npm install', category: 'runtime' },
        { error: 'Bundle not loading', solution: 'Clear expo cache: npx expo start --clear', category: 'runtime' },
      ],
      fullstack: [
        { error: 'Database connection failed', solution: 'Check DATABASE_URL in .env', category: 'configuration' },
        { error: 'CORS errors', solution: 'Add domain to CORS whitelist', category: 'configuration' },
      ],
      agent: [
        { error: 'API key not found', solution: 'Set OPENAI_API_KEY environment variable', category: 'configuration' },
        { error: 'Rate limit exceeded', solution: 'Implement exponential backoff', category: 'runtime' },
      ],
      engine: [
        { error: 'WebGL not supported', solution: 'Check browser WebGL1/WebGL2 support', category: 'runtime' },
        { error: 'Memory leak', solution: 'Dispose resources in componentWillUnmount', category: 'runtime' },
      ],
      llm: [
        { error: 'CUDA out of memory', solution: 'Reduce batch size or model size', category: 'runtime' },
        { error: 'Model not found', solution: 'Verify model path in config', category: 'configuration' },
      ],
      system: [
        { error: 'Permission denied', solution: 'Run with elevated privileges or check file permissions', category: 'runtime' },
        { error: 'Segmentation fault', solution: 'Check pointer validity and memory allocation', category: 'runtime' },
      ],
      automation: [
        { error: 'CI/CD pipeline failed', solution: 'Check GitHub Actions logs for specific errors', category: 'runtime' },
        { error: 'Timeout errors', solution: 'Increase timeout values in workflow config', category: 'configuration' },
      ],
      web_extension: [
        { error: 'Extension not loading', solution: 'Check manifest.json for errors', category: 'configuration' },
        { error: 'Cross-origin blocked', solution: 'Add domains to permissions in manifest', category: 'security' },
      ],
      universal: [
        { error: 'Config not loading', solution: 'Check config file path and format', category: 'configuration' },
        { error: 'Import failed', solution: 'Verify module exports match imports', category: 'syntax' },
      ],
    };

    return [...commonSolutions, ...(categorySolutions[category] || [])];
  }

  private generateBestPractices(category: TemplateCategory, languages: LanguageConfig[]): string[] {
    const languagePractices = languages.map(l => 
      `Use ${l.fullName} best practices: ${l.errors.strictTypes ? 'strict typing' : ''}, ${l.errors.nullSafety ? 'null safety' : ''}`
    ).filter(Boolean);

    const categoryPractices: Record<string, string[]> = {
      pwa: [
        'Use service worker for offline functionality',
        'Implement app shell architecture',
        'Add to home screen prompt',
      ],
      mobile: [
        'Use offline-first data storage',
        'Handle platform-specific features with native modules',
      ],
      fullstack: [
        'Use environment variables for secrets',
        'Implement rate limiting on APIs',
        'Use database connection pooling',
      ],
      agent: [
        'Implement proper error handling for API calls',
        'Use streaming for real-time responses',
        'Add conversation context management',
      ],
      engine: [
        'Use requestAnimationFrame for game loops',
        'Implement object pooling for performance',
        'Use proper cleanup in destructor',
      ],
      llm: [
        'Use gradient checkpointing for large models',
        'Implement proper batching',
        'Monitor GPU memory usage',
      ],
      system: [
        'Handle signals gracefully (SIGTERM, SIGINT)',
        'Use proper error codes',
        'Implement logging with levels',
      ],
      automation: [
        'Use secrets management for credentials',
        'Implement idempotency',
        'Add retry logic with backoff',
      ],
      web_extension: [
        'Minimize permissions scope',
        'Use content scripts strategically',
        'Handle extension lifecycle events',
      ],
      universal: [
        'Always validate user input',
        'Handle errors gracefully',
        'Use type safety where possible',
      ],
    };

    return [
      ...(categoryPractices[category] || []),
      ...languagePractices,
    ];
  }

  private findRelatedTopics(category: TemplateCategory): string[] {
    const related: Record<string, string[]> = {
      pwa: ['mobile', 'web_extension'],
      mobile: ['pwa', 'fullstack'],
      fullstack: ['api', 'database'],
      agent: ['llm', 'automation'],
      engine: ['game', 'graphics'],
      llm: ['agent', 'data'],
      system: ['automation', 'cli'],
      automation: ['ci_cd', 'deployment'],
      web_extension: ['pwa', 'browser'],
      universal: ['template', 'boilerplate'],
    };

    return related[category] || [];
  }

  private getInstallCommand(category: TemplateCategory): string {
    const commands: Record<string, string> = {
      pwa: 'npm install',
      mobile: 'npm install',
      fullstack: 'npm install && pip install -r requirements.txt',
      agent: 'pip install -r requirements.txt',
      engine: 'npm install',
      llm: 'pip install -r requirements.txt',
      system: 'cargo build OR make',
      automation: 'chmod +x scripts/*.sh',
      web_extension: 'npm install',
      universal: 'npm install',
    };
    return commands[category] || 'npm install';
  }

  private getDevCommand(category: TemplateCategory): string {
    const commands: Record<string, string> = {
      pwa: 'npm run dev',
      mobile: 'npx expo start',
      fullstack: 'npm run dev',
      agent: 'python src/main.py',
      engine: 'npm run dev',
      llm: 'python src/train.py',
      system: 'cargo run OR ./main',
      automation: './scripts/dev.sh',
      web_extension: 'npm run dev',
      universal: 'npm run dev',
    };
    return commands[category] || 'npm run dev';
  }

  private getBuildCommand(category: TemplateCategory): string {
    const commands: Record<string, string> = {
      pwa: 'npm run build',
      mobile: 'npx expo export',
      fullstack: 'npm run build',
      agent: 'python -m py_compile src/main.py',
      engine: 'npm run build',
      llm: 'python -m py_compile src/train.py',
      system: 'cargo build --release',
      automation: 'docker build -t app .',
      web_extension: 'npm run build',
      universal: 'npm run build',
    };
    return commands[category] || 'npm run build';
  }

  private getRunCommand(category: TemplateCategory): string {
    const commands: Record<string, string> = {
      system: './main OR go run main.go',
      automation: 'bash scripts/main.sh',
    };
    return commands[category] || 'node dist/main.js';
  }

  // Recall methods for conversation continuity
  remember(key: string, content: WikiContent): void {
    this.wikiStore.set(key, content);
  }

  recall(key: string): WikiContent | undefined {
    return this.wikiStore.get(key);
  }

  recallByTopic(topic: string): WikiContent | undefined {
    for (const wiki of this.wikiStore.values()) {
      if (wiki.topic.toLowerCase().includes(topic.toLowerCase())) {
        return wiki;
      }
    }
    return undefined;
  }

  getAllWikis(): WikiContent[] {
    return Array.from(this.wikiStore.values());
  }

  searchWiki(query: string): WikiContent[] {
    const results: WikiContent[] = [];
    const lowerQuery = query.toLowerCase();

    for (const wiki of this.wikiStore.values()) {
      if (
        wiki.topic.toLowerCase().includes(lowerQuery) ||
        wiki.category.toLowerCase().includes(lowerQuery) ||
        wiki.languages.some(l => l.toLowerCase().includes(lowerQuery)) ||
        wiki.errors.some(e => e.error.toLowerCase().includes(lowerQuery))
      ) {
        results.push(wiki);
      }
    }

    return results;
  }

  generateMarkdown(wiki: WikiContent): string {
    const lines: string[] = [];

    lines.push(`# ${wiki.topic}`);
    lines.push('');
    lines.push(`*Generated: ${wiki.timestamp}*`);
    lines.push(`*Category: ${wiki.category}*`);
    lines.push(`*Languages: ${wiki.languages.join(', ')}*`);
    lines.push('');

    lines.push('## Usage');
    for (const guide of wiki.usage) {
      lines.push(`### ${guide.title}`);
      lines.push('```bash');
      lines.push(guide.command);
      lines.push('```');
      lines.push(guide.description);
      lines.push('');
    }

    lines.push('## Examples');
    for (const example of wiki.examples) {
      lines.push(`### ${example.filename} (${example.language})`);
      lines.push('```' + example.language);
      lines.push(example.code);
      lines.push('```');
      lines.push('');
    }

    lines.push('## Common Errors');
    for (const error of wiki.errors) {
      lines.push(`### ${error.error}`);
      lines.push(`**Category:** ${error.category}`);
      lines.push(`**Solution:** ${error.solution}`);
      lines.push('');
    }

    lines.push('## Best Practices');
    for (const practice of wiki.bestPractices) {
      lines.push(`- ${practice}`);
    }

    if (wiki.related.length > 0) {
      lines.push('');
      lines.push('## Related Topics');
      lines.push(wiki.related.map(t => `- ${t}`).join('\n'));
    }

    return lines.join('\n');
  }
}

export const wikiGenerator = new WikiGenerator();
export default wikiGenerator;