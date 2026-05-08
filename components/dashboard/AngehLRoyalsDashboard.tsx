import React, { useState, useEffect } from 'react';
import { royalsEngine, VideoDNA } from '@/engine/AngehLRoyals';
import { photoRAM } from '@/memory/PhotoRAM';

export const AngehLRoyalsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState(royalsEngine.getZetaMetrics());
  const [registry, setRegistry] = useState<VideoDNA[]>(royalsEngine.getRegistry());
  const [vpuStatus, setVpuStatus] = useState(photoRAM.getStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(royalsEngine.getZetaMetrics());
      setRegistry(royalsEngine.getRegistry());
      setVpuStatus(photoRAM.getStatus());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 bg-slate-950/80 backdrop-blur-3xl border border-amber-500/20 rounded-[2.5rem] shadow-2xl h-full overflow-hidden flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-600 p-[1px] animate-pulse">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xl">
              👑
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              ANGEHL ROYALS
            </h2>
            <p className="text-[10px] font-bold text-amber-500/50 uppercase tracking-[0.2em]">Quantum Built-in Master Engine</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Zeta+ Computing</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Virtual Params', value: metrics.virtualParams.toExponential(), sub: 'Zeta+ Scale', color: 'text-amber-400' },
          { label: 'DNA Manifests', value: metrics.dnaManifests, sub: '.angv Count', color: 'text-purple-400' },
          { label: 'VPU Load', value: vpuStatus.utilization, sub: 'Photo RAM', color: 'text-indigo-400' }
        ].map((m, i) => (
          <div key={i} className="p-4 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-xl font-black ${m.color} tabular-nums group-hover:scale-105 transition-transform origin-left`}>
              {m.value}
            </p>
            <p className="text-[8px] font-medium text-slate-600 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* DNA Registry */}
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 tracking-[0.15em] uppercase px-1">Living Reasoning DNA</h3>
          <span className="text-[10px] font-bold text-slate-600 italic">Playable S-Expression Traces</span>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {registry.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20">
              <div className="text-4xl mb-4">🧬</div>
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Waiting for Royal Manifestation...</p>
            </div>
          ) : (
            registry.map((dna) => (
              <div key={dna.manifestId} className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/5 to-purple-500/5 border border-white/5 hover:border-amber-500/20 transition-all animate-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-amber-500 tracking-tighter">NODE: {dna.manifestId}</span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase">.ANGV</span>
                </div>
                
                <div className="space-y-2">
                  {dna.reasoningTraces.slice(0, 3).map((trace, i) => (
                    <div key={i} className="flex gap-3 items-start group">
                      <div className="text-[9px] font-black text-slate-600 tabular-nums py-1">
                        {(trace.timestamp / 1000).toFixed(1)}s
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-300 truncate group-hover:text-amber-200 transition-colors">
                          {trace.thought}
                        </p>
                        <div className="h-[2px] mt-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500/40 w-full animate-progress" style={{ animationDuration: '2s' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Status */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] font-black tracking-widest text-slate-500 uppercase">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            LEDGER_ACTIVE
          </span>
          <span className="flex items-center gap-1.5 opacity-50">
            P2P_SYNCING
          </span>
        </div>
        <div className="text-amber-500/40">
          OS v5.0 ROYAL_CORE
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.2); }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress linear infinite;
        }
      `}</style>
    </div>
  );
};
