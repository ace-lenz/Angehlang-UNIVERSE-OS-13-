/**
 * ThreeDAutomation.ts - Automation for 3D Studio
 * 
 * Features:
 * - Audio-to-3D neural triggers
 * - Environment generation from presets
 * - Material synthesis
 * - Animation automation
 */

import { automationAgentCore } from '@/agents/AutomationAgent';
import { LatticeWorkflow, NeuralPulseTrigger, GoalInput } from '@/features/automation/types/sovereign-types';
import { sovereignDiffusionHub } from '@/engine/diffusion/SovereignDiffusionHub';
import { DiffusionRequest, DiffusionMode } from '@/engine/diffusion/DiffusionTypes';

export interface ThreeDScene {
  id: string;
  name: string;
  nodes: ThreeDNode[];
  environment: string;
  lighting: string;
  camera: CameraConfig;
}

export interface ThreeDNode {
  id: string;
  type: 'mesh' | 'light' | 'camera' | 'group';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  material?: MaterialConfig;
  children?: ThreeDNode[];
}

export interface MaterialConfig {
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  opacity?: number;
}

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface ThreeDGenerationResult {
  success: boolean;
  scene: ThreeDScene;
  generationTime: number;
  style?: string;
}

export type EnvironmentPreset = 'nebula' | 'void' | 'studio' | 'sunset' | 'cyberpunk' | 'quantum' | 'aurora';

// ===================== THREE D AUTOMATION ENGINE =====================

export class ThreeDAutomationEngine {
  private scenes: Map<string, ThreeDScene> = new Map();
  private generationHistory: ThreeDGenerationResult[] = [];
  private environmentPresets: Record<EnvironmentPreset, any> = {
    nebula: {
      background: '#0a0015',
      fog: { color: '#1a0030', near: 10, far: 100 },
      lights: [
        { type: 'point', color: '#ff00ff', intensity: 2, position: [10, 10, 10] },
        { type: 'point', color: '#00ffff', intensity: 1.5, position: [-10, 5, -10] },
      ],
    },
    void: {
      background: '#000000',
      fog: { color: '#000000', near: 50, far: 200 },
      lights: [
        { type: 'ambient', color: '#111111', intensity: 0.5 },
      ],
    },
    studio: {
      background: '#1a1a1a',
      fog: null,
      lights: [
        { type: 'directional', color: '#ffffff', intensity: 1, position: [5, 10, 5] },
        { type: 'ambient', color: '#404040', intensity: 0.5 },
      ],
    },
    sunset: {
      background: '#ff6b35',
      fog: { color: '#ff8c42', near: 20, far: 80 },
      lights: [
        { type: 'directional', color: '#ff7b00', intensity: 1.5, position: [-5, 3, 10] },
        { type: 'point', color: '#ff4500', intensity: 1, position: [0, 5, 0] },
      ],
    },
    cyberpunk: {
      background: '#0d0d1a',
      fog: { color: '#1a0a2e', near: 15, far: 60 },
      lights: [
        { type: 'point', color: '#ff00ff', intensity: 3, position: [5, 3, 5] },
        { type: 'point', color: '#00ffff', intensity: 2, position: [-5, 3, -5] },
        { type: 'ambient', color: '#1a0a2e', intensity: 0.3 },
      ],
    },
    quantum: {
      background: '#050510',
      fog: { color: '#0a0a20', near: 10, far: 50 },
      lights: [
        { type: 'point', color: '#8b5cf6', intensity: 4, position: [0, 10, 0] },
        { type: 'point', color: '#06b6d4', intensity: 2, position: [8, 2, 8] },
        { type: 'point', color: '#a855f7', intensity: 2, position: [-8, 2, -8] },
        { type: 'ambient', color: '#1a1a3a', intensity: 0.2 },
      ],
    },
    aurora: {
      background: '#001a1a',
      fog: { color: '#003030', near: 20, far: 80 },
      lights: [
        { type: 'point', color: '#00ff88', intensity: 2, position: [10, 15, 0] },
        { type: 'point', color: '#00ffff', intensity: 1.5, position: [-10, 10, 5] },
        { type: 'ambient', color: '#002222', intensity: 0.4 },
      ],
    },
  };

  constructor() {
    this.registerNeuralTriggers();
    console.log('[ThreeDAutomation] Engine initialized');
  }

