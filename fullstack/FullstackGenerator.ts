/**
 * FullstackGenerator.ts - Complete Full-Stack Application Generator
 * 
 * Features:
 * - Next.js/React full-stack generation
 * - API routes and server actions
 * - Database schema generation
 * - Supabase integration
 * - Deployment preparation
 * - Live preview
 */

import { aiOrchestrator } from '@/features/ai/AIOrchestrator';

export interface AppSpec {
  name: string;
  description: string;
  frontend: FrontendSpec;
  backend?: BackendSpec;
  database?: DatabaseSpec;
  auth?: AuthSpec;
}

export interface FrontendSpec {
  framework: 'nextjs' | 'react-vite' | 'astro';
  styling: 'tailwind' | 'css-modules' | 'styled-components';
  features: string[];
  pages: string[];
}

export interface BackendSpec {
  runtime: 'node' | 'deno' | 'edge';
  apiStyle: 'rest' | 'graphql';
  routes: string[];
}

export interface DatabaseSpec {
  provider: 'supabase' | 'postgres' | 'sqlite';
  tables: TableSpec[];
}

export interface TableSpec {
  name: string;
  columns: ColumnSpec[];
  relations?: RelationSpec[];
}

export interface ColumnSpec {
  name: string;
  type: string;
  nullable: boolean;
  primary?: boolean;
  unique?: boolean;
  default?: string;
  references?: string;
}

export interface RelationSpec {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface AuthSpec {
  provider: 'supabase' | 'clerk' | 'nextauth';
  methods: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface GenerationResult {
  success: boolean;
  files: GeneratedFile[];
  previewUrl?: string;
  deployCommand?: string;
  error?: string;
}

const TEMPLATES = {
  nextjs: {
    name: 'Next.js 14 Full-Stack',
    description: 'React with App Router, API Routes, Server Actions',
    files: [
      { path: 'app/layout.tsx', template: 'nextjs-layout' },
      { path: 'app/page.tsx', template: 'nextjs-page' },
      { path: 'app/globals.css', template: 'tailwind' },
      { path: 'package.json', template: 'nextjs-package' },
      { path: 'tailwind.config.ts', template: 'tailwind-config' },
      { path: 'next.config.js', template: 'next-config' }
    ]
  },
  'react-vite': {
    name: 'React + Vite',
    description: 'React with Vite, TypeScript, Tailwind',
    files: [
      { path: 'src/App.tsx', template: 'react-app' },
      { path: 'src/main.tsx', template: 'react-main' },
      { path: 'src/index.css', template: 'tailwind' },
      { path: 'package.json', template: 'vite-package' },
      { path: 'vite.config.ts', template: 'vite-config' },
      { path: 'tailwind.config.js', template: 'tailwind-config' }
    ]
  },
  'supabase': {
    name: 'Supabase Full-Stack',
    description: 'Next.js + Supabase (Auth, DB, Storage)',
    files: [
      { path: 'lib/supabase.ts', template: 'supabase-client' },
      { path: 'app/login/page.tsx', template: 'supabase-login' },
      { path: 'middleware.ts', template: 'supabase-middleware' }
    ]
  }
};

class FullstackGenerator {
  private static instance: FullstackGenerator;
  private isGenerating: boolean = false;

  private constructor() {}

  public static getInstance(): FullstackGenerator {
    if (!FullstackGenerator.instance) {
      FullstackGenerator.instance = new FullstackGenerator();
    }
    return FullstackGenerator.instance;
  }

  // ========== Main Generation ==========

  async generate(spec: AppSpec): Promise<GenerationResult> {
    if (this.isGenerating) {
      return { success: false, files: [], error: 'Generation already in progress' };
    }

    this.isGenerating = true;
    const files: GeneratedFile[] = [];

    try {
      // Generate frontend
      const frontendFiles = await this.generateFrontend(spec);
      files.push(...frontendFiles);

      // Generate backend if specified
      if (spec.backend) {
        const backendFiles = await this.generateBackend(spec);
        files.push(...backendFiles);
      }

      // Generate database schema if specified
      if (spec.database) {
        const dbFiles = await this.generateDatabase(spec);
        files.push(...dbFiles);
      }

      // Generate auth if specified
      if (spec.auth) {
        const authFiles = await this.generateAuth(spec);
        files.push(...authFiles);
      }

      // Generate package.json and configs
      const configFiles = await this.generateConfigs(spec);
      files.push(...configFiles);

      this.isGenerating = false;
      
      return {
        success: true,
        files,
        deployCommand: this.getDeployCommand(spec)
      };

    } catch (error) {
      this.isGenerating = false;
      return {
        success: false,
        files,
        error: error instanceof Error ? error.message : 'Generation failed'
      };
    }
  }

