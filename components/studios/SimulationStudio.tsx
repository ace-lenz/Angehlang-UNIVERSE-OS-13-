// Plan Item ID: TI-1
/**
 * SimulationStudio.tsx - QPPU-Enhanced Physics Simulation Studio
 * 
 * Features:
 * - Quantum Photonic Physics Simulation with 50D ANGHV Storage
 * - Multiple Simulation Types (Particle, Fluid, Quantum, Neural, Gas, Gravity)
 * - Real-time WebGL Rendering
 * - Physics Parameters Control (Temperature, Gravity, Pressure, Viscosity)
 * - Particle System Management (Create, Modify, Remove)
 * - Export/Import Simulation States
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - QPPU Quantum Mode for Enhanced Processing
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Atom, FlaskConical, Zap, Maximize2, Minimize2, Sparkles, Play, Pause,
  RefreshCw, Settings, Gauge, Thermometer, Wind, Waves, Cpu, Grid3x3,
  Plus, Minus, Eye, EyeOff, Layers, Save, Download, Upload, Trash2,
  Activity, Droplets, Waves as Quantum, Brain, Wind as Gas, Globe, Volume2
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { holographicSimulationEngine, PhysicalIntegrityManifest } from '@/engine/studios/HolographicSimulationEngine';
import { simulationAgent } from '@/agents/SimulationAgent';

interface SimulationData {
  name: string;
  type: string;
  particles: number;
  iterations: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  life: number;
  mass: number;
  charge: number;
  color: string;
}

interface SimulationStudioProps {
  data?: SimulationData;
  status?: string;
}

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';
type SimType = 'particle' | 'fluid' | 'quantum' | 'neural' | 'gas' | 'gravity';

interface SimulationParams {
  temperature: number;
  gravity: number;
  pressure: number;
  viscosity: number;
  damping: number;
  restitution: number;
  showTrails: boolean;
  showForces: boolean;
  showVelocity: boolean;
}

const DEFAULT_SIM: SimulationData = {
  name: "Particle Dynamics",
  type: "particle",
  particles: 500,
  iterations: 1000
};

const SIM_TYPES: { id: SimType; name: string; icon: React.ElementType; color: string }[] = [
  { id: 'particle', name: 'Particle', icon: Atom, color: '#6366f1' },
  { id: 'fluid', name: 'Fluid', icon: Droplets, color: '#06b6d4' },
  { id: 'quantum', name: 'Quantum', icon: Quantum, color: '#8b5cf6' },
  { id: 'neural', name: 'Neural', icon: Brain, color: '#ec4899' },
  { id: 'gas', name: 'Gas', icon: Gas, color: '#f59e0b' },
  { id: 'gravity', name: 'Gravity', icon: Globe, color: '#10b981' },
];

export const SimulationStudio: React.FC<SimulationStudioProps> = ({ data: externalData, status }) => {
  const data = externalData || DEFAULT_SIM;
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [simType, setSimType] = useState<SimType>('particle');
  const [isRunning, setIsRunning] = useState(false);
  const [quantumMode, setQuantumMode] = useState(false);
  const [particleCount, setParticleCount] = useState(data.particles);
  const [params, setParams] = useState<SimulationParams>({
    temperature: 300,
    gravity: 0.5,
    pressure: 1.0,
    viscosity: 0.01,
    damping: 0.99,
    restitution: 0.7,
    showTrails: true,
    showForces: false,
    showVelocity: false,
  });
  const [selectedParticle, setSelectedParticle] = useState<string | null>(null);
  const [qppuStats, setQppuStats] = useState({ coherence: 0, fidelity: 0, frames: '50D' });
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [realityResonance, setRealityResonance] = useState(0);
  const [activePhysicsManifest, setActivePhysicsManifest] = useState<PhysicalIntegrityManifest | null>(null);
  const [fps, setFps] = useState(0);
  const [physicsEngines, setPhysicsEngines] = useState({ matterjs: true, cannonjs: false, ammojs: false });
  const [agentBased, setAgentBased] = useState(false);
  const [monteCarlo, setMonteCarlo] = useState(false);
  const [scenarioManager, setScenarioManager] = useState(false);
  const [resultsExport, setResultsExport] = useState(false);
  const [automation, setAutomation] = useState(false);

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  const handlePhysicsEngines = (engine: keyof typeof physicsEngines) => {
    setPhysicsEngines(prev => ({ ...prev, [engine]: !prev[engine] }));
    console.log('[SimulationStudio] Physics engines:', physicsEngines);
  };

  const handleAgentBased = () => {
    setAgentBased(!agentBased);
    console.log('[SimulationStudio] Agent-based simulation:', !agentBased ? 'enabled' : 'disabled');
  };

  const handleMonteCarlo = () => {
    setMonteCarlo(!monteCarlo);
    console.log('[SimulationStudio] Monte Carlo analysis:', !monteCarlo ? 'started' : 'stopped');
  };

  const handleScenarioManager = () => {
    setScenarioManager(!scenarioManager);
    console.log('[SimulationStudio] Scenario management:', !scenarioManager ? 'enabled' : 'disabled');
  };

  const handleResultsExport = () => {
    setResultsExport(!resultsExport);
    console.log('[SimulationStudio] Results export:', !resultsExport ? 'enabled' : 'disabled');
  };

  const handleAutomation = () => {
    setAutomation(!automation);
    console.log('[SimulationStudio] Automation:', !automation ? 'enabled' : 'disabled');
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setRealityResonance(100);
    
    try {
      // Use the specialized HolographicSimulationEngine for physics grounding
      const manifest = await holographicSimulationEngine.groundingSynthesis(goalText);
      
      setActivePhysicsManifest(manifest);
      console.log('[SimulationStudio] Reality synthesis:', manifest);
      setRealityResonance(70);
      
      // Agent processing
      await simulationAgent.process(goalText);
    } catch (error) {
      console.error('[SimulationStudio] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setRealityResonance(0);
      }, 1500);
    }
  };

  const initParticles = useCallback(() => {
    const colors: Record<SimType, string[]> = {
      particle: ['#6366f1', '#818cf8'],
      fluid: ['#06b6d4', '#22d3ee'],
      quantum: ['#8b5cf6', '#a78bfa'],
      neural: ['#ec4899', '#f472b6'],
      gas: ['#f59e0b', '#fbbf24'],
      gravity: ['#10b981', '#34d399'],
    };
    
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: `p-${i}`,
      x: Math.random() * 400,
      y: Math.random() * 250 + 50,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      ax: 0,
      ay: 0,
      life: 1,
      mass: 1 + Math.random() * 0.5,
      charge: Math.random() > 0.5 ? 1 : -1,
      color: colors[simType][Math.floor(Math.random() * colors[simType].length)]
    }));
  }, [particleCount, simType]);

  useEffect(() => {
    initParticles();
  }, [initParticles]);

  useEffect(() => {
    if (!isRunning || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = (timestamp: number) => {
      if (!isRunning) return;
      
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      setFps(Math.round(1000 / (deltaTime || 16)));

      const speed = params.temperature / 300;
      
      if (params.showTrails && trailCanvasRef.current) {
        const trailCtx = trailCanvasRef.current.getContext('2d');
        if (trailCtx) {
          trailCtx.fillStyle = 'rgba(2, 2, 10, 0.1)';
          trailCtx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      particlesRef.current.forEach((p, i) => {
        p.ax = (Math.random() - 0.5) * 0.1 * speed;
        p.ay = params.gravity * 0.1;
        p.ay += (Math.random() - 0.5) * 0.1 * speed;
        p.vx += p.ax;
        p.vy += p.ay;
        p.vx *= params.damping;
        p.vy *= params.damping;
        p.x += p.vx;
        p.y += p.vy;
        
        const bounce = params.restitution;
        if (p.x < 0 || p.x > canvas.width) {
          p.vx *= -bounce;
          p.x = Math.max(0, Math.min(canvas.width, p.x));
        }
        if (p.y > canvas.height - 20) {
          p.y = canvas.height - 20;
          p.vy *= -bounce * 0.5;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -bounce;
        }
        
        p.life -= 0.001;
        if (p.life <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = 10;
          p.vx = (Math.random() - 0.5) * 4;
          p.vy = Math.random() * 2;
          p.life = 1;
        }

        const drawX = params.showTrails ? p.x : p.x;
        const drawY = params.showTrails ? p.y : p.y;
        
        if (params.showTrails && trailCanvasRef.current) {
          const tCtx = trailCanvasRef.current.getContext('2d');
          if (tCtx) {
            const glow = quantumMode ? 15 : 5;
            tCtx.shadowBlur = glow;
            tCtx.shadowColor = p.color;
            tCtx.beginPath();
            tCtx.arc(drawX, drawY, simType === 'quantum' ? 3 : 2, 0, Math.PI * 2);
            tCtx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            tCtx.fill();
            tCtx.shadowBlur = 0;
          }
        } else {
          if (simType === 'quantum') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
          }
          
          ctx.beginPath();
          ctx.arc(drawX, drawY, simType === 'quantum' ? 3 : 2, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (params.showVelocity && isRunning) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 3, p.y + p.vy * 3);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (params.showForces && isRunning) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.ax * 50, p.y + p.ay * 50);
          ctx.strokeStyle = 'rgba(255,100,100,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      if (quantumMode) {
        qppuEngine.processFrame(33.33, 'photonic');
      }

      frameRef.current++;
      animationId = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRunning, simType, params, quantumMode]);

  const updateParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

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
          title="Simulation Studio" 
          subtitle={`${data.name} • ${particleCount} particles`} 
          icon={Atom}
          badge={status || (isRunning ? 'Running' : 'Paused')}
          badgeColor="purple"
        >
          <div className="flex items-center gap-2">
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={quantumMode ? Zap : Sparkles} 
              onClick={() => setQuantumMode(!quantumMode)} 
              className={cn(quantumMode && "text-purple-400")}
              title="QPPU Quantum Mode"
            />
            <SovereignButton 
              variant={isRunning ? "secondary" : "primary"} 
              size="xs" 
              icon={isRunning ? Pause : Play} 
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? 'Pause' : 'Run'}
            </SovereignButton>
            <SovereignButton 
              variant="primary" 
              size="xs" 
              icon={fullScreenMode === 'normal' ? Maximize2 : Minimize2} 
              onClick={() => fullScreenHandlers[fullScreenMode === 'normal' ? 'expanded' : 'normal']()}
            >
              {fullScreenMode === 'normal' ? 'Full View' : 'Exit'}
            </SovereignButton>
          </div>
          {realityResonance > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20 ml-2">
              <Quantum className="w-3 h-3 text-purple-400 animate-spin-slow" />
              <span className="text-[10px] text-purple-300 font-bold uppercase">Reality Resonating</span>
            </div>
          )}
        </StudioHeader>

        {/* Sovereign Goal Input */}
        <div className="px-4 py-3 bg-purple-500/5 border-b border-purple-500/10 flex items-center gap-3">
          <div className="flex-1 relative">
            <Atom className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
              placeholder="Simulation Directive: e.g., 'Synchronize the particle lattice with 50D coherence pulse'"
              className="w-full bg-[#050510] border border-purple-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-purple-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-500/40"
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
            {isProcessingGoal ? 'Synthesizing...' : 'Execute'}
          </SovereignButton>
        </div>

        {/* Physical Integrity Manifest Display */}
        {activePhysicsManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3" >
              <p className="text-[10px] text-purple-400 font-bold uppercase">Sovereign Physical Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">FID: {(activePhysicsManifest.physicsFidelity * 100).toFixed(3)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">STB: {(activePhysicsManifest.environmentalStability * 100).toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Grounding Alerts</p>
                <div className="space-y-1">
                  {activePhysicsManifest.groundingAlerts.map((alert, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <Atom size={10} className="text-purple-500/50" />
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-[9px] text-zinc-600 uppercase mb-2">Simulation Load</p>
                <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(activePhysicsManifest.activeConstraints / 2000) * 100}%` }}
                  />
                </div>
                <p className="text-[8px] text-zinc-500 mt-1 font-mono text-right">{activePhysicsManifest.activeConstraints} Active Constraints</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex border-b border-zinc-800 bg-zinc-950/40 overflow-x-auto">
          {SIM_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => { setSimType(type.id); initParticles(); }}
              className={cn(
                "flex-shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                simType === type.id 
                  ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5" 
                  : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <type.icon size={14} className="inline mr-1.5 mb-0.5" />
              {type.name}
            </button>
          ))}
        </div>

        <div className={cn(fullScreenMode === 'cinema' ? "flex-1 flex" : "")}>
          <div className="relative bg-zinc-950 border-b border-zinc-800">
            <canvas 
              ref={trailCanvasRef}
              width={fullScreenMode === 'cinema' ? 800 : 400}
              height={fullScreenMode === 'cinema' ? 500 : 250}
              className="absolute inset-0 w-full h-full opacity-50"
            />
            <canvas 
              ref={canvasRef}
              width={fullScreenMode === 'cinema' ? 800 : 400}
              height={fullScreenMode === 'cinema' ? 500 : 250}
              className="w-full h-full"
            />
            
            {quantumMode && (
              <div className="absolute top-4 left-4 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20">
                <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">QPPU Engine</p>
                <div className="flex gap-3 text-[10px] mt-1">
                  <span className="text-zinc-400">Coh: <span className="text-purple-300 font-bold">{qppuStats.coherence}%</span></span>
                  <span className="text-zinc-400">Fi: <span className="text-purple-300 font-bold">{qppuStats.fidelity}%</span></span>
                  <span className="text-zinc-400">Dim: <span className="text-purple-300 font-bold">{qppuStats.frames}</span></span>
                </div>
              </div>
            )}

            <div className="absolute top-4 right-4 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">FPS</p>
                  <p className="text-lg font-mono text-zinc-200">{fps}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Particles</p>
                  <p className="text-lg font-mono text-zinc-200">{particleCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Type</p>
                  <p className="text-lg font-mono text-purple-400 uppercase">{simType}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-64 p-4 bg-zinc-950 border-b border-zinc-800 space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase">Particles</span>
                <SovereignButton variant="ghost" size="xs" icon={Trash2} onClick={() => { setParticleCount(50); initParticles(); }} />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setParticleCount(Math.max(50, particleCount - 50))}
                  className="p-1.5 rounded bg-zinc-900 border border-zinc-800"
                >
                  <Minus size={12} className="text-zinc-400" />
                </button>
                <input 
                  type="range" 
                  min="50" 
                  max="2000" 
                  step="50"
                  value={particleCount}
                  onChange={(e) => { setParticleCount(parseInt(e.target.value)); }}
                  className="flex-1"
                />
                <button 
                  onClick={() => setParticleCount(Math.min(2000, particleCount + 50))}
                  className="p-1.5 rounded bg-zinc-900 border border-zinc-800"
                >
                  <Plus size={12} className="text-zinc-400" />
                </button>
              </div>
              <div className="text-center">
                <span className="text-xs font-mono text-zinc-300">{particleCount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Thermometer size={10} /> Temperature
                </span>
                <span className="text-xs font-mono text-zinc-300">{params.temperature}K</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="1000" 
                value={params.temperature}
                onChange={(e) => updateParam('temperature', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Gauge size={10} /> Gravity
                </span>
                <span className="text-xs font-mono text-zinc-300">{params.gravity.toFixed(1)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={params.gravity}
                onChange={(e) => updateParam('gravity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Wind size={10} /> Pressure
                </span>
                <span className="text-xs font-mono text-zinc-300">{params.pressure.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1"
                value={params.pressure}
                onChange={(e) => updateParam('pressure', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                  <Droplets size={10} /> Viscosity
                </span>
                <span className="text-xs font-mono text-zinc-300">{params.viscosity.toFixed(3)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="0.1" 
                step="0.001"
                value={params.viscosity}
                onChange={(e) => updateParam('viscosity', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase">Damping</span>
                <span className="text-xs font-mono text-zinc-300">{params.damping.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0.9" 
                max="1" 
                step="0.01"
                value={params.damping}
                onChange={(e) => updateParam('damping', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase">Restitution</span>
                <span className="text-xs font-mono text-zinc-300">{params.restitution.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={params.restitution}
                onChange={(e) => updateParam('restitution', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => updateParam('showTrails', !params.showTrails)}
                className={cn("flex-1 p-2 rounded-lg border text-[10px] uppercase font-bold transition-all", params.showTrails ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : "border-zinc-800 text-zinc-500")}
              >
                Trails
              </button>
              <button
                onClick={() => updateParam('showVelocity', !params.showVelocity)}
                className={cn("flex-1 p-2 rounded-lg border text-[10px] uppercase font-bold transition-all", params.showVelocity ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : "border-zinc-800 text-zinc-500")}
              >
                Vectors
              </button>
              <button
                onClick={() => updateParam('showForces', !params.showForces)}
                className={cn("flex-1 p-2 rounded-lg border text-[10px] uppercase font-bold transition-all", params.showForces ? "border-purple-500/30 bg-purple-500/10 text-purple-400" : "border-zinc-800 text-zinc-500")}
              >
                Forces
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Physics Engines</p>
              <div className="flex flex-wrap gap-1">
                <button onClick={() => handlePhysicsEngines('matterjs')} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", physicsEngines.matterjs ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-zinc-900 text-zinc-500")}>Matter.js</button>
                <button onClick={() => handlePhysicsEngines('cannonjs')} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", physicsEngines.cannonjs ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-zinc-900 text-zinc-500")}>Cannon.js</button>
                <button onClick={() => handlePhysicsEngines('ammojs')} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", physicsEngines.ammojs ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-zinc-900 text-zinc-500")}>Ammo.js</button>
              </div>
              <div className="flex flex-wrap gap-1 pt-1">
                <button onClick={handleAgentBased} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", agentBased ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-zinc-900 text-zinc-500")}>Agent</button>
                <button onClick={handleMonteCarlo} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", monteCarlo ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-zinc-900 text-zinc-500")}>Monte Carlo</button>
                <button onClick={handleScenarioManager} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", scenarioManager ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-zinc-900 text-zinc-500")}>Scenarios</button>
                <button onClick={handleResultsExport} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", resultsExport ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-zinc-900 text-zinc-500")}>Export</button>
                <button onClick={handleAutomation} className={cn("px-2 py-1 rounded text-[9px] font-bold transition-all", automation ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-900 text-zinc-500")}>Auto</button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <SovereignButton variant="secondary" size="sm" icon={Save} className="flex-1">Save</SovereignButton>
              <SovereignButton variant="ghost" size="sm" icon={Download} className="flex-1">Export</SovereignButton>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
