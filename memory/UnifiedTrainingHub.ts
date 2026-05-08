/**
 * UnifiedTrainingHub.ts — v1.0
 * 
 * Combines offline and online training for continuous AI self-improvement.
 * Manages both local synthetic training and web-based learning with
 * seamless mode switching based on connectivity.
 */

import { evolutionCore, AgentEvolutionState, SynapticWeights } from './EvolutionEngine';
import { godPromptTrainer, TrainingSample, StudioType } from './GodPromptSelfTrainer';
import { onlineTrainer } from './OnlineTrainer';
import { GOD_PROMPT, getCondensedPrompt } from './GodPrompt';
import { missionEngine } from '../engine/MissionEngine';
import { artifactStore } from '../storage/ArtifactStore';

export type TrainingMode = 'offline' | 'online' | 'hybrid';

export interface TrainingCycleResult {
  mode: TrainingMode;
  offlineSamples: number;
  onlineInsights: number;
  qualityImprovement: number;
  newCapabilities: string[];
  timestamp: number;
}

export interface UnifiedTrainingConfig {
  mode: TrainingMode;
  autoTrainEnabled: boolean;
  offlineInterval: number;
  onlineInterval: number;
  hybridSyncThreshold: number;
  minQualityThreshold: number;
}

const STORAGE_KEY = 'unified_training_config';
const CYCLE_HISTORY_KEY = 'training_cycle_history';

type TrainingCallback = (message: string, type: 'info' | 'success' | 'warning') => void;

class UnifiedTrainingHub {
  private config: UnifiedTrainingConfig;
  private cycleHistory: TrainingCycleResult[] = [];
  private isRunning = false;
  private currentMode: TrainingMode = 'offline';
  private offlineTimer: NodeJS.Timeout | null = null;
  private onlineTimer: NodeJS.Timeout | null = null;
  private lastQualityScore = 0;
  private onProgress: TrainingCallback | null = null;

  private syntheticPrompts: { prompt: string; studio: StudioType }[] = [
    { prompt: 'write a recursive fibonacci function in TypeScript', studio: 'code' },
    { prompt: 'explain how neural networks learn from data', studio: 'research' },
    { prompt: 'create a REST API endpoint with authentication', studio: 'code' },
    { prompt: 'calculate prime numbers up to 1000', studio: 'code' },
    { prompt: 'design a 3D procedural terrain algorithm', studio: '3d' },
    { prompt: 'generate ambient music with 120 BPM', studio: 'audio' },
    { prompt: 'explain quantum computing superposition', studio: 'research' },
    { prompt: 'create particle animation effect', studio: 'video' },
    { prompt: 'write a database query builder class', studio: 'code' },
    { prompt: 'design an automation workflow pipeline', studio: 'automation' },
    { prompt: 'create generative art algorithm', studio: 'image' },
    { prompt: 'explain transformer architecture', studio: 'research' },
    { prompt: 'write a sorting algorithm implementation', studio: 'code' },
    { prompt: 'create procedural city generation', studio: '3d' },
    { prompt: 'explain backpropagation in deep learning', studio: 'research' }
  ];

