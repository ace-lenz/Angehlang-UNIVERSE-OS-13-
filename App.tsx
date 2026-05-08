// Plan Item ID: TI-1
import React, { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Settings, Maximize, Minimize, Loader2, Zap, LayoutTemplate, Layers, X, Menu, Gauge } from 'lucide-react';

// Context & State
import { SovereignProvider, useSovereign } from '@/context/SovereignContext';
import { cn } from '@/utils/sovereign-utils';

// Decomposed Layout Components
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatInterface } from '@/components/layout/ChatInterface';
import { NeuralActionStreamPanel } from '@/components/dashboard/NeuralActionStreamPanel';
import { SettingsPanel } from '@/components/shared/SettingsPanel';
import { PlaygroundBuilder } from '@/components/shared/PlaygroundBuilder';
// Lazy Components
const AudioStudio = lazy(() => import('@/components/studios/AudioStudio').then(m => ({ default: m.AudioStudio })));
const CodeStudio = lazy(() => import('@/components/studios/CodeStudio').then(m => ({ default: m.CodeStudio })));
const VideoPlayer = lazy(() => import('@/components/studios/VideoPlayer').then(m => ({ default: m.VideoPlayer })));
const ImageStudio = lazy(() => import('@/components/studios/ImageStudio').then(m => ({ default: m.ImageStudio })));
const ThreeDViewer = lazy(() => import('@/components/studios/ThreeDViewer').then(m => ({ default: m.ThreeDViewer })));
const BookStudio = lazy(() => import('@/components/studios/BookStudio').then(m => ({ default: m.BookStudio })));
const DatabaseStudio = lazy(() => import('@/components/studios/DatabaseStudio').then(m => ({ default: m.DatabaseStudio })));
const NetworkStudio = lazy(() => import('@/components/studios/NetworkStudio').then(m => ({ default: m.NetworkStudio })));
const IoTStudio = lazy(() => import('@/components/studios/IoTStudio').then(m => ({ default: m.IoTStudio })));
const GameStudio = lazy(() => import('@/components/studios/GameStudio').then(m => ({ default: m.GameStudio })));
const SimulationStudio = lazy(() => import('@/components/studios/SimulationStudio').then(m => ({ default: m.SimulationStudio })));
const SecurityStudio = lazy(() => import('@/components/studios/SecurityStudio').then(m => ({ default: m.SecurityStudio })));
const CloudStudio = lazy(() => import('@/components/studios/CloudStudio').then(m => ({ default: m.CloudStudio })));
const DataVizStudio = lazy(() => import('@/components/studios/DataVizStudio').then(m => ({ default: m.DataVizStudio })));
const TextProcessingStudio = lazy(() => import('@/components/studios/TextProcessingStudio').then(m => ({ default: m.TextProcessingStudio })));
const BrowserStudio = lazy(() => import('@/components/studios/BrowserStudio'));
const OSStudio = lazy(() => import('@/components/studios/OSStudio'));
const SyntheticBioStudio = lazy(() => import('@/components/studios/SyntheticBioStudio').then(m => ({ default: m.SyntheticBioStudio })));
const AutomationDashboard = lazy(() => import('@/components/studios/AutomationDashboard').then(m => ({ default: m.AutomationDashboard })));
const ProgressiveTestStudio = lazy(() => import('@/components/studios/ProgressiveTestStudio'));
const BenchmarkStudio = lazy(() => import('@/components/studios/BenchmarkStudio'));
const IntelligenceHubStudio = lazy(() => import('@/components/studios/IntelligenceHubStudio'));
const A2ACommunicationHubStudio = lazy(() => import('@/components/studios/A2ACommunicationHubStudio'));
const MusicProductionStudio = lazy(() => import('@/components/studios/MusicProductionStudio').then(m => ({ default: m.MusicProductionStudio })));
const EvolutionStudio = lazy(() => import('@/components/studios/EvolutionStudio'));
const MathematicsStudio = lazy(() => import('@/components/studios/MathematicsStudio'));
const SovereignMaturityStudio = lazy(() => import('@/components/studios/SovereignMaturityStudio'));

// Lazy Components
const UniversalExplorer = lazy(() => import('@/components/explorer/UniversalExplorer').then(m => ({ default: m.UniversalExplorer })));
const ChangeReviewer = lazy(() => import('@/components/shared/ChangeReviewer').then(m => ({ default: m.ChangeReviewer })));

