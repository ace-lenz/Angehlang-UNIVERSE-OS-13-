import { useState, useCallback, useEffect, useRef } from 'react';
import { toneAudioEngine, SequenceNote, DrumPattern } from './engines/ToneAudioEngine';
import { getGenre, getAllGenres, GENRE_DATABASE, type GenreConfig } from './data/GenreDatabase';
import { realMusicGenerator } from './engines/RealMusicGenerator';
import { audioExporter, ExportFormat } from './outputs/AudioExporter';

interface UseToneAudioEngine {
  isPlaying: boolean;
  isInitialized: boolean;
  isGenerating: boolean;
  bpm: number;
  musicalKey: string;
  genre: string;
  masterGain: number;
  reverbEnabled: boolean;
  delayEnabled: boolean;
  analyser: AnalyserNode | null;
  waveformData: Uint8Array | null;
  frequencyData: Uint8Array | null;
  initialize: () => Promise<void>;
  start: () => void;
  stop: () => void;
  togglePlay: () => void;
  setBpm: (bpm: number) => void;
  setKey: (key: string) => void;
  setGenre: (genre: string) => void;
  setMasterGain: (gain: number) => void;
  setReverbEnabled: (enabled: boolean) => void;
  setDelayEnabled: (enabled: boolean) => void;
  generateMusic: (prompt: string, options?: GenerationOptions) => Promise<void>;
  exportAudio: (format: ExportFormat) => Promise<Blob | null>;
  playNote: (note: string, duration?: string) => void;
  playChord: (notes: string[]) => void;
  playDrum: (type: 'kick' | 'snare' | 'hihat') => void;
}

interface GenerationOptions {
  duration?: number;
  complexity?: number;
  includeDrums?: boolean;
  includeBass?: boolean;
  includeMelody?: boolean;
  includePad?: boolean;
}

export function useToneAudioEngine(): UseToneAudioEngine {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bpm, setBpmState] = useState(120);
  const [musicalKey, setKeyState] = useState('Am');
  const [genre, setGenreState] = useState(' Synthwave');
  const [masterGain, setMasterGainState] = useState(0.8);
  const [reverbEnabled, setReverbEnabledState] = useState(true);
  const [delayEnabled, setDelayEnabledState] = useState(false);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  
  const animationRef = useRef<number>(0);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  const initialize = useCallback(async () => {
    if (isInitialized) return;
    
    try {
      const success = await toneAudioEngine.initialize();
      if (success) {
        setIsInitialized(true);
        toneAudioEngine.setBpm(bpm);
        toneAudioEngine.setKey(musicalKey);
        toneAudioEngine.setMasterGain(masterGain);
        toneAudioEngine.setReverbEnabled(reverbEnabled);
        toneAudioEngine.setDelayEnabled(delayEnabled);
      }
    } catch (error) {
      console.error('[useToneAudioEngine] Initialize failed:', error);
    }
  }, [isInitialized, bpm, musicalKey, masterGain, reverbEnabled, delayEnabled]);

  const start = useCallback(() => {
    if (!isInitialized) return;
    toneAudioEngine.start();
    setIsPlaying(true);
  }, [isInitialized]);

  const stop = useCallback(() => {
    if (!isInitialized) return;
    toneAudioEngine.stop();
    setIsPlaying(false);
  }, [isInitialized]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      start();
    }
  }, [isPlaying, start, stop]);

  const setBpm = useCallback((newBpm: number) => {
    setBpmState(newBpm);
    if (isInitialized) {
      toneAudioEngine.setBpm(newBpm);
    }
  }, [isInitialized]);

  const setKey = useCallback((newKey: string) => {
    setKeyState(newKey);
    if (isInitialized) {
      toneAudioEngine.setKey(newKey);
    }
  }, [isInitialized]);

  const setGenre = useCallback((newGenre: string) => {
    setGenreState(newGenre);
  }, []);

  const setMasterGain = useCallback((gain: number) => {
    setMasterGainState(gain);
    if (isInitialized) {
      toneAudioEngine.setMasterGain(gain);
    }
  }, [isInitialized]);

  const setReverbEnabled = useCallback((enabled: boolean) => {
    setReverbEnabledState(enabled);
    if (isInitialized) {
      toneAudioEngine.setReverbEnabled(enabled);
    }
  }, [isInitialized]);

  const setDelayEnabled = useCallback((enabled: boolean) => {
    setDelayEnabledState(enabled);
    if (isInitialized) {
      toneAudioEngine.setDelayEnabled(enabled);
    }
  }, [isInitialized]);

  const generateMusic = useCallback(async (prompt: string, options?: GenerationOptions) => {
    if (!isInitialized) {
      await initialize();
    }
    
    setIsGenerating(true);
    
    try {
      const genreData = getGenre(genre);
      const config = {
        genre: genre,
        bpm,
        key: musicalKey,
        scale: genreData.scale,
        chordProgression: genreData.chordProgression[0],
        duration: options?.duration || 60,
        complexity: options?.complexity || 0.7,
        seed: Math.random()
      };
      
      const generated = await realMusicGenerator.generate(config);
      
      if (generated.melody) {
        toneAudioEngine.playMelody(generated.melody.map(m => ({
          time: m.time,
          note: m.note,
          duration: m.duration,
          velocity: m.velocity
        })));
      }
      
      if (generated.bass) {
        generated.bass.forEach(note => {
          toneAudioEngine.playBass(note.note, note.duration || '2n');
        });
      }
      
      if (generated.drums) {
        toneAudioEngine.playDrumPattern(generated.drums.map(d => ({
          time: d.time,
          note: d.drum,
          duration: '16n',
          velocity: d.velocity
        })));
      }
      
      toneAudioEngine.start();
      setIsPlaying(true);
    } catch (error) {
      console.error('[useToneAudioEngine] Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [isInitialized, initialize, genre, bpm, musicalKey]);

  const exportAudio = useCallback(async (format: ExportFormat): Promise<Blob | null> => {
    try {
      const blob = await audioExporter.exportFromEngine(toneAudioEngine, format);
      return blob;
    } catch (error) {
      console.error('[useToneAudioEngine] Export failed:', error);
      return null;
    }
  }, []);

  const playNote = useCallback((note: string, duration = '4n') => {
    if (!isInitialized) return;
    toneAudioEngine.playNote(note, duration);
  }, [isInitialized]);

  const playChord = useCallback((notes: string[]) => {
    if (!isInitialized) return;
    toneAudioEngine.playChord(notes);
  }, [isInitialized]);

  const playDrum = useCallback((type: 'kick' | 'snare' | 'hihat') => {
    if (!isInitialized) return;
    toneAudioEngine.playDrum(type);
  }, [isInitialized]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      toneAudioEngine.dispose();
    };
  }, []);

  return {
    isPlaying,
    isInitialized,
    isGenerating,
    bpm,
    musicalKey,
    genre,
    masterGain,
    reverbEnabled,
    delayEnabled,
    analyser,
    waveformData,
    frequencyData,
    initialize,
    start,
    stop,
    togglePlay,
    setBpm,
    setKey,
    setGenre,
    setMasterGain,
    setReverbEnabled,
    setDelayEnabled,
    generateMusic,
    exportAudio,
    playNote,
    playChord,
    playDrum,
  };
}

export default useToneAudioEngine;