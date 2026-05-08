/**
 * ToneAudioEngine.ts - Real Browser Audio Synthesis
 * 
 * Uses Tone.js for professional-grade audio synthesis
 * Features:
 * - PolySynth for melodic instruments
 * - MembraneSynth for drums
 * - MetalSynth for percussion
 * - FMSynth/AMSynth for leads
 * - Professional effects chain
 * - Real-time parameter automation
 */

import * as Tone from 'tone';

export interface SynthConfig {
  type: 'polysynth' | 'fmsynth' | 'amsynth' | 'membrane' | 'metal' | 'sampler';
  oscillator?: 'sine' | 'triangle' | 'sawtooth' | 'square';
  harmonicity?: number;
  modulationIndex?: number;
  envelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
}

export interface EffectConfig {
  type: 'reverb' | 'delay' | 'chorus' | 'distortion' | 'phaser' | 'compressor' | 'eq' | 'filter';
  wet?: number;
  decay?: number;
  delayTime?: number;
  feedback?: number;
  frequency?: number;
  depth?: number;
  threshold?: number;
  ratio?: number;
  attack?: number;
  release?: number;
}

export interface TransportConfig {
  bpm: number;
  timeSignature: number;
  noteLength: string;
}

export interface SequenceNote {
  time: string;
  note: string;
  duration?: string;
  velocity?: number;
}

export interface DrumPattern {
  name: string;
  pattern: SequenceNote[];
}

class ToneAudioEngine {
  private static instance: ToneAudioEngine;
  private isInitialized = false;
  private isPlaying = false;

  // Core synthesizers
  private melodySynth: Tone.PolySynth | Tone.FMSynth | Tone.AMSynth | null = null;
  private bassSynth: Tone.PolySynth | null = null;
  private drumSynth: Tone.MembraneSynth | null = null;
  private percussionSynth: Tone.MetalSynth | null = null;
  private leadSynth: Tone.FMSynth | Tone.AMSynth | null = null;
  private padSynth: Tone.PolySynth | null = null;

  // Effects chain
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private chorus: Tone.Chorus | null = null;
  private distortion: Tone.Distortion | null = null;
  private phaser: Tone.Phaser | null = null;
  private compressor: Tone.Compressor | null = null;
  private eq: Tone.EQ3 | null = null;
  private filter: Tone.Filter | null = null;
  private limiter: Tone.Limiter | null = null;

  // Master output
  private masterChannel: Tone.Channel | null = null;

  // Current state
  private currentBpm = 120;
  private currentKey = 'C';
  private currentScale: string[] = [];

  // Sequencers
  private melodyPart: Tone.Part | null = null;
  private bassPart: Tone.Part | null = null;
  private drumPart: Tone.Part | null = null;

  private constructor() {}

  public static getInstance(): ToneAudioEngine {
    if (!ToneAudioEngine.instance) {
      ToneAudioEngine.instance = new ToneAudioEngine();
    }
    return ToneAudioEngine.instance;
  }

