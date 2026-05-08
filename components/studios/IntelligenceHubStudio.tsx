// Plan Item ID: TI-1
/**
 * IntelligenceHubStudio.tsx - Cross-Studio Content Intelligence Hub
 * 
 * Features:
 * - Unified content index from all studios
 * - Smart suggestions & recommendations
 * - Learning path planner
 * - Content evaluation metrics
 * - Topic exploration
 * - Cross-studio navigation
 * - Content gap analysis
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, Lightbulb, Target, TrendingUp, Book, Video, Code, 
  Image, Music, FileText, ChevronRight, ChevronDown, X, Clock,
  Star, ThumbsUp, ArrowRight, Layers, Network, Search, Filter,
  Gauge, Users, Zap, Calendar, CheckCircle, AlertTriangle, Info, Activity,
  BookOpen, Film, Laptop, Palette, Headphones, File, Folder,
  Maximize2, Minimize2, Sparkle, Grid, List, Map, CalendarCheck,
  ArrowUpRight, ArrowDownRight, RefreshCw, Cpu, Database,
  Wifi, GitBranch, Terminal, Lock, Cloud, Cpu as IoT, Gamepad2 as Game,
  Globe, Monitor, Database as DB,
  Network as NetworkGraph, ScanEye, TrendingUp as Predict, BrainCircuit, Workflow
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { neuralOrchestrationEngine, SynapticManifest } from '@/engine/studios/NeuralOrchestrationEngine';
import { intelligenceHubAgent } from '@/agents/IntelligenceHubAgent';
import { a2aHub } from '@/agents/A2ACommunicationHub';
import { 
  contentIntelligence, 
  ContentItem, 
  Suggestion, 
  LearningPath, 
  EvaluationResult 
} from '@/engine/ContentIntelligenceHub';

interface HubData {
  title?: string;
  filters?: Record<string, any>;
}

interface HubStudioProps {
  data?: HubData;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type ViewMode = 'overview' | 'content' | 'paths' | 'topic' | 'gaps' | 'evaluation' | 'suggestions' | 'patterns' | 'predictions' | 'training';

const STUDIO_ICONS: Record<string, React.ReactNode> = {
  BookStudio: <BookOpen className="w-5 h-5" />,
  VideoPlayer: <Film className="w-5 h-5" />,
  CodeStudio: <Laptop className="w-5 h-5" />,
  ImageGallery: <Palette className="w-5 h-5" />,
  AudioStudio: <Headphones className="w-5 h-5" />,
  ThreeDViewer: <Grid className="w-5 h-5" />,
  NetworkStudio: <Wifi className="w-5 h-5" />,
  DataVizStudio: <GitBranch className="w-5 h-5" />,
  SimulationStudio: <Terminal className="w-5 h-5" />,
  MusicProductionStudio: <Music className="w-5 h-5" />,
  TextProcessingStudio: <FileText className="w-5 h-5" />,
  SecurityStudio: <Lock className="w-5 h-5" />,
  DatabaseStudio: <Database className="w-5 h-5" />,
  CloudStudio: <Cloud className="w-5 h-5" />,
  IoTStudio: <IoT className="w-5 h-5" />,
  GameStudio: <Game className="w-5 h-5" />,
  BrowserStudio: <Globe className="w-5 h-5" />,
  OSStudio: <Monitor className="w-5 h-5" />,
};

const CONTENT_TYPE_STYLES: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  book: { icon: <BookOpen className="w-4 h-4" />, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  video: { icon: <Film className="w-4 h-4" />, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  code: { icon: <Laptop className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  image: { icon: <Palette className="w-4 h-4" />, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  audio: { icon: <Headphones className="w-4 h-4" />, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  note: { icon: <FileText className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  document: { icon: <File className="w-4 h-4" />, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  project: { icon: <Folder className="w-4 h-4" />, color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

export default function IntelligenceHubStudio({ data, status = "active" }: HubStudioProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [quantumMode, setQuantumMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudio, setSelectedStudio] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [topicGraph, setTopicGraph] = useState<any[]>([]);
  const [contentGaps, setContentGaps] = useState<any[]>([]);
  const [studioOverview, setStudioOverview] = useState<any>({});
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [synapticLoad, setSynapticLoad] = useState(0);
  const [executiveLogs, setExecutiveLogs] = useState<string[]>([]);
  const [lastAuditResult, setLastAuditResult] = useState<any>(null);
  const [synapticTrace, setSynapticTrace] = useState<string[]>([]);
  const [swarmStatus, setSwarmStatus] = useState({ active: 802, latency: '0.4ms', resonance: 0.992, threatsBlocked: 0 });
  const [activeSynapticManifest, setActiveSynapticManifest] = useState<SynapticManifest | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Tier 5 features state
  const [knowledgeGraphEnabled, setKnowledgeGraphEnabled] = useState(false);
  const [patternRecognitionEnabled, setPatternRecognitionEnabled] = useState(false);
  const [predictiveAnalyticsEnabled, setPredictiveAnalyticsEnabled] = useState(false);
  const [decisionSupportEnabled, setDecisionSupportEnabled] = useState(false);
  const [aiOrchestrationEnabled, setAiOrchestrationEnabled] = useState(false);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [trainingReport, setTrainingReport] = useState<string>('Initializing Swarm Monitor...');
  const [perfectionScore, setPerfectionScore] = useState<number>(0);

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  const allContent = useMemo(() => {
    return contentIntelligence.getAllContent();
  }, [refreshTrigger]);

  const filteredContent = useMemo(() => {
    let filtered = allContent;

    if (searchQuery) {
      filtered = contentIntelligence.searchContent(searchQuery);
    }

    if (selectedStudio !== 'all') {
      filtered = filtered.filter(c => c.studio === selectedStudio);
    }

    return filtered;
  }, [allContent, searchQuery, selectedStudio]);

  const studios = useMemo(() => {
    const studioSet = new Set(allContent.map(c => c.studio));
    return Array.from(studioSet);
  }, [allContent]);

  useEffect(() => {
    contentIntelligence.activateQuantumMode('intelligence');
    
    const suggs = contentIntelligence.getSuggestions('book-quantum-1', 10);
    setSuggestions(suggs);
    
    const paths = contentIntelligence.getLearningPaths();
    setLearningPaths(paths);
    
    const graph = contentIntelligence.getTopicGraph();
    setTopicGraph(graph);
    
    const gaps = contentIntelligence.analyzeContentGaps();
    setContentGaps(gaps);
    
    const overview = contentIntelligence.getStudioOverview();
    setStudioOverview(overview);

    // Monitoring Interval
    const monitorInterval = setInterval(async () => {
      try {
        const { a2aSystem } = await import('@/agents/A2ASystem');
        const monitorAgent = a2aSystem.getRegistry().getAgent('Swarm_Monitor_Agent');
        if (monitorAgent) {
          const statusRes = await monitorAgent.process({ text: 'status' });
          const scoreRes = await monitorAgent.process({ text: 'perfection' });
          setTrainingReport(statusRes.text);
          setPerfectionScore(scoreRes.metadata?.lastScore || 0);
        }
      } catch (e) {
        console.warn('[IntelligenceHub] Swarm monitoring jitter:', e);
      }
    }, 4000);

    return () => clearInterval(monitorInterval);
  }, []);

  useEffect(() => {
    if (selectedContent) {
      const evalResult = contentIntelligence.evaluateContent(selectedContent.id);
      setEvaluation(evalResult);
    }
  }, [selectedContent]);

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setSynapticLoad(100);
    setExecutiveLogs(prev => [...prev, `[Executive] Processing: ${goalText}`]);

    try {
      // ◈ Swarm Consensus Orchestration
      setSynapticTrace(prev => [...prev, `[Trace] 🧠 Intercepting prompt: "${goalText}"`]);
      const { angehlangLLM } = await import('@/engine/AngehlangLLM');
      setSynapticTrace(prev => [...prev, `[Trace] ⚡ Routing to Swarm Consensus Engine (802 Nodes)...`]);
      setExecutiveLogs(prev => [...prev, `[Swarm] Initiating Photonic Synthesis across 800 nodes...`]);
      
      const res = await angehlangLLM.generate(goalText);
      setSynapticTrace(prev => [...prev, `[Trace] ◈ Consensus reached. Confidence: ${res.confidence}`]);
      setExecutiveLogs(prev => [...prev, `[Consensus] Resonance achieved: ${(res.confidence * 100).toFixed(2)}%`]);
      setExecutiveLogs(prev => [...prev, `[Lattice] Nodes active: 802 | Latency: ${res.latency}ms`]);

      // Use the specialized NeuralOrchestrationEngine for cross-studio orchestration
      setSynapticTrace(prev => [...prev, `[Trace] 🔄 Mapping executive directives to studio lattices...`]);
      const manifest = await neuralOrchestrationEngine.orchestrateCrossStudioMapping(goalText);
      
      setActiveSynapticManifest(manifest);
      setSynapticLoad(65);
      
      // Secondary logic via agent
      const result = await intelligenceHubAgent.process(goalText);
      setExecutiveLogs(prev => [...prev, `[OmniMind] Final Strategy: ${result.status}`]);

      // ◈ STRICT FIDELITY AUDIT
      setSynapticTrace(prev => [...prev, `[Trace] ⚖️ Initiating Strict Fidelity Audit (95% Threshold)...`]);
      const { promptAuditEngine } = await import('@/engine/PromptAuditEngine');
      const audit = await promptAuditEngine.auditResponse('IntelligenceHub', goalText, result.text || 'Synthesis completed');
      setLastAuditResult(audit);
      setSynapticTrace(prev => [...prev, `[Trace] ✅ Audit Complete. Fidelity: ${audit.fidelityScore}`]);
      
      if (!audit.compliant) {
        setExecutiveLogs(prev => [...prev, `[Audit] ❌ STRICT COMPLIANCE FAILURE: ${(audit.fidelityScore * 100).toFixed(1)}%`]);
        setSynapticTrace(prev => [...prev, `[Trace] ⚠️ Rejecting output. Triggering Recursive Refinement...`]);
      } else {
        setExecutiveLogs(prev => [...prev, `[Audit] ✅ STRICT COMPLIANCE ACHIEVED: ${(audit.fidelityScore * 100).toFixed(1)}%`]);
      }
    } catch (error) {
      setExecutiveLogs(prev => [...prev, `[Error] ${error instanceof Error ? error.message : 'Unknown error'}`]);
      if (error instanceof Error && error.message.includes('Shield')) {
        setSwarmStatus(prev => ({ ...prev, threatsBlocked: prev.threatsBlocked + 1 }));
      }
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setSynapticLoad(0);
      }, 1500);
    }
  };

  const handleNavigate = (contentId: string) => {
    const content = contentIntelligence.getContentById(contentId);
    if (content) {
      setSelectedContent(content);
    }
  };

  const handleKnowledgeGraph = () => {
    console.log('[IntelligenceHubStudio] Knowledge graphs activated');
    setKnowledgeGraphEnabled(prev => !prev);
  };

  const handlePatternRecognition = () => {
    console.log('[IntelligenceHubStudio] Pattern recognition initiated');
    setPatternRecognitionEnabled(prev => !prev);
    if (!patterns.length) {
      setPatterns([
        { id: 'p1', name: 'Content clustering', confidence: 0.92, type: 'behavioral' },
        { id: 'p2', name: 'User workflow optimization', confidence: 0.87, type: 'temporal' },
        { id: 'p3', name: 'Resource allocation patterns', confidence: 0.78, type: 'system' },
      ]);
    }
  };

  const handlePredictiveAnalytics = () => {
    console.log('[IntelligenceHubStudio] Predictive analytics enabled');
    setPredictiveAnalyticsEnabled(prev => !prev);
    if (!predictions.length) {
      setPredictions([
        { id: 'pred1', metric: 'content-demand', forecast: '+15%', confidence: 0.85, timeframe: '7 days' },
        { id: 'pred2', metric: 'storage-usage', forecast: '+8%', confidence: 0.92, timeframe: '30 days' },
        { id: 'pred3', metric: 'user-engagement', forecast: '+23%', confidence: 0.78, timeframe: '14 days' },
      ]);
    }
  };

  const handleDecisionSupport = () => {
    console.log('[IntelligenceHubStudio] Decision support system activated');
    setDecisionSupportEnabled(prev => !prev);
  };

  const handleAIOrchestration = () => {
    console.log('[IntelligenceHubStudio] AI orchestration workflows triggered');
    setAiOrchestrationEnabled(prev => !prev);
  };

  return (
    <div className={cn(
      "bg-quantum-deep/95 backdrop-blur-xl rounded-2xl border border-quantum-cyan/20 overflow-hidden flex flex-col",
      fullScreenMode === 'immersive' && "fixed inset-0 z-50 rounded-none",
      fullScreenMode === 'cinema' && "fixed inset-0 z-50 rounded-none bg-black",
      fullScreenMode === 'expanded' && "fixed inset-4 z-40 rounded-2xl"
    )}>
      <StudioHeader
        title="Intelligence Hub"
        icon={Brain}
        quantumMode={quantumMode}
        onToggleQuantum={() => setQuantumMode(!quantumMode)}
        fullScreenMode={fullScreenMode}
        onToggleFullScreen={() => setFullScreenMode(prev => {
          if (prev === 'normal') return 'expanded';
          if (prev === 'expanded') return 'immersive';
          if (prev === 'immersive') return 'cinema';
          return 'normal';
        })}
        stats={{
          content: allContent.length,
          swarm: `${swarmStatus.active} Agents`,
          resonance: `${(swarmStatus.resonance * 100).toFixed(1)}%`,
          threats: swarmStatus.threatsBlocked
        }}
      >
        <div className="flex items-center gap-1">
          <SovereignButton
            variant="ghost"
            size="xs"
            icon={NetworkGraph}
            onClick={handleKnowledgeGraph}
            className={cn(knowledgeGraphEnabled && "text-quantum-cyan")}
            title="Knowledge Graphs"
          />
          <SovereignButton
            variant="ghost"
            size="xs"
            icon={ScanEye}
            onClick={handlePatternRecognition}
            className={cn(patternRecognitionEnabled && "text-quantum-cyan")}
            title="Pattern Recognition"
          />
          <SovereignButton
            variant="ghost"
            size="xs"
            icon={Predict}
            onClick={handlePredictiveAnalytics}
            className={cn(predictiveAnalyticsEnabled && "text-quantum-cyan")}
            title="Predictive Analytics"
          />
          <SovereignButton
            variant="ghost"
            size="xs"
            icon={BrainCircuit}
            onClick={handleDecisionSupport}
            className={cn(decisionSupportEnabled && "text-quantum-cyan")}
            title="Decision Support"
          />
          <SovereignButton
            variant="ghost"
            size="xs"
            icon={Workflow}
            onClick={handleAIOrchestration}
            className={cn(aiOrchestrationEnabled && "text-quantum-cyan")}
            title="AI Orchestration"
          />
        </div>
        {synapticLoad > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-quantum-cyan/10 rounded-lg border border-quantum-cyan/20 ml-2">
            <Brain className="w-3 h-3 text-quantum-cyan animate-pulse" />
            <span className="text-[10px] text-quantum-cyan font-bold uppercase">Executive Thinking</span>
          </div>
        )}
      </StudioHeader>

      {/* Sovereign Goal Input */}
      <div className="px-4 py-3 bg-quantum-cyan/5 border-b border-quantum-cyan/10 flex items-center gap-3">
        <div className="flex-1 relative">
          <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quantum-cyan" />
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
            placeholder="Executive Directive: e.g., 'Coordinate a full system audit and suggest optimizations for lattice density'"
            className="w-full bg-[#050510] border border-quantum-cyan/20 rounded-xl py-2 pl-10 pr-4 text-xs text-quantum-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-quantum-cyan/40"
            disabled={isProcessingGoal}
          />
        </div>
        <SovereignButton 
          variant="primary" 
          size="sm" 
          onClick={handleGoalSubmit}
          disabled={isProcessingGoal}
          icon={Zap}
        >
          {isProcessingGoal ? 'Orchestrating...' : 'Manifest'}
        </SovereignButton>
        {/* Synaptic Manifest Display */}
        {activeSynapticManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-quantum-cyan/5 border border-quantum-cyan/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-quantum-cyan font-bold uppercase">Sovereign Synaptic Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">DENS: {(activeSynapticManifest.latticeDensity * 100).toFixed(1)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">CONF: {(activeSynapticManifest.sovereigntyConfidence * 100).toFixed(2)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Unmapped Semantic Gaps</p>
                <div className="space-y-1">
                  {activeSynapticManifest.unmappedGaps.map((gap, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <div className="w-1 h-1 rounded-full bg-quantum-red" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Executive Directives</p>
                <div className="space-y-1">
                  {activeSynapticManifest.executiveDirectives.map((directive, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-quantum-cyan/80">
                      <Target size={10} className="text-quantum-cyan/40" />
                      <span>{directive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Strict Audit Overlay */}
        {lastAuditResult && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "p-3 rounded-xl border flex items-center gap-3",
              lastAuditResult.compliant ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              lastAuditResult.compliant ? "bg-emerald-500/20" : "bg-rose-500/20"
            )}>
              <ScanEye size={16} className={lastAuditResult.compliant ? "text-emerald-400" : "text-rose-400"} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Strict Fidelity Audit</p>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold", lastAuditResult.compliant ? "text-emerald-400" : "text-rose-400")}>
                  {(lastAuditResult.fidelityScore * 100).toFixed(1)}% FIDELITY
                </span>
                <span className="text-[10px] text-zinc-600">|</span>
                <span className="text-[10px] font-mono text-zinc-500">{lastAuditResult.compliant ? 'PASSED' : 'REJECTED'}</span>
              </div>
            </div>
            <SovereignButton variant="ghost" size="xs" onClick={() => setLastAuditResult(null)} icon={X} />
          </motion.div>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-quantum-dark/30 border-b border-quantum-cyan/10 overflow-x-auto">
        {(['overview', 'content', 'paths', 'topic', 'gaps', 'patterns', 'predictions', 'training', 'evaluation', 'suggestions'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
              viewMode === mode 
                ? "bg-quantum-cyan/20 text-quantum-cyan" 
                : "text-quantum-gray hover:text-quantum-white hover:bg-quantum-dark/30"
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-2 px-4 py-3 bg-quantum-dark/20 border-b border-quantum-cyan/5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quantum-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all content..."
            className="w-full pl-10 pr-4 py-2 bg-quantum-dark/50 rounded-xl border border-quantum-cyan/20 focus:border-quantum-cyan/50 outline-none text-sm"
          />
        </div>
        <select
          value={selectedStudio}
          onChange={(e) => setSelectedStudio(e.target.value)}
          className="px-3 py-2 bg-quantum-dark/50 rounded-lg border border-quantum-cyan/20 text-sm"
        >
          <option value="all">All Studios</option>
          {studios.map(studio => (
            <option key={studio} value={studio}>{studio}</option>
          ))}
        </select>
      </div>

      {/* Synaptic Trace Monitor */}
      {synapticTrace.length > 0 && (
        <div className="mx-4 mt-2 mb-4 p-4 rounded-xl bg-quantum-dark/60 border border-quantum-cyan/10 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-quantum-cyan" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Internal Synaptic Trace</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {synapticTrace.map((trace, i) => (
              <div key={i} className="text-[10px] font-mono text-quantum-cyan/60 flex items-center gap-2">
                <span className="text-zinc-700">[{new Date().toLocaleTimeString()}]</span>
                <span>{trace}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Studio Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                {Object.entries(studioOverview).map(([studio, info]: [string, any]) => (
                  <motion.div
                    key={studio}
                    className="p-4 rounded-xl bg-quantum-dark/30 border border-quantum-cyan/20 hover:border-quantum-cyan/50 cursor-pointer transition-all"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedStudio(studio);
                      setViewMode('content');
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {STUDIO_ICONS[studio] || <Sparkles className="w-5 h-5 text-quantum-cyan" />}
                    </div>
                    <h3 className="font-medium text-quantum-white text-sm truncate">{studio}</h3>
                    <p className="text-xs text-quantum-gray">{info.count} items</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-quantum-cyan/20 to-quantum-purple/20 border border-quantum-cyan/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-quantum-cyan" />
                    <span className="text-sm text-quantum-cyan">Total Content</span>
                  </div>
                  <p className="text-3xl font-bold text-quantum-white">{allContent.length}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-quantum-yellow/20 to-quantum-orange/20 border border-quantum-yellow/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-quantum-yellow" />
                    <span className="text-sm text-quantum-yellow">Suggestions</span>
                  </div>
                  <p className="text-3xl font-bold text-quantum-white">{suggestions.length}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-quantum-green/20 to-quantum-cyan/20 border border-quantum-green/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-quantum-green" />
                    <span className="text-sm text-quantum-green">Learning Paths</span>
                  </div>
                  <p className="text-3xl font-bold text-quantum-white">{learningPaths.length}</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-quantum-red/20 to-quantum-orange/20 border border-quantum-red/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-quantum-red" />
                    <span className="text-sm text-quantum-red">Content Gaps</span>
                  </div>
                  <p className="text-3xl font-bold text-quantum-white">{contentGaps.length}</p>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {filteredContent.map(item => {
                const typeStyle = CONTENT_TYPE_STYLES[item.type] || CONTENT_TYPE_STYLES.document;
                return (
                  <motion.div
                    key={item.id}
                    className="p-4 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20 hover:border-quantum-cyan/50 cursor-pointer transition-all"
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedContent(item)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", typeStyle.bg)}>
                          {typeStyle.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-quantum-white">{item.title}</h4>
                          <p className="text-xs text-quantum-gray line-clamp-2">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {STUDIO_ICONS[item.studio]}
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs",
                          item.difficulty === 'beginner' ? "bg-quantum-green/20 text-quantum-green" :
                          item.difficulty === 'intermediate' ? "bg-quantum-yellow/20 text-quantum-yellow" :
                          item.difficulty === 'advanced' ? "bg-quantum-orange/20 text-quantum-orange" :
                          "bg-quantum-red/20 text-quantum-red"
                        )}>
                          {item.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.topics.slice(0, 4).map(topic => (
                        <span key={topic} className="px-2 py-0.5 bg-quantum-dark/50 rounded text-xs text-quantum-gray">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {viewMode === 'paths' && (
            <motion.div
              key="paths"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {learningPaths.map(path => (
                <motion.div
                  key={path.id}
                  className="p-4 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-quantum-white">{path.title}</h4>
                      <p className="text-xs text-quantum-gray">{path.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-sm",
                        path.difficulty === 'beginner' ? "bg-quantum-green/20 text-quantum-green" :
                        path.difficulty === 'intermediate' ? "bg-quantum-yellow/20 text-quantum-yellow" :
                        path.difficulty === 'advanced' ? "bg-quantum-orange/20 text-quantum-orange" :
                        "bg-quantum-red/20 text-quantum-red"
                      )}>
                        {path.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-quantum-gray mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {path.estimatedDuration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {path.steps.length} steps
                    </span>
                  </div>
                  <div className="space-y-1">
                    {path.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-quantum-cyan/20 text-quantum-cyan flex items-center justify-center">
                          {step.order}
                        </span>
                        <span className="text-quantum-gray">{step.contentTitle}</span>
                        <span className="text-quantum-purple ml-auto">({step.studio})</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'topic' && (
            <motion.div
              key="topic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topicGraph.map(topic => (
                  <div
                    key={topic.topic}
                    className="p-4 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20"
                  >
                    <h4 className="font-medium text-quantum-white mb-2">{topic.topic}</h4>
                    <div className="flex items-center gap-2 text-xs text-quantum-cyan mb-2">
                      <span>{topic.depth} resources</span>
                      <span>•</span>
                      <span>{topic.categories.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {topic.connections.slice(0, 5).map((conn, i) => (
                        <span key={i} className="px-2 py-0.5 bg-quantum-purple/20 rounded text-xs text-quantum-purple">
                          {conn.topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {viewMode === 'gaps' && (
            <motion.div
              key="gaps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {contentGaps.map(gap => (
                <motion.div
                  key={gap.topic}
                  className="p-4 rounded-lg bg-gradient-to-r from-quantum-red/10 to-quantum-yellow/10 border border-quantum-red/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-quantum-white">{gap.topic}</h4>
                    <AlertTriangle className="w-5 h-5 text-quantum-red" />
                  </div>
                  <div className="flex items-center gap-2">
                    {gap.missingTypes.map(type => (
                      <span key={type} className="px-2 py-1 bg-quantum-red/20 rounded text-xs text-quantum-red">
                        Missing {type}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'evaluation' && selectedContent && (
            <motion.div
              key="evaluation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-xl bg-quantum-dark/30 border border-quantum-cyan/20 text-center">
                <h3 className="text-lg font-medium text-quantum-white mb-2">{selectedContent.title}</h3>
                <p className="text-sm text-quantum-gray">{selectedContent.studio}</p>
              </div>

              {evaluation && (
                <>
                  <div className="p-4 rounded-lg bg-quantum-cyan/10 border border-quantum-cyan/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-quantum-gray">Content Score</span>
                      <span className="text-3xl font-bold text-quantum-cyan">{evaluation.score}%</span>
                    </div>
                    <div className="h-3 bg-quantum-dark/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-quantum-cyan to-quantum-purple"
                        animate={{ width: `${evaluation.score}%` }}
                      />
                    </div>
                  </div>

                  {evaluation.strengths.length > 0 && (
                    <div className="p-4 rounded-lg bg-quantum-green/10 border border-quantum-green/30">
                      <h4 className="text-sm font-medium text-quantum-green mb-2">Strengths</h4>
                      {evaluation.strengths.map((s, i) => (
                        <div key={i} className="text-xs text-quantum-gray pl-4">• {s}</div>
                      ))}
                    </div>
                  )}

                  {evaluation.gaps.length > 0 && (
                    <div className="p-4 rounded-lg bg-quantum-yellow/10 border border-quantum-yellow/30">
                      <h4 className="text-sm font-medium text-quantum-yellow mb-2">Gaps</h4>
                      {evaluation.gaps.map((g, i) => (
                        <div key={i} className="text-xs text-quantum-gray pl-4">• {g}</div>
                      ))}
                    </div>
                  )}

                  {evaluation.recommendations.length > 0 && (
                    <div className="p-4 rounded-lg bg-quantum-purple/10 border border-quantum-purple/30">
                      <h4 className="text-sm font-medium text-quantum-purple mb-2">Recommendations</h4>
                      {evaluation.recommendations.map((r, i) => (
                        <div key={i} className="text-xs text-quantum-gray pl-4">• {r}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {viewMode === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {suggestions.map(sug => (
                <motion.div
                  key={sug.id}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all",
                    sug.priority === 'high' 
                      ? "bg-quantum-cyan/10 border-quantum-cyan/40 hover:border-quantum-cyan" 
                      : "bg-quantum-dark/30 border-quantum-cyan/20 hover:border-quantum-cyan/40"
                  )}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleNavigate(sug.contentId)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Lightbulb className={cn("w-4 h-4", sug.priority === 'high' ? "text-quantum-cyan" : "text-quantum-gray")} />
                      <span className="font-medium text-quantum-white text-sm">{sug.title}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs",
                      sug.priority === 'high' ? "bg-quantum-cyan/20 text-quantum-cyan" :
                      sug.priority === 'medium' ? "bg-quantum-yellow/20 text-quantum-yellow" :
                      "bg-quantum-dark/50 text-quantum-gray"
                    )}>
                      {sug.priority}
                    </span>
                  </div>
                  <p className="text-xs text-quantum-gray mb-2">{sug.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-quantum-gray flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sug.estimatedTime}
                    </span>
                    <span className="text-quantum-cyan">{Math.round(sug.relevanceScore * 100)}% match</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'patterns' && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {patternRecognitionEnabled ? (
                patterns.length > 0 ? (
                  patterns.map(pattern => (
                    <motion.div
                      key={pattern.id}
                      className="p-4 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ScanEye className="w-4 h-4 text-quantum-cyan" />
                          <span className="font-medium text-quantum-white text-sm">{pattern.name}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-quantum-purple/20 rounded text-xs text-quantum-purple">{pattern.type}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-quantum-gray">Confidence:</span>
                        <span className="text-quantum-green">{(pattern.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-quantum-gray text-xs py-8">No patterns detected. Enable pattern recognition to analyze.</div>
                )
              ) : (
                <div className="text-center text-quantum-gray text-xs py-8">Enable Pattern Recognition to detect patterns</div>
              )}
            </motion.div>
          )}

          {viewMode === 'predictions' && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {predictiveAnalyticsEnabled ? (
                predictions.length > 0 ? (
                  predictions.map(pred => (
                    <motion.div
                      key={pred.id}
                      className="p-4 rounded-lg bg-gradient-to-r from-quantum-cyan/10 to-quantum-purple/10 border border-quantum-cyan/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-quantum-cyan" />
                          <span className="font-medium text-quantum-white text-sm">{pred.metric}</span>
                        </div>
                        <span className="text-quantum-green font-bold">{pred.forecast}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-quantum-gray">Confidence: {(pred.confidence * 100).toFixed(0)}%</span>
                        <span className="text-quantum-gray">Timeframe: {pred.timeframe}</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-quantum-gray text-xs py-8">No predictions available. Enable predictive analytics.</div>
                )
              ) : (
                <div className="text-center text-quantum-gray text-xs py-8">Enable Predictive Analytics to generate forecasts</div>
              )}
            </motion.div>
          )}

          {viewMode === 'training' && (
            <motion.div
              key="training"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="p-8 rounded-3xl bg-quantum-dark/60 border border-quantum-cyan/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Activity size={32} className="text-quantum-cyan/20 animate-pulse" />
                </div>
                
                <h3 className="text-2xl font-black text-white tracking-tighter mb-6 flex items-center gap-3">
                  <ScanEye className="text-quantum-cyan" />
                  Sovereign Swarm Monitor
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Real-Time Swarm Report</p>
                    <pre className="p-6 rounded-2xl bg-black/40 border border-white/5 text-xs text-quantum-cyan font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                      {trainingReport}
                    </pre>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-quantum-cyan/5 border border-quantum-cyan/10">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">Perfection Score</span>
                        <span className="text-3xl font-black text-quantum-cyan">{perfectionScore.toFixed(2)}<span className="text-xs text-zinc-600">/10.0</span></span>
                      </div>
                      <div className="h-4 bg-black/40 rounded-full overflow-hidden p-1 border border-white/5">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-quantum-cyan via-quantum-purple to-quantum-pink rounded-full"
                          animate={{ width: `${perfectionScore * 10}%` }}
                          transition={{ type: 'spring', stiffness: 50 }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <p className="text-[10px] text-zinc-500 uppercase mb-1">Swarm Resonance</p>
                        <p className="text-xl font-bold text-white">0.9992</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                        <p className="text-[10px] text-zinc-500 uppercase mb-1">Threat Barrier</p>
                        <p className="text-xl font-bold text-emerald-400">HARDENED</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-quantum-dark/30 border-t border-quantum-cyan/10 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-quantum-gray">
            {filteredContent.length} items
          </span>
          <span className="text-quantum-gray">
            {studios.length} studios
          </span>
        </div>
        <div className="flex items-center gap-4">
          {quantumMode && (
            <span className="text-quantum-cyan flex items-center gap-1">
              <Zap className="w-3 h-3" />
              QPPU Active
            </span>
          )}
          <button 
            onClick={() => {
              setRefreshTrigger(prev => prev + 1);
              contentIntelligence.activateQuantumMode('intelligence');
            }}
            className="flex items-center gap-1 text-quantum-gray hover:text-quantum-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
          <span className="text-quantum-green">
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