const OS_Content: React.FC = () => {
  const { ui, setUi, neuralStatus, hasOllama, vitals } = useSovereign();
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [topHover, setTopHover] = React.useState(false);
  const [playgroundOpen, setPlaygroundOpen] = React.useState(false);
  const [studioDropdownOpen, setStudioDropdownOpen] = React.useState(false);

  const showTop = !ui.autoHideNav || topHover || settingsOpen;

  // Close dropdown when clicking outside or pressing Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStudioDropdownOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      const dropdown = document.getElementById('studio-dropdown');
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setStudioDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleQuickStudio = (studioId: string) => {
    setUi(prev => ({ ...prev, activeView: studioId as any }));
    setStudioDropdownOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans relative bg-[#060812] text-slate-50">
      {/* ── Ambient Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-600/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-cyan-600/4 rounded-full blur-[80px]" />
      </div>
      
      {/* Mobile Drawer Overlay */}
      <div className={cn("mobile-overlay lg:hidden", ui.sidebarOpen ? "active" : "")} onClick={() => setUi(prev => ({ ...prev, sidebarOpen: false }))} />
      <div className={cn("sidebar-drawer lg:static lg:block", ui.sidebarOpen ? "open" : "")}>
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Invisible Hover Zone to Trigger Top Bar */}
        {ui.autoHideNav && !ui.zenMode && (
          <div 
            onMouseEnter={() => setTopHover(true)} 
            className="absolute top-0 left-0 w-full h-8 z-[35]" 
          />
        )}

        {/* ── Top Command Bar ── */}
        {!ui.zenMode && (
          <div
            onMouseEnter={() => setTopHover(true)}
            onMouseLeave={() => setTopHover(false)}
            className={cn(
              "absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-40",
              "border-b border-white/[0.06] backdrop-blur-2xl bg-[#060812]/80 transition-all duration-200",
              showTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            )}
          >
            {/* Left — Sidebar toggle + Breadcrumb */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setUi(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))}
                className="p-1.5 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/70 transition-all flex"
                title="Toggle Sidebar"
              >
                <Menu size={15} />
              </button>
              <div className="h-4 w-px bg-white/8" />
              {ui.activeView !== 'chat' && ui.activeView !== 'monitoring' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUi(prev => ({ ...prev, activeView: 'chat' }))}
                    className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/60 transition-colors"
                  >
                    <Layers size={10} />
                    Home
                  </button>
                  <span className="text-white/15 text-sm">/</span>
                  <span className="text-[11px] font-semibold text-indigo-400 capitalize">{ui.activeView} Studio</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-white/30">Sovereign Workspace</span>
                </div>
              )}
            </div>

            {/* Right — Status + Controls */}
            <div className="flex items-center gap-1.5">
              {ui.isThinking && (
                <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mr-1">
                  <Loader2 size={10} className="animate-spin" />
                  <span className="tracking-widest font-bold">SYNTHESIZING</span>
                </div>
              )}
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border",
                hasOllama
                  ? "bg-violet-500/10 border-violet-500/20 text-violet-300"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              )}>
                <div className={cn("w-1.5 h-1.5 rounded-full", hasOllama ? "bg-violet-400 animate-pulse" : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]")} />
                {hasOllama ? 'Cluster' : 'Sovereign'}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono text-white/30">
                <Gauge size={10} />
                <span>{(vitals?.latencyMs || 42).toFixed(0)}ms / 60 FPS</span>
              </div>
              <div className="h-4 w-px bg-white/8 mx-0.5" />
              <button onClick={() => setPlaygroundOpen(true)} className="p-1.5 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/60 transition-all" title="Playground">
                <LayoutTemplate size={14} />
              </button>
              <button onClick={() => setSettingsOpen(true)} className="p-1.5 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/60 transition-all" title="Settings">
                <Settings size={14} />
              </button>
              <button onClick={() => setUi(prev => ({ ...prev, zenMode: !prev.zenMode }))} className="p-1.5 rounded-lg hover:bg-white/8 text-white/25 hover:text-white/60 transition-all" title="Focus Mode">
                {ui.zenMode ? <Minimize size={14} /> : <Maximize size={14} />}
              </button>
            </div>
          </div>
        )}

        {/* ── Dynamic View Engine ── */}
        <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row" style={{ paddingTop: ui.zenMode ? 0 : 48 }}>
          {/* Main Pane (Left) */}
          <div className={cn("relative transition-all duration-300 flex flex-col h-full z-20 w-full md:w-auto", ui.splitView ? "md:w-[55%] border-r border-white/10" : "flex-1", (ui.splitView || ui.activeView === 'chat') ? "" : "hidden md:flex")}>
            <ChatInterface />
          </div>

          {/* Secondary Pane (Right — Studio) */}
          <div className={cn(
            "relative transition-all duration-300 h-full flex-1 w-full md:w-auto",
            ui.splitView
              ? "md:w-[45%] border-l border-white/[0.06]"
              : (ui.activeView === 'chat' ? 'hidden md:block w-0 overflow-hidden opacity-0' : 'absolute inset-0 z-30 md:relative')
          )}>
            <Suspense fallback={
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060812]/80 backdrop-blur-xl z-50">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center mb-4">
                    <Loader2 className="animate-spin text-indigo-400" size={20} />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse" />
                </div>
                <span className="text-indigo-300/70 text-[10px] tracking-[0.3em] uppercase font-bold">Loading Studio</span>
              </div>
            }>
              <AnimatePresence mode="wait">
                <motion.div
                  key={ui.activeView === 'chat' ? 'monitoring' : ui.activeView}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex flex-col"
                >
                  {(ui.activeView === 'monitoring' || (ui.splitView && ui.activeView === 'chat')) ? (
                    <NeuralActionStreamPanel />
                  ) : ui.activeView === 'knowledge' ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500 font-light tracking-widest italic">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                        Knowledge Hub Bridge Synchronizing...
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                      </div>
                    </div>
                  ) : ui.activeView === 'audio' ? (
                    <div className="studio-scroll custom-scrollbar"><AudioStudio /></div>
                  ) : ui.activeView === 'code' ? (
                    <div className="flex-1 overflow-hidden"><CodeStudio /></div>
                  ) : ui.activeView === 'video' ? (
                    <div className="studio-scroll custom-scrollbar"><VideoPlayer /></div>
                  ) : ui.activeView === 'image' ? (
                    <div className="studio-scroll custom-scrollbar"><ImageStudio /></div>
                  ) : ui.activeView === '3d' ? (
                    <div className="studio-scroll custom-scrollbar"><ThreeDViewer /></div>
                  ) : ui.activeView === 'book' ? (
                    <div className="studio-scroll custom-scrollbar"><BookStudio /></div>
                  ) : ui.activeView === 'database' ? (
                    <div className="studio-scroll custom-scrollbar"><DatabaseStudio /></div>
                  ) : ui.activeView === 'network' ? (
                    <div className="studio-scroll custom-scrollbar"><NetworkStudio /></div>
                  ) : ui.activeView === 'iot' ? (
                    <div className="studio-scroll custom-scrollbar"><IoTStudio /></div>
                  ) : ui.activeView === 'game' ? (
                    <div className="studio-scroll custom-scrollbar"><GameStudio /></div>
                  ) : ui.activeView === 'simulation' ? (
                    <div className="studio-scroll custom-scrollbar"><SimulationStudio /></div>
                  ) : ui.activeView === 'security' ? (
                    <div className="studio-scroll custom-scrollbar"><SecurityStudio /></div>
                  ) : ui.activeView === 'cloud' ? (
                    <div className="studio-scroll custom-scrollbar"><CloudStudio /></div>
                  ) : ui.activeView === 'dataviz' ? (
                    <div className="studio-scroll custom-scrollbar"><DataVizStudio /></div>
                  ) : ui.activeView === 'text' ? (
                    <div className="studio-scroll custom-scrollbar"><TextProcessingStudio /></div>
                  ) : ui.activeView === 'browser' ? (
                    <div className="flex-1 overflow-hidden"><BrowserStudio /></div>
                  ) : ui.activeView === 'os' ? (
                    <div className="studio-scroll custom-scrollbar"><OSStudio /></div>
                  ) : ui.activeView === 'bio' ? (
                    <div className="studio-scroll custom-scrollbar"><SyntheticBioStudio /></div>
                  ) : ui.activeView === 'automation' ? (
                    <div className="studio-scroll custom-scrollbar"><AutomationDashboard /></div>
                  ) : ui.activeView === 'test' ? (
                    <div className="studio-scroll custom-scrollbar"><ProgressiveTestStudio /></div>
                  ) : ui.activeView === 'benchmark' ? (
                    <div className="studio-scroll custom-scrollbar"><BenchmarkStudio /></div>
                  ) : ui.activeView === 'intelligence' ? (
                    <div className="studio-scroll custom-scrollbar"><IntelligenceHubStudio /></div>
                  ) : ui.activeView === 'protocol' ? (
                    <div className="studio-scroll custom-scrollbar"><A2ACommunicationHubStudio /></div>
                  ) : ui.activeView === 'music' ? (
                    <div className="studio-scroll custom-scrollbar"><MusicProductionStudio /></div>
                  ) : ui.activeView === 'evolution' ? (
                    <div className="studio-scroll custom-scrollbar"><EvolutionStudio /></div>
                  ) : ui.activeView === 'mathematics' ? (
                    <div className="studio-scroll custom-scrollbar"><MathematicsStudio /></div>
                  ) : ui.activeView === 'maturity' ? (
                    <div className="studio-scroll custom-scrollbar"><SovereignMaturityStudio /></div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </div>
        </div>

        {/* ── Toast Notifications ── */}
        <AnimatePresence>
          {ui.toast && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl bg-[#0c0e1a]/95 border border-indigo-500/25 text-xs text-white/80 shadow-2xl backdrop-blur-xl flex items-center gap-2"
            >
               {ui.toast.message}
             </motion.div>
          )}
</AnimatePresence>
      </main>

      <AnimatePresence>
        {settingsOpen && <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />}
        {playgroundOpen && <PlaygroundBuilder isOpen={playgroundOpen} onClose={() => setPlaygroundOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <SovereignProvider>
      <OS_Content />
    </SovereignProvider>
  );
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
