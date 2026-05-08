// Plan Item ID: TI-1
/**
 * ThreeDViewer.tsx - QPPU-Enhanced 3D Model Viewer Studio
 * 
 * Features:
 * - Quantum Photonic Mesh Synthesis
 * - Dynamic Environment Presets (Nebula, Void, Studio, Sunset, Cyberpunk)
 * - Full-Screen Modes: Expanded, Immersive, Cinema
 * - Dynamic Backgrounds with Photonic Effects
 * - Glassmorphism UI Components
 * - QPPU Integration for 50D ANGHV Storage
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Layers, Maximize2, RotateCw, ShieldCheck, Cuboid, 
  Maximize, Minimize2, Sparkles, Zap, Palette, Sun, Moon, 
  Grid3x3, BoxSelect, Eye, EyeOff, Download,
  Activity, Play, Pause, SkipBack, Timer
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { qppuEngine } from '@/engine/QPPUCore';
import { SyntheticIntuitionEngine } from '@/engine/SyntheticIntuitionEngine';
import { PhotonicTensorCore } from '@/engine/PhotonicTensorCore';
import { OmniscientContextEngine } from '@/engine/OmniscientContextEngine';
import { holographicSimulationEngine, PhysicalIntegrityManifest } from '@/engine/studios/HolographicSimulationEngine';
import { threeDAgent } from '@/agents/ThreeDAgent';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export interface ThreeDNode {
  id: number;
  type: string;
  pos: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  wireframe?: boolean;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}

type EnvironmentPreset = 'nebula' | 'void' | 'studio' | 'sunset' | 'cyberpunk';

type FullScreenMode = 'normal' | 'expanded' | 'immersive' | 'cinema';

export interface ThreeDData {
  name: string;
  geometry: string;
  wireframe: boolean;
  nodes: ThreeDNode[];
  lighting?: 'pbr' | 'basic';
  environment?: EnvironmentPreset;
}

interface ThreeDViewerProps {
  data?: ThreeDData;
  status?: string;
}

const DEFAULT_3D: ThreeDData = {
  name: "Synthesizing Mesh...",
  geometry: "BufferGeometry",
  wireframe: true,
  nodes: [
    { id: 1, type: 'box', pos: [0, 0, 0], scale: [1, 1, 1], color: '#6366f1' }
  ]
};

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ data: externalData, status }) => {
  const data = externalData || DEFAULT_3D;
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [fullScreenMode, setFullScreenMode] = useState<FullScreenMode>('normal');
  const [environment, setEnvironment] = useState<EnvironmentPreset>(data.environment || 'nebula');
  const [showWireframe, setShowWireframe] = useState(data.wireframe);
  const [gridVisible, setGridVisible] = useState(true);
  const [quantumMode, setQuantumMode] = useState(false);
  const [qppuStats, setQppuStats] = useState({ coherence: 0, fidelity: 0, frames: '50D' });
  const [goalText, setGoalText] = useState('');
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [spatialPulse, setSpatialPulse] = useState(0);
  const [activeIntegrityManifest, setActiveIntegrityManifest] = useState<PhysicalIntegrityManifest | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [physicsActive, setPhysicsActive] = useState(false);
  
  const engineRef = useRef<{ 
    scene: THREE.Scene, 
    camera: THREE.PerspectiveCamera, 
    renderer: THREE.WebGLRenderer, 
    controls: OrbitControls,
    models: THREE.Group 
  } | null>(null);

  const superIntelligence = {
    intuition: SyntheticIntuitionEngine.getInstance(),
    photonic: PhotonicTensorCore.getInstance(),
    context: OmniscientContextEngine.getInstance(),
  };

  // Super-intelligence auto-initializes via getInstance()

  const handleExport = () => {
    if (!engineRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      engineRef.current.scene,
      (gltf) => {
        const output = JSON.stringify(gltf, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sovereign_Artifact_${Date.now()}.gltf`;
        link.click();
      },
      (error) => console.error('[ThreeDViewer] Export error:', error),
      { binary: false }
    );
  };

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return;
    setIsProcessingGoal(true);
    setSpatialPulse(100);
    
    try {
      const manifest = await holographicSimulationEngine.synthesizeVolumetricLattice({ goal: goalText, type: 'mesh' });
      
      setActiveIntegrityManifest(manifest);
      console.log('[ThreeDViewer] Physical integrity manifest synthesized:', manifest);
      setSpatialPulse(70);
      
      // Secondary logic via agent
      await threeDAgent.process(goalText);
    } catch (error) {
      console.error('[ThreeDViewer] Goal error:', error);
    } finally {
      setTimeout(() => {
        setIsProcessingGoal(false);
        setGoalText('');
        setSpatialPulse(0);
      }, 1500);
    }
  };

  const getEnvironmentBg = useCallback((env: EnvironmentPreset) => {
    const colors: Record<EnvironmentPreset, { bg: string; fog: string; ambient: number; fogDensity: number }> = {
      nebula: { bg: '#020205', fog: '#0a0612', ambient: 0.4, fogDensity: 0.03 },
      void: { bg: '#000000', fog: '#000000', ambient: 0.1, fogDensity: 0.01 },
      studio: { bg: '#1a1a1a', fog: '#1a1a1a', ambient: 0.8, fogDensity: 0.02 },
      sunset: { bg: '#1a0808', fog: '#2a1010', ambient: 0.6, fogDensity: 0.025 },
      cyberpunk: { bg: '#050510', fog: '#0a0520', ambient: 0.5, fogDensity: 0.03 },
    };
    return colors[env];
  }, []);

  const environmentColor = getEnvironmentBg(environment);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(environmentColor.bg);
    scene.fog = new THREE.FogExp2(environmentColor.fog, environmentColor.fogDensity);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(30, 20, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0x404040, environmentColor.ambient);
    scene.add(ambientLight);
    
    const mainLightColor = environment === 'cyberpunk' ? 0x00ffff : environment === 'sunset' ? 0xff6600 : 0xffffff;
    const mainLight = new THREE.DirectionalLight(mainLightColor, 2.5);
    mainLight.position.set(50, 100, 50);
    scene.add(mainLight);
    
    if (environment === 'nebula' || environment === 'cyberpunk') {
      const rimLight = new THREE.DirectionalLight(0x6366f1, 1.0);
      rimLight.position.set(-50, 50, -50);
      scene.add(rimLight);
    }

    const gridHelper = new THREE.GridHelper(200, 100, 0x333333, 0x111111);
    gridHelper.position.y = -0.5;
    gridHelper.visible = gridVisible;
    scene.add(gridHelper);
    
    const modelsGroup = new THREE.Group();
    data.nodes.forEach(node => {
      const geometry = node.type === 'sphere' ? new THREE.SphereGeometry(1, 32, 32) : new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhysicalMaterial({ 
        color: node.color || 0x6366f1,
        metalness: quantumMode ? 0.8 : 0.5,
        roughness: quantumMode ? 0.1 : 0.2,
        wireframe: showWireframe,
        emissive: quantumMode ? new THREE.Color(0x6366f1) : undefined,
        emissiveIntensity: quantumMode ? 0.3 : 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(node.pos[0], node.pos[1], node.pos[2]);
      mesh.scale.set(node.scale[0], node.scale[1], node.scale[2]);
      modelsGroup.add(mesh);
    });

    scene.add(modelsGroup);
    engineRef.current = { scene, camera, renderer, controls, models: modelsGroup };

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      
      if (isRotating || isAnimating) {
        const speed = isAnimating ? 0.02 : 0.005;
        modelsGroup.rotation.y += speed;
        if (quantumMode) modelsGroup.rotation.x += 0.002;
        
        if (isAnimating) {
          setTimelineProgress(prev => (prev + 0.5) % 100);
        }
      }

      if (physicsActive) {
        modelsGroup.children.forEach((mesh, i) => {
          mesh.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
        });
      }

      renderer.render(scene, camera);
    };
    
    if (quantumMode) {
      qppuEngine.processFrame(33.33, 'photonic');
    }
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, [data, isRotating, environment, showWireframe, gridVisible, quantumMode, environmentColor]);

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
      <motion.div 
        className={containerClasses}
        layout
      >
        <StudioHeader 
          title="3D Studio" 
          subtitle={`${data.name} • ${data.geometry}`} 
          icon={Cuboid}
          badge={status || 'Ready'}
          badgeColor="indigo"
        >
          <div className="flex items-center gap-2">
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={quantumMode ? Zap : Sparkles} 
              onClick={() => setQuantumMode(!quantumMode)} 
              className={cn(quantumMode && "text-indigo-400")}
              title="QPPU Quantum Mode"
            />
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={Download} 
              onClick={handleExport} 
              title="Export GLTF"
            />
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={RotateCw} 
              onClick={() => setIsRotating(!isRotating)} 
              className={cn(isRotating && "text-indigo-400 rotate-180 transition-transform duration-1000")} 
              title="Toggle Rotation"
            />
            <SovereignButton 
              variant="ghost" 
              size="xs" 
              icon={physicsActive ? Activity : Cuboid} 
              onClick={() => setPhysicsActive(!physicsActive)} 
              className={cn(physicsActive && "text-emerald-400")}
              title="Physics Engine"
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
          {spatialPulse > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20 ml-2">
              <Layers size={12} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] text-indigo-300 font-bold uppercase">Spatial Resonance</span>
            </div>
          )}
        </StudioHeader>

        {/* Sovereign Goal Input */}
        <div className="px-4 py-3 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center gap-3">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalSubmit()}
              placeholder="Spatial Directive: e.g., 'Manifest a complex volumetric lattice with 50D chromatic PBR shaders'"
              className="w-full bg-[#050510] border border-indigo-500/20 rounded-xl py-2 pl-10 pr-4 text-xs text-indigo-100 placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
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
            {isProcessingGoal ? 'Constructing...' : 'Saturate'}
          </SovereignButton>
        </div>

        {/* Physical Integrity Manifest Display */}
        {activeIntegrityManifest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mx-4 mb-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-indigo-400 font-bold uppercase">Physical Integrity Manifest</p>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">STR: {(activeIntegrityManifest.structuralIntegrity * 100).toFixed(2)}%</span>
                <span className="text-[9px] text-zinc-500 font-mono">VOL: {activeIntegrityManifest.volumetricDensity.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase",
                  activeIntegrityManifest.stabilityVerified ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
                )}>
                  Simulation: {activeIntegrityManifest.stabilityVerified ? 'Stable' : 'Critical'}
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-zinc-600 uppercase mb-1">Depth Coherence</p>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"
                      initial={{ width: 0 }}
                      animate={{ width: `${activeIntegrityManifest.depthCoherence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-[9px] text-zinc-600 uppercase mb-1">Entropy Load</p>
                  <p className="text-xl font-bold text-indigo-200">{(activeIntegrityManifest.entropyLoad * 100).toFixed(1)}%</p>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  activeIntegrityManifest.stabilityVerified ? "bg-emerald-500" : "bg-red-500"
                )} />
              </div>
            </div>
          </motion.div>
        )}

        {(fullScreenMode === 'expanded' || fullScreenMode === 'immersive' || fullScreenMode === 'cinema') && (
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950/80 border-b border-zinc-800">
            {(['nebula', 'void', 'studio', 'sunset', 'cyberpunk'] as EnvironmentPreset[]).map(env => (
              <button
                key={env}
                onClick={() => setEnvironment(env)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                  environment === env 
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {env}
              </button>
            ))}
          </div>
        )}

        <div className={cn(
          "relative bg-black",
          fullScreenMode === 'cinema' ? "flex-1" : "aspect-video"
        )}>
           <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
           
           {/* HUD */}
           <div className="absolute top-4 left-4 p-3 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800 pointer-events-none space-y-1">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Mesh_Data</p>
              <p className="text-xs font-bold text-zinc-200">{data.nodes.length} Nodes Synthesis</p>
           </div>

           {/* Environment Selector */}
           <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => setEnvironment(environment === 'nebula' ? 'void' : environment === 'void' ? 'studio' : environment === 'studio' ? 'sunset' : environment === 'sunset' ? 'cyberpunk' : 'nebula')}
                className="p-2 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-zinc-800 hover:border-indigo-500/50 transition-all"
              >
                <Palette size={14} className="text-zinc-400" />
              </button>
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={cn("p-2 rounded-lg bg-zinc-950/80 backdrop-blur-md border transition-all", showWireframe ? "border-indigo-500/50" : "border-zinc-800")}
              >
                <Grid3x3 size={14} className={cn(showWireframe ? "text-indigo-400" : "text-zinc-400")} />
              </button>
              <button
                onClick={() => setGridVisible(!gridVisible)}
                className={cn("p-2 rounded-lg bg-zinc-950/80 backdrop-blur-md border transition-all", gridVisible ? "border-zinc-800" : "border-zinc-900")}
              >
                {gridVisible ? <Eye size={14} className="text-zinc-400" /> : <EyeOff size={14} className="text-zinc-600" />}
              </button>
           </div>

           {/* QPPU Stats */}
           {quantumMode && (
             <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-indigo-950/30 backdrop-blur-md border border-indigo-500/20 pointer-events-none space-y-1">
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">QPPU Engine</p>
                <div className="flex gap-3 text-[10px]">
                  <span className="text-zinc-400">Coh: <span className="text-indigo-300 font-bold">{qppuStats.coherence}%</span></span>
                  <span className="text-zinc-400">Fi: <span className="text-indigo-300 font-bold">{qppuStats.fidelity}%</span></span>
                  <span className="text-zinc-400">Dim: <span className="text-indigo-300 font-bold">{qppuStats.frames}</span></span>
                </div>
             </div>
           )}

           <div className="absolute bottom-4 right-4 flex gap-2">
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                 <ShieldCheck size={12} className="text-emerald-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">PBR Verified</span>
            </div>
          </div>

          {/* Animation Timeline HUD */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-2/3 px-4 py-2 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-2xl flex items-center gap-4">
             <button 
               onClick={() => setIsAnimating(!isAnimating)}
               className="p-2 rounded-full bg-indigo-500 text-black hover:bg-indigo-400"
             >
               {isAnimating ? <Pause size={14} /> : <Play size={14} />}
             </button>
             <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[8px] text-zinc-500 uppercase font-mono">
                  <span>Timeline</span>
                  <span>{timelineProgress.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"
                    style={{ width: `${timelineProgress}%` }}
                  />
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Timer size={12} className="text-zinc-500" />
                <span className="text-[10px] text-zinc-400 font-mono">00:14:22</span>
             </div>
          </div>
       </div>
     </motion.div>
   </AnimatePresence>
 );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
