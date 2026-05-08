// Plan Item ID: TI-1
/**
 * SyntheticBioStudio.tsx - QPPU-Enhanced Bio Synthesis Studio
 * 
 * Features:
 * - Quantum Photonic DNA Synthesis
 * - Multi-Mode Visualization (DNA, Protein, Circuit)
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - Dynamic Backgrounds with Photonic Effects
 * - Glassmorphism UI Components
 * - QPPU Integration for 50D ANGHV Storage
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dna, FlaskConical, Atom, Zap, RotateCw, Download, Share2, 
  Activity, Microscope, Maximize2, Minimize2, Sparkles, Sun, Moon, 
  Play, Pause, Plus, Trash2, Save, Copy
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { bioDigitalSynthesisEngine, MolecularResonanceManifest } from '@/engine/studios/BioDigitalSynthesisEngine';
import { bioAgent } from '@/agents/BioAgent';

import { BioData } from '@/types';

interface SyntheticBioStudioProps {
  data?: BioData;
  status?: string;
}

type BioMode = 'dna' | 'protein' | 'circuit';

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';

interface Nucleotide {
  base: 'A' | 'T' | 'G' | 'C';
  pair: 'T' | 'A' | 'C' | 'G';
  color: string;
  pairColor: string;
}

const BASE_COLORS: Record<string, string> = {
  A: '#f43f5e',  // Adenine
  T: '#06b6d4',  // Thymine
  G: '#10b981',  // Guanine
  C: '#f59e0b',  // Cytosine
};

const PAIRS: Record<string, 'T' | 'A' | 'C' | 'G'> = { A: 'T', T: 'A', G: 'C', C: 'G' };

function generateStrand(length: number): Nucleotide[] {
  console.log('%c[BioStudio] ⚡ Initializing Quantum-Inspired Photonic Synthesis (UPIS)...', 'color: #10b981;');
  const bases = ['A', 'T', 'G', 'C'] as const;
  
  // High-fidelity photonic mapping simulation
  return Array.from({ length }, (_, i) => {
    // Coherent alignment logic (PH_COHERENCE_GATE simulation)
    const flux = Math.sin(Date.now() * 0.001 + i);
    const baseIndex = Math.abs(Math.floor(flux * 4)) % 4;
    const base = bases[baseIndex];
    const pair = PAIRS[base];
    return { base, pair, color: BASE_COLORS[base], pairColor: BASE_COLORS[pair] };
  });
}

const DNA_STRAND_LEN = 18;

const DnaVisualizer: React.FC<{ strand: Nucleotide[]; animating: boolean }> = ({ strand, animating }) => {
  return (
    <div className="relative w-full overflow-x-auto py-6 custom-scrollbar">
      <div className="flex items-center gap-0 mx-auto" style={{ width: 'fit-content' }}>
        {strand.map((nt, i) => {
          const twist = Math.sin((i / strand.length) * Math.PI * 3) * 24;
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center"
              style={{ marginTop: twist > 0 ? 0 : Math.abs(twist) }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg select-none"
                style={{ backgroundColor: nt.color }}
              >
                {nt.base}
              </div>
              <div className="w-0.5 h-8 bg-zinc-800 rounded-full my-1 opacity-50" />
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg select-none"
                style={{ backgroundColor: nt.pairColor }}
              >
                {nt.pair}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const ProteinVisualizer: React.FC<{ strand: Nucleotide[]; folding: boolean }> = ({ strand, folding }) => {
  return (
    <div className="relative w-full h-48 bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
      <div className="flex items-center gap-1">
        {strand.map((nt, i) => {
          const x = folding ? Math.cos(i * 0.8) * (20 + i * 2) : i * 25 - (strand.length * 12);
          const y = folding ? Math.sin(i * 0.8) * (20 + i * 2) : 0;
          const z = folding ? Math.sin(i * 0.5) * 50 : 0;
          
          return (
            <motion.div
              key={i}
              animate={{ x, y, scale: 1 + z/100, rotate: folding ? i * 45 : 0 }}
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              className="absolute w-6 h-6 rounded-lg shadow-xl flex items-center justify-center text-[8px] font-black text-white"
              style={{ 
                backgroundColor: nt.color,
                boxShadow: `0 0 15px ${nt.color}40`,
                zIndex: Math.round(z)
              }}
            >
              {nt.base}
            </motion.div>
          );
        })}
      </div>
      {folding && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {[...Array(20)].map((_, i) => (
             <motion.div 
               key={i}
               initial={{ x: Math.random() * 800, y: Math.random() * 400, opacity: 0 }}
               animate={{ y: [null, -100], opacity: [0, 0.5, 0] }}
               transition={{ duration: 2 + Math.random() * 4, repeat: Infinity }}
               className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
             />
           ))}
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 border border-white/10">
         <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Molecular Folding State: {folding ? 'COMPLEX' : 'LINEAR'}</span>
      </div>
    </div>
  );
};

export const SyntheticBioStudio: React.FC<SyntheticBioStudioProps> = ({ data, status }) => {
  const [mode, setMode] = useState<BioMode>('dna');
  const [strand, setStrand] = useState<Nucleotide[]>(() => data?.strand ?? generateStrand(DNA_STRAND_LEN));
  const [animating, setAnimating] = useState(true);
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [strandLength, setStrandLength] = useState(DNA_STRAND_LEN);
  const [quantumMode, setQuantumMode] = useState(false);
  const [qppuStats, setQppuStats] = useState({ coherence: 0, fidelity: 0, frames: '50D' });
  const [selectedBase, setSelectedBase] = useState<number | null>(null);
  const [isFolding, setIsFolding] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [synapticActivity, setSynapticActivity] = useState(0);
  const [activeBioManifest, setActiveBioManifest] = useState<MolecularResonanceManifest | null>(null);

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  useEffect(() => {
    const stats = qppuEngine.getStats();
    setQppuStats({ 
      coherence: Math.round(stats.coherence * 100), 
      fidelity: Math.round(stats.fidelity * 100),
      frames: `${stats.frameDimensions}D`
    });
  }, [quantumMode]);

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setSynapticActivity(100);
    
    try {
      // Use the specialized BioDigitalSynthesisEngine for molecular resonance synthesis
      const manifest = await bioDigitalSynthesisEngine.resonantSynthesis(goalText);
      
      setActiveBioManifest(manifest);
      console.log('[BioStudio] Molecular resonance synthesized:', manifest);
      setSynapticActivity(60);
      
      // Agent processing
      await bioAgent.process(goalText);
    } catch (error) {
      console.error('[BioStudio] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setSynapticActivity(0);
      }, 1000);
    }
  };

  const gcContent = useMemo(() => {
    if (!strand.length) return 0;
    const gc = strand.filter(n => n.base === 'G' || n.base === 'C').length;
    return Math.round((gc / strand.length) * 100);
  }, [strand]);

  const fullScreenHandlers = {
    normal: () => setFullScreenMode('normal'),
    expanded: () => setFullScreenMode('expanded'),
    immersive: () => setFullScreenMode('immersive'),
    cinema: () => setFullScreenMode('cinema'),
  };

  const containerClasses = cn(
    "w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-xl",
    "bg-[#09090b] transition-all duration-500",
    fullScreenMode === 'expanded' && "fixed inset-0 z-50 rounded-none",
    fullScreenMode === 'immersive' && "fixed inset-0 z-50 rounded-none bg-black",
    fullScreenMode === 'cinema' && "fixed inset-0 z-50 rounded-none bg-black"
  );

  return (
    <AnimatePresence>
      {fullScreenMode === 'cinema' && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/90"
          onClick={() => setFullScreenMode('normal')}
        />
      )}
      <motion.div 
        className={containerClasses}
        layout
      >
        <StudioHeader 
          title="Bio Studio" 
          subtitle="DNA Design • Protein Folding" 
          icon={Dna}
          badge={status || 'Active'}
          badgeColor="emerald"
        >
          <div className="flex items-center gap-2">
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={quantumMode ? Zap : Sparkles} 
              onClick={() => setQuantumMode(!quantumMode)} 
              className={cn(quantumMode && "text-emerald-400")}
            />
            <SovereignButton 
              variant="primary" 
              size="xs" 
              icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} 
              onClick={() => fullScreenHandlers[fullScreenMode === 'normal' ? 'expanded' : 'normal']()}
            >
              {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
            </SovereignButton>
          </div>
          {synapticActivity > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 ml-2">
              <Dna className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300 font-bold uppercase">Biological Logic Active</span>
            </div>
          )}
        </StudioHeader>

        {/* Sovereign Goal Input */}
        <div className="px-4 py-3 bg-emerald-500/5 border-b border-emerald-500/10 flex items-center gap-3">
          <div className="flex-1 relative">
            <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
              placeholder="Biological Directive: e.g., 'Synthesize a high-fidelity DNA strand for bioluminescent fluorescence'"
              className="w-full bg-[#050510] border border-emerald-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-emerald-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
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
            {isProcessingGoal ? 'Manifesting...' : 'Synthesize'}
          </SovereignButton>
        </div>

        {/* Molecular Resonance Manifest Display */}
        {activeBioManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-emerald-400 font-bold uppercase">Sovereign Molecular Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">FID: {(activeBioManifest.molecularFidelity * 100).toFixed(2)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">COH: {(activeBioManifest.foldingCoherence * 100).toFixed(2)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Synthesis Path</p>
                <div className="space-y-1">
                  {activeBioManifest.synthesisPath.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <FlaskConical size={10} className="text-emerald-500/50" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Resonance Alerts</p>
                <div className="space-y-1">
                  {activeBioManifest.resonanceAlerts.length > 0 ? activeBioManifest.resonanceAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-amber-400">
                      <Activity size={10} />
                      <span>{alert}</span>
                    </div>
                  )) : (
                    <div className="flex items-center gap-2 text-[10px] text-emerald-500/60">
                      <Dna size={10} />
                      <span>Coherence stable</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex border-b border-zinc-800 bg-zinc-950/40">
          {(['dna', 'protein', 'circuit'] as BioMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                mode === m ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <div className={cn(
          fullScreenMode === 'cinema' ? "p-8 flex-1 overflow-auto" : "p-6"
        )}>
           <div className="flex items-center gap-6 mb-6">
              <div className="flex-1 p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Microscope size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Base Pairs</p>
                    <p className="text-xl font-mono text-zinc-200">{strand.length}</p>
                 </div>
              </div>
              <div className="flex-1 p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <Activity size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">GC Content</p>
                    <p className="text-xl font-mono text-zinc-200">{gcContent}%</p>
                 </div>
              </div>
              {quantumMode && (
                <div className="flex-1 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Zap size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">QPPU</p>
                      <div className="flex gap-2 text-[10px]">
                        <span className="text-zinc-400">Coh: <span className="text-emerald-300 font-bold">{qppuStats.coherence}%</span></span>
                        <span className="text-zinc-400">Fi: <span className="text-emerald-300 font-bold">{qppuStats.fidelity}%</span></span>
                        <span className="text-zinc-400">Dim: <span className="text-emerald-300 font-bold">{qppuStats.frames}</span></span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="min-h-[120px] mb-6">
              {mode === 'dna' ? (
                <DnaVisualizer strand={strand} animating={animating} />
              ) : (
                <ProteinVisualizer strand={strand} folding={isFolding} />
              )}
           </div>

           <div className="flex flex-wrap gap-2 border-t border-zinc-800 pt-6">
              <SovereignButton variant="primary" size="sm" icon={RotateCw} onClick={() => setStrand(generateStrand(strandLength))}>
                 Synthesize
              </SovereignButton>
              {mode === 'protein' && (
                <SovereignButton 
                  variant="secondary" 
                  size="sm" 
                  icon={Activity} 
                  onClick={() => setIsFolding(!isFolding)}
                  className={cn(isFolding && "bg-emerald-500 text-black border-none")}
                >
                  {isFolding ? 'Unfold Chain' : 'Simulate Folding'}
                </SovereignButton>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                 <span className="text-[10px] text-zinc-500 uppercase font-bold">Length</span>
                 <input 
                    type="number" 
                    value={strandLength}
                    onChange={(e) => setStrandLength(Math.max(4, Math.min(100, parseInt(e.target.value) || 4)))}
                    className="w-12 bg-transparent text-xs text-zinc-200 font-mono text-center outline-none"
                 />
              </div>
              <SovereignButton variant="secondary" size="sm" icon={Download}>
                 Export FASTA
              </SovereignButton>
              <SovereignButton variant="secondary" size="sm" icon={Copy}>
                 Copy Sequence
              </SovereignButton>
              <SovereignButton variant="ghost" size="sm" icon={Save}>
                 Save to QPPU
              </SovereignButton>
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
