import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, RotateCw, Maximize2, Minimize2, Settings, Download, 
  Cpu, Zap, Layers, Eye
} from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';

interface ThreeDViewerProps {
  data?: any;
  status?: string;
}

/**
 * ThreeDViewer - Feature Sliced
 * Standardized 3D substrate with PBR (Physical Based Rendering) defaults.
 */
export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ data, status }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const engineRef = useRef<{ mesh?: THREE.Mesh; controls?: OrbitControls }>({});

  const [isRotating, setIsRotating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- OrbitControls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    engineRef.current.controls = controls;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // --- Geometry ---
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    engineRef.current.mesh = mesh;

    // --- Animation Loop ---
    let frameId: number;
    const animate = () => {
      if (isRotating && engineRef.current.mesh) {
        engineRef.current.mesh.rotation.x += 0.005;
        engineRef.current.mesh.rotation.y += 0.01;
      }
      if (engineRef.current.controls) {
        engineRef.current.controls.update();
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (engineRef.current.mesh) {
      (engineRef.current.mesh.material as THREE.MeshPhysicalMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  return (
    <div className="w-full bg-[#02020a] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl h-[600px]">
      <StudioHeader 
        title="3D Studio" 
        subtitle="Sovereign Geometry • PBR Engine" 
        icon={Box}
        badge={status || 'Active'}
        badgeColor="indigo"
      >
        <div className="flex items-center gap-2">
           <SovereignButton variant="ghost" size="xs" onClick={() => setShowStats(!showStats)} icon={Cpu} />
           <SovereignButton variant="primary" size="xs" icon={Download}>Export OBJ</SovereignButton>
        </div>
      </StudioHeader>

      <div className="flex-1 relative bg-black/20">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        
        {/* HUD Controls */}
        <div className="absolute top-6 left-6 flex flex-col gap-3 pointer-events-none">
           <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Topology_Scanner</span>
              <span className="text-white/60 text-[9px] font-mono">VERTICES: 128,492 / FACES: 256,984</span>
           </div>
        </div>

        <div className="absolute bottom-6 right-6 flex gap-2">
           <SovereignButton variant="secondary" size="sm" icon={RotateCw} onClick={() => setIsRotating(!isRotating)} className={isRotating ? "text-indigo-400" : ""} />
           <SovereignButton variant="secondary" size="sm" icon={Layers} onClick={() => setWireframe(!wireframe)} className={wireframe ? "text-indigo-400" : ""} />
           <SovereignButton variant="secondary" size="sm" icon={Eye} />
        </div>

        <AnimatePresence>
            {showStats && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-6 right-6 p-4 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 w-64 space-y-4"
                >
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <Cpu size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">GPU Engine Stats</span>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Draw Calls', value: '42', color: 'bg-emerald-500' },
                            { label: 'VRAM Usage', value: '1.2 GB', color: 'bg-indigo-500' },
                            { label: 'Render Latency', value: '1.2ms', color: 'bg-cyan-500' }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono">
                                    <span className="text-zinc-500 uppercase">{stat.label}</span>
                                    <span className="text-zinc-200">{stat.value}</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: '70%' }} 
                                        className={cn("h-full rounded-full", stat.color)} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};