  /**
   * Initialize the audio engine
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      await Tone.start();
      console.log('[ToneAudioEngine] Audio context started');
      
      // Create master limiter
      this.limiter = new Tone.Limiter(-1).toDestination();
      
      // Create master channel
      this.masterChannel = new Tone.Channel(0, 0).connect(this.limiter);
      
      // Initialize default effects
      this.initializeEffects();
      
      // Initialize synthesizers
      this.initializeSynthesizers();

      this.isInitialized = true;
      console.log('[ToneAudioEngine] Engine initialized successfully');
      return true;
    } catch (error) {
      console.error('[ToneAudioEngine] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize effects chain
   */
  private initializeEffects(): void {
    // Reverb
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.1,
      wet: 0.3
    }).connect(this.masterChannel);

    // Delay
    this.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0.2,
      maxDelay: 1
    }).connect(this.masterChannel);

    // Chorus
    this.chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
      wet: 0.2
    }).connect(this.masterChannel);

    // Distortion
    this.distortion = new Tone.Distortion({
      distortion: 0.4,
      wet: 0
    }).connect(this.masterChannel);

    // Phaser
    this.phaser = new Tone.Phaser({
      frequency: 0.5,
      octaves: 3,
      baseFrequency: 1000,
      wet: 0
    }).connect(this.masterChannel);

    // Compressor
    this.compressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.25
    }).connect(this.masterChannel);

    // EQ
    this.eq = new Tone.EQ3({
      low: 0,
      mid: 0,
      high: 0,
      lowFrequency: 400,
      highFrequency: 2500
    }).connect(this.masterChannel);

    // Filter
    this.filter = new Tone.Filter({
      frequency: 20000,
      type: 'lowpass',
      rolloff: -12
    }).connect(this.masterChannel);
  }

  /**
   * Initialize synthesizers
   */
  private initializeSynthesizers(): void {
    // Melody synth (polyphonic)
    this.melodySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 0.8
      }
    }).connect(this.filter);

    // Bass synth
    this.bassSynth = new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0.4,
        release: 0.4
      },
      filterEnvelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0,
        release: 0.4,
        baseFrequency: 200,
        octaves: 2
      }
    }).connect(this.filter);

    // Drum synth (Membrane for kick)
    this.drumSynth = new Tone.MembraneSynth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4
      },
      pitchDecay: 0.05,
      octaves: 6
    }).connect(this.masterChannel);

    // Percussion (MetalSynth for hi-hats)
    this.percussionSynth = new Tone.MetalSynth({
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      }
    }).connect(this.masterChannel);

    // Lead synth
    this.leadSynth = new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.3,
        release: 0.5
      },
      modulation: { type: 'square' },
      modulationEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0,
        release: 0.5
      }
    }).connect(this.filter);

    // Pad synth
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.5,
        decay: 0.3,
        sustain: 0.8,
        release: 2
      }
    }).connect(this.reverb);
  }

  /**
   * Set BPM
   */
  setBpm(bpm: number): void {
    this.currentBpm = bpm;
    Tone.getTransport().bpm.value = bpm;
  }

  /**
   * Get current BPM
   */
  getBpm(): number {
    return this.currentBpm;
  }

  /**
   * Set musical key
   */
  setKey(key: string): void {
    this.currentKey = key;
    this.currentScale = this.getScaleForKey(key, 'major');
  }

  /**
   * Get scale notes for a key
   */
  private getScaleForKey(key: string, mode: string): string[] {
    const scales: Record<string, string[]> = {
      'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      'Am': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
      'Em': ['E', 'F#', 'G', 'A', 'B', 'C', 'D'],
      'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
      'Bm': ['B', 'C#', 'D', 'E', 'F#', 'G', 'A'],
      'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
      'Dm': ['D', 'E', 'F', 'G', 'A', 'Bb', 'C'],
    };
    return scales[key] || scales['C'];
  }

  /**
   * Play a note
   */
  playNote(note: string, duration: string = '4n', velocity = 0.8): void {
    if (!this.isInitialized) return;
    
    const synth = this.melodySynth;
    if (synth) {
      synth.triggerAttackRelease(note, duration, undefined, velocity);
    }
  }

  /**
   * Play chord
   */
  playChord(notes: string[], duration: string = '4n', velocity = 0.7): void {
    if (!this.isInitialized) return;
    
    const synth = this.melodySynth;
    if (synth && notes.length > 0) {
      (synth as any).triggerAttackRelease(notes[0], duration, undefined, velocity);
    }
  }

  /**
   * Play bass note
   */
  playBass(note: string, duration: string = '2n', velocity = 0.9): void {
    if (!this.isInitialized) return;
    
    if (this.bassSynth) {
      this.bassSynth.triggerAttackRelease(note, duration, undefined, velocity);
    }
  }

  /**
   * Play drum hit
   */
  playDrum(drumType: 'kick' | 'snare' | 'hihat' | 'tom' | 'cymbal', velocity = 1): void {
    if (!this.isInitialized) return;

    const now = Tone.now();
    
    switch (drumType) {
      case 'kick':
        if (this.drumSynth) {
          this.drumSynth.triggerAttackRelease('C1', '8n', now, velocity);
        }
        break;
      case 'snare':
        if (this.drumSynth) {
          this.drumSynth.triggerAttackRelease('D2', '8n', now, velocity * 0.8);
        }
        break;
      case 'hihat':
        if (this.percussionSynth) {
          this.percussionSynth.triggerAttackRelease('C5', '32n', now, velocity * 0.5);
        }
        break;
      case 'tom':
        if (this.drumSynth) {
          this.drumSynth.triggerAttackRelease('G2', '4n', now, velocity * 0.7);
        }
        break;
      case 'cymbal':
        if (this.percussionSynth) {
          this.percussionSynth.triggerAttackRelease('G5', '8n', now, velocity * 0.4);
        }
        break;
    }
  }

  /**
   * Play melody sequence
   */
  playMelody(notes: SequenceNote[]): void {
    if (!this.isInitialized || !this.melodySynth) return;

    // Clear existing part
    if (this.melodyPart) {
      this.melodyPart.dispose();
    }

    // Create new part
    this.melodyPart = new Tone.Part((time, value: any) => {
      this.melodySynth?.triggerAttackRelease(
        value.note, 
        value.duration || '8n', 
        time, 
        value.velocity || 0.7
      );
    }, notes.map(n => ({ time: n.time, value: n })) as any);

    this.melodyPart.start(0);
  }

  /**
   * Play drum pattern
   */
  playDrumPattern(pattern: SequenceNote[]): void {
    if (!this.isInitialized) return;

    // Clear existing part
    if (this.drumPart) {
      this.drumPart.dispose();
    }

    // Create new part
    this.drumPart = new Tone.Part((time, value: any) => {
      const note = value.note;
      const velocity = value.velocity || 1;
      
      // Map note to drum type
      if (note.includes('K')) {
        this.playDrum('kick', velocity);
      } else if (note.includes('S')) {
        this.playDrum('snare', velocity);
      } else if (note.includes('H')) {
        this.playDrum('hihat', velocity);
      }
    }, pattern.map(n => ({ time: n.time, value: n })) as any);

    this.drumPart.start(0);
  }

  /**
   * Start transport
   */
  start(): void {
    if (!this.isInitialized) return;
    
    Tone.getTransport().start();
    this.isPlaying = true;
    console.log('[ToneAudioEngine] Transport started');
  }

  /**
   * Stop transport
   */
  stop(): void {
    Tone.getTransport().stop();
    this.isPlaying = false;
    console.log('[ToneAudioEngine] Transport stopped');
  }

  /**
   * Pause transport
   */
  pause(): void {
    Tone.getTransport().pause();
    this.isPlaying = false;
  }

  /**
   * Set effect parameters
   */
  setEffect(type: string, params: Partial<EffectConfig>): void {
    switch (type) {
      case 'reverb':
        if (this.reverb && params.wet !== undefined) {
          this.reverb.wet.value = params.wet;
        }
        if (params.decay !== undefined && this.reverb) {
          this.reverb.decay = params.decay;
        }
        break;
      case 'delay':
        if (this.delay && params.wet !== undefined) {
          this.delay.wet.value = params.wet;
        }
        if (params.delayTime !== undefined && this.delay) {
          this.delay.delayTime.value = params.delayTime;
        }
        if (params.feedback !== undefined && this.delay) {
          this.delay.feedback.value = params.feedback;
        }
        break;
      case 'distortion':
        if (this.distortion && params.wet !== undefined) {
          this.distortion.wet.value = params.wet;
        }
        break;
      case 'filter':
        if (this.filter && params.frequency !== undefined) {
          this.filter.frequency.value = params.frequency;
        }
        break;
    }
  }

  /**
   * Enable/disable reverb
   */
  setReverbEnabled(enabled: boolean, wet = 0.3): void {
    if (this.reverb) {
      this.reverb.wet.value = enabled ? wet : 0;
    }
  }

  /**
   * Enable/disable delay
   */
  setDelayEnabled(enabled: boolean, wet = 0.2): void {
    if (this.delay) {
      this.delay.wet.value = enabled ? wet : 0;
    }
  }

  /**
   * Set master gain
   */
  setMasterGain(gain: number): void {
    if (this.masterChannel) {
      this.masterChannel.volume.value = Tone.gainToDb(gain);
    }
  }

  /**
   * Get analyzer node for visualization
   */
  getAnalyzer(): Tone.Analyser | null {
    if (this.masterChannel) {
      const analyzer = new Tone.Analyser('waveform', 256);
      this.masterChannel.connect(analyzer);
      return analyzer;
    }
    return null;
  }

  /**
   * Get frequency analyzer
   */
  getFrequencyAnalyzer(): Tone.Analyser | null {
    if (this.masterChannel) {
      const analyzer = new Tone.Analyser('fft', 256);
      this.masterChannel.connect(analyzer);
      return analyzer;
    }
    return null;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    if (this.melodyPart) this.melodyPart.dispose();
    if (this.bassPart) this.bassPart.dispose();
    if (this.drumPart) this.drumPart.dispose();
    
    this.melodySynth?.dispose();
    this.bassSynth?.dispose();
    this.drumSynth?.dispose();
    this.percussionSynth?.dispose();
    this.leadSynth?.dispose();
    this.padSynth?.dispose();
    
    this.reverb?.dispose();
    this.delay?.dispose();
    this.chorus?.dispose();
    this.distortion?.dispose();
    this.phaser?.dispose();
    this.compressor?.dispose();
    this.eq?.dispose();
    this.filter?.dispose();
    this.limiter?.dispose();
    this.masterChannel?.dispose();

    this.isInitialized = false;
    console.log('[ToneAudioEngine] Engine disposed');
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if playing
   */
  isActive(): boolean {
    return this.isPlaying;
  }
}

export const toneAudioEngine = ToneAudioEngine.getInstance();
export default toneAudioEngine;