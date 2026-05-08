/**
 * OnlineTrainer.ts — v1.0
 * 
 * Connects Angehlang to online AI services for continuous self-training.
 * Uses web search, API integrations, and external knowledge to enhance
 * the God Prompt and improve system capabilities.
 */

import { webSearch, SearchResult } from '@/tools/WebSearch';
import { godPromptTrainer, TrainingSample } from './GodPromptSelfTrainer';
import { GOD_PROMPT } from './GodPrompt';
import { evolutionCore } from './EvolutionEngine';

export interface OnlineTrainingConfig {
  enabled: boolean;
  autoFetchInterval: number;
  qualityThreshold: number;
  maxSourcesPerCycle: number;
}

interface LearnedInsight {
  topic: string;
  content: string;
  source: string;
  quality: number;
  timestamp: number;
}

const TRAINING_CONFIG_KEY = 'online_trainer_config';
const INSIGHTS_STORAGE_KEY = 'online_learned_insights';

class OnlineTrainer {
  private config: OnlineTrainingConfig;
  private learnedInsights: LearnedInsight[] = [];
  private isTraining = false;
  private lastTrainingCycle = 0;
  private trainingTopics: string[] = [
    'machine learning best practices',
    'code optimization techniques',
    'natural language processing',
    'system design patterns',
    'ai safety guidelines',
    'prompt engineering',
    'autonomous systems',
    'continuous learning algorithms'
  ];

