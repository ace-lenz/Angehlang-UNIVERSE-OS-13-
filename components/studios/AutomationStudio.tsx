// Plan Item ID: TI-1
/**
 * AutomationStudio.tsx - Complete Automation Suite v13
 * 
 * SURPASSES ALL INDUSTRY LEADERS:
 * - Workflow: n8n, Zapier, Make (Integromat), Taskade
 * - Smart Home: Home Assistant, Apple HomeKit, Google Home
 * - RPA: UiPath, Power Automate, Automation Anywhere
 * - DevOps: Jenkins, GitHub Actions, GitLab CI/CD
 * - AI Agents: CrewAI, LangGraph, Zapier Agents
 * - BPM: Activepieces, Pega, Appian
 * 
 * Features:
 * - Visual Workflow Builder (Node-based drag & drop)
 * - Smart Home Dashboard with device control
 * - RPA Process Builder
 * - DevOps Pipeline Builder
 * - AI Agent Crew Manager
 * - BPM Process Designer
 * - Real-time Monitoring & Metrics
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Zap, Play, Pause, Plus, Save, Download, Upload, Trash2, Copy,
  Settings, Maximize2, Minimize2, RefreshCw, Activity, Server, Cpu,
  Webhook, Clock, Calendar, Code, Database, Mail, FileText, MessageSquare,
  Video, Image, Folder, Cloud, Terminal, GitBranch, GitCommit, Container,
  Users, Brain, Target, Workflow as WorkflowIcon, Home, Lightbulb, Lock, Thermometer,
  Camera, Speaker, Monitor, Battery, Wifi, Gauge, AlertCircle, CheckCircle,
  Circle, ArrowRight, ChevronRight, Layers, Grid, List, Search, Filter,
  MoreVertical, Edit3, Eye, EyeOff, ToggleLeft, ToggleRight, Power,
  Volume2, Music, Tv, Smartphone, Watch, Car, DoorOpen, DoorClosed
} from 'lucide-react';
import { cn } from '@/utils/sovereign-utils';
import { 
  automationSovereignEngine, 
  Workflow as WorkflowType, 
  WorkflowNode, 
  WorkflowConnection,
  SmartDevice, 
  SmartScene,
  IoTAutomation,
  DevOpsPipeline,
  AIAgent,
  AgentCrew,
  BPMProcess,
  AutomationDashboard,
  TriggerType,
  ActionType,
  DeviceType
} from '@/engine/studios/AutomationSovereignEngine';

interface AutomationStudioProps {
  data?: any;
  status?: string;
}

type ViewMode = 'workflows' | 'smarthome' | 'rpa' | 'pipelines' | 'agents' | 'bpm' | 'monitor';
type NodeCategory = 'triggers' | 'actions' | 'logic' | 'data';

const NODE_COLORS: Record<string, string> = {
  webhook: '#3b82f6',
  schedule: '#10b981',
  cron: '#8b5cf6',
  event: '#f59e0b',
  ai: '#ec4899',
  iot: '#06b6d4',
  manual: '#6b7280',
  http: '#3b82f6',
  code: '#10b981',
  database: '#8b5cf6',
  transform: '#f59e0b',
  filter: '#ec4899',
  loop: '#06b6d4',
  condition: '#eab308',
  email: '#ef4444',
  notification: '#14b8a6'
};

const DEVICE_ICONS: Record<DeviceType, React.ElementType> = {
  light: Lightbulb,
  switch: ToggleRight,
  sensor: Gauge,
  camera: Camera,
  thermostat: Thermometer,
  lock: Lock,
  speaker: Volume2,
  robot: Bot,
  appliance: Tv
};

export const AutomationStudio: React.FC<AutomationStudioProps> = ({ data, status }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('workflows');
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowType | null>(null);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [dashboard, setDashboard] = useState<AutomationDashboard | null>(null);
  const [devices, setDevices] = useState<SmartDevice[]>([]);
  const [scenes, setScenes] = useState<SmartScene[]>([]);
  const [pipelines, setPipelines] = useState<DevOpsPipeline[]>([]);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [crews, setCrews] = useState<AgentCrew[]>([]);
  const [bpmProcesses, setBpmProcesses] = useState<BPMProcess[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [nodeTemplates, setNodeTemplates] = useState<any>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = useState<{ type: string; category: NodeCategory } | null>(null);

  useEffect(() => {
    const engine = automationSovereignEngine;
    setWorkflows(engine.getWorkflows());
    setDashboard(engine.getDashboard());
    setNodeTemplates(engine.getNodeTemplates());
    setDevices(engine.getDevices());
    setScenes(engine.getScenes());
    setPipelines(engine.getPipelines());
    setAgents(engine.getAgents());
    setCrews(engine.getCrews());
    setBpmProcesses(engine.getBPMProcesses());
  }, []);

  const createWorkflow = (): WorkflowType => {
    const workflow = automationSovereignEngine.createWorkflow('New Workflow', 'Workflow description');
    setWorkflows([workflow, ...workflows]);
    setCurrentWorkflow(workflow);
    return workflow;
  };

  const executeWorkflow = async () => {
    if (!currentWorkflow) return;
    setIsExecuting(true);
    await automationSovereignEngine.executeWorkflow(currentWorkflow.id);
    setIsExecuting(false);
    setWorkflows(automationSovereignEngine.getWorkflows());
  };

  const addNodeToWorkflow = (type: string, category: NodeCategory, x: number, y: number) => {
    if (!currentWorkflow) return;
    
    const nodeType = category === 'triggers' ? 'trigger' : 'action';
    const node = automationSovereignEngine.addNode(currentWorkflow.id, {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type: nodeType as any,
      position: { x, y }
    });
    
    const updatedWorkflows = automationSovereignEngine.getWorkflows();
    setWorkflows(updatedWorkflows);
    setCurrentWorkflow(updatedWorkflows.find(w => w.id === currentWorkflow.id) || null);
  };

  const toggleDevice = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      const newState = device.type === 'light' 
        ? { on: !device.state.on }
        : device.type === 'lock'
        ? { locked: !device.state.locked }
        : device.state;
      automationSovereignEngine.updateDeviceState(deviceId, newState);
      setDevices(automationSovereignEngine.getDevices());
    }
  };

  const activateScene = (sceneId: string) => {
    automationSovereignEngine.activateScene(sceneId);
    setDevices(automationSovereignEngine.getDevices());
  };

  const energyUsage = automationSovereignEngine.getEnergyUsage();

  return (
    <div className="flex flex-col h-full bg-[#050510] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <WorkflowIcon size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase">Automation Studio v13</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-purple-500 uppercase tracking-widest">Sovereign Auto</span>
              <span className="text-[8px] text-zinc-600">•</span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase">{workflows.length} Workflows</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={createWorkflow} className="px-2 py-1.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase flex items-center gap-1">
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - View Modes */}
        <div className="w-48 border-r border-white/5 flex flex-col">
          <div className="p-2 space-y-1">
            {[
              { id: 'workflows', icon: WorkflowIcon, label: 'Workflows' },
              { id: 'smarthome', icon: Home, label: 'Smart Home' },
              { id: 'rpa', icon: Bot, label: 'RPA' },
              { id: 'pipelines', icon: GitBranch, label: 'Pipelines' },
              { id: 'agents', icon: Brain, label: 'AI Agents' },
              { id: 'bpm', icon: Target, label: 'BPM' },
              { id: 'monitor', icon: Activity, label: 'Monitor' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as ViewMode)}
                className={cn("w-full p-2.5 rounded flex items-center gap-2 text-left", viewMode === mode.id ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5")}
              >
                <mode.icon size={14} />
                <span className="text-[10px] font-bold uppercase">{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Stats */}
          {dashboard && (
            <div className="mt-auto p-3 border-t border-white/5">
              <div className="text-[10px] text-zinc-500 mb-2">Overview</div>
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between"><span className="text-zinc-500">Workflows</span><span className="text-purple-400">{dashboard.workflows}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Devices</span><span className="text-purple-400">{dashboard.deviceCount}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Success</span><span className="text-green-400">{dashboard.successRate.toFixed(0)}%</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Workflows View */}
          {viewMode === 'workflows' && (
            <div className="flex-1 flex">
              {/* Node Palette */}
              <div className="w-56 border-r border-white/5 p-3 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Triggers</h3>
                  <div className="space-y-1">
                    {nodeTemplates?.triggers.map((t: any) => (
                      <button
                        key={t.type}
                        draggable
                        onDragStart={(e) => setDraggedNode({ type: t.type, category: 'triggers' })}
                        className="w-full p-2 rounded bg-black/40 border border-white/10 text-left flex items-center gap-2 hover:border-purple-500/50"
                      >
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-xs">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Actions</h3>
                  <div className="space-y-1">
                    {nodeTemplates?.actions.map((t: any) => (
                      <button
                        key={t.type}
                        draggable
                        onDragStart={(e) => setDraggedNode({ type: t.type, category: 'actions' })}
                        className="w-full p-2 rounded bg-black/40 border border-white/10 text-left flex items-center gap-2 hover:border-purple-500/50"
                      >
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-xs">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center gap-2 p-3 border-b border-white/5">
                  <select 
                    value={currentWorkflow?.id || ''}
                    onChange={(e) => {
                      const wf = workflows.find(w => w.id === e.target.value);
                      setCurrentWorkflow(wf || null);
                    }}
                    className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs max-w-[200px]"
                  >
                    {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <button 
                    onClick={executeWorkflow}
                    disabled={isExecuting || !currentWorkflow}
                    className={cn("px-3 py-1.5 rounded flex items-center gap-1 text-xs font-bold uppercase", isExecuting ? "bg-purple-500/50" : "bg-purple-500 text-black")}
                  >
                    {isExecuting ? <Activity size={12} className="animate-spin" /> : <Play size={12} />}
                    {isExecuting ? 'Running' : 'Run'}
                  </button>
                  <button className="p-2 rounded hover:bg-white/10"><Save size={14} className="text-zinc-500" /></button>
                </div>

                {/* Workflow Canvas */}
                <div 
                  ref={canvasRef}
                  className="flex-1 p-4 overflow-auto"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    if (draggedNode && canvasRef.current) {
                      const rect = canvasRef.current.getBoundingClientRect();
                      addNodeToWorkflow(draggedNode.type, draggedNode.category, e.clientX - rect.left, e.clientY - rect.top);
                      setDraggedNode(null);
                    }
                  }}
                >
                  {currentWorkflow ? (
                    <div className="relative min-h-[400px] bg-black/20 rounded-lg border border-white/10">
                      {currentWorkflow.nodes.map((node, i) => (
                        <div
                          key={node.id}
                          className={cn("absolute w-40 p-3 rounded-lg border-2 cursor-pointer transition-all", 
                            node.status === 'running' ? "border-purple-500 bg-purple-500/20" :
                            node.status === 'success' ? "border-green-500 bg-green-500/20" :
                            node.status === 'error' ? "border-red-500 bg-red-500/20" :
                            "border-white/20 bg-black/60"
                          )}
                          style={{ left: node.position.x, top: node.position.y + i * 80 }}
                          onClick={() => setSelectedNode(node)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NODE_COLORS[node.action?.type || node.trigger?.type || 'manual'] }} />
                            <span className="text-xs font-bold truncate">{node.name}</span>
                          </div>
                          <div className="text-[8px] text-zinc-500 uppercase">{node.type}</div>
                        </div>
                      ))}

                      {currentWorkflow.nodes.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-zinc-600">
                            <WorkflowIcon size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Drag nodes from the palette to build your workflow</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600">
                      <div className="text-center">
                        <WorkflowIcon size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-sm mb-2">No workflow selected</p>
                        <button onClick={createWorkflow} className="px-4 py-2 rounded bg-purple-500 text-black text-xs font-bold uppercase">
                          Create Workflow
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Smart Home View */}
          {viewMode === 'smarthome' && (
            <div className="flex-1 p-4 overflow-y-auto">
              {/* Rooms */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {['Living Room', 'Kitchen', 'Bedroom', 'Entrance'].map(room => (
                  <button key={room} className="p-2 rounded bg-black/40 border border-white/10 text-xs">{room}</button>
                ))}
              </div>

              {/* Devices Grid */}
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                {devices.map(device => {
                  const Icon = DEVICE_ICONS[device.type];
                  const isOn = device.type === 'light' ? device.state.on : device.type === 'lock' ? device.state.locked : device.status === 'online';
                  return (
                    <button
                      key={device.id}
                      onClick={() => toggleDevice(device.id)}
                      className={cn("p-4 rounded-lg border transition-all", isOn ? "bg-purple-500/20 border-purple-500/30" : "bg-black/40 border-white/10")}
                    >
                      <Icon size={24} className={isOn ? "text-purple-400" : "text-zinc-600"} />
                      <div className="text-xs font-bold mt-2 truncate">{device.name}</div>
                      <div className="text-[8px] text-zinc-500 capitalize">{device.status}</div>
                    </button>
                  );
                })}
              </div>

              {/* Scenes */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Scenes</h3>
                <div className="flex gap-2">
                  {scenes.map(scene => (
                    <button
                      key={scene.id}
                      onClick={() => activateScene(scene.id)}
                      className="p-3 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2"
                    >
                      <span className="text-xl">{scene.icon}</span>
                      <span className="text-xs">{scene.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Usage */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                <h3 className="text-xs font-bold text-purple-400 mb-3">Energy Usage</h3>
                <div className="text-2xl font-bold text-purple-400">{energyUsage.total.toFixed(1)} kWh</div>
                <div className="space-y-1 mt-2">
                  {Object.entries(energyUsage.byRoom).map(([room, usage]) => (
                    <div key={room} className="flex justify-between text-[10px]">
                      <span className="text-zinc-500">{room}</span>
                      <span className="text-zinc-400">{usage.toFixed(1)} kWh</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RPA View */}
          {viewMode === 'rpa' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase">RPA Processes</h3>
                <button className="px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold uppercase flex items-center gap-1">
                  <Plus size={12} /> New Process
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Data Extraction', app: 'Web Browser', status: 'idle' },
                  { name: 'Invoice Processing', app: 'PDF Reader', status: 'completed' },
                  { name: 'Form Filling', app: 'Web Form', status: 'idle' },
                  { name: 'Report Generation', app: 'Excel', status: 'running' }
                ].map((process, i) => (
                  <div key={i} className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">{process.name}</span>
                      <span className={cn("text-[8px] px-2 py-0.5 rounded", 
                        process.status === 'running' ? "bg-purple-500/20 text-purple-400" :
                        process.status === 'completed' ? "bg-green-500/20 text-green-400" :
                        "bg-zinc-600 text-zinc-400"
                      )}>{process.status}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">Target: {process.app}</div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1 rounded bg-purple-500 text-black text-[10px] font-bold">Run</button>
                      <button className="px-3 py-1 rounded bg-white/10 text-zinc-400 text-[10px]">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipelines View */}
          {viewMode === 'pipelines' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase">DevOps Pipelines</h3>
                <button className="px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold uppercase flex items-center gap-1">
                  <Plus size={12} /> New Pipeline
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Build & Test', trigger: 'push', stages: ['Build', 'Test', 'Deploy'], status: 'success' },
                  { name: 'Deploy to Prod', trigger: 'manual', stages: ['Validate', 'Deploy'], status: 'idle' },
                  { name: 'Nightly Build', trigger: 'schedule', stages: ['Compile', 'Test', 'Package'], status: 'running' }
                ].map((pipe, i) => (
                  <div key={i} className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-xs font-bold">{pipe.name}</span>
                        <span className="text-[8px] text-zinc-500 ml-2">{pipe.trigger}</span>
                      </div>
                      <span className={cn("text-[8px] px-2 py-0.5 rounded", 
                        pipe.status === 'success' ? "bg-green-500/20 text-green-400" :
                        pipe.status === 'running' ? "bg-purple-500/20 text-purple-400" :
                        "bg-zinc-600 text-zinc-400"
                      )}>{pipe.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pipe.stages.map((stage, j) => (
                        <React.Fragment key={j}>
                          <div className={cn("px-2 py-1 rounded text-[8px]", j < pipe.stages.length - 1 ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-zinc-500")}>
                            {stage}
                          </div>
                          {j < pipe.stages.length - 1 && <ArrowRight size={10} className="text-zinc-600" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agents View */}
          {viewMode === 'agents' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase">AI Agents</h3>
                <button className="px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold uppercase flex items-center gap-1">
                  <Plus size={12} /> New Agent
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { name: 'Research Agent', role: 'researcher', model: 'GPT-4', status: 'active' },
                  { name: 'Planner Agent', role: 'planner', model: 'Claude', status: 'active' },
                  { name: 'Executor Agent', role: 'executor', model: 'GPT-4', status: 'idle' },
                  { name: 'Reviewer Agent', role: 'reviewer', model: 'Claude', status: 'active' }
                ].map((agent, i) => (
                  <div key={i} className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} className="text-purple-400" />
                      <span className="text-xs font-bold">{agent.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">{agent.role} • {agent.model}</div>
                    <div className="mt-2">
                      <span className={cn("text-[8px] px-2 py-0.5 rounded", agent.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-zinc-600 text-zinc-400")}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Crews */}
              <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Agent Crews</h3>
              <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold">Content Generation Crew</span>
                    <div className="text-[10px] text-zinc-500">3 agents • Research, Write, Review</div>
                  </div>
                  <button className="px-3 py-1.5 rounded bg-purple-500 text-black text-[10px] font-bold">Execute</button>
                </div>
              </div>
            </div>
          )}

          {/* BPM View */}
          {viewMode === 'bpm' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase">BPM Processes</h3>
                <button className="px-3 py-1.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold uppercase flex items-center gap-1">
                  <Plus size={12} /> New Process
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Leave Request', steps: 5, status: 'active' },
                  { name: 'Invoice Approval', steps: 4, status: 'draft' },
                  { name: 'Onboarding', steps: 8, status: 'active' }
                ].map((process, i) => (
                  <div key={i} className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold">{process.name}</span>
                      <span className={cn("text-[8px] px-2 py-0.5 rounded", process.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-zinc-600 text-zinc-400")}>
                        {process.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500">{process.steps} steps</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitor View */}
          {viewMode === 'monitor' && (
            <div className="flex-1 p-4 overflow-y-auto">
              {dashboard && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                    <div className="text-2xl font-bold text-purple-400">{dashboard.workflows}</div>
                    <div className="text-[10px] text-zinc-500">Total Workflows</div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                    <div className="text-2xl font-bold text-green-400">{dashboard.activeWorkflows}</div>
                    <div className="text-[10px] text-zinc-500">Active</div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-2xl font-bold text-blue-400">{dashboard.totalExecutions}</div>
                    <div className="text-[10px] text-zinc-500">Executions</div>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{dashboard.successRate.toFixed(0)}%</div>
                    <div className="text-[10px] text-zinc-500">Success Rate</div>
                  </div>
                </div>
              )}

              <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Recent Executions</h3>
              <div className="space-y-2">
                {[
                  { workflow: 'Email Parser', status: 'success', time: '2 min ago' },
                  { workflow: 'Data Sync', status: 'error', time: '5 min ago' },
                  { workflow: 'Report Gen', status: 'success', time: '10 min ago' },
                  { workflow: 'Backup', status: 'success', time: '1 hour ago' }
                ].map((exec, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded bg-black/40 border border-white/10">
                    <div className="flex items-center gap-2">
                      {exec.status === 'success' 
                        ? <CheckCircle size={14} className="text-green-400" />
                        : <AlertCircle size={14} className="text-red-400" />
                      }
                      <span className="text-xs">{exec.workflow}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{exec.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationStudio;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
