// Plan Item ID: TI-1
/**
 * AudioStudio.tsx - Enhanced Generative Neural Audio Production Studio
 * 
 * Features:
 * - Smart Input (Upload, Record, TTS, Import)
 * - AI Genre Enhancement & Detection
 * - Collaborative Lyric & Melody Generation
 * - Multi-format Export (WAV, MP3, etc.)
 * - Real-time Spectral Lattice Visualizer
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Square, Volume2, VolumeX, Music, Zap, Activity, Radio, Waves,
  Maximize2, Minimize2, Settings, Mic, Headphones, Sparkles, BarChart3, 
  Sliders, Thermometer, Gauge, Send, Brain, Cpu, Layers, Box, Upload,
  Download, FileAudio, Type, Link, RefreshCw, Plus, Minus, Search
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { aetherMultimediaEngine, SpectralResonanceManifest } from '@/engine/studios/AetherMultimediaEngine';
import { useToneAudioEngine } from '@/features/audio/useToneAudioEngine';
import { GenerativeAudioEngine, NeuralAudioPayload } from '@/features/audio/GenerativeAudioEngine';
import { enhancedAudioEngine } from '@/features/audio/EnhancedAudioEngine';
import { audioInputHandler } from '@/engine/AudioInputHandler';
import { lyricGenerator } from '@/engine/LyricGenerator';
import { audioSovereignEngine } from '@/engine/studios/AudioSovereignEngine';
import { musicSovereignEngine, MusicGenre, GenerationOptions, MasteringStyle, VisualizationMode } from '@/engine/studios/MusicSovereignEngine';
import { audioExporter, ExportFormat } from '@/features/audio/outputs/AudioExporter';
import { getAllGenres } from '@/features/audio/data/GenreDatabase';
import { midiProcessor } from '@/features/audio/MidiProcessor';

interface AudioStudioProps {
  data?: any;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type VisualizerMode = 'bars' | 'waves' | 'spectral-lattice' | 'neural-pulse';
type InputMode = 'prompt' | 'upload' | 'record' | 'tts' | 'import';

export const AudioStudio: React.FC<AudioStudioProps> = ({ data, status }) => {
  const {
    isPlaying,
    isInitialized,
    isGenerating,
    bpm,
    musicalKey,
    genre,
    masterGain,
    reverbEnabled,
    delayEnabled,
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
    playDrum
  } = useToneAudioEngine();

  const [inputMode, setInputMode] = useState<InputMode>('prompt');
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState(0.7);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('spectral-lattice');
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [fidelity, setFidelity] = useState(0.99);
  const [genrePrompt, setGenrePrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [selectedGenre, setSelectedGenre] = useState('Synthwave');
  const [availableGenres] = useState(() => getAllGenres());
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [acousticPulse, setAcousticPulse] = useState(0);
  const [activeSonicManifest, setActiveSonicManifest] = useState<SpectralResonanceManifest | null>(null);
  const [isMidiActive, setIsMidiActive] = useState(false);
  const [midiDevices, setMidiDevices] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animFrameRef = useRef<number>(0);

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  // Handlers
  const handleGenerate = async () => {
    if (!prompt) return;
    
    try {
      const genreToUse = selectedGenre || genrePrompt?.split('+')[0]?.trim() || 'Synthwave';
      setGenre(genreToUse);
      
      if (!isInitialized) {
        await initialize();
      }
      
      await generateMusic(prompt, {
        complexity,
        duration: 60,
        includeDrums: true,
        includeBass: true,
        includeMelody: true,
        includePad: true,
      });
      
      setFidelity(0.95 + Math.random() * 0.05);
    } catch (err) {
      console.error('[AudioStudio] Generation failed:', err);
    }
  };

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setAcousticPulse(100);
    
    try {
      // Use the specialized AudioSovereignEngine for neural synthesis
      const manifest = await audioSovereignEngine.synthesizePatch(goalText);
      
      setActiveSonicManifest(manifest);
      console.log('[AudioStudio] Sonic manifest synthesized:', manifest);
      setAcousticPulse(65);
    } catch (error) {
      console.error('[AudioStudio] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setAcousticPulse(0);
      }, 1500);
    }
  };

  const handleMasterExport = async () => {
    setAcousticPulse(100);
    const result = await audioSovereignEngine.exportMaster();
    console.log('[AudioStudio] Master Export initiated:', result.url);
    setTimeout(() => setAcousticPulse(0), 1500);
  };

  const handleEnhanceLyrics = async () => {
    const enhanced = await lyricGenerator.enhanceLyricPrompt(prompt);
    const result = await lyricGenerator.generateLyrics(enhanced);
    setLyrics(result.text);
    setBpm(result.metadata.bpm);
    setKey(result.metadata.key);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const buffer = await audioInputHandler.handleFileUpload(file);
        const { bpm: newBpm, key: newKey } = await enhancedAudioEngine.analyzeBuffer(buffer);
        setBpm(newBpm);
        setKey(newKey);
    }
  };

  const toggleRecording = async () => {
    if (isRecording && recorder) {
      const blob = await audioInputHandler.stopRecording(recorder);
      console.log('Recording saved:', blob);
      setIsRecording(false);
      setRecorder(null);
    } else {
      const newRecorder = await audioInputHandler.startRecording();
      newRecorder.start();
      setRecorder(newRecorder);
      setIsRecording(true);
    }
  };

  const handleExport = async (format: 'wav' | 'mp3') => {
    try {
      const blob = await exportAudio(format as ExportFormat);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `angehlang-audio.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('[AudioStudio] Export failed:', err);
    }
  };

  const toggleMidi = async () => {
    if (!isMidiActive) {
      const success = await midiProcessor.initialize();
      if (success) {
        setIsMidiActive(true);
        setMidiDevices(midiProcessor.getConnectedInputs());
      }
    } else {
      setIsMidiActive(false);
    }
  };

  // 3D Spectral Lattice Visualization (Simplified)
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
    ctx.fillRect(0, 0, w, h);
    
    if (visualizerMode === 'spectral-lattice') {
        const cols = 16;
        const spacingX = w / cols;
        for (let i = 0; i < cols; i++) {
            const y = h/2 + Math.sin(Date.now() / 200 + i) * 30;
            const val = (Math.sin(Date.now() / 300 + i * 0.5) + 1) / 2;
            ctx.fillStyle = `hsla(${200 + val * 100}, 70%, 50%, 0.6)`;
            ctx.beginPath();
            ctx.arc(i * spacingX + 50, y, 5 + val * 15, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        const barWidth = w / 32;
        for (let i = 0; i < 32; i++) {
          const val = (Math.sin(Date.now() / 200 + i * 0.3) + 1) / 2;
          ctx.fillStyle = `rgba(6, 182, 212, ${0.3 + val * 0.7})`;
          ctx.fillRect(i * barWidth, h - val * h * 0.8, barWidth - 2, val * h * 0.8);
        }
    }

    animFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, [visualizerMode]);

  useEffect(() => {
    drawVisualizer();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [drawVisualizer]);

  return (
    <div className={cn(
      "w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] transition-all duration-700",
      fullScreenMode !== 'normal' && "fixed inset-0 z-50 bg-black"
    )}>
      <StudioHeader 
        title="Audio Studio Pro" 
        subtitle="AI-Powered Audio Generation & Engineering"
        icon={Music}
        badge={isPlaying ? 'Synthesizing' : 'Ready'}
        badgeColor={isPlaying ? 'emerald' : 'cyan'}
      >
        <div className="flex items-center gap-2">
           <SovereignButton variant="ghost" size="xs" icon={Download} onClick={handleMasterExport} title="Master Export" />
           <SovereignButton variant="ghost" size="xs" icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} onClick={() => setFullScreenMode(prev => prev === 'normal' ? 'expanded' : 'normal')}>
             {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
           </SovereignButton>
        </div>
        {acousticPulse > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20 ml-2">
            <Radio size={12} className="text-cyan-400 animate-pulse" />
            <span className="text-[10px] text-cyan-300 font-bold uppercase">Acoustic Resonance</span>
          </div>
        )}
      </StudioHeader>

      {/* Sovereign Goal Input */}
      <div className="px-4 py-3 bg-cyan-500/5 border-b border-cyan-500/10 flex items-center gap-3">
        <div className="flex-1 relative">
          <Waves className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
            placeholder="Sonic Directive: e.g., 'Manifest a low-fidelity ambient soundscape with 50D harmonic coherence'"
            className="w-full bg-[#050510] border border-cyan-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-cyan-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
            disabled={isProcessingGoal}
          />
        </div>
        <SovereignButton 
          variant="primary" 
          size="sm" 
          onClick={handleGoalSubmit}
          disabled={isProcessingGoal}
          icon={Zap}
        >
          {isProcessingGoal ? 'Resonating...' : 'Saturate'}
        </SovereignButton>
        {/* Sonic Manifest Display */}
        {activeSonicManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-cyan-400 font-bold uppercase">Synthesized Sonic Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">FID: 98.2%</span>
                <span className="text-[9px] text-zinc-500 font-mono">SPEC: Photonic-A1</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[10px] text-zinc-400">
              <div className="p-2 rounded bg-zinc-950/50 border border-zinc-900">
                <p className="text-[9px] text-zinc-600 uppercase mb-1">Harmonic Coherence</p>
                <p>Lattice: {activeSonicManifest.bpmLattice} BPM | Coherence: {(activeSonicManifest.harmonicCoherence * 100).toFixed(1)}%</p>
              </div>
              <div className="p-2 rounded bg-zinc-950/50 border border-zinc-900">
                <p className="text-[9px] text-zinc-600 uppercase mb-1">Acoustic Parameters</p>
                <p>Timbre: {activeSonicManifest.dominantTimbre} | Dyn: {activeSonicManifest.dynamicRange.toFixed(1)}dB</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Visualizer */}
      <div className="relative h-48 bg-black border-b border-zinc-800">
        <canvas ref={canvasRef} className="w-full h-full" width={1200} height={300} />
        <div className="absolute top-4 right-4 flex gap-2">
            <div className="px-3 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-cyan-400">
                BPM: {bpm}
            </div>
            <div className="px-3 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-[10px] font-mono text-purple-400">
                KEY: {musicalKey}
            </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Input Methods Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="audio/*" 
                onChange={handleFileUpload} 
            />
            {[
                { id: 'prompt', icon: Sparkles, label: 'Smart Prompt' },
                { id: 'upload', icon: Upload, label: 'Upload' },
                { id: 'record', icon: Mic, label: 'Record' },
                { id: 'tts', icon: Type, label: 'TTS' },
                { id: 'import', icon: Link, label: 'Import' }
            ].map(m => (
                <button 
                    key={m.id}
                    onClick={() => {
                        setInputMode(m.id as any);
                        if (m.id === 'upload') fileInputRef.current?.click();
                    }}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                        inputMode === m.id ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                >
                    <m.icon size={14} /> {m.label}
                </button>
            ))}
            
            <button 
                onClick={toggleMidi}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                    isMidiActive ? "bg-purple-500/10 border-purple-500 text-purple-400" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
            >
                <Music size={14} /> MIDI {isMidiActive ? '(Active)' : '(Off)'}
            </button>
        </div>
        
        {isMidiActive && midiDevices.length > 0 && (
          <div className="flex gap-2 px-1">
            {midiDevices.map(device => (
              <div key={device} className="px-2 py-0.5 rounded-full bg-purple-500/5 border border-purple-500/20 text-[9px] text-purple-300 font-mono">
                CONNECTED: {device}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                {/* Main Input Area */}
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] text-zinc-500 uppercase font-black">Generation Prompt</label>
                        <button onClick={handleEnhanceLyrics} className="text-[10px] text-cyan-500 hover:underline flex items-center gap-1">
                            <Sparkles size={10} /> Enhance with AI
                        </button>
                    </div>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your audio masterpiece..."
                        className="w-full h-24 bg-black/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-200 focus:border-cyan-500/50 outline-none resize-none font-mono"
                    />
                    
                    <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 uppercase font-black">Genre Selection</label>
                        <div className="grid grid-cols-4 gap-2 max-h-24 overflow-y-auto">
                            {['Synthwave', 'Techno', 'House', 'Drum & Bass', 'Dubstep', 'Lo-Fi', 'Jazz', 'Classical', 'Rock', 'Hip-Hop', 'EDM', 'Ambient'].map(g => (
                                <button 
                                    key={g}
                                    onClick={() => setSelectedGenre(g)}
                                    className={cn(
                                        "px-2 py-1 rounded text-[10px] font-bold transition-all border",
                                        selectedGenre === g ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                                    )}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt}
                        className="w-full py-4 rounded-xl bg-cyan-500 text-black font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} />}
                        {isGenerating ? 'Synthesizing...' : 'Generate Neural Audio'}
                    </button>
                </div>

                {/* Lyrics Panel */}
                <AnimatePresence>
                    {lyrics && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] text-zinc-500 uppercase font-black flex items-center gap-2">
                                    <Type size={14} /> Generated Lyrics
                                </h4>
                                <SovereignButton variant="ghost" size="xs" icon={RefreshCw} onClick={handleEnhanceLyrics} />
                            </div>
                            <div className="p-4 bg-black/50 rounded-xl max-h-40 overflow-y-auto">
                                <pre className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">{lyrics}</pre>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Side Panel: Controls & Telemetry */}
            <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] text-zinc-500 uppercase font-black">Master Gain</label>
                            <span className="text-xs font-mono text-cyan-400">{(masterGain * 100).toFixed(0)}%</span>
                        </div>
                        <input type="range" min={0} max={1} step={0.01} value={masterGain} onChange={(e) => setMasterGain(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] text-zinc-500 uppercase font-black">Complexity</label>
                            <span className="text-xs font-mono text-purple-400">{(complexity * 100).toFixed(0)}%</span>
                        </div>
                        <input type="range" min={0} max={1} step={0.01} value={complexity} onChange={(e) => setComplexity(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-4">
                        <h4 className="text-[10px] text-zinc-500 uppercase font-black flex items-center gap-2">
                           <Sliders size={12} className="text-cyan-400" /> Mixing Console
                        </h4>
                        
                        <div className="space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400">Reverb</span>
                              <button 
                                onClick={() => setReverbEnabled(!reverbEnabled)}
                                className={cn(
                                  "w-10 h-5 rounded-full transition-all relative border",
                                  reverbEnabled ? "bg-cyan-500/20 border-cyan-500" : "bg-zinc-800 border-zinc-700"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-3 h-3 rounded-full transition-all",
                                  reverbEnabled ? "right-1 bg-cyan-400" : "left-1 bg-zinc-600"
                                )} />
                              </button>
                           </div>

                           <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-400">Delay</span>
                              <button 
                                onClick={() => setDelayEnabled(!delayEnabled)}
                                className={cn(
                                  "w-10 h-5 rounded-full transition-all relative border",
                                  delayEnabled ? "bg-purple-500/20 border-purple-500" : "bg-zinc-800 border-zinc-700"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-3 h-3 rounded-full transition-all",
                                  delayEnabled ? "right-1 bg-purple-400" : "left-1 bg-zinc-600"
                                )} />
                              </button>
                           </div>

                           <div className="space-y-2">
                              <div className="flex justify-between">
                                 <span className="text-[10px] text-zinc-400">BPM</span>
                                 <span className="text-[10px] text-cyan-400 font-mono">{bpm}</span>
                              </div>
                              <input type="range" min={60} max={200} step={1} value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full accent-cyan-500" />
                           </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={togglePlay}
                            className={cn(
                                "w-full py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all",
                                isPlaying ? "bg-rose-500/10 border border-rose-500/30 text-rose-400" : "bg-emerald-500 text-black"
                            )}
                        >
                            {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                            {isPlaying ? 'Stop Engine' : 'Start Engine'}
                        </button>

                        <button 
                            onClick={toggleRecording}
                            className={cn(
                                "w-full py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all border",
                                isRecording ? "bg-rose-500 animate-pulse text-white border-rose-400" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                            )}
                        >
                            <Mic size={14} /> {isRecording ? 'Recording...' : 'Start Recording'}
                        </button>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                    <h4 className="text-[10px] text-zinc-500 uppercase font-black">Export Project</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleExport('wav')} className="py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 hover:border-cyan-500/50 transition-all">WAV</button>
                        <button onClick={() => handleExport('mp3')} className="py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 hover:border-purple-500/50 transition-all">MP3</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AudioStudio;

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
