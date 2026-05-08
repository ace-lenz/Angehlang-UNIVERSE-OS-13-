/**
 * AudioAutomation.ts - AI synthesis and automation for AudioStudio
 * 
 * Features:
 * - Text-to-audio AI generation
 * - Preset-based audio synthesis
 * - Neural triggers for cross-studio automation
 * - Audio analysis for 3D visualization
 */

import { automationAgentCore } from '@/agents/AutomationAgent';
import { threeDAutomation } from '@/features/threed/ThreeDAutomation';
import { LatticeWorkflow, NeuralPulseTrigger, GoalInput } from '@/features/automation/types/sovereign-types';

export interface AudioGenerationConfig {
  type: 'synth' | 'ambient' | 'loop' | 'effect' | 'full';
  preset?: string;
  bpm?: number;
  duration?: number;
  genre?: string;
  style?: string;
  complexity?: number;
}

export interface AudioGenerationResult {
  success: boolean;
  audioData?: AudioBuffer | Float32Array;
  waveform?: number[];
  frequency?: number[];
  duration: number;
  preset?: string;
  metadata?: Record<string, any>;
}

export interface AudioAnalysisResult {
  waveform: number[];
  frequency: number[];
  duration: number;
  bpm?: number;
  key?: string;
  energy: number;
  spectralCentroid: number;
}

export type AudioPreset = 'ambient' | 'synthwave' | 'lo-fi' | 'quantum' | 'cyberpunk' | 'nature' | 'electronic' | 'organic';

// ===================== AUDIO AUTOMATION ENGINE =====================

export class AudioAutomationEngine {
  private generationHistory: AudioGenerationResult[] = [];
  private analysisCache: Map<string, AudioAnalysisResult> = new Map();
  private isInitialized = false;

  // Preset configurations
  private presets: Record<AudioPreset, any> = {
    ambient: {
      oscillators: [
        { type: 'sine', frequency: 220, gain: 0.1 },
        { type: 'sine', frequency: 330, gain: 0.08 },
      ],
      filter: { type: 'lowpass', frequency: 800, Q: 1 },
      reverb: { decay: 5, wet: 0.6 },
      effects: ['reverb', 'chorus'],
    },
    synthwave: {
      oscillators: [
        { type: 'sawtooth', frequency: 110, gain: 0.3 },
        { type: 'square', frequency: 220, gain: 0.15 },
      ],
      filter: { type: 'lowpass', frequency: 2000, Q: 5 },
      delay: { time: 0.25, feedback: 0.4 },
      effects: ['delay', 'distortion'],
    },
    'lo-fi': {
      oscillators: [
        { type: 'triangle', frequency: 440, gain: 0.2 },
      ],
      filter: { type: 'lowpass', frequency: 1200, Q: 2 },
      bitDepth: 8,
      effects: ['bitcrusher', 'vibrato'],
    },
    quantum: {
      oscillators: [
        { type: 'sine', frequency: 55, gain: 0.2 },
        { type: 'sine', frequency: 110, gain: 0.15 },
        { type: 'sine', frequency: 165, gain: 0.1 },
      ],
      filter: { type: 'bandpass', frequency: 440, Q: 10 },
      reverb: { decay: 8, wet: 0.8 },
      effects: ['reverb', 'phaser', 'tremolo'],
    },
    cyberpunk: {
      oscillators: [
        { type: 'sawtooth', frequency: 55, gain: 0.25 },
        { type: 'square', frequency: 110, gain: 0.2 },
        { type: 'sawtooth', frequency: 220, gain: 0.1 },
      ],
      filter: { type: 'lowpass', frequency: 3000, Q: 8 },
      distortion: { amount: 0.5 },
      effects: ['distortion', 'delay', 'filter'],
    },
    nature: {
      oscillators: [
        { type: 'sine', frequency: 80, gain: 0.15 },
        { type: 'sine', frequency: 160, gain: 0.1 },
        { type: 'sine', frequency: 320, gain: 0.05 },
      ],
      filter: { type: 'highpass', frequency: 100, Q: 0.5 },
      reverb: { decay: 4, wet: 0.5 },
      effects: ['reverb', 'delay'],
    },
    electronic: {
      oscillators: [
        { type: 'square', frequency: 220, gain: 0.2 },
        { type: 'sawtooth', frequency: 440, gain: 0.15 },
      ],
      filter: { type: 'lowpass', frequency: 2500, Q: 4 },
      effects: ['filter', 'distortion', 'compressor'],
    },
    organic: {
      oscillators: [
        { type: 'triangle', frequency: 180, gain: 0.15 },
        { type: 'sine', frequency: 360, gain: 0.1 },
      ],
      filter: { type: 'lowpass', frequency: 600, Q: 2 },
      reverb: { decay: 3, wet: 0.4 },
      effects: ['reverb', 'chorus'],
    },
  };

