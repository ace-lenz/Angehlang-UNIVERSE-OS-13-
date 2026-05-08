/**
 * OSStudio.tsx - QPPU-Enhanced Operating System Studio
 * 
 * Features:
 * - Quantum Photonic Process Management with 50D ANGHV Storage
 * - System Monitoring & Performance Analytics
 * - File System Management
 * - Service & Daemon Control
 * - Kernel Parameters & Configuration
 * - User & Permission Management
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - QPPU Quantum Mode for Enhanced Processing
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, Cpu, HardDrive, Server, Settings, Shield, Zap,
  Maximize2, Minimize2, Sparkles, Activity, Battery,
  Clock, Play, Pause, Square, RotateCw, Trash2, Folder,
  File, FileText, Image, Music, Video, Code, Archive,
  Users, User, Lock, Key, Terminal, Command,
  Database, Cloud, Download, Upload, RefreshCw, Search,
  Filter, CheckCircle, XCircle, AlertTriangle, Info, Layers,
  Layers as Stack, GitBranch, Gauge, Thermometer,
  Wifi, Bluetooth, Volume, Sun, Keyboard, Mouse,
  Disc, FolderOpen, FilePlus, FileMinus, Edit, Save,
  Copy, Scissors, Clipboard, Terminal as Term, Link2 as LinkIcon
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { coreSovereignKernel, SystemHealthManifest } from '@/engine/studios/CoreSovereignKernel';
import { osAgent } from '@/agents/OSAgent';
import { sovereignAutomaton } from '@/features/automation/engines/SovereignAutomatonEngine';

interface SystemProcess {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  memory: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  uptime: string;
  command: string;
}

interface FileNode {
  name: string;
  type: 'file' | 'directory' | 'link';
  size?: number;
  modified?: string;
  permission: string;
  owner: string;
  children?: FileNode[];
}

interface SystemService {
  name: string;
  status: 'active' | 'inactive' | 'failed' | 'activating';
  enabled: boolean;
  cpu: number;
  memory: number;
  description: string;
}

interface UserAccount {
  username: string;
  uid: number;
  gid: number;
  home: string;
  shell: string;
  lastLogin: string;
  groups: string[];
}

interface KernelParam {
  name: string;
  value: string;
  default: string;
  description: string;
}

interface SystemStats {
  cpuUsage: number;
  memoryTotal: number;
  memoryUsed: number;
  memoryFree: number;
  diskTotal: number;
  diskUsed: number;
  diskFree: number;
  uptime: string;
  loadAvg: number[];
  processes: number;
  temperature: number;
}

interface OSStudioProps {
  data?: any;
  stats?: SystemStats;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type ViewMode = 'processes' | 'filesystem' | 'services' | 'users' | 'kernel' | 'monitor' | 'terminal';

const SYSTEM_STATS: SystemStats = {
  cpuUsage: 34.5,
  memoryTotal: 32768,
  memoryUsed: 18432,
  memoryFree: 14336,
  diskTotal: 1000000,
  diskUsed: 456789,
  diskFree: 543211,
  uptime: '7d 23h 45m',
  loadAvg: [1.2, 0.8, 0.5],
  processes: 247,
  temperature: 62,
};

const MOCK_PROCESSES: SystemProcess[] = [
  { pid: 1, name: 'systemd', user: 'root', cpu: 0.1, memory: 2.4, status: 'running', uptime: '7d 23h', command: '/lib/systemd/systemd' },
  { pid: 2, name: 'kthreadd', user: 'root', cpu: 0.0, memory: 0.0, status: 'running', uptime: '7d 23h', command: 'kthreadd' },
  { pid: 123, name: 'qppu-daemon', user: 'root', cpu: 12.3, memory: 8.2, status: 'running', uptime: '7d 23h', command: '/usr/bin/qppu-daemon' },
  { pid: 456, name: 'anghv-storage', user: 'root', cpu: 8.7, memory: 12.1, status: 'running', uptime: '5d 14h', command: '/usr/bin/anghv-storage' },
  { pid: 789, name: 'photonic-ui', user: 'user', cpu: 5.2, memory: 4.8, status: 'running', uptime: '2d 6h', command: '/usr/bin/photonic-ui' },
  { pid: 1024, name: 'node', user: 'user', cpu: 2.1, memory: 6.2, status: 'running', uptime: '1d 3h', command: 'node server.js' },
  { pid: 2048, name: 'dockerd', user: 'root', cpu: 1.8, memory: 3.4, status: 'running', uptime: '7d 23h', command: '/usr/bin/dockerd' },
  { pid: 3000, name: 'nginx', user: 'www-data', cpu: 0.8, memory: 2.1, status: 'running', uptime: '3d 12h', command: 'nginx: master' },
  { pid: 3500, name: 'postgres', user: 'postgres', cpu: 1.2, memory: 15.8, status: 'running', uptime: '7d 23h', command: '/usr/lib/postgresql/bin/postgres' },
  { pid: 4000, name: 'redis-server', user: 'redis', cpu: 0.5, memory: 1.2, status: 'running', uptime: '7d 23h', command: '/usr/bin/redis-server' },
  { pid: 4500, name: 'code-server', user: 'user', cpu: 3.4, memory: 8.9, status: 'running', uptime: '6h 30m', command: '/usr/bin/code-server' },
  { pid: 5000, name: 'chrome', user: 'user', cpu: 15.2, memory: 24.5, status: 'running', uptime: '2h 15m', command: '/usr/bin/chrome' },
];

const MOCK_FILESYSTEM: FileNode[] = [
  {
    name: 'root',
    type: 'directory',
    permission: 'drwxr-xr-x',
    owner: 'root',
    modified: '2024-01-15',
    children: [
      { name: 'bin', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-10' },
      { name: 'boot', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-08' },
      { name: 'dev', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-01' },
      { name: 'etc', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-14' },
      { name: 'home', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-15', children: [
        { name: 'user', type: 'directory', permission: 'drwxr-xr-x', owner: 'user', modified: '2024-01-15', children: [
          { name: 'documents', type: 'directory', permission: 'drwxr-xr-x', owner: 'user', modified: '2024-01-14' },
          { name: 'downloads', type: 'directory', permission: 'drwxr-xr-x', owner: 'user', modified: '2024-01-15' },
          { name: 'projects', type: 'directory', permission: 'drwxr-xr-x', owner: 'user', modified: '2024-01-12' },
        ]},
      ]},
      { name: 'lib', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-10' },
      { name: 'opt', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-05' },
      { name: 'proc', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-01' },
      { name: 'root', type: 'directory', permission: 'drwx------', owner: 'root', modified: '2024-01-15' },
      { name: 'run', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-01' },
      { name: 'sbin', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-10' },
      { name: 'tmp', type: 'directory', permission: 'drwxrwxrwt', owner: 'root', modified: '2024-01-15' },
      { name: 'usr', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-10' },
      { name: 'var', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-14', children: [
        { name: 'log', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-15' },
        { name: 'cache', type: 'directory', permission: 'drwxr-xr-x', owner: 'root', modified: '2024-01-15' },
      ]},
    ],
  },
];

const MOCK_SERVICES: SystemService[] = [
  { name: 'qppu-daemon', status: 'active', enabled: true, cpu: 12.3, memory: 8.2, description: 'QPPU Processing Daemon' },
  { name: 'anghv-storage', status: 'active', enabled: true, cpu: 8.7, memory: 12.1, description: 'ANGHV Storage Service' },
  { name: 'photonic-ui', status: 'active', enabled: true, cpu: 5.2, memory: 4.8, description: 'Photonic UI Service' },
  { name: 'nginx', status: 'active', enabled: true, cpu: 0.8, memory: 2.1, description: 'Web Server' },
  { name: 'docker', status: 'active', enabled: true, cpu: 1.8, memory: 3.4, description: 'Container Runtime' },
  { name: 'postgresql', status: 'active', enabled: true, cpu: 1.2, memory: 15.8, description: 'Database Server' },
  { name: 'redis', status: 'active', enabled: true, cpu: 0.5, memory: 1.2, description: 'In-Memory Cache' },
  { name: 'cron', status: 'active', enabled: true, cpu: 0.1, memory: 0.2, description: 'Task Scheduler' },
  { name: 'ssh', status: 'active', enabled: false, cpu: 0.2, memory: 0.5, description: 'SSH Daemon' },
  { name: 'fail2ban', status: 'inactive', enabled: true, cpu: 0.3, memory: 1.2, description: 'Intrusion Prevention' },
  { name: 'quantum-firewall', status: 'active', enabled: true, cpu: 2.1, memory: 1.8, description: 'Quantum Firewall' },
  { name: 'backup-service', status: 'failed', enabled: false, cpu: 0.0, memory: 0.0, description: 'Backup Daemon' },
];

const MOCK_USERS: UserAccount[] = [
  { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', lastLogin: '2024-01-15 08:30', groups: ['root', 'sudo'] },
  { username: 'user', uid: 1000, gid: 1000, home: '/home/user', shell: '/bin/bash', lastLogin: '2024-01-15 14:22', groups: ['user', 'sudo', 'docker'] },
  { username: 'www-data', uid: 33, gid: 33, home: '/var/www', shell: '/usr/sbin/nologin', lastLogin: 'Never', groups: ['www-data'] },
  { username: 'postgres', uid: 116, gid: 116, home: '/var/lib/postgresql', shell: '/bin/bash', lastLogin: '2024-01-14 12:00', groups: ['postgres', 'ssl-cert'] },
  { username: 'redis', uid: 127, gid: 131, home: '/var/lib/redis', shell: '/usr/sbin/nologin', lastLogin: '2024-01-15 10:15', groups: ['redis'] },
];

const KERNEL_PARAMS: KernelParam[] = [
  { name: 'kernel.shmmax', value: '68719476736', default: '34359738368', description: 'Maximum shared memory segment size' },
  { name: 'kernel.shmall', value: '4294967296', default: '2097152', description: 'Maximum shared memory pages' },
  { name: 'fs.file-max', value: '2097152', default: '1048576', description: 'Maximum number of open files' },
  { name: 'net.core.rmem_max', value: '134217728', default: '16777216', description: 'Maximum read buffer' },
  { name: 'net.core.wmem_max', value: '134217728', default: '16777216', description: 'Maximum write buffer' },
  { name: 'net.ipv4.tcp_max_syn_backlog', value: '262144', default: '4096', description: 'TCP SYN backlog queue' },
  { name: 'vm.max_map_count', value: '262144', default: '65530', description: 'Maximum memory map areas' },
  { name: 'vm.overcommit_memory', value: '1', default: '0', description: 'Memory overcommit mode' },
  { name: 'vm.swappiness', value: '10', default: '60', description: 'Swap tendency' },
];

export default function OSStudio({ stats = SYSTEM_STATS, status = "running" }: OSStudioProps): React.ReactElement {
  const [activeView, setActiveView] = useState<ViewMode>('monitor');
  const [processes, setProcesses] = useState<SystemProcess[]>(MOCK_PROCESSES);
  const [filesystem, setFilesystem] = useState<FileNode[]>(MOCK_FILESYSTEM);
  const [services, setServices] = useState<SystemService[]>(MOCK_SERVICES);
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS);
  const [kernelParams, setKernelParams] = useState<KernelParam[]>(KERNEL_PARAMS);
  const [currentStats, setCurrentStats] = useState<SystemStats>(stats);
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [quantumMode, setQuantumMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'cpu' | 'memory' | 'name'>('cpu');
  const [selectedPath, setSelectedPath] = useState<string[]>(['root']);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Angehlang OS v50D - Quantum Photonic Operating System',
    'Type "help" for available commands.',
  ]);
  const [currentDir, setCurrentDir] = useState('/home/user');
  const [spectralLoad, setSpectralLoad] = useState<any[]>([]);
  const [automationMetrics, setAutomationMetrics] = useState<any>(null);
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [goalText, setGoalText] = useState('');
  const [systemPulse, setSystemPulse] = useState(0);
  const [activeHealthManifest, setActiveHealthManifest] = useState<SystemHealthManifest | null>(null);

  const currentDirNode = useMemo(() => {
    let node = filesystem[0];
    for (const part of selectedPath) {
      if (node?.children) {
        node = node.children.find(c => c.name === part);
      }
    }
    return node;
  }, [filesystem, selectedPath]);

  const filteredProcesses = useMemo(() => {
    let filtered = processes;
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pid.toString().includes(searchQuery) ||
        p.command.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'cpu') return b.cpu - a.cpu;
      if (sortBy === 'memory') return b.memory - a.memory;
      return a.name.localeCompare(b.name);
    });
  }, [processes, searchQuery, sortBy]);

  const memoryPercent = useMemo(() => 
    (currentStats.memoryUsed / currentStats.memoryTotal) * 100, 
    [currentStats]
  );

  const diskPercent = useMemo(() => 
    (currentStats.diskUsed / currentStats.diskTotal) * 100, 
    [currentStats]
  );

  useEffect(() => {
    if (quantumMode) {
      qppuEngine.activateQuantumMode('os');
    }
  }, [quantumMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpectralLoad(osAgent.getSpectralLoad());
      const metrics = sovereignAutomaton.getExecutionMetrics('latest');
      if (metrics) setAutomationMetrics(metrics);
      setCurrentStats(prev => ({
        ...prev,
        cpuUsage: Math.max(0, Math.min(100, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsed: prev.memoryUsed + Math.floor((Math.random() - 0.5) * 200),
        loadAvg: [1.0 + Math.random() * 0.5, 0.8 + Math.random() * 0.4, 0.6 + Math.random() * 0.3],
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setSystemPulse(100);
    try {
      await coreSovereignKernel.balanceResources();
      const health = await coreSovereignKernel.verifySovereignty();
      setActiveHealthManifest(health);
      console.log('[OSStudio] System health manifest:', health);
      setSystemPulse(70);
      const result = await osAgent.process(goalText);
      if (result.synthesis) {
        setTerminalHistory(prev => [...prev, `[OSAgent] Intent Synthesized: ${result.synthesis.slice(0, 100)}...`]);
      }
    } catch (error) {
      setTerminalHistory(prev => [...prev, `[Error] ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setSystemPulse(0);
      }, 1500);
    }
  };

  const handleKillProcess = (pid: number) => {
    setProcesses(prev => prev.filter(p => p.pid !== pid));
  };

  const handleToggleService = (name: string) => {
    setServices(prev => prev.map(s => 
      s.name === name ? { ...s, status: s.status === 'active' ? 'inactive' : 'active', enabled: s.status === 'active' ? false : s.enabled } : s
    ));
  };

  const handleNavigateTo = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    setSelectedPath(parts.length ? parts : ['root']);
  };

  const handleTerminalCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    setTerminalHistory(prev => [...prev, `user@angehlang:~$ ${trimmed}`]);
    const output = processCommand(trimmed);
    if (output) setTerminalHistory(prev => [...prev, output]);
    setTerminalInput('');
  };

  const processCommand = (cmd: string): string => {
    const parts = cmd.split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    switch (command) {
      case 'help': return `Available commands: help, ls, cd, pwd, ps, top, df, free, uname, whoami, date, echo, clear`;
      case 'ls': return currentDirNode?.children?.map(c => `${c.type === 'directory' ? 'd' : '-'}${c.permission.slice(1)} ${c.owner} ${c.size || '-'} ${c.name}`).join('\n') || '';
      case 'pwd': return currentDir;
      case 'whoami': return 'user';
      case 'date': return new Date().toString();
      case 'uname': return args.includes('-a') ? 'Angehlang 50D GNU/Lux 2024.1 x86_64 Quantum Photonic' : 'Angehlang';
      case 'clear': setTerminalHistory([]); return '';
      case 'ps': return processes.slice(0, 5).map(p => `${p.pid.toString().padStart(5)} ${p.user.padStart(8)} ${p.cpu.toFixed(1).padStart(5)} ${p.memory.toFixed(1).padStart(5)} ${p.name}`).join('\n');
      case 'df': return `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1      977G  447G  530G  47% /`;
      case 'free': return `              total        used        free      shared  buff/cache   available\nMem:         32768       18432       14336       2048       5120       13568\nSwap:         8192         512        7680`;
      case 'echo': return args.join(' ');
      case 'cat': return `File content preview not available in this view`;
      default: return command ? `Command not found: ${command}` : '';
    }
  };

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-quantum-green';
      case 'running': return 'text-quantum-green';
      case 'inactive': return 'text-quantum-gray';
      case 'failed': return 'text-quantum-red';
      case 'stopped': return 'text-quantum-orange';
      case 'sleeping': return 'text-quantum-cyan';
      case 'zombie': return 'text-quantum-purple';
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
        title="OS Studio"
        icon={Monitor}
        badge={status || (quantumMode ? 'Quantum' : 'Classic')}
        badgeColor="emerald"
      >
        <div className="flex items-center gap-2">
          <SovereignButton
            variant="ghost"
            size="xs"
            icon={quantumMode ? Zap : Sparkles}
            onClick={() => setQuantumMode(!quantumMode)}
            className={cn(quantumMode && "text-cyan-400")}
            title="Toggle Quantum Mode"
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
        {systemPulse > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20 ml-2">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-[10px] text-cyan-300 font-bold uppercase">Kernel Manifesting</span>
          </div>
        )}
      </StudioHeader>

      <div className="flex flex-col h-[calc(100%-64px)]">
        <div className="px-4 py-3 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center gap-3">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
              placeholder="System Objective: e.g., 'Optimize Photonic RAM for high-fidelity audio synthesis'"
              className="w-full bg-[#05050a] border border-indigo-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-indigo-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
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
            {isProcessingGoal ? 'Orchestrating...' : 'Orchestrate'}
          </SovereignButton>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r border-quantum-cyan/10 p-2 space-y-1">
            {(['monitor', 'processes', 'filesystem', 'services', 'users', 'kernel', 'terminal'] as ViewMode[]).map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  activeView === view 
                    ? "bg-quantum-cyan/20 text-quantum-cyan border border-quantum-cyan/30" 
                    : "text-quantum-gray hover:bg-quantum-cyan/10 hover:text-quantum-cyan"
                )}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {activeView === 'monitor' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-quantum-deep/50 rounded-xl p-4 border border-quantum-cyan/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="w-4 h-4 text-quantum-cyan" />
                    <span className="text-xs text-quantum-gray uppercase">CPU</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{currentStats.cpuUsage.toFixed(1)}%</div>
                  <div className="mt-2 h-1.5 bg-quantum-cyan/20 rounded-full overflow-hidden">
                    <div className="h-full bg-quantum-cyan transition-all" style={{ width: `${currentStats.cpuUsage}%` }} />
                  </div>
                </div>
                <div className="bg-quantum-deep/50 rounded-xl p-4 border border-quantum-cyan/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Memory className="w-4 h-4 text-quantum-purple" />
                    <span className="text-xs text-quantum-gray uppercase">Memory</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{memoryPercent.toFixed(1)}%</div>
                  <div className="mt-2 h-1.5 bg-quantum-purple/20 rounded-full overflow-hidden">
                    <div className="h-full bg-quantum-purple transition-all" style={{ width: `${memoryPercent}%` }} />
                  </div>
                </div>
                <div className="bg-quantum-deep/50 rounded-xl p-4 border border-quantum-cyan/10">
                  <div className="flex items-center gap-2 mb-3">
                    <HardDrive className="w-4 h-4 text-quantum-green" />
                    <span className="text-xs text-quantum-gray uppercase">Disk</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{diskPercent.toFixed(1)}%</div>
                  <div className="mt-2 h-1.5 bg-quantum-green/20 rounded-full overflow-hidden">
                    <div className="h-full bg-quantum-green transition-all" style={{ width: `${diskPercent}%` }} />
                  </div>
                </div>
                <div className="bg-quantum-deep/50 rounded-xl p-4 border border-quantum-cyan/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="w-4 h-4 text-quantum-orange" />
                    <span className="text-xs text-quantum-gray uppercase">Temp</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{currentStats.temperature}°C</div>
                </div>
              </div>
            )}

            {activeView === 'processes' && (
              <div className="space-y-2">
                <div className="flex items-center gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search processes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-quantum-deep border border-quantum-cyan/20 rounded-lg px-3 py-2 text-xs text-white placeholder:text-quantum-gray"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-quantum-deep border border-quantum-cyan/20 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="cpu">Sort by CPU</option>
                    <option value="memory">Sort by Memory</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
                <div className="space-y-1">
                  {filteredProcesses.map(proc => (
                    <div key={proc.pid} className="flex items-center justify-between p-3 bg-quantum-deep/30 rounded-lg border border-quantum-cyan/10">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-quantum-gray font-mono w-12">{proc.pid}</span>
                        <span className="text-xs text-white">{proc.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs ${getStatusColor(proc.status)}`}>{proc.status}</span>
                        <span className="text-xs text-quantum-gray">{proc.cpu.toFixed(1)}%</span>
                        <span className="text-xs text-quantum-gray">{proc.memory.toFixed(1)}%</span>
                        <button onClick={() => handleKillProcess(proc.pid)} className="text-quantum-red hover:text-quantum-red/80">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'filesystem' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-quantum-gray mb-4">
                  <Folder className="w-4 h-4" />
                  <span>/</span>
                  {selectedPath.map((p, i) => (
                    <React.Fragment key={i}>
                      <span>/</span>
                      <span>{p}</span>
                    </React.Fragment>
                  ))}
                </div>
                <div className="space-y-1">
                  {currentDirNode?.children?.map((node, i) => (
                    <button
                      key={i}
                      onClick={() => node.type === 'directory' && handleNavigateTo(node.name)}
                      className="w-full flex items-center gap-3 p-3 bg-quantum-deep/30 rounded-lg border border-quantum-cyan/10 hover:border-quantum-cyan/30 text-left"
                    >
                      {node.type === 'directory' ? <Folder className="w-4 h-4 text-quantum-cyan" /> : <File className="w-4 h-4 text-quantum-gray" />}
                      <span className="text-xs text-white">{node.name}</span>
                      <span className="text-xs text-quantum-gray ml-auto">{node.permission}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'services' && (
              <div className="space-y-2">
                {services.map(service => (
                  <div key={service.name} className="flex items-center justify-between p-3 bg-quantum-deep/30 rounded-lg border border-quantum-cyan/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${service.status === 'active' ? 'bg-quantum-green' : service.status === 'failed' ? 'bg-quantum-red' : 'bg-quantum-gray'}`} />
                      <div>
                        <div className="text-xs text-white">{service.name}</div>
                        <div className="text-[10px] text-quantum-gray">{service.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-quantum-gray">{service.cpu.toFixed(1)}% CPU</span>
                      <span className="text-[10px] text-quantum-gray">{service.memory.toFixed(1)}% MEM</span>
                      <button onClick={() => handleToggleService(service.name)} className="text-xs text-quantum-cyan hover:underline">
                        {service.status === 'active' ? 'Stop' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'terminal' && (
              <div className="h-full bg-black rounded-lg p-4 font-mono text-xs">
                <div className="space-y-1 mb-4">
                  {terminalHistory.map((line, i) => (
                    <div key={i} className={line.includes('$') ? 'text-quantum-green' : 'text-quantum-gray'}>
                      {line}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-quantum-green">user@angehlang:~$</span>
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTerminalCommand(terminalInput)}
                    className="flex-1 bg-transparent text-white outline-none"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-2 border-t border-quantum-cyan/10 flex items-center justify-between text-xs text-quantum-gray">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {currentStats.cpuUsage.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              <Memory className="w-3 h-3" />
              {memoryPercent.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1">
              <Process className="w-3 h-3" />
              {currentStats.processes} processes
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentStats.uptime}
            </span>
            <span className={cn("flex items-center gap-1", status === "running" ? "text-quantum-green" : "text-quantum-red")}>
              {status === "running" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const Memory = ({ className }: { className?: string }) => <HardDrive className={className} />;
const Process = ({ className }: { className?: string }) => <Layers className={className} />;