  // ===================== DIFFUSION-BASED 3D GENERATION =====================

  async generateWithDiffusion(prompt: string, config?: {
    complexity?: 'simple' | 'medium' | 'complex';
    style?: string;
  }): Promise<ThreeDGenerationResult> {
    const startTime = Date.now();
    const sceneId = `scene_diff_${Date.now()}`;

    console.log('[ThreeDAutomation] Generating 3D with diffusion:', prompt.substring(0, 50));

    try {
      const complexity = config?.complexity || 'medium';
      const nodeCount = complexity === 'complex' ? 20 : (complexity === 'medium' ? 10 : 5);

      const diffusionRequest: DiffusionRequest = {
        prompt: `Create a 3D scene: ${prompt}`,
        mode: 'spatial' as DiffusionMode,
        steps: complexity === 'complex' ? 40 : (complexity === 'medium' ? 25 : 15),
        seed: Math.floor(Math.random() * 1000000),
        guidance: 7.5,
        strength: 0.8,
        dimensions: { width: 0, height: 0, depth: nodeCount }
      };

      const diffusionResult = await sovereignDiffusionHub.diffuse(diffusionRequest);

      const nodes: ThreeDNode[] = this.parseDiffusionOutput(diffusionResult.description, nodeCount);
      
      const scene: ThreeDScene = {
        id: sceneId,
        name: prompt.substring(0, 30),
        nodes,
        environment: (config?.style as EnvironmentPreset) || 'quantum',
        lighting: 'pbr',
        camera: { position: [0, 5, 10], target: [0, 0, 0], fov: 60 }
      };

      this.scenes.set(sceneId, scene);

      const result: ThreeDGenerationResult = {
        success: true,
        scene,
        generationTime: Date.now() - startTime,
        style: config?.style || 'quantum'
      };

      this.generationHistory.unshift(result);
      if (this.generationHistory.length > 50) {
        this.generationHistory.pop();
      }

      console.log(`[ThreeDAutomation] Diffusion 3D generated in ${result.generationTime}ms`);
      return result;

    } catch (error) {
      console.error('[ThreeDAutomation] Diffusion generation failed, falling back to procedural:', error);
      return this.generateFromGoal({ text: prompt, priority: 'medium' });
    }
  }

  private parseDiffusionOutput(description: string, nodeCount: number): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 5;
      
      nodes.push({
        id: `node_${i}`,
        type: 'mesh',
        position: [
          Math.cos(angle) * radius,
          Math.random() * 5,
          Math.sin(angle) * radius
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: [1 + Math.random(), 1 + Math.random(), 1 + Math.random()],
        material: {
          color: '#8b5cf6',
          metalness: 0.8,
          roughness: 0.2,
          emissive: '#06b6d4'
        }
      });
    }