  constructor() {
    this.registerNeuralTriggers();
    this.isInitialized = true;
    console.log('[AudioAutomation] Engine initialized');
  }

  // ===================== AUDIO GENERATION =====================

  async generateAudio(config: AudioGenerationConfig): Promise<AudioGenerationResult> {
    const startTime = Date.now();
    console.log('[AudioAutomation] Generating audio:', config.type, config.preset);

    const preset = (config.preset || 'ambient') as AudioPreset;
    const presetConfig = this.presets[preset] || this.presets.ambient;

    // Generate waveform data based on preset
    const duration = config.duration || 8;
    const sampleRate = 44100;
    const samples = duration * sampleRate;
    const waveform = this.generateWaveform(preset, duration, config);

    // Generate frequency data via FFT simulation
    const frequency = this.generateFrequencyData(waveform);

    const result: AudioGenerationResult = {
      success: true,
      waveform,
      frequency,
      duration,
      preset,
      metadata: {
        type: config.type,
        bpm: config.bpm || 120,
        genre: config.genre,
        complexity: config.complexity || 0.5,
        generatedAt: Date.now(),
      },
    };

    this.generationHistory.unshift(result);
    if (this.generationHistory.length > 50) {
      this.generationHistory.pop();
    }

    // Trigger 3D visualization if enabled
    if (config.preset) {
      await this.trigger3DGeneration(result);
    }

    console.log(`[AudioAutomation] Audio generated in ${Date.now() - startTime}ms`);

    return result;
  }

  private generateWaveform(preset: AudioPreset, duration: number, config: AudioGenerationConfig): number[] {
    const samples = Math.floor(duration * 44100);
    const waveform = new Float32Array(samples);
    const presetConfig = this.presets[preset];

    // Generate audio based on preset characteristics
    for (let i = 0; i < samples; i++) {
      const t = i / 44100;
      let sample = 0;

      switch (preset) {
        case 'ambient':
          sample = Math.sin(t * 220 * Math.PI * 2) * 0.1 +
                   Math.sin(t * 330 * Math.PI * 2) * 0.08 +
                   Math.sin(t * 440 * Math.PI * 2) * 0.05;
          break;

        case 'synthwave':
          const saw = ((t * 110) % 1) * 2 - 1;
          sample = saw * 0.3 + Math.sin(t * 220 * Math.PI * 2) * 0.15;
          break;

        case 'quantum':
          const phase = Math.sin(t * 55 * Math.PI * 2);
          sample = phase * 0.2 +
                   Math.sin(t * 110 * Math.PI * 2 + phase) * 0.15 +
                   Math.sin(t * 165 * Math.PI * 2) * 0.1;
          break;

        case 'cyberpunk':
          const square = Math.sign(Math.sin(t * 55 * Math.PI * 2));
          sample = square * 0.25 + Math.sin(t * 110 * Math.PI * 2) * 0.2;
          // Add some distortion
          sample = Math.tanh(sample * 2) * 0.5;
          break;

        case 'lo-fi':
          sample = Math.sin(t * 440 * Math.PI * 2) * 0.2;
          // Add noise for lo-fi effect
          sample += (Math.random() - 0.5) * 0.05;
          break;

        default:
          sample = Math.sin(t * 440 * Math.PI * 2) * 0.2;
      }

      // Apply envelope
      const envelope = Math.min(1, t * 2) * Math.min(1, (duration - t) * 2);
      waveform[i] = sample * envelope * 0.8;
    }

    return Array.from(waveform);
  }

  private generateFrequencyData(waveform: number[]): number[] {
    // Simplified frequency analysis (not real FFT)
    const frequencies = new Array(256).fill(0);
    const windowSize = Math.floor(waveform.length / 256);

    for (let i = 0; i < 256; i++) {
      let sum = 0;
      const start = i * windowSize;
      const end = start + windowSize;

      for (let j = start; j < end; j++) {
        sum += Math.abs(waveform[j] || 0);
      }

      frequencies[i] = Math.min(255, (sum / windowSize) * 255 * 10);
    }

    return frequencies;
  }

  // ===================== TEXT-TO-AUDIO =====================

