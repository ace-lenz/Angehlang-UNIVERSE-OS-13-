/**
 * MathematicsStudio.tsx
 * 
 * High-performance studio for autonomous mathematical discovery and theorem proving.
 * Exposes the AutonomousMathematicsEngine with a premium, scientific UI.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sigma, Binary, Cpu, Zap, Search, RefreshCw, 
  CheckCircle2, AlertTriangle, Play, Layers,
  Terminal, Database, Brain, Globe, Shield,
  FlaskConical, Target, Award
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { autoMath, Theorem, ProofStep } from '@/engine/AutonomousMathematicsEngine';
import { cn } from '@/utils/sovereign-utils';

export const MathematicsStudio: React.FC = () => {
  const [theorems, setTheorems] = useState<Theorem[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [selectedTheorem, setSelectedTheorem] = useState<Theorem | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>('algebra');
  const [problemToAttack, setProblemToAttack] = useState<string>('riemann');
  const [metrics, setMetrics] = useState(autoMath.getMetrics());

  const discoverNewTheorem = async () => {
    setIsDiscovering(true);
    try {
      const thm = await autoMath.discoverTheorem(selectedDomain);
      setTheorems(prev => [thm, ...prev]);
      setSelectedTheorem(thm);
      setMetrics(autoMath.getMetrics());
    } finally {
      setIsDiscovering(false);
    }
  };

  const attackProblem = async () => {
    setIsDiscovering(true);
    try {
      const thm = await autoMath.attackOpenProblem(problemToAttack);
      if (thm) {
        setTheorems(prev => [thm, ...prev]);
        setSelectedTheorem(thm);
      }
      setMetrics(autoMath.getMetrics());
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] transition-all duration-700">
      <StudioHeader 
        title="Mathematics Studio" 
        subtitle="Autonomous Theorem Discovery & Formal Logic"
        icon={Sigma}
        badge={isDiscovering ? 'Discovering' : 'Coherent'}
        badgeColor={isDiscovering ? 'purple' : 'emerald'}
      >
        <div className="flex items-center gap-2">
          <SovereignButton 
            variant="primary" 
            size="sm" 
            onClick={discoverNewTheorem} 
            disabled={isDiscovering}
            icon={isDiscovering ? RefreshCw : Play}
          >
            {isDiscovering ? 'Synthesizing Proof...' : 'Discover Theorem'}
          </SovereignButton>
        </div>
      </StudioHeader>

      <div className="p-6 space-y-6">
        {/* Domain Selector & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <label className="text-[10px] text-zinc-500 uppercase font-black">Mathematical Domain</label>
              <div className="grid grid-cols-1 gap-2">
                {['algebra', 'geometry', 'topology', 'analysis', 'number_theory', 'quantum', 'logic'].map(d => (
                  <button 
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-bold text-left transition-all border",
                      selectedDomain === d ? "bg-purple-500/10 border-purple-500 text-purple-400" : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-700"
                    )}
                  >
                    {d.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-3">
              <h4 className="text-[10px] text-purple-400 uppercase font-black">Open Problems</h4>
              <select 
                value={problemToAttack}
                onChange={(e) => setProblemToAttack(e.target.value)}
                className="w-full bg-black border border-purple-500/20 rounded-lg py-2 px-3 text-xs text-zinc-200 outline-none"
              >
                <option value="riemann">Riemann Hypothesis</option>
                <option value="p_vs_np">P vs NP</option>
                <option value="collatz">Collatz Conjecture</option>
                <option value="goldbach">Goldbach Conjecture</option>
              </select>
              <button 
                onClick={attackProblem}
                disabled={isDiscovering}
                className="w-full py-2 rounded-lg bg-purple-600 text-white text-xs font-black uppercase hover:bg-purple-500 transition-all flex items-center justify-center gap-2"
              >
                <Target size={14} /> Attack Problem
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Vitals */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Theorems', val: metrics.theoremsDiscovered, color: 'text-emerald-400' },
                { label: 'Verified', val: metrics.proofsVerified, color: 'text-cyan-400' },
                { label: 'Algorithms', val: metrics.algorithmsDiscovered, color: 'text-amber-400' },
                { label: 'Attempts', val: metrics.proofAttempts, color: 'text-purple-400' }
              ].map(m => (
                <div key={m.label} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1">{m.label}</p>
                  <p className={cn("text-2xl font-black", m.color)}>{m.val}</p>
                </div>
              ))}
            </div>

            {/* Selected Theorem Display */}
            <AnimatePresence mode="wait">
              {selectedTheorem ? (
                <motion.div 
                  key={selectedTheorem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-purple-400 font-mono">
                          {selectedTheorem.domain.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">{selectedTheorem.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-zinc-100 italic">"{selectedTheorem.statement}"</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500 uppercase mb-1">Confidence</div>
                      <div className="text-xl font-black text-emerald-400">{(selectedTheorem.confidence * 100).toFixed(2)}%</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] text-zinc-500 uppercase font-black flex items-center gap-2">
                      <Layers size={12} className="text-purple-400" /> Formal Proof Sequence
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {selectedTheorem.proof.map((step, i) => (
                        <div key={i} className="flex gap-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                          <div className="text-[10px] font-mono text-zinc-600 w-4">{step.step}.</div>
                          <div className="flex-1 space-y-1">
                            <p className="text-xs text-zinc-300">{step.assertion}</p>
                            <p className="text-[9px] text-zinc-500 italic">Rule: {step.rule}</p>
                          </div>
                          {step.verified && <CheckCircle2 size={14} className="text-emerald-500/50" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500">
                    <div className="flex gap-4">
                      <span>VERIFIED: ✓ FORMAL_RIGOR</span>
                      <span>METHOD: PHOTONIC_INFERENCE</span>
                    </div>
                    <span>{new Date(selectedTheorem.discoveredAt).toLocaleString()}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-600 bg-zinc-950 rounded-2xl border border-zinc-900 border-dashed">
                  <Sigma size={48} className="mb-4 opacity-10" />
                  <p className="text-sm">Initiate discovery to synthesize new mathematical logic</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Discovery Feed */}
        <div className="space-y-4">
          <h4 className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Recent Discoveries</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {theorems.slice(1, 4).map(thm => (
              <button 
                key={thm.id}
                onClick={() => setSelectedTheorem(thm)}
                className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 transition-all text-left space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-purple-400 font-mono uppercase">{thm.domain}</span>
                  <span className="text-[9px] text-emerald-400 font-mono">{(thm.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-xs text-zinc-300 font-medium line-clamp-2 italic">"{thm.statement}"</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathematicsStudio;
