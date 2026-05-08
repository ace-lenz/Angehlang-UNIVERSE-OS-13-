// Plan Item ID: TI-1
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Cpu, Activity, Layers, Terminal, Sparkles, Box, ShieldCheck } from 'lucide-react';
import { useSovereign } from '@/context/SovereignContext';
import { cn } from '@/utils/sovereign-utils';
import { APP_VERSION } from '@/constants';

interface ActionLog {
  id: string;
  type: 'PHOTONIC' | 'QUANTUM' | 'NEURAL' | 'CORE';
  message: string;
  timestamp: number;
}

export const NeuralActionStreamPanel: React.FC = () => {
  const { ui } = useSovereign();
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ui.isThinking) return;

    const actions = [
      "Accessing Photonic RAM (1.280 TB/s @ 0.1ns)...",
      "Quantizing Logic Substrate (Zeta+ Core Sync)...",
      "Saturating 1T+ Dimensional Neural Lattice...",
      "Resolving Quantum Paradoxes in Photonic Buffer...",
      "Polymorphic Encryption substrate v" + APP_VERSION.split('.')[0] + " active...",
      "Streaming Photonic Inferences via Photonic Tensor Core...",
      "Zeta-Sync enabled: Coherence at 99.9997%...",
      "Bypassing classical silicon constraints...",
      "Synthesizing Sovereign Manifest: 1.04M MZIs active...",
      "Mapping Synaptic Fidelity to D42 Substrate...",
      "Initiating Global Lattice Scan (Photonic)..."
    ];

    const interval = setInterval(() => {
      const newLog: ActionLog = {
        id: Math.random().toString(36).substr(2, 9),
        type: ['PHOTONIC', 'QUANTUM', 'NEURAL', 'CORE'][Math.floor(Math.random() * 4)] as any,
        message: actions[Math.floor(Math.random() * actions.length)],
        timestamp: Date.now()
      };
      setLogs(prev => [...prev.slice(-40), newLog]);
    }, 150); // High-speed stream

    return () => clearInterval(interval);
  }, [ui.isThinking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#02040a] border-l border-white/5 font-mono">
      <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Zap size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tighter">Neural Action Stream</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Realtime Photonic Telemetry</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[9px] text-slate-500 uppercase font-black">Coherence</span>
              <span className="text-xs font-bold text-emerald-400 tracking-widest">99.999%</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-4 text-[11px] leading-relaxed group"
            >
              <span className="text-slate-600 flex-shrink-0 w-20">
                [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}]
              </span>
              <span className={cn(
                "font-black flex-shrink-0 px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter",
                log.type === 'PHOTONIC' ? "bg-cyan-500/10 text-cyan-400" :
                log.type === 'QUANTUM' ? "bg-purple-500/10 text-purple-400" :
                log.type === 'NEURAL' ? "bg-indigo-500/10 text-indigo-400" :
                "bg-slate-500/10 text-slate-400"
              )}>
                {log.type}
              </span>
              <span className="text-slate-300 group-hover:text-white transition-colors">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {!ui.isThinking && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-20">
            <Activity size={48} className="text-slate-500" />
            <p className="text-xs font-black uppercase tracking-[0.4em]">Awaiting Neural Spike</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-white/[0.01] grid grid-cols-3 gap-4">
         <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Photonic Load</p>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: ui.isThinking ? '85%' : '2%' }}
                 className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
               />
            </div>
         </div>
         <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Quantum Sync</p>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: ui.isThinking ? '92%' : '1%' }}
                 className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
               />
            </div>
         </div>
         <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Zeta Coherence</p>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 animate={{ width: ui.isThinking ? '99%' : '0%' }}
                 className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
               />
            </div>
         </div>
      </div>
    </div>
  );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
