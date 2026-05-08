import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, CheckCircle2, CircleDashed, Activity, Server, Zap, Cpu, 
  Pause, Settings, Play, Plus, GitBranch, Zap as ZapFast, 
  Brain, Network, Radio, MessageSquare, Target, Sparkles,
  Clock, AlertTriangle, RefreshCw, Eye, X, ChevronRight,
  Workflow, Layers, Radio as RadioIcon, Cpu as CpuIcon, Code
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { AutomationData } from '@/types';
import { sovereignAutomaton } from '@/features/automation/engines/SovereignAutomatonEngine';
import {
  LatticeWorkflow, 
  LatticeNode, 
  SovereignExecutionState,
  type LivePulseView as LivePulseViewType,
  LatticeVisualization,
  GoalInput,
  NeuralPulseTrigger
} from '@/features/automation/types/sovereign-types';

interface AutomationDashboardProps {
  data?: AutomationData;
  status?: string;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT DATA
// ═══════════════════════════════════════════════════════════════

const DEFAULT_AUTOMATION: AutomationData = {
  workflow: "Neural Pipeline Alpha",
  tasks: [
    { id: '1', name: "Synthesizing DNA Substrate", progress: 65, status: 'active' },
    { id: '2', name: "Calibrating Photonic Lattice", progress: 100, status: 'completed' },
    { id: '3', name: "Initializing Agentic Handshake", progress: 0, status: 'pending' },
  ]
};

// ═══════════════════════════════════════════════════════════════
// LATTICE NODE VISUALIZATION COMPONENT
// ═══════════════════════════════════════════════════════════════

const LatticeNodeVisual: React.FC<{ node: LatticeNode; isActive: boolean; activity: number }> = ({ node, isActive, activity }) => {
  const typeColors: Record<string, string> = {
    'a2a-call': 'bg-purple-500/20 border-purple-500/50',
    'angeh-script': 'bg-indigo-500/20 border-indigo-500/50',
    'neural-trigger': 'bg-amber-500/20 border-amber-500/50',
    'synthetic-branch': 'bg-emerald-500/20 border-emerald-500/50',
    'quantum-state': 'bg-cyan-500/20 border-cyan-500/50',
    'memory-sync': 'bg-blue-500/20 border-blue-500/50',
    'validation-gate': 'bg-rose-500/20 border-rose-500/50',
  };

  const typeIcons: Record<string, React.ReactNode> = {
    'a2a-call': <Network size={14} />,
    'angeh-script': <Code size={14} />,
    'neural-trigger': <RadioIcon size={14} />,
    'synthetic-branch': <GitBranch size={14} />,
    'quantum-state': <ZapFast size={14} />,
    'memory-sync': <Layers size={14} />,
    'validation-gate': <CheckCircle2 size={14} />,
  };

  const glowIntensity = Math.min(activity * 2, 1);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ 
        scale: 1,
        boxShadow: glowIntensity > 0 ? `0 0 ${glowIntensity * 20}px rgba(99, 102, 241, ${glowIntensity})` : 'none'
      }}
      className={cn(
        "absolute p-3 rounded-xl border-2 transition-all cursor-pointer",
        typeColors[node.type] || 'bg-zinc-800/50 border-zinc-700',
        (isActive || activity > 0.1) && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#02020a]",
        node.status === 'completed' && "opacity-60"
      )}
      style={{ 
        left: node.position.x, 
        top: node.position.y,
        minWidth: '130px'
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-zinc-400">{typeIcons[node.type]}</span>
        <span className="text-[10px] font-bold text-zinc-300 uppercase">{node.type}</span>
      </div>
      <p className="text-xs font-medium text-zinc-100 truncate">{node.name}</p>
      {(node.status === 'executing' || activity > 0) && (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 - glowIntensity }}
          className="absolute -top-1 -right-1"
        >
          <CircleDashed size={12} className="text-indigo-500" />
        </motion.div>
      )}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LIVE PULSE VISUALIZATION
// ═══════════════════════════════════════════════════════════════

