/**
 * MusicProductionStudio.tsx
 * 
 * Advanced music production studio with multi-track sequencer,
 * piano roll visualization, and AI mixing console.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Music, Layers, Sliders, Play, Square, 
  Plus, Volume2, Mic2, Disc, Waves, Zap
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';

export const MusicProductionStudio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Lead Synth', volume: 80, pan: 0, muted: false },
    { id: 2, name: 'Deep Bass', volume: 70, pan: -10, muted: false },
    { id: 3, name: 'Quantum Drums', volume: 90, pan: 10, muted: false },
    { id: 4, name: 'Ambient Pad', volume: 50, pan: 0, muted: false },
  ]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b]">
      <StudioHeader 
        title="Music Production Studio" 
        subtitle="Neural Sequencing & AI Mixing Environment"
        icon={Music}
        badge={isPlaying ? 'Recording' : 'Standby'}
        badgeColor={isPlaying ? 'rose' : 'cyan'}
      >
        <div className="flex gap-2">
          <SovereignButton 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsPlaying(!isPlaying)}
            icon={isPlaying ? Square : Play}
          >
            {isPlaying ? 'Stop' : 'Master Play'}
          </SovereignButton>
          <SovereignButton variant="primary" size="sm" icon={Zap}>
            AI Master
          </SovereignButton>
        </div>
      </StudioHeader>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Track List & Mixer */}
        <div className="lg:col-span-1 space-y-3">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Sliders size={12} className="text-purple-400" /> Track Console
          </h4>
          
          <div className="space-y-2">
            {tracks.map(track => (
              <div key={track.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-300">{track.name}</span>
                  <div className="flex gap-1">
                    <button className="p-1 rounded bg-zinc-950 text-[8px] text-zinc-500 hover:text-rose-400">M</button>
                    <button className="p-1 rounded bg-zinc-950 text-[8px] text-zinc-500 hover:text-amber-400">S</button>
                  </div>
                </div>
                <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: isPlaying ? `${Math.random() * 100}%` : '0%' }}
                    className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  />
                </div>
                <input type="range" className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
              </div>
            ))}
            <button className="w-full py-2 border border-dashed border-zinc-800 rounded-xl text-zinc-600 text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-zinc-900/50 transition-all">
              <Plus size={12} /> Add Neural Track
            </button>
          </div>
        </div>

        {/* Sequencer / Piano Roll */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Layers size={12} className="text-cyan-400" /> Neural Sequencer (Timeline)
          </h4>
          
          <div className="relative h-[400px] bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden group">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
            
            {/* Playhead */}
            {isPlaying && (
              <motion.div 
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 bottom-0 w-px bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)] z-10"
              />
            )}

            {/* Simulated MIDI Blocks */}
            <div className="absolute top-10 left-20 w-32 h-6 bg-cyan-500/20 border border-cyan-500/50 rounded-md flex items-center px-2">
              <div className="w-full h-1 bg-cyan-500/40 rounded-full" />
            </div>
            <div className="absolute top-20 left-60 w-48 h-6 bg-purple-500/20 border border-purple-500/50 rounded-md flex items-center px-2">
              <div className="w-full h-1 bg-purple-500/40 rounded-full" />
            </div>
            <div className="absolute top-40 left-10 w-20 h-6 bg-emerald-500/20 border border-emerald-500/50 rounded-md flex items-center px-2">
              <div className="w-full h-1 bg-emerald-500/40 rounded-full" />
            </div>

            <div className="absolute bottom-4 right-4 flex gap-4 text-zinc-500 text-[10px] font-mono">
              <span>BPM: 124</span>
              <span>4/4</span>
              <span>C MINOR</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <div className="p-2 rounded bg-cyan-500/10 text-cyan-400"><Waves size={16} /></div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase">Phase Correlation</p>
                <p className="text-xs font-bold text-zinc-200">OPTIMAL</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <div className="p-2 rounded bg-purple-500/10 text-purple-400"><Disc size={16} /></div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase">LUFS Target</p>
                <p className="text-xs font-bold text-zinc-200">-14.2</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <div className="p-2 rounded bg-emerald-500/10 text-emerald-400"><Volume2 size={16} /></div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase">Fidelity Level</p>
                <p className="text-xs font-bold text-zinc-200">MASTER GRADE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicProductionStudio;
