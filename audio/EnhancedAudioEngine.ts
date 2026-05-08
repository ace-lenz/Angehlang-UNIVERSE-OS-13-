import { audioInputHandler } from '@/engine/AudioInputHandler';
import { genreDetector } from '@/engine/GenreDetector';
import { lyricGenerator } from '@/engine/LyricGenerator';
import { audioAnalyzer } from '@/engine/AudioAnalyzer';
import { audioExporter } from '@/engine/AudioExporter';
import { audioValidation } from '@/engine/AudioValidation';
import { GenerativeAudioEngine } from './GenerativeAudioEngine';
import { GenreConfig } from './audio-types';

export class EnhancedAudioEngine {
  private audioCtx: AudioContext;

  constructor() {
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async processSmartInput(input: string) {
    const env = audioValidation.validateEnvironment();
    if (!env.supported) throw new Error(`Browser missing: ${env.missing.join(', ')}`);

    const { detected, enhanced, config } = await genreDetector.detectAndEnhance(input);
    return { detected, enhanced, config };
  }

  async generateLyricsAndChords(prompt: string, genre: string) {
    const lyrics = await lyricGenerator.generateLyrics(prompt);
    const chords = await lyricGenerator.suggestChords(lyrics.text, genre);
    return { lyrics, chords };
  }

  async exportProject(buffer: AudioBuffer, format: 'wav' | 'mp3' | 'ogg') {
    if (format === 'wav') {
      const blob = await audioExporter.bufferToWav(buffer);
      audioExporter.downloadBlob(blob, `project_${Date.now()}.wav`);
    } else {
      // Future implementation for other formats using a worker-based encoder
      console.warn(`Format ${format} not yet implemented, falling back to WAV`);
      const blob = await audioExporter.bufferToWav(buffer);
      audioExporter.downloadBlob(blob, `project_${Date.now()}.wav`);
    }
  }

  async analyzeBuffer(buffer: AudioBuffer) {
    const bpm = await audioAnalyzer.detectBpm(buffer);
    const key = await audioAnalyzer.detectKey(buffer);
    return { bpm, key };
  }
}

export const enhancedAudioEngine = new EnhancedAudioEngine();
