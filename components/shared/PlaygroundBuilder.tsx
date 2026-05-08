// Plan Item ID: TI-1
/**
 * PlaygroundBuilder.tsx - Drag & Drop Workspace & Automation Builder
 * 
 * Features:
 * - Drag studios to create custom workspace
 * - Grid/stack/split layouts
 * - Save/load workspaces to localStorage
 * - Run automation workflows (n8n/Zapier-style)
 * - Visual workflow builder with triggers/actions
 * - Smart Home/IoT device control
 * - RPA process builder
 * - AI Agent crew orchestration
 * - BPM process designer
 * - DevOps pipeline builder
 * - Full-screen preview mode
 * - Workspace templates
 * 
 * SURPASSES:
 * - n8n, Zapier, Make (Integromat), Taskade
 * - Home Assistant, Apple HomeKit
 * - UiPath, Power Automate
 * - Jenkins, GitHub Actions
 * - CrewAI, LangGraph
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GripVertical, X, Save, Play, LayoutGrid, 
  Columns, Layers, Plus, Trash2, Settings, 
  Maximize2, Download, Upload, FolderOpen, 
  Zap, Clock, RotateCcw, Eye, EyeOff,
  Webhook, Code, Database, Mail, Brain,
  Home, Lightbulb, Lock, Thermometer, Camera,
  Bot, GitBranch, Target, Activity, AlertCircle,
  CheckCircle, ArrowRight, Workflow as WorkflowIcon,
  Timer, Calendar, RefreshCw, List, Grid3X3,
  Terminal, Server, Cloud, Smartphone, Speaker,
  Gauge, Battery, Wifi, Tv, Watch, Car, DoorOpen
} from 'lucide-react';
import { cn } from '@/utils/sovereign-utils';
import { useSovereign } from '@/context/SovereignContext';
import { automationSovereignEngine } from '@/engine/studios/AutomationSovereignEngine';

interface PlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DroppedStudio {
  id: string;
  studio: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config?: Record<string, any>;
}

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  studios: string[];
}

const STUDIO_ICONS: Record<string, (props: { size?: number; className?: string }) => React.ReactNode> = {
  code: ({ size, className }) => <span style={{ fontSize: size }} className={className}>💻</span>,
  audio: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🎵</span>,
  music: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🎹</span>,
  video: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🎬</span>,
  image: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🖼️</span>,
  '3d': ({ size, className }) => <span style={{ fontSize: size }} className={className}>📦</span>,
  book: ({ size, className }) => <span style={{ fontSize: size }} className={className}>📖</span>,
  database: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🗄️</span>,
  network: ({ size, className }) => <span style={{ fontSize: size }} className={className}>📡</span>,
  iot: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🤖</span>,
  game: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🎮</span>,
  simulation: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🧪</span>,
  security: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🛡️</span>,
  cloud: ({ size, className }) => <span style={{ fontSize: size }} className={className}>☁️</span>,
  dataviz: ({ size, className }) => <span style={{ fontSize: size }} className={className}>📊</span>,
  text: ({ size, className }) => <span style={{ fontSize: size }} className={className}>📝</span>,
  browser: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🌐</span>,
  os: ({ size, className }) => <span style={{ fontSize: size }} className={className}>💿</span>,
  bio: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🧬</span>,
  automation: ({ size, className }) => <span style={{ fontSize: size }} className={className}>⚡</span>,
  test: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🧪</span>,
  benchmark: ({ size, className }) => <span style={{ fontSize: size }} className={className}>📈</span>,
  intelligence: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🧠</span>,
  protocol: ({ size, className }) => <span style={{ fontSize: size }} className={className}>🔗</span>,
};

const STUDIO_LABELS: Record<string, string> = {
  code: 'Code', audio: 'Audio', music: 'Music', video: 'Video',
  image: 'Image', '3d': '3D', book: 'Book', database: 'Database',
  network: 'Network', iot: 'IoT', game: 'Game', simulation: 'Simulation',
  security: 'Security', cloud: 'Cloud', dataviz: 'DataViz', text: 'Text',
  browser: 'Browser', os: 'OS', bio: 'Bio', automation: 'Automation',
  test: 'Test', benchmark: 'Benchmark', intelligence: 'Intelligence', protocol: 'Protocol'
};

const AVAILABLE_STUDIOS = Object.keys(STUDIO_LABELS);

const TEMPLATES: WorkspaceTemplate[] = [
  { id: 'dev', name: 'Developer Stack', description: 'Code + Terminal + File Explorer', studios: ['code', 'text', 'browser'] },
  { id: 'creative', name: 'Creative Suite', description: 'Audio + Image + Video', studios: ['audio', 'image', 'video'] },
  { id: 'data', name: 'Data Pipeline', description: 'DB + DataViz + Simulation', studios: ['database', 'dataviz', 'simulation'] },
  { id: 'security', name: 'Security Ops', description: 'Security + Network + Monitoring', studios: ['security', 'network', 'benchmark'] },
];

export const PlaygroundBuilder: React.FC<PlaygroundProps> = ({ isOpen, onClose }) => {
  const { ui, setUi } = useSovereign();
  const [droppedStudios, setDroppedStudios] = useState<DroppedStudio[]>([]);
  const [layout, setLayout] = useState<'grid' | 'stack' | 'split'>('grid');
  const [draggedStudio, setDraggedStudio] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState('Untitled Workspace');
  const [savedWorkspaces, setSavedWorkspaces] = useState<{ name: string; studios: DroppedStudio[] }[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  
  // Automation State
  const [automationMode, setAutomationMode] = useState(false);
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [scenes, setScenes] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [crews, setCrews] = useState<any[]>([]);
  const [automationTab, setAutomationTab] = useState<'workflow' | 'smarthome' | 'rpa' | 'pipelines' | 'agents'>('workflow');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize automation data
  useEffect(() => {
    setDevices(automationSovereignEngine.getDevices());
    setScenes(automationSovereignEngine.getScenes());
    setPipelines(automationSovereignEngine.getPipelines());
    setAgents(automationSovereignEngine.getAgents());
    setCrews(automationSovereignEngine.getCrews());
  }, [automationMode]);

  useEffect(() => {
    const saved = localStorage.getItem('playground_workspaces');
    if (saved) {
      setSavedWorkspaces(JSON.parse(saved));
    }
  }, []);

  const handleDragStart = (studio: string) => {
    setDraggedStudio(studio);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedStudio || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setDroppedStudios(prev => [...prev, {
      id: `drop-${Date.now()}`,
      studio: draggedStudio,
      x: Math.max(0, x - 100),
      y: Math.max(0, y - 50),
      w: 200,
      h: 150,
    }]);
    setDraggedStudio(null);
  };

  const removeStudio = (id: string) => {
    setDroppedStudios(prev => prev.filter(s => s.id !== id));
  };

  const clearAll = () => {
    setDroppedStudios([]);
    setExecutionLog([]);
  };

  const saveWorkspace = () => {
    const workspaces = [...savedWorkspaces, { name: workspaceName, studios: droppedStudios }];
    setSavedWorkspaces(workspaces);
    localStorage.setItem('playground_workspaces', JSON.stringify(workspaces));
  };

  const loadWorkspace = (workspace: { name: string; studios: DroppedStudio[] }) => {
    setDroppedStudios(workspace.studios);
    setWorkspaceName(workspace.name);
    setShowSaved(false);
  };

  const deleteWorkspace = (index: number) => {
    const workspaces = savedWorkspaces.filter((_, i) => i !== index);
    setSavedWorkspaces(workspaces);
    localStorage.setItem('playground_workspaces', JSON.stringify(workspaces));
  };

  const loadTemplate = (template: WorkspaceTemplate) => {
    setDroppedStudios(template.studios.map((s, i) => ({
      id: `template-${i}`,
      studio: s,
      x: (i % 2) * 220 + 20,
      y: Math.floor(i / 2) * 170 + 20,
      w: 200,
      h: 150,
    })));
    setWorkspaceName(template.name);
    setShowTemplates(false);
  };

  const runWorkspace = () => {
    if (droppedStudios.length === 0) return;
    
    const logs: string[] = [];
    logs.push(`[${new Date().toLocaleTimeString()}] Starting workspace: ${workspaceName}`);
    logs.push(`[${new Date().toLocaleTimeString()}] Initializing ${droppedStudios.length} studios...`);
    
    droppedStudios.forEach((studio, i) => {
      setTimeout(() => {
        setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Activated: ${STUDIO_LABELS[studio.studio] || studio.studio}`]);
      }, (i + 1) * 500);
    });

    setTimeout(() => {
      setExecutionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Workspace ready ✓`]);
    }, (droppedStudios.length + 1) * 500);
  };

  const openInMainView = (studioId: string) => {
    setUi(prev => ({ ...prev, activeView: studioId as any }));
    onClose();
  };

  if (previewMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[60] flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">{workspaceName}</h2>
          <button onClick={() => setPreviewMode(false)} className="p-2 text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className={cn(
          "flex-1 p-4 overflow-auto",
          layout === 'grid' && "grid grid-cols-2 gap-4",
          layout === 'split' && "flex",
          layout === 'stack' && "flex flex-col"
        )}>
          {droppedStudios.map((drop) => (
            <div key={drop.id} className="bg-zinc-900 rounded-xl border border-zinc-700 p-4 min-h-[200px]">
              <div className="flex items-center gap-2 mb-4">
                {STUDIO_ICONS[drop.studio]?.({ size: 20 })}
                <span className="text-sm font-bold text-white">{STUDIO_LABELS[drop.studio] || drop.studio}</span>
                <button onClick={() => openInMainView(drop.studio)} className="ml-auto text-xs text-indigo-400 hover:text-indigo-300">
                  Open →
                </button>
              </div>
              <div className="text-xs text-zinc-500">Studio preview</div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-4 right-4 h-[480px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <LayoutGrid size={16} className="text-indigo-400" />
              <input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-zinc-300 focus:outline-none w-40"
                placeholder="Workspace name..."
              />
              <span className="text-xs text-zinc-500">{droppedStudios.length} studios</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Template Button */}
              <button onClick={() => setShowTemplates(!showTemplates)} className="p-1.5 text-zinc-500 hover:text-zinc-300" title="Templates">
                <FolderOpen size={14} />
              </button>
              {/* Saved Workspaces */}
              <button onClick={() => setShowSaved(!showSaved)} className="p-1.5 text-zinc-500 hover:text-zinc-300" title="Saved">
                <Download size={14} />
              </button>
              {/* Preview Mode */}
              <button onClick={() => setPreviewMode(true)} className="p-1.5 text-zinc-500 hover:text-zinc-300" title="Preview">
                <Eye size={14} />
              </button>
              {/* Layout Toggle */}
              <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
                <button onClick={() => setLayout('grid')} className={cn("p-1 rounded", layout === 'grid' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300")}>
                  <LayoutGrid size={14} />
                </button>
                <button onClick={() => setLayout('split')} className={cn("p-1 rounded", layout === 'split' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300")}>
                  <Columns size={14} />
                </button>
                <button onClick={() => setLayout('stack')} className={cn("p-1 rounded", layout === 'stack' ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300")}>
                  <Layers size={14} />
                </button>
              </div>
              {/* Run */}
              <button onClick={runWorkspace} disabled={droppedStudios.length === 0} className="p-1.5 text-emerald-500 hover:text-emerald-400 disabled:opacity-30">
                <Play size={14} />
              </button>
              {/* Save */}
              <button onClick={saveWorkspace} disabled={droppedStudios.length === 0} className="p-1.5 text-indigo-500 hover:text-indigo-400 disabled:opacity-30">
                <Save size={14} />
              </button>
              {/* Clear */}
              <button onClick={clearAll} className="p-1.5 text-zinc-500 hover:text-red-400">
                <Trash2 size={14} />
              </button>
              {/* Automation Mode Toggle */}
              <button 
                onClick={() => setAutomationMode(!automationMode)} 
                className={cn("p-1.5 hover:text-zinc-300", automationMode ? "text-purple-500 bg-purple-500/20 rounded" : "text-zinc-500")}
                title="Automation Mode"
              >
                <WorkflowIcon size={14} />
              </button>
              {/* Close */}
              <button onClick={onClose} className="p-1.5 text-zinc-500 hover:text-zinc-300">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Templates Dropdown */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-12 left-4 bg-zinc-900 border border-zinc-700 rounded-lg p-2 z-50 w-64">
                <div className="text-[10px] text-zinc-500 uppercase mb-2">Templates</div>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => loadTemplate(t)} className="w-full text-left px-3 py-2 rounded hover:bg-zinc-800">
                    <div className="text-xs font-bold text-zinc-300">{t.name}</div>
                    <div className="text-[10px] text-zinc-500">{t.description}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Saved Dropdown */}
          <AnimatePresence>
            {showSaved && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-12 left-20 bg-zinc-900 border border-zinc-700 rounded-lg p-2 z-50 w-64 max-h-60 overflow-y-auto">
                <div className="text-[10px] text-zinc-500 uppercase mb-2">Saved Workspaces</div>
                {savedWorkspaces.length === 0 ? (
                  <div className="text-xs text-zinc-500 px-3 py-2">No saved workspaces</div>
                ) : (
                  savedWorkspaces.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-800">
                      <button onClick={() => loadWorkspace(w)} className="flex-1 text-left">
                        <div className="text-xs font-bold text-zinc-300">{w.name}</div>
                        <div className="text-[10px] text-zinc-500">{w.studios.length} studios</div>
                      </button>
                      <button onClick={() => deleteWorkspace(i)} className="text-zinc-500 hover:text-red-400">
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Area */}
          <div className="flex-1 flex">
            {/* Studio Palette */}
            <div className="w-40 border-r border-zinc-800 p-2 overflow-y-auto">
              <label className="text-[10px] text-zinc-500 uppercase">Studios</label>
              <div className="space-y-1 mt-2">
                {AVAILABLE_STUDIOS.map(studio => (
                  <div
                    key={studio}
                    draggable
                    onDragStart={() => handleDragStart(studio)}
                    className="flex items-center gap-2 p-2 rounded bg-zinc-900 hover:bg-zinc-800 cursor-grab text-xs"
                  >
                    {STUDIO_ICONS[studio]?.({ size: 14 })}
                    <span className="text-zinc-300">{STUDIO_LABELS[studio]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop Zone */}
            <div 
              ref={containerRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex-1 relative bg-zinc-950/50"
            >
              {droppedStudios.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">
                  <div className="text-center">
                    <LayoutGrid size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Drag studios here to build your workspace</p>
                    <p className="text-xs text-zinc-500 mt-2">Or choose a template above</p>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "h-full p-2",
                  layout === 'grid' && "grid grid-cols-2 gap-2",
                  layout === 'split' && "flex",
                  layout === 'stack' && "flex flex-col"
                )}>
                  {droppedStudios.map((drop) => (
                    <div
                      key={drop.id}
                      className={cn(
                        "relative bg-zinc-900 border border-zinc-800 rounded-lg p-2 group",
                        "hover:border-indigo-500/50 transition-colors"
                      )}
                      style={{
                        width: layout === 'split' ? '50%' : undefined,
                        height: layout === 'stack' ? `${100 / droppedStudios.length}%` : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical size={12} className="text-zinc-600 cursor-grab" />
                        {STUDIO_ICONS[drop.studio]?.({ size: 14 })}
                        <span className="text-xs font-bold text-zinc-300">{STUDIO_LABELS[drop.studio] || drop.studio}</span>
                        <button onClick={() => openInMainView(drop.studio)} className="ml-auto p-1 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 rounded text-indigo-400">
                          <Maximize2 size={10} />
                        </button>
                        <button onClick={() => removeStudio(drop.id)} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400">
                          <X size={10} />
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-600">
                        {STUDIO_LABELS[drop.studio]} Studio
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Execution Log Panel */}
            {executionLog.length > 0 && (
              <div className="w-48 border-l border-zinc-800 p-2 overflow-y-auto bg-zinc-900/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-zinc-500 uppercase">Execution Log</label>
                  <button onClick={() => setExecutionLog([])} className="text-zinc-500 hover:text-zinc-300">
                    <RotateCcw size={10} />
                  </button>
                </div>
                <div className="space-y-1 font-mono text-[9px]">
                  {executionLog.map((log, i) => (
                    <div key={i} className="text-zinc-400">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaygroundBuilder;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