  async generateFromText(text: string, style?: string): Promise<AudioGenerationResult> {
    console.log('[AudioAutomation] Generating from text:', text.substring(0, 50));

    // Analyze text to determine audio characteristics
    const analysis = this.analyzeText(text);

    // Determine preset based on analysis
    let preset: AudioPreset = 'ambient';
    if (style) {
      preset = this.mapStyleToPreset(style);
    } else if (analysis.sentiment === 'energetic' || analysis.sentiment === 'happy') {
      preset = 'synthwave';
    } else if (analysis.sentiment === 'dark' || analysis.sentiment === 'intense') {
      preset = 'cyberpunk';
    }

    return await this.generateAudio({
      type: 'full',
      preset,
      duration: Math.min(analysis.estimatedDuration, 30),
      complexity: analysis.complexity,
      genre: analysis.genre,
    });
  }

  private analyzeText(text: string): { sentiment: string; genre?: string; complexity: number; estimatedDuration: number } {
    const lower = text.toLowerCase();

    let sentiment = 'neutral';
    if (lower.includes('happy') || lower.includes('joy') || lower.includes('excited') || lower.includes('energetic')) {
      sentiment = 'energetic';
    } else if (lower.includes('sad') || lower.includes('dark') || lower.includes('melancholy')) {
      sentiment = 'dark';
    } else if (lower.includes('calm') || lower.includes('peace') || lower.includes('relax')) {
      sentiment = 'calm';
    }

    let genre: string | undefined;
    if (lower.includes('rock') || lower.includes('metal')) {
      genre = 'rock';
    } else if (lower.includes('jazz') || lower.includes('blues')) {
      genre = 'jazz';
    } else if (lower.includes('electronic') || lower.includes('techno')) {
      genre = 'electronic';
    }

    const complexity = lower.includes('complex') ? 0.8 : lower.includes('simple') ? 0.3 : 0.5;
    const estimatedDuration = Math.max(4, Math.min(30, text.split(' ').length / 5));

    return { sentiment, genre, complexity, estimatedDuration };
  }

  private mapStyleToPreset(style: string): AudioPreset {
    const lower = style.toLowerCase();
    
    if (lower.includes('quantum') || lower.includes('future')) return 'quantum';
    if (lower.includes('cyber') || lower.includes('neon')) return 'cyberpunk';
    if (lower.includes('lo-fi') || lower.includes('vintage')) return 'lo-fi';
    if (lower.includes('wave') || lower.includes('retro')) return 'synthwave';
    if (lower.includes('nature') || lower.includes('organic')) return 'organic';
    if (lower.includes('electronic')) return 'electronic';
    
    return 'ambient';
  }

  // ===================== AI GOAL-BASED GENERATION =====================

  async generateFromGoal(goal: GoalInput): Promise<AudioGenerationResult> {
    console.log('[AudioAutomation] Goal-based generation:', goal.text);

    // Parse the goal to determine audio requirements
    const parsedGoal = this.parseGoal(goal.text);

    return await this.generateAudio({
      type: parsedGoal.type,
      preset: parsedGoal.preset,
      duration: parsedGoal.duration,
      bpm: parsedGoal.bpm,
      style: parsedGoal.style,
      complexity: parsedGoal.complexity,
    });
  }

  private parseGoal(goal: string): {
    type: 'synth' | 'ambient' | 'loop' | 'effect' | 'full';
    preset?: string;
    duration?: number;
    bpm?: number;
    style?: string;
    complexity?: number;
  } {
    const lower = goal.toLowerCase();

    let type: 'synth' | 'ambient' | 'loop' | 'effect' | 'full' = 'full';
    if (lower.includes('loop') || lower.includes('beat')) type = 'loop';
    else if (lower.includes('ambient') || lower.includes('background')) type = 'ambient';
    else if (lower.includes('effect') || lower.includes('sound')) type = 'effect';
    else if (lower.includes('synth') || lower.includes('tone')) type = 'synth';

    let preset = 'ambient';
    if (lower.includes('quantum')) preset = 'quantum';
    else if (lower.includes('cyber')) preset = 'cyberpunk';
    else if (lower.includes('lo-fi') || lower.includes('vintage')) preset = 'lo-fi';
    else if (lower.includes('synthwave') || lower.includes('retro')) preset = 'synthwave';
    else if (lower.includes('nature') || lower.includes('organic')) preset = 'organic';

    let duration = 8;
    const durationMatch = lower.match(/(\d+)\s*(second|sec|minute|min)/);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      duration = durationMatch[2].startsWith('min') ? num * 60 : num;
    }

    let bpm: number | undefined;
    const bpmMatch = lower.match(/(\d+)\s*bpm/);
    if (bpmMatch) {
      bpm = parseInt(bpmMatch[1]);
    }

    const complexity = lower.includes('complex') ? 0.8 : lower.includes('simple') ? 0.3 : 0.5;