  constructor() {
    this.config = {
      enabled: true,
      autoFetchInterval: 300000,
      qualityThreshold: 0.7,
      maxSourcesPerCycle: 5
    };
    this.loadConfig();
    this.loadInsights();
    // Lazy start
    // this.startAutoTraining();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem(TRAINING_CONFIG_KEY);
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[OnlineTrainer] Config load failed, using defaults');
    }
  }

  private saveConfig() {
    localStorage.setItem(TRAINING_CONFIG_KEY, JSON.stringify(this.config));
  }

  private loadInsights() {
    try {
      const saved = localStorage.getItem(INSIGHTS_STORAGE_KEY);
      if (saved) {
        this.learnedInsights = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[OnlineTrainer] Insights load failed');
    }
  }

  private saveInsights() {
    localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(this.learnedInsights.slice(-100)));
  }

  async trainOnline(): Promise<{ insights: number; quality: number }> {
    if (this.isTraining || !this.config.enabled) {
      return { insights: 0, quality: 0 };
    }

    this.isTraining = true;
    console.log('[OnlineTrainer] 🌐 Starting online training cycle...');

    let totalInsights = 0;
    let totalQuality = 0;

    for (const topic of this.trainingTopics.slice(0, this.config.maxSourcesPerCycle)) {
      try {
        const results = await webSearch.search(`${topic} AI system best practices`, 3);
        
        for (const result of results.results) {
          if (result.source === 'live') {
            const insight = this.extractInsight(topic, result);
            if (insight && insight.quality >= this.config.qualityThreshold) {
              this.learnedInsights.push(insight);
              totalInsights++;
              totalQuality += insight.quality;
              
              this.recordAsTrainingSample(insight);
            }
          }
        }
      } catch (err) {
        console.warn(`[OnlineTrainer] Failed to fetch ${topic}:`, err);
      }
    }

    this.saveInsights();
    this.lastTrainingCycle = Date.now();

    const avgQuality = totalInsights > 0 ? totalQuality / totalInsights : 0;
    this.updateEvolutionFromOnline(avgQuality);

    console.log(`[OnlineTrainer] ✅ Online training complete. ${totalInsights} insights learned.`);

    this.isTraining = false;
    return { insights: totalInsights, quality: avgQuality };
  }

  private extractInsight(topic: string, result: SearchResult): LearnedInsight | null {
    const quality = this.evaluateSourceQuality(result);
    
    if (quality < this.config.qualityThreshold) {
      return null;
    }

    return {
      topic,
      content: result.snippet.slice(0, 500),
      source: result.url,
      quality,
      timestamp: Date.now()
    };
  }

  private evaluateSourceQuality(result: SearchResult): number {
    let score = 0.5;

    if (result.contentLength && result.contentLength > 500) score += 0.1;
    if (result.source === 'live') score += 0.2;
    
    const snippet = result.snippet.toLowerCase();
    const qualityIndicators = ['best practices', 'guidelines', 'documentation', 'tutorial', 'guide'];
    if (qualityIndicators.some(i => snippet.includes(i))) score += 0.1;
    
    const lowQuality = ['spam', 'ads', 'clickbait', 'undefined'];
    if (!lowQuality.some(l => snippet.includes(l))) score += 0.1;

    return Math.min(1, score);
  }

  private recordAsTrainingSample(insight: LearnedInsight) {
    const prompt = `Learn about ${insight.topic}: ${insight.content.slice(0, 100)}`;
    const response = this.synthesizeFromInsight(insight);
    
    godPromptTrainer.recordInteraction(prompt, response, insight.quality);
  }

  private synthesizeFromInsight(insight: LearnedInsight): string {
    return `## Learned from Online Training: ${insight.topic}

**Source:** ${insight.source}

**Key Insight:**
${insight.content}

**Quality Score:** ${(insight.quality * 100).toFixed(0)}%

*This insight was acquired from online sources and integrated into the system's knowledge base.*`;
  }

  private updateEvolutionFromOnline(avgQuality: number) {
    const agents = ['Architect', 'Compiler', 'Reviewer', 'VisionModel', 'QuantumCore'];
    
    for (const agentId of agents) {
      const state = evolutionCore.getOrCreateAgentState(agentId);
      
      state.synapses.context = Math.min(1.0, state.synapses.context + (avgQuality * 0.01));
      state.synapses.accuracy = Math.min(1.0, state.synapses.accuracy + (avgQuality * 0.005));
      
      state.onlineTrainingCycles = (state.onlineTrainingCycles || 0) + 1;
    }
  }

  private startAutoTraining() {
    if (!this.config.enabled) return;

    setInterval(() => {
      if (navigator.onLine) {
        this.trainOnline();
      }
    }, this.config.autoFetchInterval);
  }

  async fetchAndLearn(query: string): Promise<LearnedInsight[]> {
    const results = await webSearch.search(query, 5);
    const insights: LearnedInsight[] = [];

    for (const result of results.results) {
      if (result.source === 'live') {
        const insight = this.extractInsight(query, result);
        if (insight) {
          insights.push(insight);
          this.learnedInsights.push(insight);
          this.recordAsTrainingSample(insight);
        }
      }
    }

    this.saveInsights();
    return insights;
  }

  getInsights(): LearnedInsight[] {
    return this.learnedInsights;
  }

  getStats() {
    return {
      totalInsights: this.learnedInsights.length,
      lastTraining: this.lastTrainingCycle,
      isTraining: this.isTraining,
      config: this.config,
      topicsCovered: [...new Set(this.learnedInsights.map(i => i.topic))].length
    };
  }

  updateConfig(updates: Partial<OnlineTrainingConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  toggle(enabled: boolean) {
    this.config.enabled = enabled;
    this.saveConfig();
    
    if (enabled) {
      // Lazy start
    // this.startAutoTraining();
    }
  }

  async enhanceGodPrompt(): Promise<string> {
    const insights = this.learnedInsights
      .sort((a, b) => b.quality - a.quality)
      .slice(0, 10);

    if (insights.length === 0) {
      return GOD_PROMPT;
    }

    const enhancements: string[] = [];
    
    for (const insight of insights) {
      enhancements.push(`
─── LEARNED ENHANCEMENT: ${insight.topic.toUpperCase()} ───
Source: ${insight.source}
Insight: ${insight.content.slice(0, 200)}...
`);
    }

    return GOD_PROMPT + '\n\n' + enhancements.join('\n');
  }

  clearInsights(): void {
    this.learnedInsights = [];
    this.saveInsights();
    console.log('[OnlineTrainer] 🗑️ Learned insights cleared');
  }
}

export const onlineTrainer = new OnlineTrainer();
export default onlineTrainer;