// Plan Item ID: TI-1
import { codeExecutor } from './CodeExecutionEngine';

export interface CodeArtifact {
  id: string;
  name: string;
  language: string;
  content: string;
  createdAt: number;
  usage: string;
}

export interface CodeTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  variables: string[];
}

export interface ProgrammingResult {
  success: boolean;
  artifacts: CodeArtifact[];
  output: string;
  errors: string[];
  executionTime: number;
}

export class ProgrammingEngineeringEngine {
  private static instance: ProgrammingEngineeringEngine;
  private templates: Map<string, CodeTemplate[]> = new Map();
  private artifacts: Map<string, CodeArtifact[]> = new Map();

  private constructor() {
    this.initializeTemplates();
  }

  static getInstance(): ProgrammingEngineeringEngine {
    if (!ProgrammingEngineeringEngine.instance) {
      ProgrammingEngineeringEngine.instance = new ProgrammingEngineeringEngine();
    }
    return ProgrammingEngineeringEngine.instance;
  }

  private initializeTemplates(): void {
    const templates: CodeTemplate[] = [
      // React Templates
      {
        id: 'react-component',
        name: 'React Component',
        category: 'react',
        description: 'Basic React functional component with TypeScript',
        code: `interface {{componentName}}Props {
  className?: string;
  children?: React.ReactNode;
}

export function {{componentName}}({ className, children }: {{componentName}}Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}`,
        variables: ['componentName']
      },
      {
        id: 'react-hook',
        name: 'React Custom Hook',
        category: 'react',
        description: 'Custom React hook with state management',
        code: `import { useState, useEffect, useCallback } from 'react';

export function use{{hookName}}({{initialParams}}) {
  const [state, setState] = useState({{initialState}});

  useEffect(() => {
    // Effect logic here
  }, [{{dependencies}}]);

  const {{actionName}} = useCallback(() => {
    // Action logic here
  }, [{{dependencies}}]);

  return { state, {{actionName}} };
}`,
        variables: ['hookName', 'initialParams', 'initialState', 'dependencies', 'actionName']
      },
      {
        id: 'react-context',
        name: 'React Context Provider',
        category: 'react',
        description: 'React context with provider pattern',
        code: `import React, { createContext, useContext, useState } from 'react';

interface {{contextName}}ContextType {
  {{stateVariables}}
}

const {{contextName}}Context = createContext<{{contextName}}ContextType | undefined>(undefined);

export function {{contextName}}Provider({ children }: { children: React.ReactNode }) {
  const [{{stateFields}}] = useState({{initialValues}});

  const value = {
    {{stateFields}}
  };

  return (
    <{{contextName}}Context.Provider value={value}>
      {children}
    </{{contextName}}Context.Provider>
  );
}

export function use{{contextName}}() {
  const context = useContext({{contextName}}Context);
  if (!context) {
    throw new Error('use{{contextName}} must be used within a {{contextName}}Provider');
  }
  return context;
}`,
        variables: ['contextName', 'stateVariables', 'stateFields', 'initialValues']
      },
      // Node.js Templates
      {
        id: 'express-route',
        name: 'Express Route Handler',
        category: 'node',
        description: 'Express API route with CRUD operations',
        code: `import express, { Request, Response, Next } from 'express';

const router = express.Router();

router.get('/{{routePath}}', async (req: Request, res: Response, next: Next) => {
  try {
    const result = await {{serviceName}}.getAll();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/{{routePath}}', async (req: Request, res: Response, next: Next) => {
  try {
    const result = await {{serviceName}}.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.put('/{{routePath}}/:id', async (req: Request, res: Response, next: Next) => {
  try {
    const result = await {{serviceName}}.update(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.delete('/{{routePath}}/:id', async (req: Request, res: Response, next: Next) => {
  try {
    await {{serviceName}}.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;`,
        variables: ['routePath', 'serviceName']
      },
      {
        id: 'express-middleware',
        name: 'Express Middleware',
        category: 'node',
        description: 'Custom Express middleware function',
        code: `import { Request, Response, NextFunction } from 'express';

export function {{middlewareName}}(req: Request, res: Response, next: NextFunction) {
  // Pre-processing
  const start = Date.now();

  // Response handler
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(\`[{{middlewareName}}] \${req.method} \${req.path} - \${res.statusCode} (\${duration}ms)\`);
  });

  // Continue to next middleware
  next();
}`,
        variables: ['middlewareName']
      },
      // Utility Templates
      {
        id: 'debounce-function',
        name: 'Debounce Function',
        category: 'utility',
        description: 'Debounce utility for function throttling',
        code: `export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}`,
        variables: []
      },
      {
        id: 'throttle-function',
        name: 'Throttle Function',
        category: 'utility',
        description: 'Throttle utility for rate limiting',
        code: `export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}`,
        variables: []
      },
      {
        id: 'fetch-wrapper',
        name: 'Fetch Wrapper',
        category: 'utility',
        description: 'Type-safe fetch wrapper with error handling',
        code: `interface FetchOptions extends RequestInit {
  timeout?: number;
}

interface FetchResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export async function fetchApi<T>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResponse<T>> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });

    const data = await response.json();

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Request failed',
        status: response.status
      };
    }

    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: error.message || 'Network error',
      status: 0
    };
  }
}`,
        variables: []
      },
      {
        id: 'class-transformer',
        name: 'Data Transformer Class',
        category: 'utility',
        description: 'Utility class for data transformation',
        code: `export class {{className}}Transformer {
  static toDTO(data: any): {{className}}DTO {
    return {
      {{dtoMappings}}
    };
  }

  static toEntity(dto: {{className}}DTO): {{className}}Entity {
    return {
      {{entityMappings}}
    };
  }

  static toDTOList(dataList: any[]): {{className}}DTO[] {
    return dataList.map(item => this.toDTO(item));
  }
}`,
        variables: ['className', 'dtoMappings', 'entityMappings']
      },
      // Test Templates
      {
        id: 'vitest-test',
        name: 'Vitest Unit Test',
        category: 'testing',
        description: 'Vitest unit test template',
        code: `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { {{subjectName}} } from './{{subjectPath}}';

describe('{{subjectName}}', () => {
  let instance: {{subjectName}};

  beforeEach(() => {
    instance = new {{subjectName}}({{setupParams}});
  });

  it('should {{testDescription}}', () => {
    // Arrange
    const input = {{testInput}};

    // Act
    const result = instance.{{testMethod}}(input);

    // Assert
    expect(result).to{{matcher}}({{expectedValue}});
  });

  it('should handle {{errorCase}}', () => {
    expect(() => instance.{{testMethod}}({{errorInput}})).toThrow({{errorType}});
  });
});`,
        variables: ['subjectName', 'subjectPath', 'setupParams', 'testDescription', 'testInput', 'testMethod', 'matcher', 'expectedValue', 'errorCase', 'errorInput', 'errorType']
      },
      // Database Templates
      {
        id: 'prisma-model',
        name: 'Prisma Schema Model',
        category: 'database',
        description: 'Prisma schema model definition',
        code: `model {{modelName}} {
  id        String   @id @default(cuid())
  {{fields}}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  {{relations}}
}

{{#each relations}}
model {{relationName}} {
  id        String   @id @default(cuid())
  {{fields}}
  {{modelName}}Id String
  {{modelName}} {{modelName}} @relation(fields: [{{modelName}}Id], references: [id])
}
{{/each}}`,
        variables: ['modelName', 'fields', 'relations']
      },
      {
        id: 'sql-query-builder',
        name: 'SQL Query Builder Helper',
        category: 'database',
        description: 'Type-safe SQL query builder',
        code: `export class QueryBuilder {
  private query: string = '';
  private params: any[] = [];

  select(columns: string[]): this {
    this.query += \`SELECT \${columns.join(', ')}\`;
    return this;
  }

  from(table: string): this {
    this.query += \` FROM \${table}\`;
    return this;
  }

  where(condition: string, ...params: any[]): this {
    this.query += \` WHERE \${condition}\`;
    this.params.push(...params);
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.query += \` ORDER BY \${column} \${direction}\`;
    return this;
  }

  limit(count: number): this {
    this.query += \` LIMIT \${count}\`;
    return this;
  }

  build(): { query: string; params: any[] } {
    return { query: this.query, params: this.params };
  }
}`,
        variables: []
      }
    ];

    // Categorize templates
    const categories = ['react', 'node', 'utility', 'testing', 'database'];
    categories.forEach(cat => {
      this.templates.set(cat, templates.filter(t => t.category === cat));
    });
    this.templates.set('all', templates);
  }

