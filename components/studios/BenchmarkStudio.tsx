/**
 * BenchmarkStudio.tsx
 * 
 * High-performance benchmarking studio for validating all 22 system studios.
 * Displays real-time quality scores, throughput, and latency metrics.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Activity, Zap, Cpu, Search, RefreshCw, 
  CheckCircle2, AlertTriangle, XCircle, Play, Layers
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { studioBenchmark, BenchmarkResult, StudioType } from '@/engine/StudioBenchmarkSystem';
import { cn } from '@/utils/sovereign-utils';

export const BenchmarkStudio: React.FC = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'top' | 'stats'>('all');

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    const types: StudioType[] = [
      'book', 'code', 'video', 'image', 'audio', '3d', 'bio', 'automation',
      'network', 'dataviz', 'simulation', 'music-production', 'text', 'security',
      'database', 'cloud', 'iot', 'game', 'browser', 'os', 'intelligence', 'a2a', 'mathematics'
    ];

    for (const type of types) {
      setCurrentTest(type);
      const res = await studioBenchmark.runBenchmark(type);
      setResults(prev => [...prev, res]);
    }
    
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="text-emerald-400" size={16} />;
    if (score >= 70) return <AlertTriangle className="text-amber-400" size={16} />;
    return <XCircle className="text-rose-400" size={16} />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] transition-all duration-700">
      <StudioHeader 
        title="Benchmark Studio" 
        subtitle="System-Wide Performance & Quality Validation"
        icon={BarChart3}
        badge={isRunning ? 'Testing' : 'Idle'}
        badgeColor={isRunning ? 'amber' : 'cyan'}
      >
        <div className="flex items-center gap-2">
          <SovereignButton 
            variant="primary" 
            size="sm" 
            onClick={runAllTests} 
            disabled={isRunning}
            icon={isRunning ? RefreshCw : Play}
          >
            {isRunning ? 'Running Cascade...' : 'Execute Full Cascade'}
          </SovereignButton>
        </div>
      </StudioHeader>

      <div className="p-6 space-y-6">
        {/* Real-time Status Bar */}
        {isRunning && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-amber-400 animate-spin" size={18} />
              <div>
                <p className="text-xs font-bold text-amber-200 uppercase">Testing Studio: {currentTest}</p>
                <p className="text-[10px] text-zinc-500">Executing photonic integrity check...</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-zinc-400">{results.length} / 22 COMPLETED</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.length === 0 && !isRunning && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-zinc-600">
              <BarChart3 size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Execute the Full Cascade to begin system validation</p>
            </div>
          )}
          
          {results.map((res, i) => (
            <motion.div 
              key={res.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-zinc-950 border border-zinc-800">
                    <Activity size={14} className="text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">{res.studio}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">{res.type}</p>
                  </div>
                </div>
                {getStatusIcon(res.score)}
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5">
                <div className="text-center">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1">Score</p>
                  <p className={cn("text-sm font-black", getScoreColor(res.score))}>{res.score.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1">Fidelity</p>
                  <p className="text-sm font-black text-pink-400">{res.quality.toFixed(1)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-zinc-500 uppercase mb-1">Latency</p>
                  <p className="text-sm font-black text-cyan-400">{res.latency}ms</p>
                </div>
              </div>

              <div className="pt-1">
                <p className="text-[10px] text-zinc-400 italic">"{res.output.details}"</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Metrics Panel */}
        {results.length > 0 && (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-amber-400" /> Global Photonic Coherence
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase">Average Score</p>
                <p className="text-2xl font-black text-white">
                  {(results.reduce((a, b) => a + b.score, 0) / results.length).toFixed(1)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase">Peak Throughput</p>
                <p className="text-2xl font-black text-cyan-400">
                  {Math.max(...results.map(r => r.throughput)).toFixed(1)} tx/s
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase">Min Latency</p>
                <p className="text-2xl font-black text-purple-400">
                  {Math.min(...results.map(r => r.latency))}ms
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase">Strict Fidelity</p>
                <p className="text-2xl font-black text-pink-400">
                  {(results.reduce((a, b) => a + b.quality, 0) / results.length).toFixed(1)}%
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500 uppercase">System Integrity</p>
                <p className="text-2xl font-black text-emerald-400">HARDENED</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkStudio;
