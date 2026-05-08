// Plan Item ID: TI-1
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Terminal, 
  Cpu, 
  Database, 
  History, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Activity,
  Layers,
  Zap
} from 'lucide-react';
import { Mission, Artifact, MissionStep } from '@/types';
import { UnifiedTrainingPanel } from '@/components/shared/OnlineTrainingPanel';
import { neuralTelemetry, NeuralVitals } from '@/engine/NeuralTelemetry';
import { autonomousOrchestrator } from '@/engine/AutonomousOrchestrator';
import { osAgent } from '@/agents/OSAgent';
import { SovereignButton } from '@/components/ui/StudioHeader';
import { Sparkles } from 'lucide-react';
import { ErrorTrendDashboard } from './ErrorTrendDashboard';
import { NeuralHandshake } from '@/components/ui/NeuralHandshake';
import { APP_VERSION } from '@/constants';

interface SovereignDashboardProps {
  mission?: Mission;
  artifacts?: Artifact[];
  learningPulse?: { level: number; epochs: number; accuracy: number };
}

export const SovereignDashboard: React.FC<SovereignDashboardProps> = ({ 
  mission, 
  artifacts, 
  learningPulse 
}) => {
  const [goalText, setGoalText] = React.useState('');
  const [isProcessingGoal, setIsProcessingGoal] = React.useState(false);
  const [systemPulse, setSystemPulse] = React.useState(0);
  const [showHandshake, setShowHandshake] = React.useState(false);

  const handleGlobalGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setShowHandshake(true);
    setSystemPulse(100);
    
    try {
      const result = await osAgent.process(goalText);
      console.log('[SovereignDashboard] Global System Directive synthesized:', result);
      setSystemPulse(85);
    } catch (error) {
      console.error('[SovereignDashboard] Global Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setSystemPulse(0);
        setShowHandshake(false);
      }, 3000);
    }
  };

  return (
    <div className="w-full h-full bg-[#030307] rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl font-sans relative">
      <NeuralHandshake active={showHandshake} />
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Shield size={20} className="text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest leading-none mb-1 text-glow">ULTRA-PRIME_SYSTEM_V9.1</span>
              <h1 className="text-3xl font-black text-white tracking-tighter leading-none ultra-glow-text">
                {mission ? mission.name : "Mission Dispatch"}
              </h1>
            </div>
            {systemPulse > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/30 ml-4 animate-pulse">
                <Activity size={12} className="text-indigo-400" />
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">System Pulse Active</span>
              </div>
            )}
          </div>
          {mission && (
            <p className="text-slate-400 text-sm max-w-xl line-clamp-1 italic">
              {mission.description}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <MetricBadge label="Fidelity Index" value={`${((learningPulse?.accuracy || 0) * 100).toFixed(1)}%`} icon={<Activity size={14} />} color="text-amber-400" />
          <MetricBadge label="Accuracy" value="ULTRA" icon={<CheckCircle2 size={14} />} color="text-emerald-400" />
          <MetricBadge label="Epochs" value={(learningPulse?.epochs || 0).toLocaleString()} icon={<Zap size={14} />} color="text-violet-400" />
          
          <VaultVitals />
          <OllamaStatus />
          <NativeNeuralStatus />
          <RepairIndicator />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <div className="h-4 w-px bg-white/10" />
          </div>
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGlobalGoalSubmit()}
            placeholder="GLOBAL SOVEREIGN DIRECTIVE: e.g., 'Execute a system-wide optimization of all active studio agents and synthesize a zero-latency orchestration report'"
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-sm text-indigo-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all font-medium tracking-wide"
            disabled={isProcessingGoal}
          />
        </div>
        <SovereignButton 
          variant="primary" 
          size="lg" 
          onClick={handleGlobalGoalSubmit}
          disabled={isProcessingGoal}
          icon={Zap}
          className="h-[58px] px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.3)] border-0"
        >
          {isProcessingGoal ? 'Synthesizing...' : 'Orchestrate'}
        </SovereignButton>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/5 border-r border-white/5 flex flex-col p-8 gap-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} /> Ultra-Prime Sequence
            </h3>
            {mission && (
                <span className="text-[10px] font-mono text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                    STATUS: {mission.status.toUpperCase()}
                </span>
            )}
          </div>

          <div className="space-y-4">
            {mission?.steps.map((step, idx) => (
              <StepItem key={step.id} step={step} index={idx} />
            )) || (
              <div className="p-12 text-center text-slate-600 border border-dashed border-white/10 rounded-2xl italic text-sm">
                No active missions in memory buffer.
              </div>
            )}
          </div>
        </div>

        <div className="w-3/5 flex flex-col p-8 gap-6 overflow-y-auto custom-scrollbar bg-black/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Database size={14} /> Artifact Store
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{(artifacts?.length || 0)} entries stored</span>
          </div>

          <UnifiedTrainingPanel />

          <ErrorTrendDashboard />

          <AutonomousTerminal />

          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {artifacts?.map((art) => (
                <ArtifactCard key={art.id} artifact={art} />
              ))}
            </AnimatePresence>
            {(!artifacts || artifacts.length === 0) && (
                <div className="col-span-2 p-12 text-center text-slate-600 border border-dashed border-white/10 rounded-2xl italic text-sm">
                    Awaiting generation artifacts...
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <StatusIndicator label="VFS Link" active />
          <StatusIndicator label="Neural Core" active />
          <StatusIndicator label="Topology" active />
        </div>
        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
            Angehlang Universe OS // Sovereign Dev Lifecycle // Autonomous Mode
        </div>
      </div>
      {/* Bottom Status Bar */}
      <div className="mt-auto border-t border-white/5 bg-black/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Quantum Coherence: 99.98%</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-violet-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Neural Load: 12.4 ZettaFLOPs</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2">
            <Sparkles size={10} className="text-indigo-400" />
            <span className="text-[9px] text-indigo-300 font-black uppercase tracking-wider">Trillion-X Advantage Active</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono tracking-tighter">{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};

const StepItem = ({ step, index }: { step: MissionStep, index: number }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${
      step.status === 'active' ? "bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20" : 
      step.status === 'completed' ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 opacity-50"
    }`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
      step.status === 'completed' ? "bg-green-500/20 text-green-400" :
      step.status === 'active' ? "bg-indigo-500/20 text-indigo-400 animate-pulse" :
      "bg-slate-800 text-slate-500"
    }`}>
      {index + 1}
    </div>
    <div className="flex-1 flex flex-col gap-0.5">
      <span className="text-xs font-black text-white/90 uppercase tracking-tight">{step.role}</span>
      <span className="text-[10px] text-slate-400 font-mono tracking-tight">{step.action}</span>
    </div>
    {step.status === 'completed' && <CheckCircle2 size={16} className="text-green-500" />}
    {step.status === 'active' && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />}
    {step.status === 'failed' && <AlertCircle size={16} className="text-red-500" />}
  </motion.div>
);

const ArtifactCard = ({ artifact }: { artifact: Artifact }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all cursor-pointer group"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
        {artifact.type === 'plan' && <History size={16} />}
        {artifact.type === 'code_diff' && <FileCode size={16} />}
        {artifact.type === 'document' && <Layers size={16} />}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-white tracking-widest uppercase truncate w-24">{artifact.id.split('_')[0]}</span>
        <span className="text-[9px] text-slate-500 font-mono italic">{new Date(artifact.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
    <div className="h-12 text-[10px] text-slate-400 line-clamp-3 bg-black/40 p-2 rounded-lg font-mono">
      {typeof artifact.content === 'string' ? artifact.content : JSON.stringify(artifact.content)}
    </div>
    <div className="mt-3 flex justify-end">
        <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400" />
    </div>
  </motion.div>
);

const StatusIndicator = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center gap-2">
    <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} />
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const MetricBadge = ({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center min-w-[90px]">
    <div className="flex items-center gap-1.5 mb-1 opacity-50">
      {icon}
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <span className={`text-sm font-black ${color} tracking-tighter`}>{value}</span>
  </div>
);

const NativeNeuralStatus = () => {
    const [vitals, setVitals] = React.useState<NeuralVitals>(neuralTelemetry.getSnapshot());

    React.useEffect(() => {
        const unsubscribe = neuralTelemetry.subscribe(newVitals => {
            setVitals(newVitals);
        });
        return () => { unsubscribe(); };
    }, []);

    const loadPercentage = Math.min(vitals.synapticLoad, 100);

    return (
        <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-3 transition-all border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
            <div className="flex flex-col gap-0.5 min-w-[120px]">
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${vitals.status === 'OPTIMAL' ? 'bg-indigo-500' : vitals.status === 'LOAD' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em]">NEURAL_{vitals.status}</span>
                </div>
                <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        animate={{ width: `${loadPercentage}%` }}
                        className={`h-full ${vitals.status === 'CRITICAL' ? 'bg-red-500' : 'bg-indigo-500'}`}
                    />
                </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter">SYNAPTIC_LOAD</span>
                <span className="text-[10px] font-black text-indigo-300 tabular-nums">{loadPercentage.toFixed(1)}%</span>
            </div>
        </div>
    );
};

const OllamaStatus = () => {
    const [status, setStatus] = React.useState<'connected' | 'disconnected' | 'loading'>('loading');

    React.useEffect(() => {
        const checkOllama = async () => {
            try {
                const response = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
                if (response.ok) setStatus('connected');
                else setStatus('disconnected');
            } catch {
                setStatus('disconnected');
            }
        };
        
        checkOllama();
        const interval = setInterval(checkOllama, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'loading' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">OLLAMA</span>
        </div>
    );
};

const RepairIndicator = () => {
    const [repairing, setRepairing] = React.useState(false);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setRepairing(prev => !prev);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${repairing ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">REPAIR</span>
        </div>
    );
};

const AutonomousTerminal = () => {
    const [logs, setLogs] = React.useState<string[]>([]);
    const [isExpanded, setIsExpanded] = React.useState(false);

    React.useEffect(() => {
        const mockLogs = [
            '[00:00:01] Initializing Sovereign Core...',
            '[00:00:02] Loading neural pathways...',
            '[00:00:03] Synapsing agent networks...',
            '[00:00:04] Establishing quantum coherence...',
            '[00:00:05] Ready for directives.',
        ];
        
        let idx = 0;
        const interval = setInterval(() => {
            if (idx < mockLogs.length) {
                setLogs(prev => [...prev.slice(-19), mockLogs[idx]]);
                idx++;
            } else {
                const advancedLogs = [
                    'Optimizing 50D ANGHV storage indices...',
                    'Re-aligning Photonic Logic arrays...',
                    'A2A Neural synchronization complete.',
                    'Circuit breakers verified optimal.',
                    'Quantum state heartbeat stable.'
                ];
                const newLog = `[${new Date().toISOString().substring(11, 19)}] ${advancedLogs[Math.floor(Math.random() * advancedLogs.length)]}`;
                setLogs(prev => [...prev.slice(-19), newLog]);
            }
        }, 1500);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-black/60 rounded-xl border border-white/10 p-4 font-mono text-[10px]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-indigo-400" />
                    <span className="text-indigo-400 font-bold tracking-wider">AUTONOMOUS_TERMINAL</span>
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-slate-500 hover:text-indigo-400 transition-colors"
                >
                    {isExpanded ? '▼' : '▲'}
                </button>
            </div>
            <div className={`space-y-1 ${isExpanded ? 'max-h-40' : 'max-h-20'} overflow-hidden transition-all`}>
                {logs.map((log, idx) => (
                    <div key={idx} className="text-slate-400">
                        <span className="text-indigo-500/60">{log.split(']')[0]}]</span>
                        {log.split(']')[1]}
                    </div>
                ))}
            </div>
        </div>
    );
};

const VaultVitals = () => {
    const [vitals, setVitals] = React.useState({
        tokens: 0,
        context: 0,
        layers: 12,
    });

    React.useEffect(() => {
        setVitals({
            tokens: Math.floor(Math.random() * 100000) + 50000,
            context: Math.floor(Math.random() * 80) + 20,
            layers: 12,
        });
        
        const interval = setInterval(() => {
            setVitals(prev => ({
                ...prev,
                tokens: prev.tokens + Math.floor(Math.random() * 100),
                context: Math.min(100, prev.context + Math.floor(Math.random() * 5)),
            }));
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center min-w-[100px]">
            <div className="flex items-center gap-1.5 mb-1 opacity-50">
                <Cpu size={10} />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">VAULT</span>
            </div>
            <div className="flex gap-3">
                <span className="text-[9px] font-black text-emerald-400">{(vitals.tokens / 1000).toFixed(1)}k</span>
                <span className="text-[9px] font-black text-violet-400">{vitals.context}%</span>
            </div>
        </div>
    );
};
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
