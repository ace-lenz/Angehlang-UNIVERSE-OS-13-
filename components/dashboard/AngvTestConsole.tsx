/**
 * AngvTestConsole.tsx — v1.0
 *
 * Live frontend test harness for the ANGV Compute Engine, MOTE Training,
 * and Native LLM inference pipeline. Shows real-time frame bus stats,
 * photonic seek logs, MOTE scores per intent, and a live inference prompt tester.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, Database, Brain, Activity, Code2, Play,
  CheckCircle, AlertCircle, RefreshCw, Cpu, Layers
} from 'lucide-react';
import { angvCompute } from '@/storage/AngvComputeEngine';
import { sovereignLogic } from '@/engine/SovereignLogicCore';
import { angvStorage } from '@/storage/AngvStorageEngine';
import { zetaLightningTrainer } from '@/memory/ZetaLightningTrainer';
import { photoRAM } from '@/memory/PhotoRAM';
import { codebaseTopology } from '@/storage/CodebaseTopology';

// ── Helpers ─────────────────────────────────────────────────────────────────

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Test prompts pre-wired to every A2A route domain
const PRESET_TESTS = [
  { label: 'Math',      prompt: '(native-llm-infer "calculate 99 + 1")',     intent: 'math',     color: 'text-indigo-400', bg: 'bg-indigo-900/30', border: 'border-indigo-700/40' },
  { label: 'Code',      prompt: '(native-llm-infer "write code fibonacci")',  intent: 'code',     color: 'text-violet-400', bg: 'bg-violet-900/30', border: 'border-violet-700/40' },
  { label: 'Explain',   prompt: '(native-llm-infer "explain quantum")',       intent: 'explain',  color: 'text-sky-400',    bg: 'bg-sky-900/30',    border: 'border-sky-700/40' },
  { label: 'MCP',       prompt: '(native-llm-infer "mcp angehl_watches")',    intent: 'mcp',      color: 'text-amber-400',  bg: 'bg-amber-900/30',  border: 'border-amber-700/40' },
  { label: 'Greeting',  prompt: '(native-llm-infer "hello world")',           intent: 'greeting', color: 'text-emerald-400',bg: 'bg-emerald-900/30',border: 'border-emerald-700/40' },
  { label: 'ANGV Seek', prompt: '(angv-seek "math" "calculate 99 + 1")',      intent: 'angv',     color: 'text-pink-400',   bg: 'bg-pink-900/30',   border: 'border-pink-700/40' },
  { label: 'ANGV Stats',prompt: '(angv-stats)',                               intent: 'stats',    color: 'text-teal-400',   bg: 'bg-teal-900/30',   border: 'border-teal-700/40' },
];

interface LogEntry {
  id: string;
  time: string;
  level: 'info' | 'success' | 'warn' | 'error';
  label: string;
  text: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AngvTestConsole() {
  const [stats, setStats]           = useState(angvCompute.getEngineStats());
  const [vitals, setVitals]         = useState(angvStorage.getVitals());
  const [zetaMeta, setZetaMeta]     = useState(zetaLightningTrainer.getMetrics());
  const [topoStats, setTopoStats]   = useState(codebaseTopology.getSpatialLatticeMap());
  const [holographicTotal, setHolographicTotal] = useState(photoRAM.getHolographicBuffer().size);
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [customPrompt, setCustomPrompt] = useState('(angv-stats)');
  const [outputPanel, setOutputPanel]   = useState<string>('');
  const [isRunning, setIsRunning]       = useState(false);
  const [activeTest, setActiveTest]     = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Refresh engine stats every 2 s
  useEffect(() => {
    const t = setInterval(() => {
      setStats(angvCompute.getEngineStats());
      setVitals(angvStorage.getVitals());
      setZetaMeta(zetaLightningTrainer.getMetrics());
      setTopoStats(codebaseTopology.getSpatialLatticeMap());
      setHolographicTotal(photoRAM.getHolographicBuffer().size);
    }, 2000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((level: LogEntry['level'], label: string, text: string) => {
    const entry: LogEntry = {
      id: `${Date.now()}_${Math.random()}`,
      time: new Date().toISOString().slice(11, 23),
      level, label, text
    };
    setLogs(prev => [...prev.slice(-199), entry]);
  }, []);

  const runScript = useCallback(async (script: string, testLabel?: string) => {
    if (isRunning) return;
    const label = testLabel || 'Custom';
    setIsRunning(true);
    setActiveTest(label);
    addLog('info', label, `▶ Executing: ${script.substring(0, 80)}...`);

    const t0 = performance.now();
    try {
      const result = await sovereignLogic.runScript(script);
      const latency = (performance.now() - t0).toFixed(2);
      const out = typeof result === 'object'
        ? JSON.stringify(result, null, 2)
        : String(result ?? '(null)');
      
      setOutputPanel(out);
      addLog('success', label, `✓ Done in ${latency} ms`);
      addLog('info', `${label} Output`, out.substring(0, 300));
    } catch (err: any) {
      const latency = (performance.now() - t0).toFixed(2);
      addLog('error', label, `✗ Error after ${latency} ms: ${err?.message || err}`);
      setOutputPanel(`ERROR: ${err?.message || String(err)}`);
    } finally {
      setIsRunning(false);
      setActiveTest(null);
      setStats(angvCompute.getEngineStats());
    }
  }, [isRunning, addLog]);

  const levelColor = (l: LogEntry['level']) => {
    if (l === 'success') return 'text-emerald-400';
    if (l === 'warn')    return 'text-amber-400';
    if (l === 'error')   return 'text-red-400';
    return 'text-zinc-400';
  };
  const levelIcon = (l: LogEntry['level']) => {
    if (l === 'success') return <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />;
    if (l === 'error')   return <AlertCircle size={10} className="text-red-400 flex-shrink-0" />;
    return <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 flex-shrink-0 inline-block" />;
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4 py-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tighter text-white ultra-glow-text">
              ANGV Compute Engine
            </h1>
            <span className="sovereign-badge bg-pink-500/30 text-pink-100 border-pink-500/50">
              v2.0 · MOTE
            </span>
          </div>
          <p className="text-zinc-500 text-xs">
            30D Frame Bus · Photonic O(1) Seek · Cross-Session DNA · Multi-Objective Training
          </p>
        </div>
        <button
          onClick={() => { setStats(angvCompute.getEngineStats()); setVitals(angvStorage.getVitals()); }}
          className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Refresh stats"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Live Metrics Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            icon: Database, label: 'ANGV Frames',
            value: stats.totalFrames, sub: `${stats.sovereignLocked} Sovereign-Locked`,
            color: 'text-pink-400', bar: Math.min(100, stats.totalFrames * 5), barColor: 'bg-pink-500'
          },
          {
            icon: Zap, label: 'Cache Hits',
            value: stats.totalCacheHits, sub: 'L1/L2 Frame Bus',
            color: 'text-amber-400', bar: Math.min(100, stats.totalCacheHits * 10), barColor: 'bg-amber-500'
          },
          {
            icon: Brain, label: 'Zeta Efficiency',
            value: zetaMeta.efficiency.toFixed(3) + 'x', sub: `${zetaMeta.traceCount} traces`,
            color: 'text-violet-400', bar: Math.min(100, zetaMeta.efficiency * 10), barColor: 'bg-violet-500'
          },
          {
            icon: Activity, label: 'Quantum Flux',
            value: vitals.quantumFlux.toFixed(2), sub: `${vitals.photonicUsage.toFixed(1)}% RAM`,
            color: 'text-emerald-400', bar: vitals.photonicUsage, barColor: 'bg-emerald-500'
          },
          {
            icon: Layers, label: 'Holographic Cache',
            value: holographicTotal, sub: 'Cached Frames',
            color: 'text-cyan-400', bar: Math.min(100, holographicTotal), barColor: 'bg-cyan-500'
          },
          {
            icon: Code2, label: 'Topology Nodes',
            value: topoStats.size, sub: 'Spatial Mapped',
            color: 'text-amber-400', bar: Math.min(100, topoStats.size / 10), barColor: 'bg-amber-500'
          }
        ].map((m, i) => (
          <motion.div
            key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-sovereign rounded-2xl p-4 flex flex-col gap-3"
          >
            <div className={cn('w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center', m.color)}>
              <m.icon size={15} />
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 mb-0.5">{m.label}</div>
              <div className="text-xl font-bold tracking-tight text-white">{m.value}</div>
              <div className="text-[10px] text-zinc-600">{m.sub}</div>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${m.bar}%` }}
                transition={{ duration: 1.2 }} className={cn('h-full rounded-full', m.barColor)} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Session DNA + MOTE Objectives ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session DNA */}
        <div className="glass-sovereign rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Cpu size={12} className="text-pink-400" /> Cross-Session DNA Entanglement
          </h2>
          <div className="font-mono text-sm text-pink-300 bg-pink-950/20 border border-pink-900/40 rounded-lg px-4 py-3 break-all">
            {stats.sessionDNA}
          </div>
          <div className="text-[10px] text-zinc-600 mt-2">
            Unique key persisted to SovereignVault (IDB). Enables cross-session photonic memory continuity.
          </div>
        </div>

        {/* MOTE Objectives */}
        <div className="glass-sovereign rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Layers size={12} className="text-teal-400" /> MOTE — Active Objectives
          </h2>
          <div className="flex flex-col gap-2">
            {stats.moteObjectives.map((obj) => {
              const pct = Math.round(obj.weight * 100);
              return (
                <div key={obj.label} className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-400 w-28 truncate">{obj.label}</span>
                  <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1 }} className="h-full rounded-full bg-teal-500" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-400 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MOTE Per-Intent Scores ─────────────────────────────────────────── */}
      {Object.keys(stats.moteMetrics).length > 0 && (
        <div className="glass-sovereign rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Activity size={12} className="text-violet-400" /> Live MOTE Scores by Intent
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.moteMetrics).map(([intent, data]) => (
              <div key={intent} className="flex flex-col gap-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 min-w-[110px]">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{intent}</span>
                <span className={cn(
                  'text-2xl font-black tabular-nums',
                  data.avg >= 0.75 ? 'text-emerald-400' : data.avg >= 0.5 ? 'text-amber-400' : 'text-red-400'
                )}>{(data.avg).toFixed(3)}</span>
                <span className="text-[9px] text-zinc-600">{data.samples} samples</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Preset Test Buttons ────────────────────────────────────────────── */}
      <div className="glass-sovereign rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Play size={12} className="text-amber-400" /> Preset Pipeline Tests
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {PRESET_TESTS.map((t) => (
            <button
              key={t.label}
              id={`angv-test-${t.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => runScript(t.prompt, t.label)}
              disabled={isRunning}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                t.bg, t.border, t.color,
                activeTest === t.label ? 'opacity-100 animate-pulse' : '',
                isRunning && activeTest !== t.label ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-125 cursor-pointer'
              )}
            >
              <Play size={10} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Custom Script Runner */}
        <div className="flex gap-2">
          <input
            id="angv-custom-script-input"
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { runScript(customPrompt, 'Custom'); } }}
            placeholder={'(angv-seek "math" "calculate 99 + 1")'}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-violet-600 transition-colors"
          />
          <button
            id="angv-run-custom-btn"
            onClick={() => runScript(customPrompt, 'Custom')}
            disabled={isRunning}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
          >
            {isRunning ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </button>
        </div>
      </div>

      {/* ── Output Panel ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {outputPanel && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-sovereign rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Code2 size={13} className="text-violet-400" />
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Last Output</h2>
            </div>
            <pre className="text-xs font-mono text-emerald-300 bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-words max-h-64 overflow-y-auto custom-scrollbar">
              {outputPanel}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live Execution Log ────────────────────────────────────────────── */}
      <div className="glass-sovereign rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} className="text-pink-400" /> Execution Log
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
              {logs.length} entries
            </span>
          </h2>
          <button
            onClick={() => setLogs([])}
            className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="h-52 overflow-y-auto custom-scrollbar bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 font-mono">
          {logs.length === 0 && (
            <p className="text-zinc-700 text-xs text-center mt-16">
              Run a test to see execution logs…
            </p>
          )}
          {logs.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 mb-1.5">
              {levelIcon(entry.level)}
              <span className="text-[9px] text-zinc-700 flex-shrink-0 mt-0.5">{entry.time}</span>
              <span className="text-[9px] font-bold text-zinc-500 flex-shrink-0 w-16 truncate">[{entry.label}]</span>
              <span className={cn('text-[10px] break-words flex-1', levelColor(entry.level))}>
                {entry.text}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

    </div>
  );
}
