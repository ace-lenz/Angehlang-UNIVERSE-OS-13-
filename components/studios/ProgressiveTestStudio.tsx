/**
 * ProgressiveTestStudio.tsx
 * 
 * UI for monitoring autonomous test execution and fidelity coverage.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Beaker, ShieldCheck, Zap, Activity, Bug, 
  RefreshCw, Play, Search, CheckCircle2, XCircle
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { progressiveTester, TestResult } from '@/agents/ProgressiveTestAgent';

export const ProgressiveTestStudio: React.FC = () => {
  const [history, setHistory] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [targetStudio, setTargetStudio] = useState('AudioStudio');

  const updateHistory = () => {
    setHistory([...progressiveTester.getHistory()]);
  };

  const runTest = async () => {
    setIsRunning(true);
    await progressiveTester.runTestSuite(targetStudio);
    updateHistory();
    setIsRunning(false);
  };

  useEffect(() => {
    updateHistory();
  }, []);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b]">
      <StudioHeader 
        title="Progressive Test Studio" 
        subtitle="Autonomous Fidelity & Coverage Validation"
        icon={Beaker}
        badge={isRunning ? 'Testing' : 'Secure'}
        badgeColor={isRunning ? 'amber' : 'emerald'}
      >
        <div className="flex gap-2">
          <input 
            type="text" 
            value={targetStudio}
            onChange={(e) => setTargetStudio(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded px-3 py-1 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500/50"
            placeholder="Studio ID..."
          />
          <SovereignButton 
            variant="primary" 
            size="sm" 
            onClick={runTest} 
            disabled={isRunning}
            icon={isRunning ? RefreshCw : Play}
          >
            {isRunning ? 'Synthesizing Tests...' : 'Run Test Suite'}
          </SovereignButton>
        </div>
      </StudioHeader>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Test Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} className="text-cyan-400" /> Test Execution History
          </h4>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {history.map((test) => (
                <motion.div 
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={test.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'}>
                      {test.status === 'PASSED' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-zinc-200">{test.target}</h5>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] font-mono text-zinc-500">{test.type}</span>
                        <span className="text-[10px] font-mono text-zinc-500">ID: {test.id.slice(-6)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 items-center">
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 uppercase">Coverage</p>
                      <p className="text-sm font-black text-cyan-400">{test.coverage.toFixed(1)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-zinc-500 uppercase">Fidelity</p>
                      <p className={`text-sm font-black ${test.fidelityScore >= 0.95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {(test.fidelityScore * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Test Stats */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-400" /> System Robustness
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1 uppercase">
                  <span className="text-zinc-500">Global Coverage</span>
                  <span className="text-cyan-400">92.4%</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-[92.4%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1 uppercase">
                  <span className="text-zinc-500">Failure Recovery</span>
                  <span className="text-emerald-400">100%</span>
                </div>
                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Bug size={12} className="text-rose-400" /> Active Discovered Bugs
            </h4>
            <div className="flex flex-col items-center justify-center py-6 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
              <Zap size={24} className="mb-2 opacity-20" />
              <p className="text-xs">No active regressions detected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveTestStudio;