const LivePulseView: React.FC<{ pulseData: LivePulseViewType }> = ({ pulseData }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Pulse</span>
        <div className="flex items-center gap-1">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
          <span className="text-[9px] font-mono text-emerald-500">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <p className="text-[9px] text-zinc-500 uppercase">Active Handshakes</p>
          <p className="text-lg font-bold text-purple-400">{pulseData.activeHandshakes.length}</p>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <p className="text-[9px] text-zinc-500 uppercase">Messages/s</p>
          <p className="text-lg font-bold text-cyan-400">{pulseData.recentMessages.length}</p>
        </div>
      </div>

      {pulseData.activeHandshakes.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] text-zinc-500 uppercase">Recent Handshakes</p>
          {pulseData.activeHandshakes.slice(0, 3).map((handshake, idx) => (
            <motion.div
              key={handshake.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Network size={12} className="text-purple-400" />
                <span className="text-[10px] text-zinc-300">{handshake.fromAgent}</span>
                <ChevronRight size={10} className="text-zinc-600" />
                <span className="text-[10px] text-zinc-300">{handshake.toAgent}</span>
              </div>
              <span className="text-[9px] text-purple-400 uppercase">{handshake.status}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// GOAL INPUT BAR COMPONENT
// ═══════════════════════════════════════════════════════════════

const GoalInputBar: React.FC<{ onSubmit: (goal: GoalInput) => void }> = ({ onSubmit }) => {
  const [goal, setGoal] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!goal.trim()) return;
    
    setIsProcessing(true);
    await onSubmit({ 
      text: goal, 
      priority: 'high',
      context: {} 
    });
    setGoal('');
    setIsProcessing(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 focus-within:border-indigo-500/50 transition-colors">
        <Sparkles size={16} className="text-indigo-400" />
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Describe your automation goal in natural language..."
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={isProcessing || !goal.trim()}
          className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/50 hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <RefreshCw size={14} className="text-indigo-400" />
            </motion.div>
          ) : (
            <ZapFast size={14} className="text-indigo-400" />
          )}
        </motion.button>
      </div>
      <p className="text-[9px] text-zinc-600 mt-1 ml-1">
        Try: "When Music Studio detects quantum preset, generate matching 3D environment"
      </p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// NEURAL TRIGGER PANEL
// ═══════════════════════════════════════════════════════════════

const NeuralTriggerPanel: React.FC<{ triggers: NeuralPulseTrigger[] }> = ({ triggers }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <RadioIcon size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-zinc-300">Neural Triggers</span>
        </div>
        <span className="text-[10px] text-amber-400">{triggers.filter(t => t.enabled).length} active</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {triggers.map((trigger, idx) => (
              <div
                key={trigger.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  trigger.enabled 
                    ? "bg-amber-500/5 border-amber-500/20" 
                    : "bg-zinc-900/30 border-zinc-800"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-zinc-200">{trigger.name}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    trigger.enabled ? "bg-amber-500 animate-pulse" : "bg-zinc-700"
                  )} />
                </div>
                <p className="text-[10px] text-zinc-500">{trigger.eventType} from {trigger.sourceStudio}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════

export const AutomationDashboard: React.FC<AutomationDashboardProps> = ({ data: externalData, status }) => {
  const [data, setData] = useState<AutomationData>(externalData || DEFAULT_AUTOMATION);
  const [viewMode, setViewMode] = useState<'tasks' | 'lattice' | 'pulse'>('tasks');
  const [workflows, setWorkflows] = useState<LatticeWorkflow[]>([]);
  const [livePulse, setLivePulse] = useState<LivePulseViewType | null>(null);
  const [neuralTriggers, setNeuralTriggers] = useState<NeuralPulseTrigger[]>([]);
  const [isEngineReady, setIsEngineReady] = useState(false);

  // Initialize the engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        const allWorkflows = await sovereignAutomaton.getAllWorkflows();
        setWorkflows(allWorkflows);
        
        const triggers = sovereignAutomaton.getNeuralTriggers();
        setNeuralTriggers(triggers);
        
        setIsEngineReady(true);
        console.log('[AutomationDashboard] Engine ready');
      } catch (error) {
        console.error('[AutomationDashboard] Engine initialization error:', error);
      }
    };

    initEngine();

    // Refresh live data periodically
    const interval = setInterval(() => {
      setLivePulse(sovereignAutomaton.getLivePulseView());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleGoalSubmit = useCallback(async (goal: GoalInput) => {
    console.log('[AutomationDashboard] Processing goal:', goal.text);
    
    try {
      const result = await sovereignAutomaton.executeFromGoal(goal);
      console.log('[AutomationDashboard] Synthesis result:', result);
      
      if (result.success) {
        const allWorkflows = await sovereignAutomaton.getAllWorkflows();
        setWorkflows(allWorkflows);
      }
    } catch (error) {
      console.error('[AutomationDashboard] Goal processing error:', error);
    }
  }, []);

  return (
    <div className="w-full bg-[#02020a] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl h-[700px]">
      {/* Header */}
      <StudioHeader 
        title="Sovereign Automaton" 
        subtitle={data.workflow}
        icon={Bot}
        badge={status || isEngineReady ? 'Lattice Active' : 'Initializing'}
        badgeColor="indigo"
      >
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900/50 rounded-lg p-0.5">
            {[
              { key: 'tasks', icon: Target, label: 'Tasks' },
              { key: 'lattice', icon: Layers, label: 'Lattice' },
              { key: 'pulse', icon: RadioIcon, label: 'Pulse' },
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as any)}
                className={cn(
                  "p-2 rounded-md flex items-center gap-2 transition-all",
                  viewMode === mode.key 
                    ? "bg-indigo-500/20 text-indigo-400" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <mode.icon size={14} />
                <span className="text-[10px] font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
          <SovereignButton variant="secondary" size="xs" icon={Pause}>Pause</SovereignButton>
          <SovereignButton variant="ghost" size="xs" icon={Settings} />
        </div>
      </StudioHeader>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Goal Input Bar - Always visible */}
        <div className="p-4 border-b border-zinc-800">
          <GoalInputBar onSubmit={handleGoalSubmit} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Neural Load', value: '42%', icon: Cpu, color: 'text-indigo-400' },
                    { label: 'Data Throughput', value: '12.8k ops/s', icon: Zap, color: 'text-amber-400' },
                    { label: 'Active Workflows', value: workflows.length.toString(), icon: Workflow, color: 'text-purple-400' },
                    { label: 'Executions/min', value: '24', icon: ZapFast, color: 'text-cyan-400' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-900 group hover:border-indigo-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl bg-zinc-900/50 border border-zinc-800", stat.color)}>
                          <stat.icon size={16} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">{stat.label}</p>
                          <p className="text-lg font-black text-zinc-200 mt-1">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tasks List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Manifest</span>
                    <span className="text-[9px] font-mono text-zinc-600 tracking-tighter">V3.0.0 // SOVEREIGN_LATTICE</span>
                  </div>
                  {data.tasks.map((task, idx) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5",
                        task.status === 'active' ? "bg-indigo-500/5 border-indigo-500/20 shadow-lg shadow-indigo-500/5" : "bg-zinc-950/40 border-zinc-900"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          </div>
                        ) : task.status === 'active' ? (
                          <CircleDashed size={16} className="text-indigo-500 animate-spin-slow" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
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
                              task.status === 'completed' ? "bg-emerald-500" : "bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                            )}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Neural Triggers */}
                <NeuralTriggerPanel triggers={neuralTriggers} />
              </motion.div>
            )}

            {viewMode === 'lattice' && (
              <motion.div
                key="lattice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <div className="h-full bg-zinc-950/30 rounded-2xl border border-zinc-800 p-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Lattice</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-600">Nodes: {workflows.reduce((acc, w) => acc + w.nodes.length, 0)}</span>
                      </div>
                    </div>

                    {workflows.length > 0 ? (
                      <div className="relative h-[400px]">
                        {workflows[0]?.nodes.map((node, idx) => (
                          <LatticeNodeVisual
                            key={node.id}
                            node={node}
                            isActive={node.status === 'executing'}
                            activity={livePulse?.nodeActivity[node.id] || 0}
                          />
                        ))}
                        {workflows[0]?.connections.map((conn, idx) => {
                          const source = workflows[0].nodes.find(n => n.id === conn.sourceId);
                          const target = workflows[0].nodes.find(n => n.id === conn.targetId);
                          if (!source || !target) return null;
                          
                          const isActive = livePulse?.nodeActivity[source.id] > 0 || livePulse?.nodeActivity[target.id] > 0;

                          return (
                            <motion.div
                              key={idx}
                              animate={{ 
                                opacity: isActive ? [0.2, 0.8, 0.2] : 0.2,
                                height: isActive ? 2 : 1
                              }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className={cn(
                                "absolute bg-indigo-500/30 origin-left",
                                isActive && "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"
                              )}
                              style={{
                                left: source.position.x + 130,
                                top: source.position.y + 25,
                                width: Math.sqrt(Math.pow(target.position.x - source.position.x - 130, 2) + Math.pow(target.position.y - source.position.y, 2)),
                                transform: `rotate(${Math.atan2(target.position.y - source.position.y, target.position.x - source.position.x - 130)}rad)`
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500">
                        <Brain size={48} className="mb-4 opacity-30" />
                        <p className="text-sm">No lattice workflows yet</p>
                        <p className="text-[10px] text-zinc-600 mt-1">Use the goal input above to synthesize one</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'pulse' && (
              <motion.div
                key="pulse"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {livePulse ? (
                  <LivePulseView pulseData={livePulse} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-zinc-500">
                    <RadioIcon size={48} className="mb-4 opacity-30 animate-pulse" />
                    <p className="text-sm">Initializing pulse monitor...</p>
                  </div>
                )}

                {/* Execution History */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Recent Activity</span>
                  {workflows.slice(0, 3).map((workflow, idx) => (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10">
                          <Workflow size={14} className="text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-200">{workflow.name}</p>
                          <p className="text-[9px] text-zinc-500">{workflow.nodes.length} nodes • v{workflow.version}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-zinc-600" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Server size={14} className="text-zinc-600" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
              Lattice_Nodes: <span className="text-zinc-300 font-bold">{workflows.reduce((acc, w) => acc + w.nodes.length, 0)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-zinc-600" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
              Heartbeat: <span className="text-emerald-500 font-bold">SYNC</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CpuIcon size={14} className="text-zinc-600" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">
              Mode: <span className="text-purple-400 font-bold">SOVEREIGN</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(12)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ height: [4, 12, 4], opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
              className="w-1 bg-indigo-500/50 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutomationDashboard;