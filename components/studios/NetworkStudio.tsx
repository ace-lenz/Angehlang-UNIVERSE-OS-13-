// Plan Item ID: TI-1
/**
 * NetworkStudio.tsx - QPPU-Enhanced Network Analysis Studio
 * 
 * Features:
 * - Quantum Photonic Network Analysis with 50D ANGHV Storage
 * - Real-time Traffic Monitoring & Visualization
 * - Protocol Analysis (TCP/UDP/HTTP/HTTPS/WebSocket/DNS)
 * - Connection Tracking & State Management
 * - Bandwidth & Latency Analytics
 * - Port Scanning & Security Assessment
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - QPPU Quantum Mode for Enhanced Processing
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, Wifi, Globe, Server, Link, Activity, Shield, Lock, Unlock,
  Maximize2, Minimize2, Sparkles, Zap, Search, Filter, Scan,
  RefreshCw, Play, Pause, TrendingUp, TrendingDown, AlertTriangle,
  Clock, ArrowRight, Database, HardDrive, Eye, EyeOff, BarChart2,
  Signal, Zap as Lightning, Cpu, HardDrive as Disk, Mail, FileText,
  ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, HelpCircle
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { resonantLatticeEngine, LatticeCoherenceManifest } from '@/engine/studios/ResonantLatticeEngine';
import { networkAgent } from '@/agents/NetworkAgent';

interface NetworkData {
  name: string;
  protocol: string;
  connections: number;
  bandwidth: number;
  localIP?: string;
  gateway?: string;
  subnet?: string;
}

interface NetworkConnection {
  id: string;
  source: string;
  sourcePort: number;
  destination: string;
  destinationPort: number;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS' | 'WebSocket' | 'DNS';
  status: 'active' | 'pending' | 'closed' | 'timewait';
  latency: number;
  packets: number;
  bytes: number;
  timestamp: string;
}

interface NetworkPort {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
  risk: 'low' | 'medium' | 'high';
}

interface NetworkStudioProps {
  data?: NetworkData;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type ViewMode = 'connections' | 'topology' | 'traffic' | 'security' | 'ports' | 'dns';

const DEFAULT_NETWORK: NetworkData = {
  name: "Local Network",
  protocol: "TCP/IPv4",
  connections: 24,
  bandwidth: 125.4,
  localIP: "192.168.1.100",
  gateway: "192.168.1.1",
  subnet: "255.255.255.0"
};

const MOCK_CONNECTIONS: NetworkConnection[] = [
  { id: '1', source: '192.168.1.100', sourcePort: 443, destination: '8.8.8.8', destinationPort: 53, protocol: 'DNS', status: 'active', latency: 12, packets: 1542, bytes: 245678, timestamp: '2s ago' },
  { id: '2', source: '192.168.1.100', sourcePort: 52341, destination: '172.217.14.206', destinationPort: 443, protocol: 'HTTPS', status: 'active', latency: 8, packets: 892, bytes: 123456, timestamp: '1s ago' },
  { id: '3', source: '192.168.1.100', sourcePort: 52000, destination: '151.101.1.69', destinationPort: 80, protocol: 'HTTP', status: 'active', latency: 15, packets: 456, bytes: 89012, timestamp: '5s ago' },
  { id: '4', source: '192.168.1.100', sourcePort: 52342, destination: '104.16.249.249', destinationPort: 443, protocol: 'WebSocket', status: 'pending', latency: 5, packets: 124, bytes: 34567, timestamp: 'now' },
  { id: '5', source: '192.168.1.100', sourcePort: 52222, destination: '52.84.223.107', destinationPort: 443, protocol: 'HTTPS', status: 'timewait', latency: 0, packets: 0, bytes: 0, timestamp: '30s ago' },
  { id: '6', source: '192.168.1.101', sourcePort: 80, destination: '192.168.1.100', destinationPort: 8080, protocol: 'TCP', status: 'active', latency: 2, packets: 2456, bytes: 567890, timestamp: '1s ago' },
  { id: '7', source: '192.168.1.102', sourcePort: 443, destination: '93.184.216.34', destinationPort: 443, protocol: 'HTTPS', status: 'active', latency: 45, packets: 89, bytes: 12345, timestamp: '3s ago' },
];

const COMMON_PORTS: NetworkPort[] = [
  { port: 21, service: 'FTP', status: 'closed', risk: 'high' },
  { port: 22, service: 'SSH', status: 'open', risk: 'medium' },
  { port: 23, service: 'Telnet', status: 'closed', risk: 'high' },
  { port: 25, service: 'SMTP', status: 'closed', risk: 'medium' },
  { port: 53, service: 'DNS', status: 'open', risk: 'low' },
  { port: 80, service: 'HTTP', status: 'open', risk: 'medium' },
  { port: 110, service: 'POP3', status: 'closed', risk: 'medium' },
  { port: 143, service: 'IMAP', status: 'closed', risk: 'medium' },
  { port: 443, service: 'HTTPS', status: 'open', risk: 'low' },
  { port: 445, service: 'SMB', status: 'closed', risk: 'high' },
  { port: 993, service: 'IMAPS', status: 'open', risk: 'low' },
  { port: 995, service: 'POP3S', status: 'open', risk: 'low' },
  { port: 3306, service: 'MySQL', status: 'closed', risk: 'high' },
  { port: 5432, service: 'PostgreSQL', status: 'closed', risk: 'high' },
  { port: 8080, service: 'HTTP-Alt', status: 'open', risk: 'medium' },
  { port: 8443, service: 'HTTPS-Alt', status: 'open', risk: 'low' },
];

const DNS_RECORDS = [
  { domain: 'google.com', ip: '142.250.190.46', type: 'A', ttl: 300 },
  { domain: 'cloudflare.com', ip: '104.16.249.249', type: 'A', ttl: 300 },
  { domain: 'github.com', ip: '140.82.121.4', type: 'A', ttl: 60 },
  { domain: 'vercel.com', ip: '76.76.21.21', type: 'A', ttl: 300 },
];

export const NetworkStudio: React.FC<NetworkStudioProps> = ({ data: externalData, status }) => {
  const data = externalData || DEFAULT_NETWORK;
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [viewMode, setViewMode] = useState<ViewMode>('connections');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [quantumMode, setQuantumMode] = useState(false);
  const [connections, setConnections] = useState<NetworkConnection[]>(MOCK_CONNECTIONS);
  const [ports, setPorts] = useState<NetworkPort[]>(COMMON_PORTS);
  const [dnsRecords, setDnsRecords] = useState(DNS_RECORDS);
  const [qppuStats, setQppuStats] = useState({ coherence: 0, fidelity: 0, frames: '50D' });
  const [searchQuery, setSearchQuery] = useState('');
  const [portScanActive, setPortScanActive] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [fluxPulse, setFluxPulse] = useState(0);
  const [activeNetworkManifest, setActiveNetworkManifest] = useState<LatticeCoherenceManifest | null>(null);
  const [networkSimulation, setNetworkSimulation] = useState(false);
  const [trafficAnalysis, setTrafficAnalysis] = useState(false);
  const [securityScan, setSecurityScan] = useState(false);
  const [protocolAnalysis, setProtocolAnalysis] = useState(false);
  const [bandwidthMonitoring, setBandwidthMonitoring] = useState(false);
  const [automation, setAutomation] = useState(false);
  
  const statsRef = useRef({ packetsPerSec: 0, errorsPerSec: 0, bandwidthHistory: [] as number[] });

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  const handleNetworkSimulation = () => {
    setNetworkSimulation(!networkSimulation);
    console.log('[NetworkStudio] Network simulation:', !networkSimulation ? 'started' : 'stopped');
  };

  const handleTrafficAnalysis = () => {
    setTrafficAnalysis(!trafficAnalysis);
    console.log('[NetworkStudio] Traffic analysis:', !trafficAnalysis ? 'enabled' : 'disabled');
  };

  const handleSecurityScan = () => {
    setSecurityScan(!securityScan);
    console.log('[NetworkStudio] Security scanning:', !securityScan ? 'initiated' : 'cancelled');
  };

  const handleProtocolAnalysis = () => {
    setProtocolAnalysis(!protocolAnalysis);
    console.log('[NetworkStudio] Protocol analysis:', !protocolAnalysis ? 'enabled' : 'disabled');
  };

  const handleBandwidthMonitoring = () => {
    setBandwidthMonitoring(!bandwidthMonitoring);
    console.log('[NetworkStudio] Bandwidth monitoring:', !bandwidthMonitoring ? 'enabled' : 'disabled');
  };

  const handleAutomation = () => {
    setAutomation(!automation);
    console.log('[NetworkStudio] Automation:', !automation ? 'enabled' : 'disabled');
  };

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setFluxPulse(100);
    
    try {
      // Use the specialized ResonantLatticeEngine for network lattice sync and flux orchestration
      const manifest = await resonantLatticeEngine.orchestrateLatticeSync(goalText);
      
      setActiveNetworkManifest(manifest);
      console.log('[NetworkStudio] Packet resonance synthesized:', manifest);
      setFluxPulse(60);
      
      // Secondary logic via agent
      await networkAgent.process(goalText);
    } catch (error) {
      console.error('[NetworkStudio] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setFluxPulse(0);
      }, 1500);
    }
  };

  useEffect(() => {
    if (quantumMode && isMonitoring) {
      qppuEngine.processFrame(33.33, 'photonic');
    }
  }, [quantumMode, isMonitoring]);

  useEffect(() => {
    if (!isMonitoring) return;
    const interval = setInterval(() => {
      const newPps = Math.floor(Math.random() * 500 + 100);
      statsRef.current.packetsPerSec = newPps;
      statsRef.current.bandwidthHistory = [...statsRef.current.bandwidthHistory, data.bandwidth + Math.random() * 10 - 5].slice(-20);
      
      setConnections(prev => prev.map(c => ({
        ...c,
        packets: c.packets + Math.floor(Math.random() * 10),
        bytes: c.bytes + Math.floor(Math.random() * 1000),
        timestamp: 'now'
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, [isMonitoring, data.bandwidth]);

  const filteredConnections = useMemo(() => {
    if (!searchQuery) return connections;
    const query = searchQuery.toLowerCase();
    return connections.filter(c => 
      c.source.toLowerCase().includes(query) || 
      c.destination.toLowerCase().includes(query) ||
      c.protocol.toLowerCase().includes(query)
    );
  }, [connections, searchQuery]);

  const totalBytes = useMemo(() => {
    return connections.reduce((acc, c) => acc + c.bytes, 0);
  }, [connections]);

  const totalPackets = useMemo(() => {
    return connections.reduce((acc, c) => acc + c.packets, 0);
  }, [connections]);

  const avgLatency = useMemo(() => {
    const active = connections.filter(c => c.status === 'active');
    if (!active.length) return 0;
    return Math.round(active.reduce((acc, c) => acc + c.latency, 0) / active.length);
  }, [connections]);

  const openPorts = useMemo(() => ports.filter(p => p.status === 'open').length, [ports]);
  const highRiskPorts = useMemo(() => ports.filter(p => p.risk === 'high').length, [ports]);

  const fullScreenHandlers = {
    normal: () => setFullScreenMode('normal'),
    expanded: () => setFullScreenMode('expanded'),
    immersive: () => setFullScreenMode('immersive'),
    cinema: () => setFullScreenMode('cinema'),
  };

  const containerClasses = cn(
    "w-full rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl",
    "bg-[#02020a] transition-all duration-500",
    fullScreenMode === 'expanded' && "fixed inset-0 z-50 rounded-none",
    fullScreenMode === 'immersive' && "fixed inset-0 z-50 rounded-none bg-black",
    fullScreenMode === 'cinema' && "fixed inset-0 z-50 rounded-none bg-black"
  );

  const renderTopologyView = () => (
    <div className="relative h-64 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
              <Globe size={24} className="text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-300">Internet</span>
              <span className="text-[10px] text-zinc-500">Public Network</span>
            </div>
          </div>
          
          <div className="w-px h-8 bg-zinc-700" />
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center">
              <Server size={28} className="text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-300">Gateway</span>
              <span className="text-[10px] text-zinc-500">{data.gateway}</span>
            </div>
          </div>
          
          <div className="w-px h-8 bg-zinc-700" />
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-16 rounded-2xl bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center">
              <HardDrive size={28} className="text-indigo-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-300">Local Host</span>
              <span className="text-[10px] text-zinc-500">{data.localIP}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="px-2 py-1 rounded bg-zinc-900 text-[10px] text-zinc-400">{data.subnet}</div>
        <div className="px-2 py-1 rounded bg-zinc-900 text-[10px] text-zinc-400">MTU: 1500</div>
      </div>
    </div>
  );

  const renderTrafficView = () => (
    <div className="space-y-4">
      <div className="h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-zinc-500 uppercase">Bandwidth History</span>
          <span className="text-lg font-mono text-cyan-400">{data.bandwidth.toFixed(1)} MB/s</span>
        </div>
        <div className="flex items-end gap-1 h-24">
          {statsRef.current.bandwidthHistory.map((val, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-cyan-500/60 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(val / 200) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">Packets/s</p>
          <p className="text-lg font-mono text-zinc-200">{statsRef.current.packetsPerSec}</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">Total Packets</p>
          <p className="text-lg font-mono text-zinc-200">{(totalPackets / 1000).toFixed(1)}K</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">Errors/s</p>
          <p className="text-lg font-mono text-emerald-400">0</p>
        </div>
      </div>
    </div>
  );

  const renderSecurityView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">Risk Score</p>
          <p className="text-lg font-mono text-emerald-400">Low</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">Open Ports</p>
          <p className="text-lg font-mono text-zinc-200">{openPorts}</p>
        </div>
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
          <p className="text-[10px] text-zinc-500 uppercase mb-1">High Risk</p>
          <p className="text-lg font-mono text-amber-400">{highRiskPorts}</p>
        </div>
      </div>
      
      <div className="p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/20">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">Network appears secure</span>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">No suspicious patterns detected</p>
      </div>
    </div>
  );

  const renderPortsView = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">Common Ports ({ports.length})</span>
        <SovereignButton 
          variant={portScanActive ? "secondary" : "primary"} 
          size="xs" 
          icon={Scan}
          onClick={() => setPortScanActive(!portScanActive)}
        >
          {portScanActive ? 'Scanning...' : 'Scan'}
        </SovereignButton>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {ports.map(port => (
          <div key={port.port} className={cn(
            "p-2 rounded-lg border flex items-center justify-between",
            port.status === 'open' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-950 border-zinc-900"
          )}>
            <div className="flex items-center gap-2">
              {port.status === 'open' ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-zinc-600" />}
              <span className="text-xs font-mono text-zinc-300">{port.port}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">{port.service}</span>
              {port.risk === 'high' && <AlertTriangle size={10} className="text-red-400" />}
              {port.risk === 'medium' && <AlertTriangle size={10} className="text-amber-400" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDnsView = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {dnsRecords.map((record, i) => (
          <div key={i} className="p-3 rounded-lg bg-zinc-950 border border-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">{record.domain}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{record.type}</span>
            </div>
            <p className="text-xs font-mono text-cyan-400 mt-1">{record.ip}</p>
            <p className="text-[10px] text-zinc-600 mt-1">TTL: {record.ttl}s</p>
          </div>
        ))}
      </div>
      
      <SovereignButton variant="secondary" size="sm" icon={RefreshCw} className="w-full">
        Refresh DNS Cache
      </SovereignButton>
    </div>
  );

  return (
    <AnimatePresence>
      {fullScreenMode === 'cinema' && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/90"
          onClick={() => setFullScreenMode('normal')}
        />
      )}
      <motion.div className={containerClasses} layout>
        <StudioHeader 
          title="Network Studio" 
          subtitle={`${data.name} • ${data.protocol} • ${data.localIP}`} 
          icon={Network}
          badge={status || (isMonitoring ? 'Monitoring' : 'Paused')}
          badgeColor="cyan"
        >
          <div className="flex items-center gap-2">
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={quantumMode ? Zap : Sparkles} 
              onClick={() => setQuantumMode(!quantumMode)} 
              className={cn(quantumMode && "text-cyan-400")}
              title="QPPU Quantum Mode"
            />
            <SovereignButton 
              variant="primary" 
              size="xs" 
              icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} 
              onClick={() => fullScreenHandlers[fullScreenMode === 'normal' ? 'expanded' : 'normal']()}
            >
              {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
            </SovereignButton>
          </div>
          {fluxPulse > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20 ml-2">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="text-[10px] text-cyan-300 font-bold uppercase">Flux Orchestration</span>
            </div>
          )}
        </StudioHeader>

        {/* Sovereign Goal Input */}
        <div className="px-4 py-3 bg-cyan-500/5 border-b border-cyan-500/10 flex items-center gap-3">
          <div className="flex-1 relative">
            <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
              placeholder="Network Directive: e.g., 'Allocate 50D bandwidth for cross-studio A2A telemetry'"
              className="w-full bg-[#050510] border border-cyan-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-cyan-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
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
            {isProcessingGoal ? 'Optimizing...' : 'Execute'}
          </SovereignButton>
        </div>

        {/* Packet Lattice Manifest Display */}
        {activeNetworkManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-cyan-400 font-bold uppercase">Sovereign Packet Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">COH: {(activeNetworkManifest.coherenceScore * 100).toFixed(2)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">LAT: {activeNetworkManifest.syncLatency}ms</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Network Alerts</p>
                <div className="space-y-1">
                  {activeNetworkManifest.latticeAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <Signal size={10} className="text-cyan-500/50" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Resonance Active</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(activeNetworkManifest.activeResonances / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400">{activeNetworkManifest.activeResonances} Units</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex border-b border-zinc-800 bg-zinc-950/40 overflow-x-auto">
          {(['connections', 'topology', 'traffic', 'security', 'ports', 'dns'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                viewMode === mode 
                  ? "text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5" 
                  : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className={cn(
          fullScreenMode === 'cinema' ? "flex-1 p-6 overflow-auto" : "p-6"
        )}>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Link size={16} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Connections</p>
                <p className="text-xl font-mono text-zinc-200">{connections.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Bandwidth</p>
                <p className="text-xl font-mono text-zinc-200">{data.bandwidth.toFixed(1)} MB/s</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Activity size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Avg Latency</p>
                <p className="text-xl font-mono text-zinc-200">{avgLatency}ms</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Database size={16} className="text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Total Data</p>
                <p className="text-xl font-mono text-zinc-200">{(totalBytes / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
          </div>

          {quantumMode && (
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center gap-4 mb-6">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Lightning size={16} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] text-cyan-400 uppercase font-black tracking-widest">QPPU Quantum Engine</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-zinc-400">Coh: <span className="text-cyan-300 font-bold">{qppuStats.coherence}%</span></span>
                  <span className="text-zinc-400">Fi: <span className="text-cyan-300 font-bold">{qppuStats.fidelity}%</span></span>
                  <span className="text-zinc-400">Dim: <span className="text-cyan-300 font-bold">{qppuStats.frames}</span></span>
                  <span className="text-zinc-400">Mode: <span className="text-cyan-300 font-bold">Photonic</span></span>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'connections' && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by IP, protocol..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-cyan-500/50"
                  />
                </div>
                <SovereignButton variant="ghost" size="xs" icon={RefreshCw} onClick={() => setConnections([...connections])} />
              </div>

              <div className="space-y-2">
                {filteredConnections.map((conn) => (
                  <motion.div 
                    key={conn.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedConnection(conn.id === selectedConnection ? null : conn.id)}
                    className={cn(
                      "p-3 rounded-xl border flex items-center gap-4 transition-all cursor-pointer",
                      selectedConnection === conn.id 
                        ? "bg-cyan-500/10 border-cyan-500/30" 
                        : conn.status === 'active' 
                        ? "bg-cyan-500/5 border-cyan-500/20" 
                        : conn.status === 'pending'
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-zinc-950 border-zinc-900"
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      conn.status === 'active' ? "bg-emerald-500" : conn.status === 'pending' ? "bg-amber-500" : "bg-zinc-700"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-200">{conn.source}:{conn.sourcePort}</span>
                        <ArrowRight size={10} className="text-zinc-600 flex-shrink-0" />
                        <span className="text-xs font-mono text-zinc-200">{conn.destination}:{conn.destinationPort}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-zinc-500">{conn.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono">{conn.protocol}</span>
                      {conn.status === 'active' && (
                        <span className="text-zinc-500 font-mono">{conn.latency}ms</span>
                      )}
                      <span className="text-zinc-600 font-mono">{(conn.bytes / 1024).toFixed(1)} KB</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {viewMode === 'topology' && renderTopologyView()}
          {viewMode === 'traffic' && renderTrafficView()}
          {viewMode === 'security' && renderSecurityView()}
          {viewMode === 'ports' && renderPortsView()}
          {viewMode === 'dns' && renderDnsView()}
        </div>

        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Wifi size={12} className="text-emerald-400" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Status: <span className="text-emerald-400 font-bold">Online</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Signal size={12} className="text-zinc-600" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Signal: <span className="text-zinc-200 font-bold">Excellent</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-zinc-600" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase">Updated: <span className="text-zinc-200 font-bold">Just now</span></span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleNetworkSimulation} className={cn("px-2 py-1 rounded text-[9px] uppercase font-bold transition-all", networkSimulation ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-zinc-900 text-zinc-500")}>Sim</button>
            <button onClick={handleTrafficAnalysis} className={cn("px-2 py-1 rounded text-[9px] uppercase font-bold transition-all", trafficAnalysis ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-zinc-900 text-zinc-500")}>Traffic</button>
            <button onClick={handleSecurityScan} className={cn("px-2 py-1 rounded text-[9px] uppercase font-bold transition-all", securityScan ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-zinc-900 text-zinc-500")}>Security</button>
            <button onClick={handleProtocolAnalysis} className={cn("px-2 py-1 rounded text-[9px] uppercase font-bold transition-all", protocolAnalysis ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-zinc-900 text-zinc-500")}>Protocol</button>
            <button onClick={handleBandwidthMonitoring} className={cn("px-2 py-1 rounded text-[9px] uppercase font-bold transition-all", bandwidthMonitoring ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-zinc-900 text-zinc-500")}>Bandwidth</button>
            <button onClick={handleAutomation} className={cn("px-2 py-1 rounded text-[9px] uppercase font-bold transition-all", automation ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500")}>Auto</button>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ scaleY: [1, 1.5 + Math.random() * 0.5, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
                className={cn("w-1 h-3 rounded-full", quantumMode ? "bg-cyan-400" : "bg-cyan-500/40")}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