    return nodes;
  }

  async generateSceneFromTextWithDiffusion(text: string, style?: string): Promise<ThreeDGenerationResult> {
    return this.generateWithDiffusion(text, { complexity: 'medium', style });
  }

  // ===================== SCENE MANAGEMENT =====================

  createScene(config: Partial<ThreeDScene>): ThreeDScene {
    const scene: ThreeDScene = {
      id: `scene_${Date.now()}`,
      name: config.name || 'New Scene',
      nodes: config.nodes || [],
      environment: config.environment || 'studio',
      lighting: config.lighting || 'pbr',
      camera: config.camera || {
        position: [0, 5, 10],
        target: [0, 0, 0],
        fov: 60,
      },
    };

    this.scenes.set(scene.id, scene);
    return scene;
  }

  getScene(id: string): ThreeDScene | undefined {
    return this.scenes.get(id);
  }

  getAllScenes(): ThreeDScene[] {
    return Array.from(this.scenes.values());
  }

  updateScene(id: string, updates: Partial<ThreeDScene>): ThreeDScene | undefined {
    const scene = this.scenes.get(id);
    if (scene) {
      const updated = { ...scene, ...updates };
      this.scenes.set(id, updated);
      return updated;
    }
    return undefined;
  }

  deleteScene(id: string): void {
    this.scenes.delete(id);
  }

  // ===================== ENVIRONMENT GENERATION =====================

  generateEnvironment(preset: EnvironmentPreset): any {
    return this.environmentPresets[preset] || this.environmentPresets.studio;
  }

  setEnvironment(sceneId: string, preset: EnvironmentPreset): void {
    const scene = this.scenes.get(sceneId);
    if (scene) {
      scene.environment = preset;
      this.scenes.set(sceneId, scene);
    }
  }

  // ===================== AUDIO-TO-3D GENERATION =====================

  async generateFromAudio(audioData: {
    waveform?: number[];
    frequency?: number[];
    duration?: number;
    preset?: string;
  }): Promise<ThreeDGenerationResult> {
    const startTime = Date.now();

    console.log('[ThreeDAutomation] Generating 3D from audio data...');

    // Map audio characteristics to 3D elements
    const nodes: ThreeDNode[] = [];

    // Generate nodes based on audio data
    if (audioData.waveform) {
      const waveNodes = this.generateWaveformNodes(audioData.waveform);
      nodes.push(...waveNodes);
    }

    if (audioData.frequency) {
      const freqNodes = this.generateFrequencyNodes(audioData.frequency);
      nodes.push(...freqNodes);
    }

    // Determine environment based on preset
    let environment: EnvironmentPreset = 'studio';
    if (audioData.preset) {
      if (audioData.preset.toLowerCase().includes('quantum')) {
        environment = 'quantum';
      } else if (audioData.preset.toLowerCase().includes('cyber')) {
        environment = 'cyberpunk';
      } else if (audioData.preset.toLowerCase().includes('neon')) {
        environment = 'aurora';
      } else if (audioData.preset.toLowerCase().includes('dark') || audioData.preset.toLowerCase().includes('ambient')) {
        environment = 'void';
      }
    }

    const scene = this.createScene({
      name: `Audio Scene ${Date.now()}`,
      nodes,
      environment,
      lighting: 'pbr',
    });

    const result: ThreeDGenerationResult = {
      success: true,
      scene,
      generationTime: Date.now() - startTime,
      style: audioData.preset,
    };

    this.generationHistory.unshift(result);
    if (this.generationHistory.length > 50) {
      this.generationHistory.pop();
    }

    return result;
  }

  private generateWaveformNodes(waveform: number[]): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    const samples = Math.min(waveform.length, 50);
    const step = Math.floor(waveform.length / samples);

    for (let i = 0; i < samples; i++) {
      const value = Math.abs(waveform[i * step] || 0);
      const height = value * 5 + 0.5;

      nodes.push({
        id: `wave_${i}`,
        type: 'mesh',
        position: [(i - samples / 2) * 0.5, height / 2, 0],
        scale: [0.3, height, 0.3],
        material: {
          color: `hsl(${260 + value * 60}, 70%, ${50 + value * 20}%)`,
          metalness: 0.8,
          roughness: 0.2,
          emissive: `hsl(${260 + value * 60}, 70%, ${30 + value * 20}%)`,
          opacity: 0.9,
        },
      });
    }

    return nodes;
  }

  private generateFrequencyNodes(frequencies: number[]): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    const bands = Math.min(frequencies.length, 8);
    const step = Math.floor(frequencies.length / bands);

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

    for (let i = 0; i < bands; i++) {
      const freq = frequencies[i * step] || 0;
      const normalizedFreq = Math.min(freq / 255, 1);
      const scale = normalizedFreq * 3 + 0.5;

      const angle = (i / bands) * Math.PI * 2;
      const radius = 5;

      nodes.push({
        id: `freq_${i}`,
        type: 'mesh',
        position: [
          Math.cos(angle) * radius,
          scale / 2,
          Math.sin(angle) * radius,
        ],
        scale: [scale, scale, scale],
        material: {
          color: colors[i % colors.length],
          metalness: 0.9,
          roughness: 0.1,
          emissive: colors[i % colors.length],
          opacity: 0.8,
        },
      });
    }

    return nodes;
  }

  // ===================== AI GENERATION =====================

  async generateFromGoal(goal: GoalInput): Promise<ThreeDGenerationResult> {
    const startTime = Date.now();

    console.log('[ThreeDAutomation] Generating from goal:', goal.text);

    // Parse the goal to determine what to generate
    const lowerGoal = goal.text.toLowerCase();

    let nodes: ThreeDNode[] = [];
    let environment: EnvironmentPreset = 'studio';

    // Parse environment
    if (lowerGoal.includes('cyber') || lowerGoal.includes('neon')) {
      environment = 'cyberpunk';
      nodes = this.generateCyberpunkScene();
    } else if (lowerGoal.includes('quantum') || lowerGoal.includes('future')) {
      environment = 'quantum';
      nodes = this.generateQuantumScene();
    } else if (lowerGoal.includes('nature') || lowerGoal.includes('forest') || lowerGoal.includes('aurora')) {
      environment = 'aurora';
      nodes = this.generateAuroraScene();
    } else if (lowerGoal.includes('sunset') || lowerGoal.includes('evening')) {
      environment = 'sunset';
      nodes = this.generateSunsetScene();
    } else if (lowerGoal.includes('space') || lowerGoal.includes('void') || lowerGoal.includes('dark')) {
      environment = 'void';
      nodes = this.generateVoidScene();
    } else {
      // Default to studio with some interesting elements
      nodes = this.generateAbstractScene();
    }

    const scene = this.createScene({
      name: this.extractSceneName(goal.text),
      nodes,
      environment,
      lighting: 'pbr',
    });

    const result: ThreeDGenerationResult = {
      success: true,
      scene,
      generationTime: Date.now() - startTime,
    };

    this.generationHistory.unshift(result);

    return result;
  }

  private generateCyberpunkScene(): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    
    // Neon pillars
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const color = i % 2 === 0 ? '#ff00ff' : '#00ffff';
      nodes.push({
        id: `neon_pillar_${i}`,
        type: 'mesh',
        position: [Math.cos(angle) * 8, 3, Math.sin(angle) * 8],
        scale: [0.5, 6, 0.5],
        material: {
          color,
          metalness: 0.9,
          roughness: 0.1,
          emissive: color,
          opacity: 0.9,
        },
      });
    }

    return nodes;
  }

  private generateQuantumScene(): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    
    // Floating quantum orbs
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const height = Math.sin(i * 0.5) * 3 + 2;
      const color = ['#8b5cf6', '#06b6d4', '#a855f7'][i % 3];
      
      nodes.push({
        id: `quantum_orb_${i}`,
        type: 'mesh',
        position: [
          Math.cos(angle) * (3 + i * 0.3),
          height,
          Math.sin(angle) * (3 + i * 0.3),
        ],
        scale: [0.8, 0.8, 0.8],
        material: {
          color,
          metalness: 1,
          roughness: 0,
          emissive: color,
          opacity: 0.7,
        },
      });
    }

    // Central core
    nodes.push({
      id: 'quantum_core',
      type: 'mesh',
      position: [0, 3, 0],
      scale: [1.5, 1.5, 1.5],
      material: {
        color: '#ffffff',
        metalness: 1,
        roughness: 0,
        emissive: '#8b5cf6',
        opacity: 0.9,
      },
    });

    return nodes;
  }

  private generateAuroraScene(): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    
    // Aurora ribbons
    for (let i = 0; i < 5; i++) {
      nodes.push({
        id: `aurora_ribbon_${i}`,
        type: 'mesh',
        position: [(i - 2) * 3, 4 + i * 0.5, -5],
        scale: [1.5, 8, 0.2],
        material: {
          color: i % 2 === 0 ? '#00ff88' : '#00ffff',
          metalness: 0.3,
          roughness: 0.5,
          emissive: i % 2 === 0 ? '#00ff88' : '#00ffff',
          opacity: 0.6,
        },
      });
    }

    return nodes;
  }

  private generateSunsetScene(): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    
    // Gradient spheres
    for (let i = 0; i < 6; i++) {
      nodes.push({
        id: `sunset_sphere_${i}`,
        type: 'mesh',
        position: [(i - 2.5) * 2, 2 + Math.abs(i - 2.5) * 0.5, 0],
        scale: [1, 1, 1],
        material: {
          color: `hsl(${30 + i * 15}, 80%, ${60 - i * 5}%)`,
          metalness: 0.5,
          roughness: 0.3,
          emissive: `hsl(${30 + i * 15}, 80%, ${40 - i * 5}%)`,
          opacity: 0.9,
        },
      });
    }

    return nodes;
  }

  private generateVoidScene(): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    
    // Distant stars
    for (let i = 0; i < 30; i++) {
      nodes.push({
        id: `void_star_${i}`,
        type: 'mesh',
        position: [
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          -20 - Math.random() * 30,
        ],
        scale: [0.1, 0.1, 0.1],
        material: {
          color: '#ffffff',
          metalness: 1,
          roughness: 0,
          emissive: '#ffffff',
          opacity: 0.8,
        },
      });
    }

    return nodes;
  }

  private generateAbstractScene(): ThreeDNode[] {
    const nodes: ThreeDNode[] = [];
    
    for (let i = 0; i < 10; i++) {
      nodes.push({
        id: `abstract_${i}`,
        type: 'mesh',
        position: [
          (Math.random() - 0.5) * 10,
          Math.random() * 5 + 1,
          (Math.random() - 0.5) * 10,
        ],
        scale: [0.5 + Math.random(), 0.5 + Math.random(), 0.5 + Math.random()],
        material: {
          color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          metalness: 0.7,
          roughness: 0.3,
          opacity: 0.8,
        },
      });
    }

    return nodes;
  }

  private extractSceneName(goal: string): string {
    const words = goal.split(' ').slice(0, 3).join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1) + ' Scene';
  }

  // ===================== NEURAL TRIGGERS =====================

  registerNeuralTriggers(): void {
    const triggers: NeuralPulseTrigger[] = [
      {
        id: 'trigger_audio_3d_quantum',
        name: 'Audio Quantum Trigger',
        eventType: 'audio-detected',
        sourceStudio: 'MusicStudio',
        conditions: [
          { field: 'preset', operator: 'equals', value: 'quantum' },
        ],
        actions: [
          { targetNode: '', inputMapping: { preset: 'quantum' }, delay: 0 },
        ],
        enabled: true,
      },
      {
        id: 'trigger_audio_3d_cyberpunk',
        name: 'Audio Cyberpunk Trigger',
        eventType: 'audio-detected',
        sourceStudio: 'MusicStudio',
        conditions: [
          { field: 'preset', operator: 'contains', value: 'cyber' },
        ],
        actions: [
          { targetNode: '', inputMapping: { preset: 'cyberpunk' }, delay: 0 },
        ],
        enabled: true,
      },
      {
        id: 'trigger_audio_3d_ambient',
        name: 'Audio Ambient Trigger',
        eventType: 'audio-detected',
        sourceStudio: 'MusicStudio',
        conditions: [
          { field: 'preset', operator: 'contains', value: 'ambient' },
        ],
        actions: [
          { targetNode: '', inputMapping: { preset: 'void' }, delay: 0 },
        ],
        enabled: true,
      },
      {
        id: 'trigger_text_3d',
        name: 'Text to 3D Trigger',
        eventType: 'text-analyzed',
        sourceStudio: 'TextStudio',
        conditions: [
          { field: 'sentiment', operator: 'equals', value: 'positive' },
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

    console.log('[ThreeDAutomation] Neural triggers registered');
  }

  async fireTrigger(eventType: string, sourceStudio: string, data: Record<string, any>): Promise<void> {
    console.log(`[ThreeDAutomation] Trigger fired: ${eventType} from ${sourceStudio}`);
    
    if (sourceStudio === 'MusicStudio') {
      // Generate 3D from audio data
      await this.generateFromAudio({
        waveform: data.waveform,
        frequency: data.frequency,
        duration: data.duration,
        preset: data.preset,
      });
    }
  }

  // ===================== EXPORT/IMPORT =====================

  exportScene(sceneId: string): string {
    const scene = this.scenes.get(sceneId);
    if (!scene) return '{}';
    return JSON.stringify(scene, null, 2);
  }

  importScene(json: string): ThreeDScene | null {
    try {
      const scene = JSON.parse(json) as ThreeDScene;
      this.scenes.set(scene.id, scene);
      return scene;
    } catch {
      return null;
    }
  }

  // ===================== STATISTICS =====================

  getStats(): { totalScenes: number; totalGenerations: number; avgGenerationTime: number } {
    const totalGenerations = this.generationHistory.length;
    const avgGenerationTime = totalGenerations > 0
      ? this.generationHistory.reduce((acc, r) => acc + r.generationTime, 0) / totalGenerations
      : 0;

    return {
      totalScenes: this.scenes.size,
      totalGenerations,
      avgGenerationTime,
    };
  }
}

// ===================== SINGLETON =====================

export const threeDAutomation = new ThreeDAutomationEngine();

export default threeDAutomation;