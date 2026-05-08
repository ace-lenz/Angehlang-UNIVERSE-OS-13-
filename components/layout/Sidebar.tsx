// Plan Item ID: TI-1
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Zap, MessageSquare, Cpu, X, Music, Code2, Film, Image, 
  Box, Database, Wifi, Gamepad2, FlaskConical, Shield, Cloud, 
  BarChart3, FileText, Brain, Sparkles, Terminal, Activity,
  Globe, Beaker, Gauge, TestTube, Binary, BookOpen, Layout,
  ChevronRight, Search, Settings, Bot, Layers, Network, Dna,
  Mic, Eye, FolderOpen, Hash, Sigma, Trophy
} from 'lucide-react';
import { useSovereign } from '@/context/SovereignContext';
import { cn } from '@/utils/sovereign-utils';
import { APP_VERSION } from '@/constants';

const studioGroups = [
  {
    label: 'Creative',
    color: 'from-violet-500 to-purple-600',
    accent: 'violet',
    studios: [
      { id: 'image',  icon: Image,    label: 'Image',  color: 'text-violet-400' },
      { id: 'video',  icon: Film,     label: 'Video',  color: 'text-rose-400' },
      { id: 'audio',  icon: Mic,      label: 'Audio',  color: 'text-cyan-400' },
      { id: 'music',  icon: Music,    label: 'Music',  color: 'text-pink-400' },
      { id: '3d',     icon: Box,      label: '3D',     color: 'text-amber-400' },
    ],
  },
  {
    label: 'Engineering',
    color: 'from-indigo-500 to-blue-600',
    accent: 'indigo',
    studios: [
      { id: 'code',       icon: Code2,       label: 'Code',     color: 'text-indigo-400' },
      { id: 'database',   icon: Database,    label: 'Database', color: 'text-emerald-400' },
      { id: 'browser',    icon: Globe,       label: 'Browser',  color: 'text-blue-400' },
      { id: 'network',    icon: Network,     label: 'Network',  color: 'text-teal-400' },
      { id: 'cloud',      icon: Cloud,       label: 'Cloud',    color: 'text-sky-400' },
    ],
  },
  {
    label: 'Intelligence',
    color: 'from-emerald-500 to-teal-600',
    accent: 'emerald',
    studios: [
      { id: 'intelligence', icon: Brain,       label: 'AI Hub',   color: 'text-emerald-400' },
      { id: 'automation',   icon: Zap,         label: 'Automate', color: 'text-yellow-400' },
      { id: 'dataviz',      icon: BarChart3,   label: 'DataViz',  color: 'text-purple-400' },
      { id: 'text',         icon: FileText,    label: 'Text',     color: 'text-slate-400' },
      { id: 'book',         icon: BookOpen,    label: 'Book',     color: 'text-orange-400' },
    ],
  },
  {
    label: 'Science',
    color: 'from-rose-500 to-pink-600',
    accent: 'rose',
    studios: [
      { id: 'simulation', icon: FlaskConical, label: 'Simulate', color: 'text-rose-400' },
      { id: 'bio',        icon: Dna,          label: 'Bio',      color: 'text-green-400' },
      { id: 'iot',        icon: Cpu,          label: 'IoT',      color: 'text-cyan-400' },
      { id: 'game',       icon: Gamepad2,     label: 'Game',     color: 'text-pink-400' },
      { id: 'evolution',  icon: Activity,     label: 'Evolve',   color: 'text-lime-400' },
      { id: 'mathematics', icon: Sigma,       label: 'Math',     color: 'text-purple-400' },
    ],
  },
  {
    label: 'Ops',
    color: 'from-amber-500 to-orange-600',
    accent: 'amber',
    studios: [
      { id: 'security',  icon: Shield,   label: 'Security', color: 'text-red-400' },
      { id: 'os',        icon: Layout,   label: 'OS',       color: 'text-slate-400' },
      { id: 'test',      icon: TestTube, label: 'Testing',  color: 'text-violet-400' },
      { id: 'benchmark', icon: Gauge,    label: 'Bench',    color: 'text-amber-400' },
      { id: 'maturity',  icon: Trophy,   label: 'Maturity', color: 'text-emerald-400' },
      { id: 'protocol',  icon: Binary,   label: 'Protocol', color: 'text-teal-400' },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { 
    sessions, currentSessionId, setCurrentSessionId, 
    neuralStatus, availableModels, currentModel, setCurrentModel,
    ui, setUi, createNewChat, deleteSession, clearAllHistory 
  } = useSovereign();

  const [sideHover, setSideHover] = React.useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('Creative');
  const [modelTab, setModelTab] = useState<'native' | 'ollama' | 'cloud'>('native');
  const [searchQuery, setSearchQuery] = useState('');
  const showSide = !ui.autoHideNav || sideHover;

  if (ui.zenMode) return null;

  const allStudios = studioGroups.flatMap(g => g.studios);
  const filteredStudios = searchQuery 
    ? allStudios.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  return (
    <>
      {ui.autoHideNav && !sideHover && ui.sidebarOpen && (
        <div className="absolute left-0 top-0 w-8 h-full z-[35]" onMouseEnter={() => setSideHover(true)} />
      )}
      <motion.aside
        onMouseEnter={() => setSideHover(true)}
        onMouseLeave={() => setSideHover(false)}
        initial={{ width: 0, opacity: 0 }}
        animate={{ 
          width: ui.sidebarOpen && showSide ? 260 : 0, 
          opacity: ui.sidebarOpen && showSide ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "h-full flex-shrink-0 flex flex-col border-r z-40 overflow-hidden",
          "bg-[#060812]/95 border-white/[0.06] backdrop-blur-2xl",
          "fixed md:relative inset-y-0 left-0"
        )}
      >
        <div className="w-[260px] h-full flex flex-col min-w-[260px]">

          {/* ── Logo Header ────────────────────────────────────── */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-sm" />
                <img src="/Angehlang%20Logo.svg" alt="Logo" className="relative w-6 h-6 object-contain" />
              </div>
              <div>
                <div className="text-[9px] font-black text-indigo-400 tracking-[0.25em] uppercase leading-none">Angehlang</div>
                <div className="text-[11px] font-bold text-white/90 tracking-tight leading-tight">Universe OS</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={createNewChat}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-400 transition-all border border-indigo-500/20"
              title="New Chat"
            >
              <Plus size={14} />
            </motion.button>
          </div>

          {/* ── Version Badge ───────────────────────────────────── */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/15">
              <div className={cn("w-1.5 h-1.5 rounded-full", 
                neuralStatus === 'ONLINE' ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" :
                neuralStatus === 'CONNECTING' ? "bg-amber-400 animate-pulse" : "bg-slate-600"
              )} />
              <span className="text-[9px] font-bold text-indigo-300 tracking-wider uppercase flex-1">
                {neuralStatus === 'ONLINE' ? `SOVEREIGN CORE v${APP_VERSION}` : neuralStatus}
              </span>
              <span className="text-[8px] text-indigo-500 font-mono">Native v13</span>
            </div>
          </div>

          {/* ── Nav Tabs ────────────────────────────────────────── */}
          <div className="px-3 pb-2 flex gap-1">
            {[
              { id: 'chat',       icon: MessageSquare, label: 'Sovereign Chat' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setUi(prev => ({ ...prev, activeView: tab.id as any }))}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                  ui.activeView === tab.id 
                    ? "bg-white/8 text-white border border-white/10" 
                    : "text-white/30 hover:text-white/60 hover:bg-white/5"
                )}
              >
                <tab.icon size={11} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Studio Search ───────────────────────────────────── */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search studios..."
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-7 pr-3 py-1.5 text-[11px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/8 transition-all"
              />
            </div>
          </div>

          {/* ── Studios ─────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1 pb-2">

            {filteredStudios ? (
              // Search results flat view
              <div className="space-y-0.5">
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1 py-1">Results</div>
                {filteredStudios.map(studio => (
                  <StudioItem
                    key={studio.id}
                    studio={studio}
                    isActive={ui.activeView === studio.id}
                    onClick={() => { setUi(prev => ({ ...prev, activeView: studio.id as any })); setSearchQuery(''); }}
                  />
                ))}
              </div>
            ) : (
              // Grouped view
              studioGroups.map(group => (
                <div key={group.label}>
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
                    className="w-full flex items-center gap-2 px-1 py-1.5 group"
                  >
                    <div className={`w-1 h-3 rounded-full bg-gradient-to-b ${group.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                    <span className="text-[9px] font-black text-white/25 uppercase tracking-[0.15em] flex-1 text-left group-hover:text-white/50 transition-colors">
                      {group.label}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedGroup === group.label ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={10} className="text-white/20 group-hover:text-white/40" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedGroup === group.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-0.5 pb-1 pl-3">
                          {group.studios.map(studio => (
                            <StudioItem
                              key={studio.id}
                              studio={studio}
                              isActive={ui.activeView === studio.id}
                              onClick={() => setUi(prev => ({ ...prev, activeView: studio.id as any }))}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}

            {/* ── Conversation History ─────────────────────────── */}
            {!searchQuery && (
              <div className="pt-1">
                <div className="text-[9px] font-black text-white/20 uppercase tracking-widest px-1 py-1">Recent Sessions</div>
                {sessions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 opacity-20">
                    <MessageSquare size={18} className="mb-2" />
                    <p className="text-[9px] tracking-widest font-bold">No sessions yet</p>
                  </div>
                )}
                {sessions.slice(0, 8).map(s => (
                  <motion.div
                    key={s.id}
                    onClick={() => setCurrentSessionId(s.id)}
                    whileHover={{ x: 2 }}
                    className={cn(
                      "group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all relative",
                      currentSessionId === s.id
                        ? "bg-indigo-500/10 text-indigo-200"
                        : "text-white/30 hover:bg-white/5 hover:text-white/60"
                    )}
                  >
                    {currentSessionId === s.id && (
                      <motion.div layoutId="session-indicator" className="absolute left-0 inset-y-2 w-0.5 bg-indigo-400 rounded-full" />
                    )}
                    <Hash size={10} className="flex-shrink-0 opacity-40" />
                    <span className="text-[11px] font-medium flex-1 truncate">{s.title || 'Untitled'}</span>
                    <button
                      onClick={e => { e.stopPropagation(); deleteSession(e, s.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                      <X size={9} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer: Model Selector ───────────────────────────── */}
          <div className="p-3 border-t border-white/[0.06] bg-black/30 space-y-2 shrink-0">
            {/* Model tabs */}
            <div className="flex gap-0.5 p-0.5 bg-white/5 rounded-lg">
              {(['native', 'ollama', 'cloud'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setModelTab(tab)}
                  className={cn(
                    "flex-1 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all",
                    modelTab === tab ? "bg-indigo-500/25 text-indigo-300" : "text-white/25 hover:text-white/50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Model selector */}
            <div className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/[0.06] flex items-center gap-2">
              <Brain size={11} className="text-indigo-400 flex-shrink-0" />
              <select
                value={currentModel}
                onChange={e => setCurrentModel(e.target.value)}
                className="bg-transparent border-none text-[11px] font-semibold text-white/80 focus:outline-none w-full cursor-pointer appearance-none"
              >
                {modelTab === 'native' ? (
                  <option value="sovereign-core-v13" className="bg-slate-900">Sovereign Core v{APP_VERSION}</option>
                ) : modelTab === 'ollama' ? (
                  availableModels.length > 0 
                    ? availableModels.map(m => <option key={m} value={m} className="bg-slate-900">{m}</option>)
                    : <option value="" className="bg-slate-900">Run 'ollama serve' first</option>
                ) : (
                  <option value="cloud-api" className="bg-slate-900">Configure API Keys →</option>
                )}
              </select>
            </div>

            {/* Status row */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles size={9} className="text-indigo-400/60" />
                <span className="text-[9px] text-white/20 font-bold uppercase tracking-wider">24 Studios Active</span>
              </div>
              <button
                onClick={clearAllHistory}
                className="text-[9px] text-white/15 hover:text-red-400 transition-colors font-bold uppercase tracking-wider"
              >
                Purge
              </button>
            </div>
          </div>

        </div>
      </motion.aside>
    </>
  );
};

// ── Studio Row Item ─────────────────────────────────────────────────────────
const StudioItem: React.FC<{
  studio: { id: string; icon: any; label: string; color: string };
  isActive: boolean;
  onClick: () => void;
}> = ({ studio, isActive, onClick }) => (
  <motion.button
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-all group",
      isActive
        ? "bg-white/8 border border-white/10 shadow-sm"
        : "hover:bg-white/5 border border-transparent"
    )}
  >
    <studio.icon size={13} className={cn("flex-shrink-0 transition-colors", isActive ? studio.color : "text-white/25 group-hover:text-white/50")} />
    <span className={cn("text-[11px] font-semibold transition-colors flex-1", isActive ? "text-white/90" : "text-white/35 group-hover:text-white/65")}>
      {studio.label}
    </span>
    {isActive && (
      <motion.div
        layoutId={`studio-dot-${studio.id}`}
        className={cn("w-1 h-1 rounded-full flex-shrink-0", studio.color.replace('text-', 'bg-'))}
      />
    )}
  </motion.button>
);
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
