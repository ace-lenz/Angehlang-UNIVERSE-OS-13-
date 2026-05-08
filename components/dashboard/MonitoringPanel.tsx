// Plan Item ID: TI-1
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Zap, ShieldCheck, Database, Brain, ShieldAlert, RefreshCw, Layers, X, Gauge, Cpu, Thermometer, Wind, Droplets } from 'lucide-react';
import { useSovereign } from '@/context/SovereignContext';
import { cn } from '@/utils/sovereign-utils';
import { AngvTestConsole } from '@/components/dashboard/AngvTestConsole';
import { neuralTelemetry } from '@/engine/NeuralTelemetry';
import { aro } from '@/engine/ResourceOrchestrator';
import { APP_VERSION } from '@/constants';

const GaugeHigh = Gauge;

export const MonitoringPanel: React.FC = () => {
  const { vitals } = useSovereign();
  const [tab, setTab] = useState<'vitals' | 'angv' | 'aro'>('angv');
  const [aroState, setAroState] = useState(aro.getVitals());

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/20 backdrop-blur-md">
      {/* Tab bar */}
      <div className="flex gap-2 px-8 pt-8 pb-0 flex-shrink-0 relative">
        {[
          { id: 'vitals', icon: Activity, label: 'Prime Vitals', color: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
          { id: 'angv', icon: Zap, label: 'Compute Engine', color: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
          { id: 'aro', icon: GaugeHigh, label: 'Resource Nexus', color: 'text-emerald-400', glow: 'shadow-emerald-500/20' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "group flex items-center gap-2.5 px-6 py-3 rounded-t-2xl text-[11px] font-black uppercase tracking-widest transition-all relative border-t border-x",
              tab === t.id 
                ? "bg-slate-900/60 border-white/10 text-white shadow-2xl" 
                : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
            )}
          >
            <t.icon size={14} className={cn("transition-colors", tab === t.id ? t.color : "opacity-40")} /> 
            {t.label}
            {tab === t.id && (
              <motion.div 
                layoutId="monitoring-tab-indicator" 
                className={cn("absolute -bottom-[2px] inset-x-0 h-[3px] rounded-full bg-current", t.color)} 
              />
            )}
          </button>
        ))}
        <div className="absolute bottom-0 left-8 right-8 h-px bg-white/5" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar sovereign-grid">
        {tab === 'angv' ? (
          <AngvTestConsole />
        ) : tab === 'aro' ? (
          <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">
             <div className="flex items-start justify-between">
                <div>
                   <h1 className="text-4xl font-black tracking-tighter text-white bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                     Sovereign ARO
                   </h1>
                   <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase mt-2">Resource Orchestration Interface</p>
                </div>
                <div className="px-6 py-3 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-xl flex items-center gap-6 shadow-2xl">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master_FPS</span>
                      <span className={cn("text-2xl font-black tracking-tight", aroState.fps < 30 ? "text-red-400" : "text-emerald-400")}>{aroState.fps}</span>
                   </div>
                   <div className="w-px h-10 bg-white/5" />
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sync_Adaptation</span>
                      <span className="text-2xl font-black tracking-tight text-white">{(aroState.state.adaptation * 100).toFixed(0)}%</span>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Environmental Substrates (D35-D42)</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                        { id: 'temp', label: 'Node Temperature', icon: Thermometer, value: aroState.state.temp, range: [0, 500], unit: 'K', accent: 'accent-red-500' },
                        { id: 'pressure', label: 'Optical Pressure', icon: Wind, value: aroState.state.pressure, range: [0, 200000], unit: 'Pa', accent: 'accent-cyan-500' },
                        { id: 'humidity', label: 'Lattice Humidity', icon: Droplets, value: aroState.state.humidity, range: [0, 100], unit: '%', accent: 'accent-indigo-500' },
                        { id: 'density', label: 'Optical Density', icon: Layers, value: aroState.state.density, range: [0, 5], step: 0.1, unit: 'mol', accent: 'accent-emerald-500' }
                     ].map(s => (
                        <div key={s.id} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all space-y-5 shadow-sm group">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <s.icon size={18} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                              </div>
                              <span className="text-sm font-black text-white px-2 py-0.5 rounded bg-white/5">{s.value.toFixed(s.step ? 1 : 0)} <span className="text-[10px] text-slate-600 ml-1">{s.unit}</span></span>
                           </div>
                           <input 
                              type="range" 
                              min={s.range[0]} 
                              max={s.range[1]} 
                              step={s.step || 1}
                              value={s.value}
                              onChange={(e) => {
                                 aro.updateEnv({ [s.id as any]: parseFloat(e.target.value) });
                                 setAroState(aro.getVitals());
                              }}
                              className={cn("w-full h-1.5 rounded-full bg-slate-800 appearance-none cursor-pointer", s.accent)}
                           />
                        </div>
                     ))}
                   </div>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col justify-center gap-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110">
                      <ShieldCheck size={120} />
                    </div>
                    <div className="space-y-4 relative z-10">
                       <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                         <ShieldCheck size={32} className="text-indigo-400" />
                       </div>
                       <h2 className="text-3xl font-black text-white tracking-tighter leading-tight italic">Pure Sovereign Isolation</h2>
                       <p className="text-slate-400 text-sm leading-relaxed">
                         The Sovereign Matrix enforces absolute computational privacy. No telemetry, no logs, no external hooks. You are the sole orchestrator of this neural ecosystem.
                       </p>
                    </div>
                    <div className="pt-8 border-t border-white/5 space-y-5 relative z-10">
                       <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>Trajectory Protocol</span>
                          <div className="flex items-center gap-2 text-indigo-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            LATCHED_V2
                          </div>
                       </div>
                       <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                          <span>Encryption Substrate</span>
                          <span className="text-indigo-200">POLYMORPHIC_V{APP_VERSION.split('.')[0]}</span>
                       </div>
                    </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl font-black tracking-tighter text-white font-display">Prime Vitals</h1>
                  <span className="text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 tracking-[0.2em] shadow-lg shadow-indigo-500/10">v.ULTRA</span>
                </div>
                <p className="text-slate-500 text-xs font-bold tracking-[0.3em] uppercase">Autonomous Neural Telemetry System</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-emerald-400 font-black tracking-[0.2em] bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-photonic" />
                SYSTEM_STABLE
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Neural Coherence', value: '0.9999', icon: Zap, color: 'text-indigo-400', progress: 99, bg: 'bg-indigo-500/10' },
                { label: 'Lattice Flux', value: `${(vitals.quantumFlux * 1.5).toFixed(1)} PHz`, icon: Activity, color: 'text-cyan-400', progress: 85, bg: 'bg-cyan-500/10' },
                { label: 'Photonic RAM', value: '1.2 Trillion', icon: Database, color: 'text-emerald-400', progress: 100, bg: 'bg-emerald-500/10' },
                { label: 'Logic Resonance', value: '0.9999', icon: ShieldCheck, color: 'text-violet-400', progress: 100, bg: 'bg-violet-500/10' }
              ].map((m, i) => (
                <div key={i} className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-6 shadow-xl group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className={cn("w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", m.bg, m.color)}>
                      <m.icon size={22} className="drop-shadow-sm" />
                    </div>
                    {m.label.includes('Flux') && (
                       <span className="text-[9px] font-black text-white/40 uppercase tracking-widest px-2 py-1 rounded-md border border-white/5 bg-white/5">ANGEH_SYN</span>
                    )}
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] text-slate-500 mb-1.5 uppercase font-black tracking-widest opacity-60 group-hover:opacity-100 transition-all">{m.label}</div>
                    <div className="text-3xl font-black text-white tracking-tight leading-none italic">{m.value}</div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800/60 rounded-full overflow-hidden relative z-10">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${m.progress}%` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn("h-full bg-current rounded-full", m.color.replace('text-', 'bg-'))} 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Logs & Cure Nexus */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 rounded-[2.5rem] bg-slate-900/20 border border-white/5 backdrop-blur-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <ShieldCheck size={20} className="text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white uppercase tracking-tighter">Integrity Nexus</h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Fault Manifest</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => neuralTelemetry.clearFaults()} 
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black uppercase tracking-widest"
                  >
                    Purge Logs
                  </button>
                </div>
                <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar space-y-3">
                  {vitals.faultLogs.length === 0 ? (
                    <div className="py-24 flex flex-col items-center gap-6 opacity-20 filter grayscale">
                       <Activity size={48} />
                       <div className="text-xs font-black tracking-[0.5em] uppercase">Zero Fault State</div>
                    </div>
                  ) : (
                    vitals.faultLogs.map(f => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        key={f.id} 
                        className="p-5 rounded-[1.5rem] bg-slate-900/40 border border-white/5 flex items-start gap-5 hover:bg-slate-800/40 transition-all group"
                      >
                        <div className={cn("mt-1 p-2 rounded-lg", f.severity === 'critical' ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400")}>
                          <ShieldAlert size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-black text-[11px] text-white uppercase tracking-[0.1em]">{f.service} FAULT_NODE</span>
                            <span className="text-[10px] text-slate-600 font-mono italic">{new Date(f.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed mb-4">{f.message}</p>
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              f.resolved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full", f.resolved ? "bg-emerald-400" : "bg-red-400 animate-pulse")} />
                              {f.resolved ? 'Repaired' : 'Manifested'}
                            </div>
                            <button className="text-[10px] font-bold text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all">TRACE NODE</button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />
                  <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Brain size={14} />
                    Refinement Nexus
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cure Status</span>
                      <span className="text-sm font-black text-emerald-400 italic">AUTO_NOMOUS</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Latent Correction</span>
                      <span className="text-sm font-black text-white">0.14ms</span>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <button className="w-full py-3 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                        Initiate Global Scan
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-white/5 shadow-2xl">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Lattice Health</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-black text-white italic">99<span className="text-indigo-500 text-lg not-italic">.9%</span></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full w-[99.9%] bg-emerald-500" />
                    </div>
                    <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Optimal Coherence Manifested</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
