import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

interface DependencyInfo {
  name: string;
  version: string;
  type: 'production' | 'development';
  required: boolean;
  usedInRegistry: boolean;
}

export class DepChecker {
  private static instance: DepChecker;

  private constructor() {}

  static getInstance(): DepChecker {
    if (!DepChecker.instance) {
      DepChecker.instance = new DepChecker();
    }
    return DepChecker.instance;
  }

  async verifyDependencies(): Promise<{
    valid: boolean;
    production: DependencyInfo[];
    development: DependencyInfo[];
    missing: string[];
    extraneous: string[];
  }> {
    const packageJsonPath = join(PROJECT_ROOT, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    const prodDeps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    const registry = await this.loadRegistry();

    const production: DependencyInfo[] = Object.entries(prodDeps).map(([name, version]) => ({
      name,
      version: version as string,
      type: 'production' as const,
      required: this.isRequired(name, registry),
      usedInRegistry: this.isInRegistry(name, registry),
    }));

    const development: DependencyInfo[] = Object.entries(devDeps).map(([name, version]) => ({
      name,
      version: version as string,
      type: 'development' as const,
      required: this.isRequired(name, registry),
      usedInRegistry: this.isInRegistry(name, registry),
    }));

    const missing = registry.productionDeps?.filter((dep: string) => !prodDeps[dep]) || [];
    const extraneous = Object.keys(prodDeps).filter(dep => 
      registry.productionDeps && !registry.productionDeps.includes(dep)
    );

    return {
      valid: missing.length === 0,
      production,
      development,
      missing,
      extraneous,
    };
  }

  async generateRecreationSteps(): Promise<string[]> {
    const result = await this.verifyDependencies();
    const steps: string[] = [];

    steps.push('npm init -y');
    if (result.production.length > 0) {
      const prodDeps = result.production.map(d => `${d.name}@${d.version}`).join(' ');
      steps.push(`npm install ${prodDeps}`);
    }
    if (result.development.length > 0) {
      const devDeps = result.development.map(d => `${d.name}@${d.version}`).join(' ');
      steps.push(`npm install -D ${devDeps}`);
    }
    if (result.missing.length > 0) {
      steps.push(`# Missing dependencies to add manually: ${result.missing.join(', ')}`);
    }

    return steps;
  }

  private async loadRegistry(): Promise<any> {
    try {
      const registryPath = join(PROJECT_ROOT, 'PLANS', '.secure', 'systems-registry.json');
      const fs = await import('fs');
      if (fs.existsSync(registryPath)) {
        return JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      }
    } catch (e) {
      console.warn('[DepChecker] Registry not found, using defaults');
    }
    return {
      productionDeps: [
        'tone', '@ai-sdk/deepseek', '@types/three', 'clsx', 'dotenv', 'express',
        'idb-keyval', 'lucide-react', 'motion', 'react', 'react-dom', 'react-markdown',
        'tailwind-merge', 'three',
      ],
    };
  }

  private isRequired(name: string, registry: any): boolean {
    const required = registry.productionDeps || [];
    return required.includes(name);
  }

  private isInRegistry(name: string, registry: any): boolean {
    const allDeps = [
      ...(registry.productionDeps || []),
      ...(registry.developmentDeps || []),
    ];
    return allDeps.includes(name);
  }
}