  getTemplates(category?: string): CodeTemplate[] {
    if (!category || category === 'all') {
      return this.templates.get('all') || [];
    }
    return this.templates.get(category) || [];
  }

  applyTemplate(templateId: string, variables: Record<string, string>): string {
    const templates = this.templates.get('all') || [];
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let code = template.code;
    Object.entries(variables).forEach(([key, value]) => {
      code = code.replace(new RegExp(`{{${key}}}`, 'g'), value || key);
    });

    return code;
  }

  async generateFromPrompt(prompt: string): Promise<ProgrammingResult> {
    const startTime = Date.now();
    const artifacts: CodeArtifact[] = [];
    const errors: string[] = [];
    let output = '';

    try {
      const intent = this.detectIntent(prompt);
      
      switch (intent.type) {
        case 'fullstack':
          output = 'Generating full-stack application structure...';
          artifacts.push(...await this.generateFullstack(intent));
          break;
        case 'component':
          output = 'Generating component code...';
          artifacts.push(this.generateComponent(intent));
          break;
        case 'api':
          output = 'Generating API endpoint...';
          artifacts.push(this.generateAPI(intent));
          break;
        case 'utility':
          output = 'Generating utility function...';
          artifacts.push(this.generateUtility(intent));
          break;
        case 'test':
          output = 'Generating test cases...';
          artifacts.push(this.generateTest(intent));
          break;
        default:
          output = 'Analyzing prompt for code generation...';
          artifacts.push(this.generateGenericCode(prompt));
      }

      return {
        success: artifacts.length > 0,
        artifacts,
        output,
        errors,
        executionTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        success: false,
        artifacts: [],
        output: '',
        errors: [error.message],
        executionTime: Date.now() - startTime
      };
    }
  }