    return { type, preset, duration, bpm, style: preset, complexity };
  }

  // ===================== 3D VISUALIZATION TRIGGER =====================

  private async trigger3DGeneration(audioResult: AudioGenerationResult): Promise<void> {
    console.log('[AudioAutomation] Triggering 3D generation from audio...');

    try {
      await threeDAutomation.generateFromAudio({
        waveform: audioResult.waveform,
        frequency: audioResult.frequency,
        duration: audioResult.duration,
        preset: audioResult.preset,
      });
      console.log('[AudioAutomation] 3D visualization triggered successfully');
    } catch (e) {
      console.error('[AudioAutomation] Failed to trigger 3D:', e);
    }
  }

  // ===================== AUDIO ANALYSIS =====================

  analyzeAudio(waveform: number[]): AudioAnalysisResult {
    // Simple audio analysis
    let energy = 0;
    let centroidSum = 0;
    let weightedSum = 0;

    for (let i = 0; i < waveform.length; i++) {
      const value = Math.abs(waveform[i]);
      energy += value * value;
      
      centroidSum += value;
      weightedSum += value * i;
    }

    const spectralCentroid = centroidSum > 0 ? weightedSum / centroidSum : 0;
    const duration = waveform.length / 44100;

    return {
      waveform: waveform.slice(0, 1000),
      frequency: this.generateFrequencyData(waveform),
      duration,
      energy: Math.sqrt(energy / waveform.length),
      spectralCentroid: spectralCentroid / waveform.length,
    };
  }

  // ===================== NEURAL TRIGGERS =====================

  registerNeuralTriggers(): void {
    const triggers: NeuralPulseTrigger[] = [
      {
        id: 'trigger_audio_to_3d',
        name: 'Audio to 3D Trigger',
        eventType: 'audio-detected',
        sourceStudio: 'MusicStudio',
        conditions: [],
        actions: [
          { targetNode: '', inputMapping: {}, delay: 0 },
        ],
        enabled: true,
      },
      {
        id: 'trigger_text_to_audio',
        name: 'Text to Audio Trigger',
        eventType: 'text-analyzed',
        sourceStudio: 'TextStudio',
        conditions: [
          { field: 'sentiment', operator: 'equals', value: 'neutral' },
        ],
        actions: [
          { targetNode: '', inputMapping: {}, delay: 0 },
        ],
        enabled: true,
      },
      {
        id: 'trigger_code_audio',
        name: 'Code to Audio Trigger',
        eventType: 'code-completed',
        sourceStudio: 'CodeStudio',
        conditions: [
          { field: 'action', operator: 'equals', value: 'generate-sound' },
        ],
        actions: [
          { targetNode: '', inputMapping: {}, delay: 0 },
        ],
        enabled: true,
      },
    ];

    triggers.forEach(trigger => {
      automationAgentCore.registerNeuralTrigger(trigger);
    });

    console.log('[AudioAutomation] Neural triggers registered');
  }

  async fireTrigger(eventType: string, sourceStudio: string, data: Record<string, any>): Promise<void> {
    console.log(`[AudioAutomation] Trigger fired: ${eventType} from ${sourceStudio}`);

    if (sourceStudio === 'TextStudio') {
      // Generate audio from text
      await this.generateFromText(data.text || '', data.style);
    }

    // Always trigger 3D generation if audio was generated
    if (data.waveform || data.frequency) {
      await this.trigger3DGeneration({
        success: true,
        waveform: data.waveform,
        frequency: data.frequency,
        duration: data.duration || 8,
        preset: data.preset,
      });
    }
  }

  // ===================== PRESET MANAGEMENT =====================

  getPresets(): AudioPreset[] {
    return Object.keys(this.presets) as AudioPreset[];
  }

  getPresetConfig(preset: AudioPreset): any {
    return this.presets[preset];
  }

  customPreset(name: string, config: any): void {
    this.presets[name as AudioPreset] = config;
    console.log('[AudioAutomation] Custom preset added:', name);
  }

  // ===================== STATISTICS =====================

  getStats(): { totalGenerated: number; avgDuration: number; presetUsage: Record<string, number> } {
    const totalGenerated = this.generationHistory.length;
    const avgDuration = totalGenerated > 0
      ? this.generationHistory.reduce((acc, r) => acc + r.duration, 0) / totalGenerated
      : 0;

    const presetUsage: Record<string, number> = {};
    this.generationHistory.forEach(r => {
      const preset = r.preset || 'unknown';
      presetUsage[preset] = (presetUsage[preset] || 0) + 1;
    });

    return { totalGenerated, avgDuration, presetUsage };
  }
}

// ===================== SINGLETON =====================

export const audioAutomation = new AudioAutomationEngine();

export default audioAutomation;