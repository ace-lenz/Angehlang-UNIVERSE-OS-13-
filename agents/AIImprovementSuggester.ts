import { sovereignVault, SovereignVault } from '../storage/SovereignVault';
import { ChangeLogger } from './ChangeLogger';

interface ImprovementSuggestion {
  id: string;
  timestamp: number;
  component: string;
  issueType: 'error' | 'performance' | 'missing_feature' | 'technical_debt';
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  systemRelevance: number;
  suggestedAction: string;
  planItemId?: string;
}

export class AIImprovementSuggester {
  private vault: SovereignVault;
  private changeLogger: ChangeLogger;
  private static instance: AIImprovementSuggester;

  private constructor() {
    this.vault = sovereignVault;
    this.changeLogger = ChangeLogger.getInstance();
  }

  static getInstance(): AIImprovementSuggester {
    if (!AIImprovementSuggester.instance) {
      AIImprovementSuggester.instance = new AIImprovementSuggester();
    }
    return AIImprovementSuggester.instance;
  }

  async analyzeErrorTrends(): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];
    const errorRegistry = (await this.vault.get('error_registry')) as any || this.getDefaultErrorRegistry();

    for (const error of errorRegistry.activeErrors || []) {
      if (error.status === 'Open') {
        suggestions.push({
          id: `SUG-${Date.now().toString(36).toUpperCase()}`,
          timestamp: Date.now(),
          component: error.file,
          issueType: 'error',
          description: error.description,
          priority: error.priority === 'High' ? 'high' : 'medium',
          estimatedImpact: error.systemRelevance * 10,
          systemRelevance: error.systemRelevance,
          suggestedAction: `Fix via Plan Item: ${error.id}. Assign to ${error.assignedAgent}`,
          planItemId: error.id,
        });
      }
    }

    return suggestions.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
  }

  async analyzePerformanceBottlenecks(): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];
    const perfIssues = [
      { file: 'src/agents/AdaptiveBridge.ts', lines: 89357, issue: 'File too large, split into modules' },
      { file: 'src/agents/A2ASystem.ts', lines: 29504, issue: 'File too large, modularize' },
      { file: 'src/engine/InferenceEngine.ts', lines: 4107, issue: 'Consider breaking into smaller engines' },
    ];

    for (const issue of perfIssues) {
      suggestions.push({
        id: `PERF-${Date.now().toString(36).toUpperCase()}`,
        timestamp: Date.now(),
        component: issue.file,
        issueType: 'performance',
        description: `${issue.issue} (${issue.lines} lines)`,
        priority: 'medium',
        estimatedImpact: 70,
        systemRelevance: 8,
        suggestedAction: `Refactor into smaller modules. Create sub-agents/modules for each responsibility.`,
      });
    }

    return suggestions;
  }

  async generateSystemImprovementPlan(): Promise<{
    critical: ImprovementSuggestion[];
    high: ImprovementSuggestion[];
    medium: ImprovementSuggestion[];
    low: ImprovementSuggestion[];
  }> {
    const allSuggestions = [
      ...await this.analyzeErrorTrends(),
      ...await this.analyzePerformanceBottlenecks(),
      ...this.getMissingFeatureSuggestions(),
    ];

    return {
      critical: allSuggestions.filter(s => s.priority === 'high' && s.systemRelevance >= 9),
      high: allSuggestions.filter(s => s.priority === 'high' && s.systemRelevance < 9),
      medium: allSuggestions.filter(s => s.priority === 'medium'),
      low: allSuggestions.filter(s => s.priority === 'low'),
    };
  }

  private getMissingFeatureSuggestions(): ImprovementSuggestion[] {
    return [
      {
        id: 'FEAT-001',
        timestamp: Date.now(),
        component: 'CodeStudio',
        issueType: 'missing_feature',
        description: 'Syntax highlighting engine missing',
        priority: 'high',
        estimatedImpact: 85,
        systemRelevance: 9,
        suggestedAction: 'Integrate Monaco Editor or CodeMirror with TypeScript LSP support',
        planItemId: 'TI-1',
      },
      {
        id: 'FEAT-002',
        timestamp: Date.now(),
        component: 'AudioStudio',
        issueType: 'missing_feature',
        description: 'MIDI support missing for MusicProductionStudio',
        priority: 'medium',
        estimatedImpact: 75,
        systemRelevance: 8,
        suggestedAction: 'Integrate Web MIDI API with Tone.js for MIDI sequencer',
        planItemId: 'TII-3',
      },
    ];
  }

  private getDefaultErrorRegistry() {
    return {
      activeErrors: [
        { id: 'ERR-001', file: 'src/engine/ErrorPrevention.ts', priority: 'High', systemRelevance: 8 },
        { id: 'ERR-005', file: 'src/agents/PerfectionistAgent.ts', priority: 'High', systemRelevance: 10 },
      ],
    };
  }

  async persistSuggestions(suggestions: ImprovementSuggestion[]): Promise<void> {
    await this.vault.set('improvement_suggestions', suggestions);
  }
}