  private detectIntent(prompt: string): { type: string; details: any } {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('fullstack') || lower.includes('app') && lower.includes('react')) {
      return { type: 'fullstack', details: { framework: 'react' } };
    }
    if (lower.includes('component') || lower.includes('react') && lower.includes('page')) {
      return { type: 'component', details: { type: 'react' } };
    }
    if (lower.includes('api') || lower.includes('endpoint') || lower.includes('route')) {
      return { type: 'api', details: {} };
    }
    if (lower.includes('test') || lower.includes('spec')) {
      return { type: 'test', details: {} };
    }
    if (lower.includes('function') || lower.includes('utility') || lower.includes('helper')) {
      return { type: 'utility', details: {} };
    }
    
    return { type: 'generic', details: {} };
  }

  private generateComponent(intent: any): CodeArtifact {
    const name = this.extractNameFromPrompt(intent.details.type || 'Component');
    return {
      id: `artifact-${Date.now()}`,
      name: `${name}.tsx`,
      language: 'typescript',
      content: this.applyTemplate('react-component', { componentName: name }),
      createdAt: Date.now(),
      usage: 'React functional component'
    };
  }

  private generateAPI(intent: any): CodeArtifact {
    return {
      id: `artifact-${Date.now()}`,
      name: 'api route.ts',
      language: 'typescript',
      content: this.applyTemplate('express-route', { routePath: 'items', serviceName: 'ItemService' }),
      createdAt: Date.now(),
      usage: 'Express API route handler'
    };
  }

  private generateUtility(intent: any): CodeArtifact {
    return {
      id: `artifact-${Date.now()}`,
      name: 'utils.ts',
      language: 'typescript',
      content: this.applyTemplate('fetch-wrapper', {}),
      createdAt: Date.now(),
      usage: 'Utility function'
    };
  }

  private generateTest(intent: any): CodeArtifact {
    return {
      id: `artifact-${Date.now()}`,
      name: 'component.test.ts',
      language: 'typescript',
      content: this.applyTemplate('vitest-test', { subjectName: 'Component', subjectPath: 'Component', setupParams: '', testDescription: 'render correctly', testInput: '{}', testMethod: 'render', matcher: 'Be', expectedValue: 'truthy', errorCase: 'invalid props', errorInput: 'null', errorType: 'Error' }),
      createdAt: Date.now(),
      usage: 'Unit test'
    };
  }

  private async generateFullstack(intent: any): Promise<CodeArtifact[]> {
    const artifacts: CodeArtifact[] = [];
    
    // Generate Next.js structure
    artifacts.push({
      id: `artifact-${Date.now()}-1`,
      name: 'page.tsx',
      language: 'typescript',
      content: `import { useState } from 'react';

export default function HomePage() {
  const [data, setData] = useState(null);

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">My Application</h1>
      <p className="text-lg text-gray-600 mt-4">
        Welcome to your new full-stack app
      </p>
    </main>
  );
}`,
      createdAt: Date.now(),
      usage: 'Next.js page component'
    });

    artifacts.push({
      id: `artifact-${Date.now()}-2`,
      name: 'layout.tsx',
      language: 'typescript',
      content: `import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,
      createdAt: Date.now(),
      usage: 'Next.js root layout'
    });

    artifacts.push({
      id: `artifact-${Date.now()}-3`,
      name: 'globals.css',
      language: 'css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground: #ffffff;
  --background: #0a0a0a;
}

body {
  color: var(--foreground);
  background: var(--background);
}`,
      createdAt: Date.now(),
      usage: 'Global CSS styles'
    });

    artifacts.push({
      id: `artifact-${Date.now()}-4`,
      name: 'package.json',
      language: 'json',
      content: JSON.stringify({
        name: 'my-app',
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint'
        },
        dependencies: {
          next: '14.0.0',
          react: '^18',
          'react-dom': '^18'
        },
        devDependencies: {
          typescript: '^5',
          '@types/node': '^20',
          '@types/react': '^18',
          '@types/react-dom': '^18',
          autoprefixer: '^10',
          postcss: '^8',
          tailwindcss: '^3'
        }
      }, null, 2),
      createdAt: Date.now(),
      usage: 'NPM package configuration'
    });

    return artifacts;
  }

  private generateGenericCode(prompt: string): CodeArtifact {
    const lines = prompt.split('\n').slice(0, 5).join('\n');
    return {
      id: `artifact-${Date.now()}`,
      name: 'generated.ts',
      language: 'typescript',
      content: `// Generated from prompt: "${lines}..."\n\n// TODO: Implement code based on requirements\n\nexport function implementation() {\n  // Your implementation here\n  return true;\n}`,
      createdAt: Date.now(),
      usage: 'Generic code placeholder'
    };
  }

  private extractNameFromPrompt(prompt: string): string {
    const match = prompt.match(/(?:create|make|generate|component|function)\s+(\w+)/i);
    return match ? match[1] : 'Component';
  }

  executeCode(code: string, language: string = 'typescript'): Promise<any> {
    return codeExecutor.execute(code, language);
  }

  validateCode(code: string, language: string): any {
    return codeExecutor.validate(code, language);
  }

  formatCode(code: string, language: string): string {
    return codeExecutor.formatCode(code, language);
  }

  suggestCompletions(code: string, cursor: number): string[] {
    return codeExecutor.suggestCompletions(code, cursor);
  }

  saveArtifact(artifact: CodeArtifact): void {
    if (!this.artifacts.has(artifact.language)) {
      this.artifacts.set(artifact.language, []);
    }
    this.artifacts.get(artifact.language)!.unshift(artifact);
  }

  getArtifacts(language?: string): CodeArtifact[] {
    if (language) {
      return this.artifacts.get(language) || [];
    }
    return Array.from(this.artifacts.values()).flat();
  }
}

export const programmingEngine = ProgrammingEngineeringEngine.getInstance();
export default programmingEngine;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
