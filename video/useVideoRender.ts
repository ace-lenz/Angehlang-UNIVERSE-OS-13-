import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Scene, VideoData, DEFAULT_VIDEO_DATA } from './video-types';
import { upeEngine } from '@/engine/UnifiedProcessingEngine';
import { wavefrontExecutor } from '@/engine/WavefrontExecutor';
import { angvCompute } from '@/storage/AngvComputeEngine';
import { photoRAM } from '@/memory/PhotoRAM';

/**
 * Procedural Render Core
 * Separated from React component to minimize re-renders and enable potential Worker migration.
 */
const renderScene = async (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  progress: number,
  scene: Scene,
  isPlaying: boolean
) => {
  const vfx = scene.vfx.toLowerCase();
  
  // 1. Dispatch Photonic Render Trajectory (UQIS)
  const renderBundle = `(PH_PHOTON_RENDER "${vfx}" (PH_COHERENCE_GATE ${isPlaying} 1.0))`;
  const renderRes = await upeEngine.dispatch('graphics', renderBundle, 'photonic');
  
  // 2. Parallel Wavefront Propagation for Phase Interference
  const frameId = `FRAME_${Math.floor(t * 100)}`;
  await wavefrontExecutor.propagate({
     id: frameId,
     ast: ['PH_COHERENT_VFX', vfx],
     coherence: renderRes.coherence || 0.9998
  });

  // 3. Compute scene hue
  const hue = scene.color ?? Math.abs(Math.sin(scene.id * 1.7) * 360);

  // 4. PERSISTENCE: Cache Frame Summary in PhotoRAM (Holographic Buffer)
  photoRAM.storeHolographicFrame(frameId, [
    renderRes.coherence || 0.95,
    Math.sin(t),
    progress / 100,
    hue / 360
  ]);

  // 1. 4D Photonic Clear: Temporal-Spatial Interference
  const trailAlpha = isPlaying ? 0.08 : 0.05;
  const interference = Math.sin(t * 0.1) * 0.02;
  const coherenceScalar = renderRes.coherence || 0.99;
  
  ctx.fillStyle = `rgba(2, 2, 10, ${(trailAlpha + interference) * coherenceScalar})`;
  ctx.fillRect(0, 0, w, h);

  // 2. Coherent Lattice Flux: 4D Mapping (X, Y, Z + Neural Time)
  const latticeNodes = 12;
  for (let i = 0; i < latticeNodes; i++) {
    // 4D Coordinate mapping
    const z = Math.sin(t * 0.5 + i) * 100; // Depths dimension
    const wD = Math.cos(t * 0.3 + i) * 50; // Neural Time dimension
    
    const x = w * (0.5 + 0.4 * Math.sin(t * 0.2 + i + wD * 0.01));
    const y = h * (0.5 + 0.4 * Math.cos(t * 0.3 + i * 2.3 + z * 0.01));
    
    const scale = (z + 200) / 300; // Perspective from Z
    
    ctx.beginPath();
    ctx.arc(x, y, 1.5 * scale, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${0.6 * scale})`;
    ctx.fill();
    
    // Quantum Entanglement viz
    if (i > 0) {
       ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${0.15 * scale})`;
       ctx.beginPath();
       ctx.moveTo(w/2, h/2);
       ctx.lineTo(x, y);
       ctx.stroke();
    }
  }

  // Domain-Specific VFX with UPIS Logic
  if (vfx.includes('data') || vfx.includes('code')) {
    const cols = 40;
    const colW = w / cols;
    ctx.font = `${Math.floor(colW * 0.8)}px monospace`;
    for (let c = 0; c < cols; c++) {
      const y = ((t * 100 + c * 200) % (h * 1.2)) - 50;
      // PH_KERR_NONLINEAR inspired flickering
      const kerrAlpha = Math.abs(Math.sin(t * 5 + c)) * 0.3;
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${kerrAlpha})`;
      ctx.fillText(Math.random() > 0.5 ? '0' : '1', c * colW, y);
    }
  }

  // 3. Post-Process: Holographic Vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, h * 1.1);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(2, 2, 15, 0.95)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
};

export const useVideoRender = (initialData?: VideoData) => {
  const [data, setData] = useState<VideoData>(initialData || DEFAULT_VIDEO_DATA);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressStateRef = useRef(0);

  // Progress logic
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
        setProgress(p => {
            const next = p + 0.1;
            if (next >= 100) return 0;
            return next;
        });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    progressStateRef.current = progress;
    const idx = Math.min(Math.floor((progress / 100) * data.scenes.length), data.scenes.length - 1);
    setActiveSceneIndex(idx);
  }, [progress, data.scenes.length]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const loop = async () => {
        t += 0.01;
        const scene = data.scenes[activeSceneIndex];
        if (scene) {
            await renderScene(ctx, canvas.width, canvas.height, t, progressStateRef.current, scene, isPlaying);
        }
        animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [activeSceneIndex, isPlaying, data.scenes]);

  const instantReplay = useCallback(() => {
    const buffer = photoRAM.getHolographicBuffer();
    const frames = Array.from(buffer.values()).slice(-100);
    console.log(`[VideoPlayer] 🔄 Instant Replay: buffer size ${frames.length}`);
    return frames;
  }, []);

  return {
    data,
    setData,
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    activeSceneIndex,
    canvasRef,
    instantReplay
  };
};
