import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Brain, 
  TrendingUp, 
  Clock,
  BookOpen,
  Settings,
  Play,
  Pause,
  Cpu,
  Zap,
  Terminal
} from 'lucide-react';
import { unifiedTrainingHub, TrainingMode } from '@/memory/UnifiedTrainingHub';

interface TrainingLogEntry {
  id: number;
  timestamp: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'training';
}

interface UnifiedStats {
  godPrompt: {
    samples: number;
    quality: number;
    cycles: number;
    studioBreakdown: Record<string, number>;
  };
  online: {
    insights: number;
    topics: number;
    lastTraining: number;
  };
  unified: {
    totalCycles: number;
    currentMode: TrainingMode;
    isOnline: boolean;
    avgImprovement: number;
  };
}

export const UnifiedTrainingPanel: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats, setStats] = useState<UnifiedStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLogEntry[]>([]);
  const logIdRef = useRef(0);

  const addLog = (message: string, type: TrainingLogEntry['type'] = 'info') => {
    const id = ++logIdRef.current;
    setTrainingLogs(prev => [...prev.slice(-49), { id, timestamp: Date.now(), message, type }]);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    unifiedTrainingHub.setProgressCallback((msg, type) => {
      addLog(msg, type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info');
    });

    const updateStats = () => {
      setStats(unifiedTrainingHub.getStats());
      setIsTraining(unifiedTrainingHub.getStatus().isRunning);
    };

    updateStats();
    const interval = setInterval(updateStats, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerTraining = async () => {
    setIsTraining(true);
    addLog('Starting training cycle...', 'training');
    
    const pollInterval = setInterval(() => {
      const status = unifiedTrainingHub.getStatus();
      if (status.isRunning && status.cycleCount > 0) {
        const recentCycle = status.recentCycles?.[status.recentCycles.length - 1];
        if (recentCycle) {
          addLog(`Cycle ${recentCycle.mode}: ${recentCycle.offlineSamples} samples, ${recentCycle.onlineInsights} insights`, 'info');
        }
      }
    }, 1500);
    
    await unifiedTrainingHub.triggerManualCycle();
    
    clearInterval(pollInterval);
    
    const finalStats = unifiedTrainingHub.getStats();
    setStats(finalStats);
    setIsTraining(false);
    addLog(`Training complete! Quality: ${(finalStats.godPrompt.quality * 100).toFixed(1)}%`, 'success');
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const getModeColor = (mode: TrainingMode) => {
    switch (mode) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-amber-400';
      case 'hybrid': return 'text-violet-400';
      default: return 'text-slate-400';
    }
  };

  const getModeLabel = (mode: TrainingMode) => {
    switch (mode) {
      case 'online': return 'Online Only';
      case 'offline': return 'Offline Only';
      case 'hybrid': return 'Hybrid Mode';
      default: return 'Unknown';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-2xl border border-white/10 overflow-hidden"
    >
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isOnline 
              ? 'bg-green-500/20 border-green-500/30' 
              : 'bg-amber-500/20 border-amber-500/30'
          }`}>
            {isOnline ? (
              <Wifi size={18} className="text-green-400" />
            ) : (
              <WifiOff size={18} className="text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-violet-400" />
              <span className="text-sm font-black text-white uppercase tracking-wider">
                Unified Training Hub
              </span>
              {isTraining && (
                <RefreshCw size={12} className="text-violet-400 animate-spin" />
              )}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2">
              <span className={isOnline ? 'text-green-400' : 'text-amber-400'}>
                ● {isOnline ? 'Online' : 'Offline'}
              </span>
              <span>•</span>
              <span className={getModeColor(stats?.unified.currentMode || 'offline')}>
                {getModeLabel(stats?.unified.currentMode || 'offline')}
              </span>
              <span>•</span>
              <span>{stats?.unified.totalCycles || 0} cycles</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerTraining();
            }}
            disabled={isTraining}
            className="px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-lg text-[10px] font-black text-violet-300 uppercase tracking-wider hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw size={12} className={isTraining ? 'animate-spin' : ''} />
            Train Now
          </button>
        </div>
      </div>

      {isExpanded && stats && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-4 pb-4 border-t border-white/5"
        >
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={12} className="text-violet-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Offline Training</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Samples</span>
                  <span className="text-white font-mono">{stats.godPrompt.samples}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Quality</span>
                  <span className={`font-mono ${stats.godPrompt.quality > 0.7 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {(stats.godPrompt.quality * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Cycles</span>
                  <span className="text-white font-mono">{stats.godPrompt.cycles}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={12} className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Online Training</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Insights</span>
                  <span className="text-white font-mono">{stats.online.insights}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Topics</span>
                  <span className="text-white font-mono">{stats.online.topics}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Last Run</span>
                  <span className="text-indigo-400 font-mono">{formatTime(stats.online.lastTraining)}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-amber-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Unified Hub</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Total Cycles</span>
                  <span className="text-white font-mono">{stats.unified.totalCycles}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Avg Improve</span>
                  <span className={`font-mono ${stats.unified.avgImprovement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.unified.avgImprovement >= 0 ? '+' : ''}{(stats.unified.avgImprovement * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className={isOnline ? 'text-green-400' : 'text-amber-400'}>
                    {isOnline ? 'Active' : 'Offline Mode'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-black/20 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={12} className="text-cyan-400" />
              <span className="text-[10px] font-black text-slate-400 uppercase">Studio Breakdown</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.godPrompt.studioBreakdown).map(([studio, count]) => (
                <div key={studio} className="px-2 py-1 bg-white/5 rounded-lg text-[10px]">
                  <span className="text-slate-400 capitalize">{studio}</span>
                  <span className="text-white ml-1 font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => unifiedTrainingHub.setMode('offline')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                  stats.unified.currentMode === 'offline' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Offline
              </button>
              <button
                onClick={() => unifiedTrainingHub.setMode('hybrid')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                  stats.unified.currentMode === 'hybrid' 
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Hybrid
              </button>
              <button
                onClick={() => unifiedTrainingHub.setMode('online')}
                className={`px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                  stats.unified.currentMode === 'online' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                Online
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">
                Auto: {unifiedTrainingHub.getStatus().config.autoTrainEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-green-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase">Training Output</span>
              </div>
              <button 
                onClick={() => setTrainingLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            </div>
            <div className="h-24 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1">
              {trainingLogs.length === 0 ? (
                <span className="text-slate-600 italic">Waiting for training output...</span>
              ) : (
                trainingLogs.map((log) => (
                  <div key={log.id} className={`flex items-start gap-2 ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                    log.type === 'training' ? 'text-violet-400' :
                    'text-slate-400'
                  }`}>
                    <span className="text-slate-600 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default UnifiedTrainingPanel;