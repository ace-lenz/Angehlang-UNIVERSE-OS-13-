// Plan Item ID: TI-1
/**
 * AutomationDashboard.tsx - QPPU-Enhanced Automation Studio
 * 
 * Features:
 * - Quantum Photonic Workflow Orchestration
 * - Real-time QPPU Stats Monitoring
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - Dynamic Backgrounds with Photonic Effects
 * - Glassmorphism UI Components
 * - QPPU Integration for 50D ANGHV Storage
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, CheckCircle2, CircleDashed, Activity, Server, Zap, Cpu, 
  Play, Pause, Settings, Maximize2, Minimize2, Sparkles,
  Plus, MoreHorizontal, RefreshCw, Save, PlayCircle, PauseCircle
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { resonantLatticeEngine, LatticeCoherenceManifest } from '@/engine/studios/ResonantLatticeEngine';
import { automationAgent } from '@/agents/AutomationAgent';

interface AutomationTask {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'active' | 'completed';
}

interface AutomationData {
  workflow: string;
  tasks: AutomationTask[];
}

interface AutomationDashboardProps {
  data?: AutomationData;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';

const DEFAULT_AUTOMATION: AutomationData = {
  workflow: "Neural Pipeline Alpha",
  tasks: [
    { id: '1', name: "Synthesizing DNA", progress: 45, status: 'active' }
  ]
};

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ data: externalData, status }) => {
  const data = externalData || DEFAULT_AUTOMATION;
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [isRunning, setIsRunning] = useState(true);
  const [quantumMode, setQuantumMode] = useState(false);
  const [qppuStats, setQppuStats] = useState({ coherence: 0, fidelity: 0, frames: '50D', throughput: 0 });
  const [systemLoad, setSystemLoad] = useState(42);
  const [throughput, setThroughput] = useState(12.8);
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [flowPulse, setFlowPulse] = useState(0);
  const [activeLatticeManifest, setActiveLatticeManifest] = useState<LatticeCoherenceManifest | null>(null);

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setFlowPulse(100);
    
    try {
      // Use the specialized ResonantLatticeEngine for high-fidelity workflow orchestration and lattice sync
      const manifest = await resonantLatticeEngine.orchestrateLatticeSync(goalText);
      
      setActiveLatticeManifest(manifest);
      console.log('[AutomationStudio] Lattice sync manifest synthesized:', manifest);
      setFlowPulse(65);
      
      // Secondary logic via agent
      await automationAgent.process(goalText);
    } catch (error) {
      console.error('[AutomationStudio] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setFlowPulse(0);
      }, 1500);
    }
  };

  useEffect(() => {
    if (quantumMode && isRunning) {
      qppuEngine.processFrame(33.33, 'photonic');
    }
  }, [quantumMode, isRunning]);

  const fullScreenHandlers = {
    normal: () => setFullScreenMode('normal'),
    expanded: () => setFullScreenMode('expanded'),
    immersive: () => setFullScreenMode('immersive'),
    cinema: () => setFullScreenMode('cinema'),
  };

  const containerClasses = cn(
    "w-full bg-[#02020a] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl",
    "transition-all duration-500",
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
          title="Automation Studio" 
          subtitle={data.workflow}
          icon={Bot}
          badge={status || 'Orchestrating'}
          badgeColor="indigo"
        >
          <div className="flex items-center gap-2">
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={quantumMode ? Zap : Sparkles} 
              onClick={() => setQuantumMode(!quantumMode)} 
              className={cn(quantumMode && "text-indigo-400")}
              title="QPPU Quantum Mode"
            />
            <SovereignButton 
              variant={isRunning ? "secondary" : "primary"} 
              size="xs" 
              icon={isRunning ? Pause : Play} 
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause' : 'Run'}
            </SovereignButton>
            <SovereignButton variant="ghost" size="xs" icon={Settings} />
            <SovereignButton 
              variant="primary" 
              size="xs" 
              icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} 
              onClick={() => fullScreenHandlers[fullScreenMode === 'normal' ? 'expanded' : 'normal']()}
            >
              {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
            </SovereignButton>
          </div>
          {flowPulse > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20 ml-2">
              <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin-slow" />
              <span className="text-[10px] text-indigo-300 font-bold uppercase">Flow Manifesting</span>
            </div>
          )}
        </StudioHeader>

        {/* Sovereign Goal Input */}
        <div className="px-4 py-3 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center gap-3">
          <div className="flex-1 relative">
            <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
              placeholder="Automation Directive: e.g., 'Synthesize a self-healing neural pipeline for cross-studio telemetry'"
              className="w-full bg-[#050510] border border-indigo-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-indigo-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
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
            {isProcessingGoal ? 'Synthesizing...' : 'Manifest'}
          </SovereignButton>
        </div>

        {/* Lattice Sync Manifest Display */}
        {activeLatticeManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-indigo-400 font-bold uppercase">Lattice Sync Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">COH: {(activeLatticeManifest.coherenceScore * 100).toFixed(2)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">LAT: {activeLatticeManifest.syncLatency}ms</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Sync Resonances</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-indigo-950/20 border border-indigo-500/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeLatticeManifest.activeResonances / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300">{activeLatticeManifest.activeResonances} Units</span>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Lattice Integrity</p>
                <div className="space-y-1">
                  {activeLatticeManifest.latticeAlerts.slice(0, 2).map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span className="truncate">{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className={cn(
          fullScreenMode === 'cinema' ? "flex-1 p-8 overflow-auto" : "flex-1 p-8 space-y-4"
        )}>
           <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'System Load', value: `${systemLoad}%`, icon: Cpu, color: 'text-indigo-400', stat: 'systemLoad', setStat: setSystemLoad },
                { label: 'Throughput', value: `${qppuStats.throughput}k ops/s`, icon: Zap, color: 'text-amber-400', stat: 'throughput', setStat: setThroughput }
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-4">
                   <div className={cn("p-2 rounded-lg bg-zinc-900", stat.color)}>
                      <stat.icon size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">{stat.label}</p>
                      <p className="text-lg font-bold text-zinc-200 mt-1">{stat.value}</p>
                   </div>
                </div>
              ))}
              {quantumMode && (
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex items-center gap-4 col-span-2">
                   <div className="p-2 rounded-lg bg-indigo-900/50 text-indigo-400">
                      <Zap size={16} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">QPPU Engine</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-zinc-400 text-xs">Coh: <span className="text-indigo-300 font-bold">{qppuStats.coherence}%</span></span>
                        <span className="text-zinc-400 text-xs">Fi: <span className="text-indigo-300 font-bold">{qppuStats.fidelity}%</span></span>
                        <span className="text-zinc-400 text-xs">Dim: <span className="text-indigo-300 font-bold">{qppuStats.frames}</span></span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="space-y-3">
             {data.tasks.map((task) => (
               <motion.div 
                 key={task.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={cn(
                   "p-4 rounded-xl border flex items-center gap-4 transition-all",
                   task.status === 'active' ? "bg-indigo-500/5 border-indigo-500/20 shadow-lg shadow-indigo-500/5" : "bg-zinc-950 border-zinc-900"
                 )}
               >
                 <div className="flex-shrink-0">
                   {task.status === 'completed' ? (
                     <CheckCircle2 size={20} className="text-emerald-500" />
                   ) : task.status === 'active' ? (
                     <CircleDashed size={20} className="text-indigo-500 animate-spin-slow" />
                   ) : (
                     <CircleDashed size={20} className="text-zinc-800" />
                   )}
                 </div>

                 <div className="flex-1 space-y-2">
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-zinc-200">{task.name}</span>
                     <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{task.progress}%</span>
                   </div>
                   <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${task.progress}%` }}
                       className={cn(
                         "h-full rounded-full transition-all duration-1000",
                         task.status === 'completed' ? "bg-emerald-500" : "bg-indigo-500 shadow-[0_0_8px_#6366f1]"
                       )}
                     />
                   </div>
                 </div>
               </motion.div>
             ))}
           </div>
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Server size={12} className="text-zinc-600" />
                 <span className="text-[9px] font-mono text-zinc-500 uppercase">Nodes: <span className="text-zinc-200 font-bold">08</span></span>
              </div>
              <div className="flex items-center gap-2">
                 <Activity size={12} className="text-zinc-600" />
                 <span className="text-[9px] font-mono text-zinc-500 uppercase">Latency: <span className="text-zinc-200 font-bold">12ms</span></span>
              </div>
           </div>
           <div className="flex items-center gap-1">
              {[...Array(8)].map((_, i) => (
                  <motion.div 
                      key={i}
                      animate={{ scaleY: [1, 2, 1], opacity: [0.3, 0.7, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                      className={cn("w-1 h-3 rounded-full", quantumMode ? "bg-indigo-400" : "bg-indigo-500/40")}
                  />
              ))}
           </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