  // ========== Smart Generation with AI ==========

  async generateFromPrompt(prompt: string): Promise<GenerationResult> {
    const analysisPrompt = `Analyze this request and generate a complete app specification in JSON format.
    
Request: "${prompt}"

Generate a JSON object with:
{
  "name": "app-name",
  "description": "2-3 sentence description",
  "frontend": {
    "framework": "nextjs" | "react-vite" | "astro",
    "styling": "tailwind",
    "features": ["list of features"],
    "pages": ["list of pages"]
  },
  "database": {
    "provider": "supabase",
    "tables": [{"name": "table", "columns": [...]}]
  },
  "auth": {
    "provider": "supabase",
    "methods": ["email", "oauth"]
  }
}

Only respond with valid JSON, no explanation.`;

    try {
      const response = await aiOrchestrator.generate({
        prompt: analysisPrompt,
        system: 'You are a JSON generator. Always output valid JSON.',
        maxTokens: 2000
      });

      const spec = JSON.parse(response.content) as AppSpec;
      return this.generate(spec);

    } catch (error) {
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : 'AI analysis failed'
      };
    }
  }

  // ========== Template Rendering ==========

  private async generateFrontend(spec: AppSpec): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const framework = spec.frontend.framework;

    switch (framework) {
      case 'nextjs':
        files.push(...this.generateNextJS(spec));
        break;
      case 'react-vite':
        files.push(...this.generateReactVite(spec));
        break;
      default:
        files.push(...this.generateNextJS(spec));
    }

    return files;
  }

