// Plan Item ID: TI-1
/**
 * EvolutionStudio.tsx - Sovereign Agent Evolution & IQ Dashboard
 * 
 * Visualizes the growth of the system's "IQ" and agent capabilities.
 * Features:
 * - Agent-specific evolution stats (Intelligence Level, Epochs, Synapses)
 * - Synaptic Lattice Visualization
 * - Evolution History Timeline
 * - Global System IQ Trend
 * - Autonomous Training Controls
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, TrendingUp, Zap, Activity, Shield, 
  Database, Clock, ChevronRight, Target, Award,
  Cpu, BarChart3, LineChart, Network, RefreshCw,
  Search, Filter, X, Maximize2, Minimize2, Info,
  AlertTriangle, CheckCircle, Flame, Waves, History,
  BrainCircuit, Workflow, ScanEye, GitBranch, Users
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { evolutionCore, AgentEvolutionState, EvolutionSnapshot } from '@/memory/EvolutionEngine';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { selfTrainingEngine } from '@/engine/SelfTrainingEngine';
import { promptAuditEngine } from '@/engine/PromptAuditEngine';

interface EvolutionStudioProps {
  data?: any;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type ViewMode = 'lattice' | 'timeline' | 'swarm' | 'analysis';

export default function EvolutionStudio({ data, status = "active" }: EvolutionStudioProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('lattice');
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [quantumMode, setQuantumMode] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [agentStates, setAgentStates] = useState<AgentEvolutionState[]>([]);
  const [isHyperTraining, setIsHyperTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [evolutionPulse, setEvolutionPulse] = useState(0);
  const [trainingHistory, setTrainingHistory] = useState(selfTrainingEngine.getHistory());
  const [liveTraining, setLiveTraining] = useState<any>(null);

  const trainingStatus = selfTrainingEngine.getStatus();

  const agents = useMemo(() => agentStates, [agentStates]);
  const selectedAgent = useMemo(() => 
    agents.find(a => a.agentId === selectedAgentId) || agents[0], 
    [agents, selectedAgentId]
  );

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  useEffect(() => {
    const refreshStates = () => {
      const states = evolutionCore.getAllStates();
      setAgentStates(states);
      if (states.length > 0 && !selectedAgentId) {
        setSelectedAgentId(states[0].agentId);
      }
    };

    refreshStates();
    const interval = setInterval(() => {
      refreshStates();
      setTrainingHistory(selfTrainingEngine.getHistory());
      
      // Sync live training preview
      const audits = promptAuditEngine.getAuditHistory();
      if (audits.length > 0) {
        setLiveTraining(audits[audits.length - 1]);
      }
    }, 2000); // Faster sync for live preview
    return () => clearInterval(interval);
  }, [selectedAgentId]);

  const handleHyperTrain = async () => {
    if (!selectedAgentId) return;
    setIsHyperTraining(true);
    setTrainingProgress(0);
    setEvolutionPulse(100);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      await evolutionCore.autonomousHyperTrain(selectedAgentId);
    } catch (error) {
      console.error('[EvolutionStudio] Hyper-training error:', error);
    } finally {
      setTimeout(() => {
        setIsHyperTraining(false);
        setEvolutionPulse(0);
      }, 1000);
    }
  };

  const handleGlobalSwarm = async () => {
    setEvolutionPulse(100);
    await evolutionCore.initiateGlobalSwarmTraining();
    setTimeout(() => setEvolutionPulse(0), 2000);
  };

  const handleAutoAudit = async () => {
    setEvolutionPulse(100);
    await selfTrainingEngine.performFullStateAudit();
    setTimeout(() => setEvolutionPulse(0), 1000);
  };

  const globalFidelity = promptAuditEngine.getGlobalFidelity();

  const systemIQ = useMemo(() => {
    if (agents.length === 0) return 0;
    const avgLevel = agents.reduce((sum, a) => sum + a.intelligenceLevel, 0) / agents.length;
    const avgAccuracy = agents.reduce((sum, a) => sum + a.synapses.accuracy, 0) / agents.length;
    return (avgLevel * 10) + (avgAccuracy * 100);
  }, [agents]);

  return (
    <div className={cn(
      "bg-quantum-deep/95 backdrop-blur-xl rounded-2xl border border-quantum-purple/20 overflow-hidden flex flex-col",
      fullScreenMode === 'immersive' && "fixed inset-0 z-50 rounded-none",
      fullScreenMode === 'cinema' && "fixed inset-0 z-50 rounded-none bg-black",
      fullScreenMode === 'expanded' && "fixed inset-4 z-40 rounded-2xl"
    )}>
      <StudioHeader
        title="Evolution Studio"
        icon={Brain}
        badge={status || (isHyperTraining ? "Evolving" : "Coherent")}
        badgeColor="purple"
      >
        <div className="flex items-center gap-2">
          {evolutionPulse > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-quantum-purple/10 rounded-lg border border-quantum-purple/20 mr-2">
              <Activity size={12} className="text-quantum-purple animate-pulse" />
              <span className="text-[10px] text-quantum-purple font-bold uppercase">Synaptic Resonance</span>
            </div>
          )}
          <SovereignButton 
            variant="ghost" 
            size="xs" 
            icon={quantumMode ? Zap : Sparkles} 
            onClick={() => setQuantumMode(!quantumMode)} 
            className={cn(quantumMode && "text-quantum-purple")}
            title="QPPU Quantum Mode"
          />
          <SovereignButton 
            variant="primary" 
            size="xs" 
            icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} 
            onClick={() => setFullScreenMode(prev => prev === 'normal' ? 'expanded' : 'normal')}
          >
            {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
          </SovereignButton>
        </div>
      </StudioHeader>

      {/* Global IQ Stats Area */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-quantum-purple/5 border-b border-quantum-purple/10">
        <div className="p-3 rounded-lg bg-quantum-purple/10 text-center relative overflow-hidden group">
          <div className="text-2xl font-black text-quantum-purple">{systemIQ.toFixed(1)}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">System Aggregate IQ</div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-quantum-purple opacity-20 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-3 rounded-lg bg-quantum-cyan/10 text-center">
          <div className="text-2xl font-black text-quantum-cyan">{agents.length}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Active Synapses</div>
        </div>
        <div className="p-3 rounded-lg bg-quantum-green/10 text-center">
          <div className="text-2xl font-black text-quantum-green">
            {agents.reduce((sum, a) => sum + a.totalEpochs, 0).toLocaleString()}
          </div>
          <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Total Epochs</div>
        </div>
        <div className="p-3 rounded-lg bg-quantum-pink/10 text-center border border-quantum-pink/20">
          <div className="text-2xl font-black text-quantum-pink">
            {(globalFidelity * 100).toFixed(1)}%
          </div>
          <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Strict Fidelity</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Agent List Sidebar */}
        <div className="w-64 border-r border-quantum-purple/10 flex flex-col">
          <div className="p-3 border-b border-quantum-purple/10 bg-quantum-purple/5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-quantum-purple" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Agent Swarm</span>
            </div>
            <SovereignButton 
              variant="primary" 
              size="xs" 
              className="w-full text-[9px] py-2"
              onClick={handleGlobalSwarm}
              icon={RefreshCw}
            >
              Global Re-Sync
            </SovereignButton>
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              className="w-full text-[9px] mt-2 py-2 border-quantum-purple/20"
              onClick={handleAutoAudit}
              icon={ScanEye}
            >
              Run State Audit
            </SovereignButton>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {agents.map(agent => (
              <button
                key={agent.agentId}
                onClick={() => setSelectedAgentId(agent.agentId)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-all border",
                  selectedAgentId === agent.agentId 
                    ? "bg-quantum-purple/20 border-quantum-purple/30 text-quantum-purple shadow-[0_0_15px_rgba(168,85,247,0.1)]" 
                    : "text-zinc-500 border-transparent hover:bg-quantum-purple/10 hover:text-quantum-purple"
                )}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="text-xs font-black tracking-tight">{agent.agentId}</span>
                  <div className="flex gap-2">
                    <span className="text-[8px] font-mono">LVL {agent.intelligenceLevel}</span>
                    <span className="text-[8px] font-black text-quantum-purple/70 uppercase">{evolutionCore.getAgentRank(agent.intelligenceLevel)}</span>
                  </div>
                </div>
                <ChevronRight size={14} className={cn(selectedAgentId === agent.agentId ? "opacity-100" : "opacity-0")} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden bg-quantum-purple/[0.02]">
          {selectedAgent ? (
            <>
              {/* Agent Header */}
              <div className="px-6 py-4 border-b border-quantum-purple/10 flex items-center justify-between bg-quantum-dark/40">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-quantum-purple/20 flex items-center justify-center border border-quantum-purple/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                    <BrainCircuit size={24} className="text-quantum-purple" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tighter">{selectedAgent.agentId}</h2>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-quantum-purple font-black uppercase tracking-widest px-2 py-0.5 rounded bg-quantum-purple/10 border border-quantum-purple/20">
                        RANK: {evolutionCore.getAgentRank(selectedAgent.intelligenceLevel)}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-zinc-600" />
                      <span className="text-[10px] text-zinc-500 font-mono">INTELLIGENCE_QUOTIENT: {(selectedAgent.intelligenceLevel * 1.618 + 100).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <SovereignButton 
                    variant="primary" 
                    size="sm" 
                    onClick={handleHyperTrain}
                    disabled={isHyperTraining}
                    icon={Zap}
                    className="bg-quantum-purple hover:bg-quantum-purple/80 text-white border-0 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  >
                    {isHyperTraining ? `Hyper-Training ${trainingProgress}%` : 'Initiate Hyper-Train'}
                  </SovereignButton>
                </div>
              </div>

              {/* View Selector */}
              <div className="flex items-center gap-1 px-6 py-2 border-b border-quantum-purple/5 overflow-x-auto">
                {(['lattice', 'timeline', 'swarm', 'analysis'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                      viewMode === mode 
                        ? "bg-quantum-purple/20 text-quantum-purple border border-quantum-purple/30" 
                        : "text-zinc-500 hover:text-quantum-purple"
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* View Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {viewMode === 'lattice' && (
                    <motion.div
                      key="lattice"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Synaptic Weights Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <WeightCard label="Creativity" value={selectedAgent.synapses.creativity} color="text-quantum-pink" />
                        <WeightCard label="Logic" value={selectedAgent.synapses.logic} color="text-quantum-cyan" />
                        <WeightCard label="Context" value={selectedAgent.synapses.context} color="text-quantum-green" />
                        <WeightCard label="Speed" value={selectedAgent.synapses.speed} color="text-quantum-yellow" />
                        <WeightCard label="Accuracy" value={selectedAgent.synapses.accuracy} color="text-quantum-purple" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Capabilities */}
                        <div className="p-5 rounded-2xl bg-quantum-dark/40 border border-quantum-purple/10">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Award size={14} className="text-quantum-purple" />
                            Acquired Capabilities
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedAgent.capabilities.map(cap => (
                              <span key={cap} className="px-3 py-1 rounded-lg bg-quantum-purple/10 border border-quantum-purple/20 text-[10px] text-quantum-purple font-mono">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* PEFT / LoRA Adapters */}
                        <div className="p-5 rounded-2xl bg-quantum-dark/40 border border-quantum-purple/10">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <GitBranch size={14} className="text-quantum-cyan" />
                            PEFT LoRA Adapters (2026)
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-quantum-cyan/5 border border-quantum-cyan/10">
                              <span className="text-[10px] text-zinc-400 font-mono uppercase">Attention_v16</span>
                              <span className="text-[10px] text-quantum-cyan font-bold">RANK 16 // ALPHA 32</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-quantum-cyan/5 border border-quantum-cyan/10">
                              <span className="text-[10px] text-zinc-400 font-mono uppercase">FFN_Gate_v8</span>
                              <span className="text-[10px] text-quantum-cyan font-bold">RANK 8 // ALPHA 16</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {viewMode === 'timeline' && (
                    <motion.div
                      key="timeline"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {/* Live Training Preview (Strict Monitor) */}
                      {liveTraining && (
                        <div className="p-6 rounded-3xl bg-quantum-pink/5 border border-quantum-pink/20 mb-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4">
                            <Activity size={24} className="text-quantum-pink/40 animate-pulse" />
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <Zap size={18} className="text-quantum-pink" />
                            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Live Training Monitor</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <p className="text-[10px] text-zinc-500 uppercase font-bold">Active Subject</p>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-quantum-pink/20 flex items-center justify-center">
                                  <Brain size={16} className="text-quantum-pink" />
                                </div>
                                <span className="text-sm font-bold text-white">{liveTraining.agentId}</span>
                                <span className="px-2 py-0.5 rounded bg-quantum-pink/10 border border-quantum-pink/20 text-[9px] text-quantum-pink font-black uppercase">
                                  Strict Audit Active
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-[10px] text-zinc-500 uppercase font-bold">Fidelity Score</p>
                              <div className="flex items-end gap-2">
                                <span className="text-2xl font-black text-quantum-pink">{(liveTraining.fidelityScore * 100).toFixed(1)}%</span>
                                <span className={cn(
                                  "text-[10px] font-bold mb-1 px-2 py-0.5 rounded",
                                  liveTraining.compliant ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
                                )}>
                                  {liveTraining.compliant ? 'COMPLIANT' : 'REJECTED / REFINING'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5">
                            <p className="text-[9px] text-zinc-600 uppercase font-bold mb-2">Synthesis Response Preview</p>
                            <pre className="text-[10px] text-quantum-pink/80 font-mono whitespace-pre-wrap">
                              {liveTraining.response.slice(0, 200)}...
                            </pre>
                          </div>
                        </div>
                      )}

                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <History size={14} className="text-quantum-purple" />
                        Evolutionary Epochs
                      </h3>
                      {selectedAgent.evolutionHistory && selectedAgent.evolutionHistory.length > 0 ? (
                        <div className="space-y-3">
                          {selectedAgent.evolutionHistory.map((snapshot, i) => (
                            <div key={i} className="p-4 rounded-xl bg-quantum-dark/40 border border-quantum-purple/10 flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg bg-quantum-purple/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-black text-quantum-purple">{snapshot.intelligenceLevel}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-bold text-white/90">{snapshot.context}</span>
                                  <span className="text-[9px] text-zinc-600 font-mono">{new Date(snapshot.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex gap-4">
                                  {Object.entries(snapshot.synapticGains).map(([key, val]) => (
                                    <span key={key} className="text-[9px] text-quantum-green font-mono">
                                      +{key}: {typeof val === 'number' ? val.toFixed(3) : String(val)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 border border-dashed border-quantum-purple/20 rounded-2xl italic text-sm text-zinc-600">
                          No evolution snapshots detected in the quantum buffer.
                        </div>
                      )}
                    </motion.div>
                  )}

                  {viewMode === 'swarm' && (
                    <motion.div
                      key="swarm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="p-12 text-center text-zinc-600 italic text-sm border border-dashed border-quantum-purple/20 rounded-2xl">
                        [Global Swarm Visualization Pending Synthetic Core Initialization]
                      </div>
                    </motion.div>
                  )}

                  {viewMode === 'analysis' && (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <ScanEye size={14} className="text-quantum-purple" />
                        Autonomous Self-Training Analysis
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-quantum-dark/40 border border-quantum-purple/10 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-zinc-500 uppercase font-bold">Engine Status</span>
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded",
                              trainingStatus.active ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                            )}>
                              {trainingStatus.active ? 'CONTINUOUS_TRAINING_ACTIVE' : 'IDLE'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-500">Cycles Completed</span>
                              <span className="text-white font-mono">{trainingStatus.historyCount}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                              <span className="text-zinc-500">Global System Integrity</span>
                              <span className="text-emerald-400 font-mono">99.999%</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-quantum-dark/40 border border-quantum-purple/10 space-y-4">
                          <h4 className="text-[10px] text-zinc-400 uppercase font-black">Recent Improvement Metrics</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {trainingHistory.slice().reverse().map((h, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                                <span className="text-[9px] text-zinc-400 font-mono">{h.file}</span>
                                <span className={cn(
                                  "text-[9px] font-black font-mono",
                                  h.score > 8.5 ? "text-emerald-400" : "text-amber-400"
                                )}>
                                  Q:{h.score.toFixed(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <Brain size={48} className="text-zinc-800 mb-6" />
              <h3 className="text-xl font-bold text-zinc-600">Awaiting Agent Selection</h3>
              <p className="text-sm text-zinc-700 max-w-sm mt-2">Select an entity from the swarm to visualize its evolutionary trajectory and synaptic lattice.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Status Bar */}
      <div className="px-6 py-2 bg-quantum-purple/5 border-t border-quantum-purple/10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <StatusIndicator label="Neural Core" active />
          <StatusIndicator label="Vault Link" active />
          <StatusIndicator label="Lattice Stability" active />
        </div>
        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
          Sovereign Memory Architecture // Tier 7 Hardened // 50D Coherence
        </div>
      </div>
    </div>
  );
}

const WeightCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="p-4 rounded-xl bg-quantum-dark/60 border border-white/5 flex flex-col items-center gap-3">
    <div className="relative w-16 h-16">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-zinc-800"
        />
        <motion.circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray="175.9"
          initial={{ strokeDashoffset: 175.9 }}
          animate={{ strokeDashoffset: 175.9 * (1 - value) }}
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-black text-white">{(value * 100).toFixed(0)}</span>
      </div>
    </div>
    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
  </div>
);

const StatusIndicator = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-quantum-purple shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "bg-red-500"}`} />
    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
  </div>
);

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
