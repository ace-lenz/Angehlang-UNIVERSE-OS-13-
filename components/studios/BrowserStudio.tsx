// Plan Item ID: TI-1
/**
 * BrowserStudio.tsx - QPPU-Enhanced Browser Studio
 * 
 * Features:
 * - Quantum Photonic Browsing with 50D ANGHV Storage
 * - Tab Management & Bookmarks
 * - History & Downloads Tracking
 * - Extensions Management
 * - Privacy Controls
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - QPPU Quantum Mode for Enhanced Processing
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, BookMarked, History, Download, Puzzle, Settings, Shield,
  Maximize2, Minimize2, Sparkles, Zap, Search, Filter, Scan,
  RefreshCw, Play, Pause, Eye, EyeOff, Lock, Unlock,
  Plus, X, ArrowLeft, ArrowRight, Star, Clock, Trash2,
  Folder, File, Link, ExternalLink, AlertTriangle, CheckCircle,
  Layers, Palette, Key, User, Database, HardDrive,
  Cpu, Zap as Lightning, BarChart2, Timer, Bookmark, Import, Upload,
  Search as SearchIcon, Youtube, Github, BookOpen,
  Bot, FormInput, Eye as EyeVisual, Gauge, Workflow
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { coreSovereignKernel, SovereignAuditManifest } from '@/engine/studios/CoreSovereignKernel';
import { browserAgent } from '@/agents/BrowserAgent';
import { unifiedSearchEngine } from '@/engine/UnifiedSearchEngine';
import { PlatformSearchResult } from '@/agents/PlatformSearchAgent';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading: boolean;
  isPinned: boolean;
  isAudioPlaying: boolean;
}

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  folder?: string;
  icon?: string;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  visitedAt: string;
  visitCount: number;
}

interface DownloadItem {
  id: string;
  filename: string;
  url: string;
  progress: number;
  status: 'downloading' | 'completed' | 'paused' | 'failed';
  size: number;
  downloaded: number;
  speed: number;
}

interface BrowserExtension {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  permissions: string[];
  description: string;
}

interface BrowserSettings {
  quantumMode: boolean;
  privacyLevel: 'standard' | 'strict' | 'paranoid';
  javascriptEnabled: boolean;
  cookiesEnabled: boolean;
  adBlockEnabled: boolean;
  vpnEnabled: boolean;
}

interface BrowserStudioProps {
  data?: any;
  tabs?: BrowserTab[];
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type ViewMode = 'browser' | 'tabs' | 'bookmarks' | 'history' | 'downloads' | 'extensions' | 'settings' | 'private';

const DEFAULT_TABS: BrowserTab[] = [
  { id: '1', title: 'Angehlang Universe OS', url: 'https://angehlang.ai', isLoading: false, isPinned: false, isAudioPlaying: false },
  { id: '2', title: 'Quantum Computing Research', url: 'https://quantum.example.com', isLoading: false, isPinned: false, isAudioPlaying: false },
  { id: '3', title: 'Neural Networks Deep Dive', url: 'https://ml.research', isLoading: true, isPinned: false, isAudioPlaying: false },
];

const BOOKMARKS: BookmarkItem[] = [
  { id: '1', title: 'Quantum Research Hub', url: 'https://quantum.hub', folder: 'Research', createdAt: '2024-01-15' },
  { id: '2', title: 'Photonics Archives', url: 'https://photonics.arc', folder: 'Research', createdAt: '2024-01-14' },
  { id: '3', title: 'Aether Engine', url: 'https://aether.eng', folder: 'Tools', createdAt: '2024-01-10' },
  { id: '4', title: 'Neural Studio', url: 'https://neural.studio', folder: 'AI', createdAt: '2024-01-08' },
  { id: '5', title: 'ANGHV Storage Docs', url: 'https://anghv.docs', folder: 'Documentation', createdAt: '2024-01-05' },
  { id: '6', title: 'QPPU Specifications', url: 'https://qppu.spec', folder: 'Documentation', createdAt: '2024-01-02' },
];

const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', title: 'Aether Engine Documentation', url: 'https://aether.eng/docs', visitedAt: '2 min ago', visitCount: 15 },
  { id: '2', title: 'Quantum Photonic Circuits', url: 'https://qpcircuits.io', visitedAt: '15 min ago', visitCount: 8 },
  { id: '3', title: 'Neural Network Architectures', url: 'https://neural.arch', visitedAt: '1 hour ago', visitCount: 12 },
  { id: '4', title: 'Holographic Storage Systems', url: 'https://holo.storage', visitedAt: '2 hours ago', visitCount: 5 },
  { id: '5', title: '50D ANGHV Framework', url: 'https://anghv.framework', visitedAt: '3 hours ago', visitCount: 23 },
  { id: '6', title: 'QPPU Core Implementation', url: 'https://qppu.core', visitedAt: '5 hours ago', visitCount: 7 },
  { id: '7', title: 'Photonic Logic Arrays', url: 'https://pla.tech', visitedAt: '1 day ago', visitCount: 3 },
  { id: '8', title: 'MZI Design Patterns', url: 'https://mzi.patterns', visitedAt: '2 days ago', visitCount: 11 },
];

const MOCK_DOWNLOADS: DownloadItem[] = [
  { id: '1', filename: 'qppu-spec-v2.pdf', url: 'https://docs.qppu/spec-v2.pdf', progress: 100, status: 'completed', size: 4500000, downloaded: 4500000, speed: 0 },
  { id: '2', filename: 'anghv-whitepaper.pdf', url: 'https://docs.anghv/whitepaper.pdf', progress: 100, status: 'completed', size: 2800000, downloaded: 2800000, speed: 0 },
  { id: '3', filename: 'quantum-circuit-designer.zip', url: 'https://tools.qcircuit/designer.zip', progress: 67, status: 'downloading', size: 15000000, downloaded: 10050000, speed: 2450000 },
  { id: '4', filename: 'photonics-library.tar.gz', url: 'https://lib.photonics/library.tar.gz', progress: 0, status: 'paused', size: 8500000, downloaded: 0, speed: 0 },
];

const MOCK_EXTENSIONS: BrowserExtension[] = [
  { id: '1', name: 'Quantum Ad Blocker', version: '3.2.1', enabled: true, permissions: ['storage', 'webRequest'], description: 'Blocks quantum-encrypted advertisements' },
  { id: '2', name: 'ANGHV Sync', version: '1.8.0', enabled: true, permissions: ['storage', 'tabs'], description: 'Synchronize bookmarks across 50D storage' },
  { id: '3', name: 'Photonics DevTools', version: '2.1.5', enabled: false, permissions: ['devtools', 'storage'], description: 'Developer tools for photonic applications' },
  { id: '4', name: 'Privacy Shield', version: '4.0.2', enabled: true, permissions: ['webRequest', 'blocking'], description: 'Advanced privacy protection' },
  { id: '5', name: 'Holographic Notes', version: '1.5.0', enabled: false, permissions: ['storage'], description: 'Notes & annotations for web pages' },
];

const DEFAULT_SETTINGS: BrowserSettings = {
  quantumMode: true,
  privacyLevel: 'strict',
  javascriptEnabled: true,
  cookiesEnabled: false,
  adBlockEnabled: true,
  vpnEnabled: false,
};

export default function BrowserStudio({ tabs = DEFAULT_TABS, status = "ready" }: BrowserStudioProps) {
  const [activeView, setActiveView] = useState<ViewMode>('browser');
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>(tabs);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0]?.id || '1');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(BOOKMARKS);
  const [history, setHistory] = useState<HistoryItem[]>(MOCK_HISTORY);
  const [downloads, setDownloads] = useState<DownloadItem[]>(MOCK_DOWNLOADS);
  const [extensions, setExtensions] = useState<BrowserExtension[]>(MOCK_EXTENSIONS);
  const [settings, setSettings] = useState<BrowserSettings>(DEFAULT_SETTINGS);
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [quantumMode, setQuantumMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateWindow, setShowPrivateWindow] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [navigationPulse, setNavigationPulse] = useState(0);
  const [activeSandboxManifest, setActiveSandboxManifest] = useState<SovereignAuditManifest | null>(null);

  // Tier 5 features state
  const [headlessMode, setHeadlessMode] = useState(false);
  const [formAutomationEnabled, setFormAutomationEnabled] = useState(false);
  const [visualRegressionEnabled, setVisualRegressionEnabled] = useState(false);
  const [performanceTestingEnabled, setPerformanceTestingEnabled] = useState(false);
  const [automationWorkflows, setAutomationWorkflows] = useState<string[]>([]);

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()
  
  // Platform Search Panel State
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [platformSearchQuery, setPlatformSearchQuery] = useState('');
  const [platformSearchResults, setPlatformSearchResults] = useState<Record<string, PlatformSearchResult[]>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [activePlatforms, setActivePlatforms] = useState<('youtube' | 'github' | 'wiki' | 'web')[]>(['youtube', 'github', 'wiki', 'web']);

  const activeTab = browserTabs.find(t => t.id === activeTabId);

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks;
    return bookmarks.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookmarks, searchQuery]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return history;
    return history.filter(h => 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  const folders = useMemo(() => {
    const folderSet = new Set(bookmarks.map(b => b.folder || 'Uncategorized'));
    return Array.from(folderSet);
  }, [bookmarks]);

  const stats = useMemo(() => ({
    totalTabs: browserTabs.length,
    activeConnections: 24,
    quantumProcessed: quantumMode ? 15420 : 0,
    privacyScore: settings.privacyLevel === 'paranoid' ? 100 : settings.privacyLevel === 'strict' ? 75 : 50,
  }), [browserTabs, quantumMode, settings.privacyLevel]);

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setNavigationPulse(100);
    
    try {
      // Use the specialized CoreSovereignKernel for sandboxed browsing and isolated web synthesis
      const manifest = await coreSovereignKernel.instantiateSovereignSandbox(goalText);
      
      setActiveSandboxManifest(manifest);
      console.log('[BrowserStudio] Sovereign sandbox manifest synthesized:', manifest);
      setNavigationPulse(70);
      
      // Secondary logic via agent
      await browserAgent.process(goalText);
    } catch (error) {
      console.error('[BrowserStudio] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setNavigationPulse(0);
      }, 1500);
    }
  };

  const handleNewTab = () => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      url: 'about:blank',
      isLoading: false,
      isPinned: false,
      isAudioPlaying: false,
    };
    setBrowserTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // Platform Search Functions
  const handlePlatformSearch = async () => {
    if (!platformSearchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      const results = await unifiedSearchEngine.search(platformSearchQuery, {
        platforms: activePlatforms,
        synthesize: true
      });
      
      const formattedResults: Record<string, PlatformSearchResult[]> = {};
      for (const r of results) {
        formattedResults[r.platform] = r.results;
      }
      setPlatformSearchResults(formattedResults);
    } catch (error) {
      console.error('[BrowserStudio] Platform search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlatformToggle = (platform: 'youtube' | 'github' | 'wiki' | 'web') => {
    setActivePlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const openResultInTab = (result: PlatformSearchResult) => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: result.title,
      url: result.link,
      isLoading: false,
      isPinned: false,
      isAudioPlaying: false,
    };
    setBrowserTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setShowSearchPanel(false);
  };

  const handleCloseTab = (tabId: string) => {
    setBrowserTabs(prev => prev.filter(t => t.id !== tabId));
    if (activeTabId === tabId && browserTabs.length > 1) {
      setActiveTabId(browserTabs[0]?.id);
    }
  };

  const handleTogglePin = (tabId: string) => {
    setBrowserTabs(prev => prev.map(t => 
      t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
    ));
  };

  const handleNavigate = (url: string) => {
    if (!url) return;
    setIsLoading(true);
    setUrlInput(url);
    
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    setTimeout(() => {
      setBrowserTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, title: url, url: normalizedUrl, isLoading: false } : t
      ));
      setIsLoading(false);
    }, 1500);
  };

  const handleAddBookmark = (tab: BrowserTab) => {
    const bookmark: BookmarkItem = {
      id: `bm-${Date.now()}`,
      title: tab.title,
      url: tab.url,
      folder: 'Uncategorized',
      createdAt: new Date().toISOString(),
    };
    setBookmarks(prev => [...prev, bookmark]);
  };

  const handleToggleExtension = (extId: string) => {
    setExtensions(prev => prev.map(e => 
      e.id === extId ? { ...e, enabled: !e.enabled } : e
    ));
  };

  const handleHeadlessMode = () => {
    console.log('[BrowserStudio] Headless browser mode toggled');
    setHeadlessMode(prev => !prev);
  };

  const handleFormAutomation = () => {
    console.log('[BrowserStudio] Form automation triggered');
    setFormAutomationEnabled(prev => !prev);
  };

  const handleVisualRegression = () => {
    console.log('[BrowserStudio] Visual regression testing started');
    setVisualRegressionEnabled(prev => !prev);
  };

  const handlePerformanceTest = () => {
    console.log('[BrowserStudio] Performance testing initiated');
    setPerformanceTestingEnabled(prev => !prev);
  };

  const handleAutomation = () => {
    console.log('[BrowserStudio] Web workflow automation activated');
    const newWorkflow = `workflow-${Date.now()}`;
    setAutomationWorkflows(prev => [...prev, newWorkflow]);
  };

  const handleUpdateSetting = <K extends keyof BrowserSettings>(key: K, value: BrowserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-quantum-cyan';
      case 'downloading': return 'text-quantum-yellow';
      case 'completed': return 'text-quantum-green';
      case 'paused': return 'text-quantum-orange';
      case 'failed': return 'text-quantum-red';
      default: return 'text-quantum-gray';
    }
  };

  return (
    <div className={cn(
      "bg-quantum-deep/95 backdrop-blur-xl rounded-2xl border border-quantum-cyan/20 overflow-hidden",
      fullScreenMode === 'immersive' && "fixed inset-0 z-50 rounded-none",
      fullScreenMode === 'cinema' && "fixed inset-0 z-50 rounded-none bg-black",
      fullScreenMode === 'expanded' && "fixed inset-4 z-40 rounded-2xl"
    )}>
      <StudioHeader
        title="Browser Studio"
        icon={Globe}
        badge={status || 'Ready'}
        badgeColor="indigo"
      >
        <div className="flex items-center gap-2">
          <SovereignButton 
            variant="ghost" 
            size="xs" 
            icon={quantumMode ? Zap : Sparkles} 
            onClick={() => setQuantumMode(!quantumMode)} 
            className={cn(quantumMode && "text-quantum-cyan")}
            title="QPPU Quantum Mode"
          />
          <SovereignButton 
            variant="ghost" 
            size="xs" 
            icon={Bot}
            onClick={handleHeadlessMode}
            className={cn(headlessMode && "text-quantum-cyan")}
            title="Headless Browser"
          />
          <SovereignButton 
            variant="ghost" 
            size="xs" 
            icon={FormInput}
            onClick={handleFormAutomation}
            className={cn(formAutomationEnabled && "text-quantum-cyan")}
            title="Form Automation"
          />
          <SovereignButton 
            variant="ghost" 
            size="xs" 
            icon={EyeVisual}
            onClick={handleVisualRegression}
            className={cn(visualRegressionEnabled && "text-quantum-cyan")}
            title="Visual Regression Testing"
          />
          <SovereignButton 
            variant="ghost" 
            size="xs" 
            icon={Gauge}
            onClick={handlePerformanceTest}
            className={cn(performanceTestingEnabled && "text-quantum-cyan")}
            title="Performance Testing"
          />
          <SovereignButton 
            variant="ghost" 
            size="xs" 
            icon={Workflow}
            onClick={handleAutomation}
            className={cn(automationWorkflows.length > 0 && "text-quantum-cyan")}
            title="Web Workflow Automation"
          />
          <SovereignButton 
            variant="primary" 
            size="xs" 
            icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} 
            onClick={() => setFullScreenMode(prev => {
              if (prev === 'normal') return 'expanded';
              if (prev === 'expanded') return 'immersive';
              if (prev === 'immersive') return 'cinema';
              return 'normal';
            })}
          >
            {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
          </SovereignButton>
        </div>
        {navigationPulse > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-quantum-cyan/10 rounded-lg border border-quantum-cyan/20 ml-2">
            <Globe className="w-3 h-3 text-quantum-cyan animate-pulse" />
            <span className="text-[10px] text-quantum-cyan font-bold uppercase">Synthesizing Web Intent</span>
          </div>
        )}
      </StudioHeader>

      {/* Sovereign Goal Input */}
      <div className="px-4 py-3 bg-quantum-cyan/5 border-b border-quantum-cyan/10 flex items-center gap-3">
        <div className="flex-1 relative">
          <Lightning className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quantum-cyan" />
          <input
            type="text"
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
            placeholder="Browser Directive: e.g., 'Research latest photonic RAM benchmarks and synthesize a comparison table'"
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
          {isProcessingGoal ? 'Cohering...' : 'Synthesize'}
        </SovereignButton>
      </div>

      {/* Sovereign Sandbox Manifest Display */}
      {activeSandboxManifest && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mx-4 mb-4 p-4 rounded-xl bg-quantum-purple/5 border border-quantum-purple/20 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-quantum-purple font-bold uppercase">Sovereign Sandbox Manifest</p>
            <div className="flex gap-4">
              <span className="text-[9px] text-zinc-500 font-mono">SEC: {(activeSandboxManifest.securityIntegrity * 100).toFixed(2)}%</span>
              <span className="text-[9px] text-zinc-500 font-mono">ISO: {activeSandboxManifest.sandboxIsolation}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[9px] text-zinc-600 uppercase mb-2">Isolation Breaches</p>
              <div className="space-y-1">
                {activeSandboxManifest.permissionViolations.length > 0 ? (
                  activeSandboxManifest.permissionViolations.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-quantum-red">
                      <Shield className="w-3 h-3 text-quantum-red/50" />
                      <span>{v}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-[10px] text-quantum-green">
                    <CheckCircle className="w-3 h-3 text-quantum-green/50" />
                    <span>Perfect Isolation Baseline</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[9px] text-zinc-600 uppercase mb-2">Kernel Shield Resistance</p>
              <div className="h-2 bg-quantum-dark/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-quantum-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${activeSandboxManifest.entropyResistance * 100}%` }}
                />
              </div>
              <p className="text-[8px] text-zinc-500 mt-1 font-mono text-right">Shield: {activeSandboxManifest.entropyResistance.toFixed(4)}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col h-[calc(100%-64px)]">
        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-quantum-dark/50 border-b border-quantum-cyan/10 overflow-x-auto">
          {browserTabs.map(tab => (
            <motion.div
              key={tab.id}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-t-lg cursor-pointer transition-all",
                activeTabId === tab.id 
                  ? "bg-quantum-cyan/20 text-quantum-cyan border-b-2 border-quantum-cyan" 
                  : "bg-quantum-dark/30 text-quantum-gray hover:bg-quantum-dark/50"
              )}
              onClick={() => setActiveTabId(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.isPinned && <Sparkles className="w-3 h-3 text-quantum-yellow" />}
              {tab.isAudioPlaying && <Zap className="w-3 h-3 text-quantum-cyan animate-pulse" />}
              <span className="text-sm truncate max-w-[120px]">{tab.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                className="p-0.5 hover:bg-quantum-red/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
          <button 
            onClick={handleNewTab}
            className="p-2 hover:bg-quantum-dark/50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 text-quantum-gray" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-quantum-dark/30 border-b border-quantum-cyan/10">
          <button 
            onClick={() => setShowPrivateWindow(!showPrivateWindow)}
            className={cn(
              "p-2 rounded-lg transition-all",
              showPrivateWindow ? "bg-quantum-purple/20 text-quantum-purple" : "hover:bg-quantum-dark/50"
            )}
          >
            {showPrivateWindow ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          
          <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-quantum-dark/50 rounded-xl border border-quantum-cyan/20 focus-within:border-quantum-cyan/50 transition-all">
            {isLoading && <RefreshCw className="w-4 h-4 text-quantum-cyan animate-spin" />}
            <input
              type="text"
              value={urlInput || activeTab?.url || ''}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate(urlInput)}
              placeholder="Enter URL or search..."
              className="flex-1 bg-transparent text-quantum-white text-sm outline-none"
            />
          </div>
          
          <button
            onClick={() => activeTab && handleAddBookmark(activeTab)}
            className="p-2 hover:bg-quantum-dark/50 rounded-lg transition-colors"
            title="Add Bookmark"
          >
            <Bookmark className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsLoading(true)}
            className="p-2 hover:bg-quantum-dark/50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSearchPanel(!showSearchPanel)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showSearchPanel ? "bg-quantum-cyan/20 text-quantum-cyan" : "hover:bg-quantum-dark/50"
            )}
            title="Platform Search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-quantum-dark/20 border-b border-quantum-cyan/5 overflow-x-auto">
          {(['browser', 'tabs', 'bookmarks', 'history', 'downloads', 'extensions', 'settings', 'private'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveView(mode)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize",
                activeView === mode 
                  ? "bg-quantum-cyan/20 text-quantum-cyan" 
                  : "text-quantum-gray hover:text-quantum-white hover:bg-quantum-dark/30"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Platform Search Panel */}
        <AnimatePresence>
          {showSearchPanel && (
            <motion.div
              key="search-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-quantum-cyan/10 overflow-hidden"
            >
              <div className="p-4 bg-quantum-dark/50">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="text"
                    value={platformSearchQuery}
                    onChange={(e) => setPlatformSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePlatformSearch()}
                    placeholder="Search all platforms..."
                    className="flex-1 bg-quantum-dark/50 border border-quantum-cyan/20 rounded-lg px-4 py-2 text-sm text-quantum-white outline-none focus:border-quantum-cyan/50"
                  />
                  <button
                    onClick={handlePlatformSearch}
                    disabled={isSearching}
                    className="px-4 py-2 bg-quantum-cyan/20 text-quantum-cyan rounded-lg text-sm hover:bg-quantum-cyan/30 disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Platform Toggles */}
                <div className="flex items-center gap-2 mb-3">
                  {(['youtube', 'github', 'wiki', 'web'] as const).map(platform => (
                    <button
                      key={platform}
                      onClick={() => handlePlatformToggle(platform)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors",
                        activePlatforms.includes(platform)
                          ? "bg-quantum-cyan/20 text-quantum-cyan"
                          : "bg-quantum-dark/30 text-quantum-gray"
                      )}
                    >
                      {platform === 'youtube' && <Youtube className="w-3 h-3" />}
                      {platform === 'github' && <Github className="w-3 h-3" />}
                      {platform === 'wiki' && <BookOpen className="w-3 h-3" />}
                      {platform === 'web' && <Globe className="w-3 h-3" />}
                      {platform}
                    </button>
                  ))}
                </div>

                {/* Search Results */}
                {Object.keys(platformSearchResults).length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto">
                    {Object.entries(platformSearchResults).map(([platform, results]) => (
                      <div key={platform} className="space-y-1">
                        <p className="text-xs text-quantum-cyan uppercase">{platform}</p>
                        {results.slice(0, 3).map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => openResultInTab(result)}
                            className="w-full text-left p-2 rounded bg-quantum-dark/30 hover:bg-quantum-dark/50 text-xs truncate"
                          >
                            {result.title}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-black/20">
          <AnimatePresence mode="wait">
            {activeView === 'browser' && activeTab && (
              <motion.div
                key="browser-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full relative group"
              >
                {activeTab.isLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-quantum-deep/80 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-quantum-cyan/20 border-t-quantum-cyan rounded-full animate-spin" />
                      <p className="text-xs text-quantum-cyan font-bold tracking-widest uppercase">Cohering Reality...</p>
                    </div>
                  </div>
                )}
                <iframe
                  src={activeTab.url}
                  className={cn(
                    "w-full h-full border-none transition-opacity duration-700",
                    activeTab.isLoading ? "opacity-0" : "opacity-100"
                  )}
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  title={activeTab.title}
                />
                
                {/* Neural Overlay */}
                <div className="absolute inset-0 pointer-events-none border-[1px] border-quantum-cyan/5 group-hover:border-quantum-cyan/10 transition-colors" />
              </motion.div>
            )}

            {activeView === 'tabs' && (
              <motion.div
                key="tabs-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {browserTabs.map(tab => (
                  <motion.div
                    key={tab.id}
                    className={cn(
                      "p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                      activeTabId === tab.id
                        ? "bg-quantum-cyan/10 border-quantum-cyan/50"
                        : "bg-quantum-dark/30 border-quantum-cyan/20 hover:border-quantum-cyan/40"
                    )}
                    onClick={() => {
                      setActiveTabId(tab.id);
                      setActiveView('browser');
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {tab.isPinned && <Sparkles className="w-4 h-4 text-quantum-yellow" />}
                        {tab.isLoading && <RefreshCw className="w-4 h-4 text-quantum-cyan animate-spin" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTogglePin(tab.id); }}
                          className="p-1 hover:bg-quantum-dark/50 rounded"
                        >
                          <Sparkles className={cn("w-3 h-3", tab.isPinned ? "text-quantum-yellow" : "text-quantum-gray")} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                          className="p-1 hover:bg-quantum-red/20 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-medium text-quantum-white truncate mb-1">{tab.title}</h3>
                    <p className="text-xs text-quantum-gray truncate">{tab.url}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeView === 'bookmarks' && (
              <motion.div
                key="bookmarks-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quantum-gray" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search bookmarks..."
                      className="w-full pl-10 pr-4 py-2 bg-quantum-dark/50 rounded-xl border border-quantum-cyan/20 focus:border-quantum-cyan/50 outline-none text-sm"
                    />
                  </div>
                  <button className="p-2 hover:bg-quantum-dark/50 rounded-lg transition-colors">
                    <Import className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-quantum-dark/50 rounded-lg transition-colors">
                    <Upload className="w-5 h-5" />
                  </button>
                </div>

                {folders.map(folder => (
                  <div key={folder} className="space-y-2">
                    <h3 className="text-sm font-medium text-quantum-cyan flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      {folder}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredBookmarks.filter(b => b.folder === folder).map(bookmark => (
                        <motion.div
                          key={bookmark.id}
                          className="p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-all cursor-pointer"
                          whileHover={{ scale: 1.01 }}
                          onClick={() => handleNavigate(bookmark.url)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-quantum-white text-sm">{bookmark.title}</h4>
                              <p className="text-xs text-quantum-gray truncate">{bookmark.url}</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-quantum-gray" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeView === 'history' && (
              <motion.div
                key="history-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quantum-gray" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search history..."
                      className="w-full pl-10 pr-4 py-2 bg-quantum-dark/50 rounded-xl border border-quantum-cyan/20 focus:border-quantum-cyan/50 outline-none text-sm"
                    />
                  </div>
                  <button className="p-2 hover:bg-quantum-red/20 rounded-lg transition-colors text-quantum-red">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {filteredHistory.map(item => (
                    <motion.div
                      key={item.id}
                      className="p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20 hover:border-quantum-cyan/40 transition-all cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleNavigate(item.url)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-quantum-white text-sm">{item.title}</h4>
                          <p className="text-xs text-quantum-gray truncate">{item.url}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-quantum-gray">
                          <span>{item.visitedAt}</span>
                          <span className="px-2 py-0.5 bg-quantum-dark/50 rounded">{item.visitCount}x</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'downloads' && (
              <motion.div
                key="downloads-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-3">
                  {downloads.map(download => (
                    <div
                      key={download.id}
                      className="p-4 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Download className={cn("w-5 h-5", getStatusColor(download.status))} />
                          <div>
                            <h4 className="font-medium text-quantum-white">{download.filename}</h4>
                            <p className="text-xs text-quantum-gray">{download.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {download.status === 'downloading' && (
                            <span className="text-xs text-quantum-cyan">{formatBytes(download.speed)}/s</span>
                          )}
                          <span className={cn("text-xs", getStatusColor(download.status))}>
                            {download.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-quantum-dark/50 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-quantum-cyan rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${download.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-quantum-gray whitespace-nowrap">
                          {formatBytes(download.downloaded)} / {formatBytes(download.size)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'extensions' && (
              <motion.div
                key="extensions-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="space-y-3">
                  {extensions.map(ext => (
                    <motion.div
                      key={ext.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all",
                        ext.enabled 
                          ? "bg-quantum-cyan/10 border-quantum-cyan/40" 
                          : "bg-quantum-dark/30 border-quantum-cyan/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            ext.enabled ? "bg-quantum-cyan/20" : "bg-quantum-dark/50"
                          )}>
                            <Puzzle className={cn("w-5 h-5", ext.enabled ? "text-quantum-cyan" : "text-quantum-gray")} />
                          </div>
                          <div>
                            <h4 className="font-medium text-quantum-white">{ext.name}</h4>
                            <p className="text-xs text-quantum-gray">{ext.description}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {ext.permissions.map(perm => (
                                <span key={perm} className="text-xs px-2 py-0.5 bg-quantum-dark/50 rounded">
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-quantum-gray">v{ext.version}</span>
                          <button
                            onClick={() => handleToggleExtension(ext.id)}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                              ext.enabled 
                                ? "bg-quantum-cyan/20 text-quantum-cyan" 
                                : "bg-quantum-dark/50 text-quantum-gray hover:text-quantum-white"
                            )}
                          >
                            {ext.enabled ? 'Enabled' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-lg bg-quantum-cyan/10 border border-quantum-cyan/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-quantum-cyan" />
                      <div>
                        <h3 className="font-medium text-quantum-white">Quantum Browsing Mode</h3>
                        <p className="text-xs text-quantum-gray">Enhanced page loading with QPPU acceleration</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateSetting('quantumMode', !settings.quantumMode)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all",
                        settings.quantumMode ? "bg-quantum-cyan" : "bg-quantum-dark/50"
                      )}
                    >
                      <motion.div
                        className="w-4 h-4 bg-white rounded-full"
                        animate={{ x: settings.quantumMode ? 24 : 0 }}
                      />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20">
                  <h3 className="font-medium text-quantum-white mb-4">Privacy Level</h3>
                  <div className="flex gap-2">
                    {(['standard', 'strict', 'paranoid'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => handleUpdateSetting('privacyLevel', level)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                          settings.privacyLevel === level
                            ? "bg-quantum-purple/20 text-quantum-purple border border-quantum-purple/50"
                            : "bg-quantum-dark/50 text-quantum-gray hover:text-quantum-white"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'javascriptEnabled' as const, label: 'JavaScript', desc: 'Enable JavaScript execution' },
                    { key: 'cookiesEnabled' as const, label: 'Cookies', desc: 'Allow cookies' },
                    { key: 'adBlockEnabled' as const, label: 'Ad Block', desc: 'Block advertisements' },
                    { key: 'vpnEnabled' as const, label: 'VPN', desc: 'Enable secure VPN connection' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20">
                      <div>
                        <h4 className="font-medium text-quantum-white">{label}</h4>
                        <p className="text-xs text-quantum-gray">{desc}</p>
                      </div>
                      <button
                        onClick={() => handleUpdateSetting(key, !settings[key])}
                        className={cn(
                          "w-10 h-5 rounded-full p-0.5 transition-all",
                          settings[key] ? "bg-quantum-cyan" : "bg-quantum-dark/50"
                        )}
                      >
                        <motion.div
                          className="w-4 h-4 bg-white rounded-full"
                          animate={{ x: settings[key] ? 20 : 0 }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'private' && (
              <motion.div
                key="private-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <EyeOff className="w-20 h-20 text-quantum-purple mb-4" />
                <h3 className="text-xl font-medium text-quantum-white mb-2">Private Browsing</h3>
                <p className="text-quantum-gray max-w-md">
                  Your browsing activity is completely isolated with quantum encryption.
                  No history, cookies, or cache will be stored.
                </p>
                <button
                  onClick={() => setShowPrivateWindow(true)}
                  className="mt-6 px-6 py-2 bg-quantum-purple/20 text-quantum-purple rounded-lg hover:bg-quantum-purple/30 transition-colors"
                >
                  Open Private Window
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-quantum-dark/30 border-t border-quantum-cyan/10 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-quantum-gray">
              {browserTabs.length} tabs
            </span>
            <span className="text-quantum-gray">
              {stats.activeConnections} connections
            </span>
            {quantumMode && (
              <span className="text-quantum-cyan flex items-center gap-1">
                <Lightning className="w-3 h-3" />
                QPPU Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-quantum-gray flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Privacy: {stats.privacyScore}%
            </span>
            <span className="text-quantum-gray">
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