  constructor() {
    this.config = {
      mode: 'hybrid',
      autoTrainEnabled: true,
      offlineInterval: 60000,
      onlineInterval: 300000,
      hybridSyncThreshold: 0.7,
      minQualityThreshold: 0.65
    };
    this.loadConfig();
    this.loadHistory();
    // Lazy start - only triggered on demand
    // this.startUnifiedTraining();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[UnifiedTraining] Config load failed');
    }
  }

  private saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  }

  private loadHistory() {
    try {
      const saved = localStorage.getItem(CYCLE_HISTORY_KEY);
      if (saved) {
        this.cycleHistory = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[UnifiedTraining] History load failed');
    }
  }

  private saveHistory() {
    localStorage.setItem(CYCLE_HISTORY_KEY, JSON.stringify(this.cycleHistory.slice(-50)));
  }

  private startUnifiedTraining() {
    if (!this.config.autoTrainEnabled) return;

    const runCycle = async () => {
      if (this.isRunning) return;
      
      const isOnline = navigator.onLine;
      this.currentMode = isOnline ? 'hybrid' : 'offline';

      await this.runTrainingCycle();

      const nextInterval = isOnline ? this.config.onlineInterval : this.config.offlineInterval;
      setTimeout(runCycle, nextInterval);
    };

    setTimeout(runCycle, 5000);
  }

  async runTrainingCycle(): Promise<TrainingCycleResult> {
    this.isRunning = true;
    console.log(`[UnifiedTraining] Starting ${this.currentMode} training cycle...`);
    this.onProgress?.(`Starting ${this.currentMode} training cycle...`, 'info');

    const startTime = Date.now();
    let offlineSamples = 0;
    let onlineInsights = 0;
    let qualityImprovement = 0;
    const newCapabilities: string[] = [];

    const prevQuality = godPromptTrainer.getAverageQuality();

    if (this.currentMode === 'offline' || this.currentMode === 'hybrid') {
      offlineSamples = await this.runOfflineTraining();
      this.onProgress?.(`Generated ${offlineSamples} offline samples`, 'info');
    }

    if (this.currentMode === 'hybrid' && navigator.onLine) {
      const onlineResult = await onlineTrainer.trainOnline();
      onlineInsights = onlineResult.insights;
      this.onProgress?.(`Learned ${onlineInsights} online insights`, 'info');
      
      if (onlineResult.quality > this.config.hybridSyncThreshold) {
        this.syncOnlineToOffline(onlineResult.quality);
      }
    }

    const trainResult = await godPromptTrainer.train();
    newCapabilities.push(...trainResult.newCapabilities);
    this.onProgress?.(`Training complete: ${trainResult.newCapabilities.length} new capabilities`, 'success');

    const newQuality = godPromptTrainer.getAverageQuality();
    qualityImprovement = newQuality - prevQuality;

    this.lastQualityScore = newQuality;
    this.updateEvolutionEngine(newQuality);

    const result: TrainingCycleResult = {
      mode: this.currentMode,
      offlineSamples,
      onlineInsights,
      qualityImprovement,
      newCapabilities,
      timestamp: Date.now()
    };

    this.cycleHistory.push(result);
    this.saveHistory();

    console.log(`[UnifiedTraining] Cycle complete in ${Date.now() - startTime}ms | Quality: ${(newQuality * 100).toFixed(1)}%`);
    this.onProgress?.(`Cycle complete in ${Date.now() - startTime}ms | Quality: ${(newQuality * 100).toFixed(1)}%`, 'success');

    this.isRunning = false;
    return result;
  }

  private async runOfflineTraining(): Promise<number> {
    const samplesGenerated = Math.floor(Math.random() * 3) + 2;
    let count = 0;

    for (let i = 0; i < samplesGenerated; i++) {
      const sample = this.syntheticPrompts[Math.floor(Math.random() * this.syntheticPrompts.length)];
      
      const response = this.generateSyntheticResponse(sample.prompt, sample.studio);
      const quality = this.evaluateSyntheticQuality(response, sample.studio);

      godPromptTrainer.recordInteraction(
        sample.prompt,
        response,
        quality,
        sample.studio
      );

      count++;
    }

    return count;
  }

  private generateSyntheticResponse(prompt: string, studio: StudioType): string {
    const templates: Record<StudioType, string[]> = {
      code: [
        `Here's the implementation:\n\n\`\`\`typescript\n// ${prompt}\nfunction process() {\n  return { success: true, data: [] };\n}\n\`\`\`\n\nThis solution uses modern async patterns.`,
        `Code solution for: ${prompt}\n\n\`\`\`typescript\nclass Handler {\n  execute(input: any) {\n    return input;\n  }\n}\n\`\`\``,
      ],
      research: [
        `${prompt} involves several key concepts:\n\n1. **Foundation**: Understanding the basics\n2. **Implementation**: Practical application\n3. **Optimization**: Performance considerations\n\nThis topic connects to broader AI systems.`,
        `Research findings on: ${prompt}\n\n- Key insight: Machine learning principles apply\n- Practical use: Automation and optimization\n- Future direction: Continuous improvement`,
      ],
      '3d': [
        `3D Generation: ${prompt}\n\nCreating procedural geometry with:\n- Vertex manipulation\n- Material systems\n- Lighting integration\n\nResult: High-fidelity mesh output.`,
      ],
      audio: [
        `Audio synthesis: ${prompt}\n\nGenerated using:\n- Waveform synthesis\n- Frequency modulation\n- Spatial audio mapping\n\nOutput: Procedural audio track.`,
      ],
      video: [
        `Video generation: ${prompt}\n\nCanvas-based rendering with:\n- Particle physics\n- Frame interpolation\n- Post-processing effects\n\nResult: 60fps animation loop.`,
      ],
      image: [
        `Image synthesis: ${prompt}\n\nSVG/CSS procedural generation:\n- Geometric patterns\n- Color theory application\n- Artistic composition\n\nOutput: Abstract visual artwork.`,
      ],
      automation: [
        `Automation workflow: ${prompt}\n\nPipeline stages:\n1. Input validation\n2. Processing logic\n3. Output generation\n4. Error handling\n\nOptimized for zero-latency execution.`,
      ],
      book: [
        `Content generation: ${prompt}\n\nStructure:\n- Introduction\n- Core concepts\n- Examples\n- Conclusion\n\nFormatted for readability.`,
      ],
      general: [
        `Response to: ${prompt}\n\nAnalyzed and synthesized with:\n- Context awareness\n- Quality scoring\n- Multi-modal support\n\nReady for deployment.`,
      ]
    };

    const options = templates[studio] || templates.general;
    return options[Math.floor(Math.random() * options.length)];
  }

  private evaluateSyntheticQuality(response: string, studio: StudioType): number {
    let score = 0.5;

    if (response.length > 100) score += 0.1;
    if (response.length > 500) score += 0.1;
    
    if (response.includes('```')) score += 0.15;
    if (/\d+\.\s+\w+/.test(response)) score += 0.05;
    if (/- \w+/.test(response)) score += 0.05;
    
    const keywords = ['implementation', 'function', 'class', 'algorithm', 'process'];
    if (keywords.some(k => response.toLowerCase().includes(k))) score += 0.1;

    return Math.min(1, score);
  }

  private syncOnlineToOffline(onlineQuality: number) {
    const insights = onlineTrainer.getInsights();
    const topInsights = insights.slice(-10);

    for (const insight of topInsights) {
      if (insight.quality >= this.config.minQualityThreshold) {
        const prompt = `Learn: ${insight.topic}`;
        const response = `## ${insight.topic}\n\n${insight.content}\n\n*Source: ${insight.source}*`;
        
        godPromptTrainer.recordInteraction(
          prompt,
          response,
          insight.quality * 0.8,
          'general'
        );
      }
    }
  }

  private updateEvolutionEngine(quality: number) {
    const agents = ['Architect', 'Compiler', 'Reviewer', 'VisionModel', 'QuantumCore'];
    
    for (const agentId of agents) {
      const state = evolutionCore.getOrCreateAgentState(agentId);
      
      const qualityBoost = quality > this.config.minQualityThreshold ? 0.01 : 0.005;
      state.synapses.context = Math.min(1.0, state.synapses.context + qualityBoost);
      state.synapses.accuracy = Math.min(1.0, state.synapses.accuracy + qualityBoost * 0.5);
      state.synapses.creativity = Math.min(1.0, state.synapses.creativity + qualityBoost * 0.3);
      
      state.totalEpochs += 1;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      currentMode: this.currentMode,
      isOnline: navigator.onLine,
      config: this.config,
      lastQuality: this.lastQualityScore,
      cycleCount: this.cycleHistory.length,
      recentCycles: this.cycleHistory.slice(-5)
    };
  }

  getStats() {
    const godStats = godPromptTrainer.getStats();
    const onlineStats = onlineTrainer.getStats();
    
    return {
      godPrompt: {
        samples: godStats.totalSamples,
        quality: godStats.averageQuality,
        cycles: godStats.trainingCycles,
        studioBreakdown: godStats.studioBreakdown
      },
      online: {
        insights: onlineStats.totalInsights,
        topics: onlineStats.topicsCovered,
        lastTraining: onlineStats.lastTraining
      },
      unified: {
        totalCycles: this.cycleHistory.length,
        currentMode: this.currentMode,
        isOnline: navigator.onLine,
        avgImprovement: this.cycleHistory.length > 0 
          ? this.cycleHistory.reduce((a, b) => a + b.qualityImprovement, 0) / this.cycleHistory.length 
          : 0
      }
    };
  }

  updateConfig(updates: Partial<UnifiedTrainingConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  setMode(mode: TrainingMode) {
    this.config.mode = mode;
    this.currentMode = mode;
    this.saveConfig();
  }

  setProgressCallback(callback: TrainingCallback) {
    this.onProgress = callback;
  }

  async triggerManualCycle(): Promise<TrainingCycleResult> {
    return this.runTrainingCycle();
  }

  async getGodPrompt(): Promise<string> {
    if (this.currentMode === 'offline') {
      return getCondensedPrompt('research');
    }
    return await onlineTrainer.enhanceGodPrompt();
  }
}

export const unifiedTrainingHub = new UnifiedTrainingHub();
export default unifiedTrainingHub;