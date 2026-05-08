/**
 * SovereignMaturityStudio.tsx
 * 
 * Executive dashboard for the Omni-Studio Stress Cascade.
 * Monitors global system pressure and maturity certification.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Zap, Activity, ShieldCheck, AlertOctagon, 
  RefreshCw, Play, BarChart3, Layers, Cpu
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { stressOrchestrator, CascadeMetric } from '@/engine/StressCascadeOrchestrator';

export const SovereignMaturityStudio: React.FC = () => {
  const [metrics, setMetrics] = useState<CascadeMetric[]>([]);
  const [isCascading, setIsCascading] = useState(false);

  const updateMetrics = () => {
    setMetrics(stressOrchestrator.getMetrics());
    setIsCascading(stressOrchestrator.getIsCascading());
  };

  useEffect(() => {
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  const runCascade = async () => {
    await stressOrchestrator.executeCascade();
  };

  const validatedCount = metrics.filter(m => m.status === 'VALIDATED').length;
  const progress = metrics.length > 0 ? (validatedCount / metrics.length) * 100 : 0;

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b]">
      <StudioHeader 
        title="Sovereign Maturity Center" 
        subtitle="Omni-Studio Stress Cascade & TOM Certification"
        icon={Trophy}
        badge={isCascading ? 'STRESS_IN_PROGRESS' : 'MATURITY_LOCKED'}
        badgeColor={isCascading ? 'rose' : 'emerald'}
      >
        <SovereignButton 
          variant="primary" 
          size="sm" 
          onClick={runCascade} 
          disabled={isCascading}
          icon={isCascading ? RefreshCw : Zap}
        >
          {isCascading ? 'CASCADING...' : 'IGNITE GLOBAL CASCADE'}
        </SovereignButton>
      </StudioHeader>

      <div className="p-6 space-y-6">
        {/* Global Progress Gauge */}
        <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500" />
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

          <div className="relative z-10 text-center space-y-2">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Operational Maturity (TOM)</h4>
            <div className="text-6xl font-black text-white flex items-baseline gap-2">
              {progress.toFixed(1)}<span className="text-2xl text-zinc-600">%</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {validatedCount} / {metrics.length || 24} STUDIOS CERTIFIED
            </p>
          </div>

          <div className="w-full max-w-md mt-6 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>

        {/* Studio Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {metrics.map((m) => (
            <motion.div 
              key={m.studio}
              layout
              className={`p-3 rounded-xl border transition-all ${
                m.status === 'VALIDATED' ? 'bg-emerald-500/5 border-emerald-500/20' :
                m.status === 'FAILED' ? 'bg-rose-500/5 border-rose-500/20' :
                m.status === 'STRESSING' ? 'bg-amber-500/5 border-amber-500/20 animate-pulse' :
                'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black text-zinc-500 uppercase truncate">{m.studio}</span>
                {m.status === 'VALIDATED' && <ShieldCheck size={10} className="text-emerald-400" />}
                {m.status === 'FAILED' && <AlertOctagon size={10} className="text-rose-400" />}
              </div>
              <div className="flex justify-between items-end">
                <div className="text-[10px] font-bold text-zinc-300">
                  {m.fidelity > 0 ? `${m.fidelity.toFixed(1)}%` : '--'}
                </div>
                <div className="text-[8px] font-mono text-zinc-600">
                  {m.latency > 0 ? `${m.latency}ms` : ''}
                </div>
              </div>
            </motion.div>
          ))}
          
          {metrics.length === 0 && !isCascading && (
            Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 border-dashed" />
            ))
          )}
        </div>

        {/* Real-time Telemetry Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400"><Cpu size={18} /></div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase">Neural Load</p>
              <p className="text-sm font-black text-zinc-200">{isCascading ? 'EXTREME' : 'OPTIMAL'}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Layers size={18} /></div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase">Concurrency</p>
              <p className="text-sm font-black text-zinc-200">{isCascading ? 'MAXIMUM' : 'STANDBY'}</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Activity size={18} /></div>
            <div>
              <p className="text-[9px] text-zinc-500 uppercase">System Coherence</p>
              <p className="text-sm font-black text-zinc-200">99.98%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SovereignMaturityStudio;
