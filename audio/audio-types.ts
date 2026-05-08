import { AudioLayer } from '@/types';

export type GenrePreset = 'ambient' | 'synthwave' | 'lo-fi' | 'quantum' | 'country';

export interface GenreConfig {
  bpm: number;
  layers: Omit<AudioLayer, 'id'>[];
}

export const GENRE_PRESETS: Record<GenrePreset, GenreConfig> = {
  ambient: {
    bpm: 60,
    layers: [
      { name: 'Drone Bass', frequency: 55, type: 'sine', gain: 0.4, active: true, color: '#6366f1' },
      { name: 'Pad Mid', frequency: 220, type: 'sine', gain: 0.2, active: true, color: '#8b5cf6' },
      { name: 'Shimmer Hi', frequency: 880, type: 'triangle', gain: 0.1, active: true, color: '#a78bfa' },
    ],
  },
  synthwave: {
    bpm: 120,
    layers: [
      { name: 'Bass Synth', frequency: 110, type: 'sawtooth', gain: 0.3, active: true, color: '#f43f5e' },
      { name: 'Lead Synth', frequency: 440, type: 'square', gain: 0.2, active: true, color: '#fb923c' },
      { name: 'Arpeggio', frequency: 660, type: 'sawtooth', gain: 0.15, active: true, color: '#fbbf24' },
    ],
  },
  'lo-fi': {
    bpm: 80,
    layers: [
      { name: 'Warm Bass', frequency: 80, type: 'triangle', gain: 0.35, active: true, color: '#10b981' },
      { name: 'Piano Tone', frequency: 330, type: 'sine', gain: 0.18, active: true, color: '#34d399' },
      { name: 'Vinyl Noise', frequency: 2000, type: 'sine', gain: 0.05, active: true, color: '#6ee7b7' },
    ],
  },
  quantum: {
    bpm: 93,
    layers: [
      { name: 'Quantum Sub', frequency: 41.2, type: 'sine', gain: 0.5, active: true, color: '#06b6d4' },
      { name: 'Phase Osc', frequency: 528, type: 'sawtooth', gain: 0.2, active: true, color: '#22d3ee' },
      { name: 'Neural Glitch', frequency: 1174, type: 'square', gain: 0.08, active: true, color: '#67e8f9' },
    ],
  },
  country: {
    bpm: 75,
    layers: [
        { name: 'Acoustic Bass', frequency: 82.41, type: 'sine', gain: 0.4, active: true, color: '#d97706' },
        { name: 'Steel Guitar', frequency: 329.63, type: 'triangle', gain: 0.25, active: true, color: '#f59e0b' },
        { name: 'Fiddle Texture', frequency: 659.25, type: 'sawtooth', gain: 0.15, active: true, color: '#fbbf24' },
    ],
  },
};