  private generateNextJS(spec: AppSpec): GeneratedFile[] {
    const name = spec.name.toLowerCase().replace(/\s+/g, '-');
    
    return [
      {
        path: `${name}/app/layout.tsx`,
        content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${spec.name}',
  description: '${spec.description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`,
        language: 'typescript'
      },
      {
        path: `${name}/app/page.tsx`,
        content: `export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">${spec.name}</h1>
      <p className="text-lg text-gray-600">${spec.description}</p>
      
      <div className="mt-8 grid gap-4 md:grid-cols-${spec.frontend.features.length}">
        ${spec.frontend.features.map(f => `
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold">${f}</h2>
        </div>`).join('')}
      </div>
    </main>
  )
}`,
        language: 'typescript'
      },
      {
        path: `${name}/app/globals.css`,
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(to bottom, transparent, rgb(var(--background-end-rgb)))
    rgb(var(--background-start-rgb));
}`,
        language: 'css'
      },
      {
        path: `${name}/package.json`,
        content: JSON.stringify({
          name,
          version: '0.1.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint'
          },
          dependencies: {
            next: '^14.0.0',
            react: '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@types/node': '^20.0.0',
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            autoprefixer: '^10.0.0',
            postcss: '^8.0.0',
            tailwindcss: '^3.4.0',
            typescript: '^5.0.0'
          }
        }, null, 2),
        language: 'json'
      },
      {
        path: `${name}/tailwind.config.ts`,
        content: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config`,
        language: 'typescript'
      },
      {
        path: `${name}/next.config.js`,
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig`,
        language: 'javascript'
      },
      {
        path: `${name}/tsconfig.json`,
        content: JSON.stringify({
          compilerOptions: {
            lib: ['dom', 'dom.iterable', 'esnext'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [{ name: 'next' }],
            paths: { '@/*': ['./*'] }
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules']
        }, null, 2),
        language: 'json'
      }
    ];
  }

  private generateReactVite(spec: AppSpec): GeneratedFile[] {
    const name = spec.name.toLowerCase().replace(/\s+/g, '-');
    
    return [
      {
        path: `${name}/src/App.tsx`,
        content: `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">${spec.name}</h1>
      <p className="text-lg text-gray-600 mb-8">${spec.description}</p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg"
        >
          Count: {count}
        </button>
      </div>
    </div>
  )
}`,
        language: 'typescript'
      },
      {
        path: `${name}/src/main.tsx`,
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        language: 'typescript'
      },
      {
        path: `${name}/src/index.css`,
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}`,
        language: 'css'
      },
      {
        path: `${name}/package.json`,
        content: JSON.stringify({
          name,
          private: true,
          version: '0.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'tsc && vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.0.0',
            autoprefixer: '^10.0.0',
            postcss: '^8.0.0',
            tailwindcss: '^3.4.0',
            typescript: '^5.0.0',
            vite: '^5.0.0'
          }
        }, null, 2),
        language: 'json'
      },
      {
        path: `${name}/vite.config.ts`,
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
        language: 'typescript'
      },
      {
        path: `${name}/index.html`,
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
        language: 'html'
      }
    ];
  }

  private async generateBackend(spec: AppSpec): Promise<GeneratedFile[]> {
    const name = spec.name.toLowerCase().replace(/\s+/g, '-');
    const files: GeneratedFile[] = [];

    if (spec.backend?.runtime === 'node') {
      files.push(
        {
          path: `${name}/app/api/health/route.ts`,
          content: `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() })
}`,
          language: 'typescript'
        },
        {
          path: `${name}/app/api/[...route]/route.ts`,
          content: `import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const data = { message: 'API endpoint' }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ received: body })
}`,
          language: 'typescript'
        }
      );
    }

    return files;
  }

  private async generateDatabase(spec: AppSpec): Promise<GeneratedFile[]> {
    if (!spec.database) return [];

    const tables = spec.database.tables.map(table => ({
      name: table.name,
      sql: this.generateTableSQL(table)
    }));

    return [
      {
        path: `${spec.name.toLowerCase().replace(/\s+/g, '-')}/supabase/schema.sql`,
        content: tables.map(t => t.sql).join('\n\n'),
        language: 'sql'
      }
    ];
  }

  private generateTableSQL(table: TableSpec): string {
    const columns = table.columns.map(col => {
      let sql = `  ${col.name} ${col.type}`;
      if (col.primary) sql += ' PRIMARY KEY';
      if (!col.nullable) sql += ' NOT NULL';
      if (col.unique) sql += ' UNIQUE';
      if (col.default) sql += ` DEFAULT ${col.default}`;
      return sql;
    }).join(',\n');

    return `CREATE TABLE ${table.name} (\n${columns}\n);`;
  }

  private async generateAuth(spec: AppSpec): Promise<GeneratedFile[]> {
    if (!spec.auth) return [];

    const files: GeneratedFile[] = [];

    if (spec.auth.provider === 'supabase') {
      files.push(
        {
          path: `${spec.name.toLowerCase().replace(/\s+/g, '-')}/lib/supabase.ts`,
          content: `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)`,
          language: 'typescript'
        }
      );
    }

    return files;
  }

  private async generateConfigs(spec: AppSpec): Promise<GeneratedFile[]> {
    return [
      {
        path: `${spec.name.toLowerCase().replace(/\s+/g, '-')}/.gitignore`,
        content: `node_modules
.next
out
.env
.env.local
.DS_Store
*.log`,
        language: 'gitignore'
      },
      {
        path: `${spec.name.toLowerCase().replace(/\s+/g, '-')}/.env.example`,
        content: `# Copy to .env.local and fill in values
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`,
        language: 'bash'
      },
      {
        path: `${spec.name.toLowerCase().replace(/\s+/g, '-')}/README.md`,
        content: `# ${spec.name}

${spec.description}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

${spec.frontend.features.map(f => `- ${f}`).join('\n')}

## Deployment

\`\`\`bash
npm run build
\`\`\`
Then deploy to Vercel or Netlify.`,
        language: 'markdown'
      }
    ];
  }

  private getDeployCommand(spec: AppSpec): string {
    if (spec.frontend.framework === 'nextjs') {
      return 'npx vercel deploy --prod';
    }
    return 'npx netlify deploy --prod';
  }

  // ========== Get Available Templates ==========

  getTemplates() {
    return TEMPLATES;
  }
}

export const fullstackGenerator = FullstackGenerator.getInstance();
export default fullstackGenerator;