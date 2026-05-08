import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Square, Volume2, Music, Activity } from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { AudioData } from '@/types';
import { useAudioEngine } from './useAudioEngine';
import { GENRE_PRESETS, GenrePreset } from './audio-types';

interface AudioStudioProps {
  data?: AudioData;
  status?: string;
}

/**
 * AudioStudio Component - Feature Sliced
 * Extracted logic to useAudioEngine hook.
 * Standardized with the Sovereign Design System.
 */
export const AudioStudio: React.FC<AudioStudioProps> = ({ data, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const {
    isPlaying,
    masterGain,
    selectedPreset,
    filterFreq,
    midiActive,
    analyserRef,
    startAudio,
    stopAudio,
    updateFilter,
    updateMasterGain,
    setSelectedPreset
  } = useAudioEngine(data);

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / 64);
    for (let i = 0; i < 64; i++) {
      const v = dataArray[i] / 255;
      const h = v * canvas.height;
      ctx.fillStyle = `hsla(${i * 4 + 180}, 80%, 60%, ${0.4 + v * 0.6})`;
      ctx.fillRect(i * barWidth, canvas.height - h, barWidth - 1, h);
    }
    animFrameRef.current = requestAnimationFrame(drawVisualizer);
  }, [analyserRef]);

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer();
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, drawVisualizer]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl">
      <StudioHeader 
        title="Audio Studio" 
        subtitle="MIDI-Ready • Biquad Filter Chain" 
        icon={Music}
        badge={status || 'Ready'}
        badgeColor="cyan"
      >
        <div className="flex items-center gap-2">
           <div className={cn(
             "w-2 h-2 rounded-full transition-all duration-500",
             midiActive ? "bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" : "bg-zinc-700"
           )} />
           <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">MIDI_LINK</span>
        </div>
      </StudioHeader>

      <div className="relative h-32 bg-zinc-950 border-b border-zinc-800 group overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" width={600} height={128} />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-40 pointer-events-none" />
      </div>

      <div className="p-6 space-y-6">
        <div className="flex gap-2">
          {(Object.keys(GENRE_PRESETS) as GenrePreset[]).map(p => (
            <button 
              key={p} 
              onClick={() => setSelectedPreset(p)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                selectedPreset === p 
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                  : "border-zinc-800 bg-zinc-900/40 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex justify-between">
                 <span>Filter Frequency</span>
                 <span className="text-cyan-400 font-mono">{filterFreq}Hz</span>
              </label>
              <div className="relative h-6 flex items-center">
                <input 
                  type="range" min={20} max={10000} value={filterFreq}
                  onChange={(e) => updateFilter(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-zinc-800 rounded-full cursor-pointer appearance-none"
                />
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex justify-between">
                 <span>Master Output</span>
                 <span className="text-indigo-400 font-mono">{Math.round(masterGain * 100)}%</span>
              </label>
              <div className="flex items-center gap-3 h-6">
                 <Volume2 size={14} className="text-zinc-600" />
                 <input 
                   type="range" min={0} max={1} step={0.01} value={masterGain}
                   onChange={(e) => updateMasterGain(parseFloat(e.target.value))}
                   className="flex-1 accent-indigo-500 h-1 bg-zinc-800 rounded-full cursor-pointer appearance-none"
                 />
              </div>
           </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <SovereignButton 
                variant={isPlaying ? "danger" : "primary"}
                size="md" 
                icon={isPlaying ? Square : Play} 
                onClick={() => isPlaying ? stopAudio() : startAudio()}
                className="min-w-[140px]"
              >
                {isPlaying ? 'Disconnect' : 'Synthesize'}
              </SovereignButton>
           </div>
           
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <Activity size={12} className="text-cyan-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Audio_Substrate_Sync: OK</span>
           </div>
        </div>
      </div>
    </div>
  );
};
