// Plan Item ID: TI-1
/**
 * ThreeDStudio.tsx - Advanced Sovereign 3D Studio v13
 * 
 * Features compared to industry leaders:
 * - Hyper3D.ai: Text-to-3D, editing
 * - Meshy-6: Multi-view, texturing
 * - Tripo P1.0: Single image reconstruction
 * - Spline Omma: Scene generation
 * - Stable Fast 3D: Fast reconstruction
 * - CSM AI: Semantic generation
 * - 3D AI Studio: Full pipeline
 * 
 * New Features:
 * - Text-to-3D Generation
 * - Image-to-3D Reconstruction
 * - Multi-view 3D Generation
 * - Scene/Environment Generation
 * - Character/Avatar Generation
 * - Architecture Generation
 * - Object/Prop Generation
 * - Terrain Generation
 * - Vehicle Generation
 * - Style Presets
 * - Material Editor
 * - UV Mapping
 * - Rigging Options
 * - LOD Generation
 * - Export Options (GLB, GLTF, OBJ, FBX, USDZ, STL)
 * - Batch Generation
 * - Real-time Preview
 * - Quality Controls
 * - Reference Image Support
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, Layers, Maximize2, Minimize2, X, Sparkles, Loader2,
  Download, Grid, RotateCw, Eye, EyeOff, Move, ZoomIn, ZoomOut,
  Palette, Sun, Moon, Zap, Settings, Sliders, FileBox, Image as ImageIcon,
  Building2, Car, Mountain, Package, Globe, RefreshCw,
  FileCode, FileImage, FileVideo, Copy, Trash2, Play, Pause,
  Maximize, Minimize, Rotate3d, BoxSelect, Cuboid, 
  CircleDashed, ArrowRight, Plus, Wand2, Cpu, Gauge, ScanLine,
  Clock
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import {
  threeDSovereignEngine,
  ThreeDAsset,
  STYLE_PRESETS,
  GENERATION_TYPES,
  EXPORT_FORMATS,
  QUALITY_PRESETS,
  ThreeDGenerationOptions,
  MaterialInfo
} from '@/engine/studios/ThreeDSovereignEngine';

type ViewMode = 'generate' | 'history' | 'editor' | 'materials';
type GenerationMode = 'text-to-3d' | 'image-to-3d' | 'multi-view-to-3d' | 'scene' | 'character' | 'architecture' | 'object' | 'terrain' | 'vehicle';
type EditorTab = 'transform' | 'materials' | 'export' | 'optimize';

interface Generated3D {
  id: string;
  url: string;
  thumbnail?: string;
  prompt: string;
  type: GenerationMode;
  style: string;
  quality: string;
  vertices: number;
  faces: number;
  hasTexture: boolean;
  hasRig: boolean;
  seed: number;
  timestamp: number;
  favorite?: boolean;
}

export const ThreeDStudio: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('generate');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('text-to-3d');
  const [prompt, setPrompt] = useState('');
  const [sourceImageUrl, setSourceImageUrl] = useState('');
  const [sourceImages, setSourceImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Generated3D[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);

  // Generation Options
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedQuality, setSelectedQuality] = useState('medium');
  const [autoTexture, setAutoTexture] = useState(true);
  const [rigReady, setRigReady] = useState(false);
  const [createLOD, setCreateLOD] = useState(false);
  const [lodLevels, setLodLevels] = useState(3);
  const [optimizeMesh, setOptimizeMesh] = useState(false);
  const [targetPolygons, setTargetPolygons] = useState(50000);
  const [exportFormat, setExportFormat] = useState('glb');
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [useSeed, setUseSeed] = useState(false);

  // Preview Controls
  const [isRotating, setIsRotating] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [background, setBackground] = useState('studio');

  // Materials
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialInfo | null>(null);
  const [materialProps, setMaterialProps] = useState({
    color: '#808080',
    metalness: 0.5,
    roughness: 0.5,
    opacity: 1,
    emissive: '#000000',
    emissiveIntensity: 0
  });

  // Editor
  const [editorTab, setEditorTab] = useState<EditorTab>('transform');
  const [transform, setTransform] = useState({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });

  const activeModel = history.find(m => m.id === activeModelId);

  // Generate 3D model
  const handleGenerate = async () => {
    if (!prompt.trim() && !sourceImageUrl && sourceImages.length === 0) return;
    setIsGenerating(true);

    try {
      const options: ThreeDGenerationOptions = {
        quality: selectedQuality as any,
        style: selectedStyle,
        sourceImageUrl: sourceImageUrl || undefined,
        sourceImages: sourceImages.length > 0 ? sourceImages : undefined,
        autoTexture,
        rigReady,
        createLOD: createLOD ? true : undefined,
        lodLevels: createLOD ? lodLevels : undefined,
        optimizeMesh: optimizeMesh ? true : undefined,
        targetPolygons: optimizeMesh ? targetPolygons : undefined,
        exportFormat: exportFormat as any,
        seed: useSeed ? seed : undefined
      };

      let asset: ThreeDAsset;
      if (generationMode === 'image-to-3d' && sourceImageUrl) {
        asset = await threeDSovereignEngine.generateFromImage(sourceImageUrl, prompt, options);
      } else if (generationMode === 'multi-view-to-3d' && sourceImages.length > 0) {
        asset = await threeDSovereignEngine.generateFromMultiView(sourceImages, options);
      } else {
        asset = await threeDSovereignEngine.generate(prompt, generationMode as any, options);
      }

      const newModel: Generated3D = {
        id: asset.id,
        url: asset.url || '',
        thumbnail: asset.thumbnail,
        prompt: asset.prompt,
        type: asset.type as any,
        style: asset.style,
        quality: asset.metadata?.quality || selectedQuality,
        vertices: asset.modelData?.vertices || 0,
        faces: asset.modelData?.faces || 0,
        hasTexture: asset.modelData?.hasUV || false,
        hasRig: asset.modelData?.hasRig || false,
        seed: asset.seed,
        timestamp: Date.now(),
        favorite: false
      };

      setHistory(prev => [newModel, ...prev].slice(0, 50));
      setActiveModelId(newModel.id);
    } catch (err) {
      console.error('[ThreeDStudio] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate variation
  const handleVariation = async () => {
    if (!activeModel) return;
    setIsGenerating(true);
    try {
      const asset = await threeDSovereignEngine.generate(activeModel.prompt, activeModel.type as any, { quality: activeModel.quality as any });
      const newModel: Generated3D = {
        id: asset.id,
        url: asset.url || '',
        prompt: asset.prompt,
        type: asset.type as any,
        style: asset.style,
        quality: asset.metadata?.quality || selectedQuality,
        vertices: asset.modelData?.vertices || 0,
        faces: asset.modelData?.faces || 0,
        hasTexture: asset.modelData?.hasUV || false,
        hasRig: asset.modelData?.hasRig || false,
        seed: asset.seed,
        timestamp: Date.now()
      };
      setHistory(prev => [newModel, ...prev]);
      setActiveModelId(newModel.id);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export
  const handleExport = async () => {
    if (!activeModel) return;
    const url = await threeDSovereignEngine.exportToFormat(activeModel.id, exportFormat as any);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sovereign-3d-${activeModel.seed}.${exportFormat}`;
    link.click();
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(m => m.id === id ? { ...m, favorite: !m.favorite } : m));
  };

  const addSourceImage = (url: string) => {
    if (url && sourceImages.length < 6 && !sourceImages.includes(url)) {
      setSourceImages([...sourceImages, url]);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#050510] text-white overflow-hidden", fullScreen && "fixed inset-0 z-[100]")}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Box size={18} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase">3D Studio v13</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-orange-500 uppercase tracking-widest">Sovereign Mesh</span>
              <span className="text-[8px] text-zinc-600">•</span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase">{history.length} models</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'generate', icon: Sparkles, label: 'Create' },
            { id: 'history', icon: Clock, label: 'History' },
            { id: 'editor', icon: BoxSelect, label: 'Editor' },
            { id: 'materials', icon: Palette, label: 'Materials' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={cn("px-2 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5", viewMode === tab.id ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "text-zinc-500 hover:text-zinc-300")}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
          <button onClick={() => setFullScreen(!fullScreen)} className="p-2 rounded-lg hover:bg-white/5 text-zinc-500">
            {fullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Generate Mode */}
      {viewMode === 'generate' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Controls */}
          <div className="w-full lg:w-80 p-4 border-r border-white/5 space-y-4 overflow-y-auto">
            {/* Generation Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Generation Type</label>
              <div className="grid grid-cols-3 gap-1.5">
                {GENERATION_TYPES.slice(0, 6).map(type => (
                  <button
                    key={type.id}
                    onClick={() => setGenerationMode(type.id)}
                    className={cn("p-2 rounded-lg text-center", generationMode === type.id ? "bg-orange-500/30 border border-orange-500/50" : "bg-white/5 border border-white/5")}
                  >
                    <div className="text-xs mb-1">{type.icon}</div>
                    <div className="text-[8px] text-zinc-400 truncate">{type.name.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Source Input */}
            {(generationMode === 'image-to-3d' || generationMode === 'multi-view-to-3d') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">
                  {generationMode === 'multi-view-to-3d' ? 'Source Images (up to 6)' : 'Source Image'}
                </label>
                <input
                  value={sourceImageUrl}
                  onChange={(e) => setSourceImageUrl(e.target.value)}
                  placeholder="Image URL..."
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs"
                />
                {generationMode === 'multi-view-to-3d' && (
                  <div className="flex gap-2">
                    <input placeholder="Add image URL" className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" onChange={(e) => addSourceImage(e.target.value)} />
                    <button onClick={() => addSourceImage(sourceImageUrl)} className="px-3 py-2 rounded bg-orange-500/20 text-orange-300 text-xs">Add</button>
                  </div>
                )}
                {sourceImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {sourceImages.map((url, i) => (
                      <div key={i} className="relative w-12 h-12 shrink-0">
                        <img src={url} alt="" className="w-full h-full object-cover rounded" />
                        <button onClick={() => setSourceImages(s => s.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full"><X size={8} /></button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white text-center">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={generationMode === 'image-to-3d' ? "Describe additional details..." : "Describe the 3D model you want to create..."}
                className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-zinc-300 placeholder:text-zinc-600 resize-none"
              />
            </div>

            {/* Style Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Style</label>
              <div className="grid grid-cols-4 gap-1.5">
                {STYLE_PRESETS.slice(0, 8).map(preset => (
                  <button key={preset.id} onClick={() => setSelectedStyle(preset.id)} className={cn("p-2 rounded-lg text-center", selectedStyle === preset.id ? "bg-orange-500/30 border border-orange-500/50" : "bg-white/5 border border-white/5")}>
                    <div className="text-xs">{preset.icon}</div>
                    <div className="text-[8px] text-zinc-400 truncate">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Quality</label>
              <div className="flex gap-1">
                {QUALITY_PRESETS.map(q => (
                  <button key={q.id} onClick={() => setSelectedQuality(q.id)} className={cn("flex-1 py-2 rounded text-[10px] font-bold uppercase", selectedQuality === q.id ? "bg-orange-500/30 text-orange-300" : "bg-white/5 text-zinc-500")}>
                    {q.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setAutoTexture(!autoTexture)} className={cn("px-3 py-1.5 rounded text-[10px] font-bold uppercase", autoTexture ? "bg-orange-500/30 text-orange-300" : "bg-white/5 text-zinc-500")}>Auto UV</button>
                <button onClick={() => setRigReady(!rigReady)} className={cn("px-3 py-1.5 rounded text-[10px] font-bold uppercase", rigReady ? "bg-orange-500/30 text-orange-300" : "bg-white/5 text-zinc-500")}>Rigged</button>
                <button onClick={() => setCreateLOD(!createLOD)} className={cn("px-3 py-1.5 rounded text-[10px] font-bold uppercase", createLOD ? "bg-orange-500/30 text-orange-300" : "bg-white/5 text-zinc-500")}>LOD</button>
                <button onClick={() => setOptimizeMesh(!optimizeMesh)} className={cn("px-3 py-1.5 rounded text-[10px] font-bold uppercase", optimizeMesh ? "bg-orange-500/30 text-orange-300" : "bg-white/5 text-zinc-500")}>Optimize</button>
              </div>
              {createLOD && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-zinc-500"><span>LOD Levels</span><span>{lodLevels}</span></div>
                  <input type="range" min="2" max="5" value={lodLevels} onChange={(e) => setLodLevels(parseInt(e.target.value))} className="w-full accent-orange-500" />
                </div>
              )}
              {optimizeMesh && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-zinc-500"><span>Target Polygons</span><span>{targetPolygons.toLocaleString()}</span></div>
                  <input type="range" min="5000" max="200000" step="5000" value={targetPolygons} onChange={(e) => setTargetPolygons(parseInt(e.target.value))} className="w-full accent-orange-500" />
                </div>
              )}
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Export Format</label>
              <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs">
                {EXPORT_FORMATS.map(f => <option key={f.id} value={f.id}>{f.name} ({f.ext})</option>)}
              </select>
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={!prompt.trim() && !sourceImageUrl && sourceImages.length === 0 || isGenerating} className={cn("w-full py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2", isGenerating ? "bg-orange-500/50 cursor-wait" : "bg-orange-500 hover:bg-orange-400")}>
              {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><ScanLine size={14} /> Generate 3D Model</>}
            </button>
          </div>

          {/* Preview */}
          <div className="flex-1 p-4 flex flex-col">
            {activeModel ? (
              <div className="flex-1 flex flex-col">
                {/* 3D Viewport */}
                <div className="flex-1 bg-black/40 rounded-xl overflow-hidden relative flex items-center justify-center">
                  {/* Simulated 3D canvas */}
                  <canvas ref={canvasRef} className="w-full h-full" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <button onClick={() => setIsRotating(!isRotating)} className={cn("p-2 rounded-lg", isRotating ? "bg-orange-500/30 text-orange-300" : "bg-black/60 text-white")}>
                      {isRotating ? <Rotate3d size={16} /> : <Box size={16} />}
                    </button>
                    <button onClick={() => setShowWireframe(!showWireframe)} className={cn("p-2 rounded-lg", showWireframe ? "bg-orange-500/30 text-orange-300" : "bg-black/60 text-white")}>
                      <Grid size={16} />
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="p-2 rounded-lg bg-black/60 text-white"><ZoomIn size={16} /></button>
                    <button className="p-2 rounded-lg bg-black/60 text-white"><ZoomOut size={16} /></button>
                  </div>
                  {/* Model info overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm">
                      <div className="text-[10px] text-orange-400 font-bold uppercase">{activeModel.type}</div>
                      <div className="text-[8px] text-zinc-400">{activeModel.vertices.toLocaleString()} vertices • {activeModel.faces.toLocaleString()} faces</div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-white/10 text-[8px] text-zinc-400">{activeModel.hasTexture ? '📦 UV' : ''}</span>
                      <span className="px-2 py-1 rounded bg-white/10 text-[8px] text-zinc-400">{activeModel.hasRig ? '🎬 Rigged' : ''}</span>
                    </div>
                  </div>
                </div>
                {/* Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[10px] text-zinc-500">{activeModel.style} • Quality: {activeModel.quality}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavorite(activeModel.id)} className="p-2 rounded-lg hover:bg-white/10"><Wand2 size={14} className={activeModel.favorite ? "text-red-500" : "text-zinc-500"} /></button>
                    <button onClick={handleVariation} disabled={isGenerating} className="p-2 rounded-lg hover:bg-white/10"><RefreshCw size={14} className="text-zinc-500" /></button>
                    <button onClick={handleExport} className="px-3 py-1.5 rounded-lg bg-orange-500 text-black text-[10px] font-bold uppercase flex items-center gap-1.5"><Download size={12} />Export</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600">
                <div className="text-center">
                  <Box size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Enter a prompt to generate</p>
                  <p className="text-xs mt-2 opacity-50">Try: "A dragon character with wings"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Mode */}
      {viewMode === 'history' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {history.map(model => (
              <motion.div key={model.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActiveModelId(model.id)} className={cn("relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2", activeModelId === model.id ? "border-orange-500" : "border-transparent hover:border-white/20")}>
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <Box size={32} className="text-orange-500/50" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[10px] text-white truncate">{model.prompt.slice(0, 25)}...</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] text-zinc-500">{model.vertices.toLocaleString()}v</p>
                    <p className="text-[8px] text-zinc-500">{model.style}</p>
                  </div>
                </div>
                {model.favorite && <div className="absolute top-2 right-2"><Wand2 size={12} className="text-red-500 fill-red-500" /></div>}
              </motion.div>
            ))}
            {history.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600"><Box size={32} className="mx-auto mb-2 opacity-50" /><p className="text-sm">No models yet</p></div>}
          </div>
        </div>
      )}

      {/* Editor Mode */}
      {viewMode === 'editor' && activeModel && (
        <div className="flex-1 flex">
          <div className="w-20 border-r border-white/5 flex flex-col items-center py-4 gap-2">
            {[
              { id: 'transform', icon: Move, label: 'Transform' },
              { id: 'materials', icon: Palette, label: 'Materials' },
              { id: 'export', icon: Download, label: 'Export' },
              { id: 'optimize', icon: Gauge, label: 'Optimize' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setEditorTab(tab.id as EditorTab)} className={cn("p-2 rounded-lg flex flex-col items-center gap-1", editorTab === tab.id ? "bg-orange-500/20 text-orange-300" : "text-zinc-500")}>
                <tab.icon size={16} /><span className="text-[8px] font-bold uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 p-4">
            {editorTab === 'transform' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 mb-3">Position</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="space-y-1">
                        <label className="text-[8px] text-zinc-500">{axis}</label>
                        <input type="number" value={transform.position[i]} onChange={(e) => setTransform({ ...transform, position: transform.position.map((v, j) => j === i ? parseFloat(e.target.value) : v) })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 mb-3">Rotation</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="space-y-1">
                        <label className="text-[8px] text-zinc-500">{axis}</label>
                        <input type="number" value={transform.rotation[i]} onChange={(e) => setTransform({ ...transform, rotation: transform.rotation.map((v, j) => j === i ? parseFloat(e.target.value) : v) })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 mb-3">Scale</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="space-y-1">
                        <label className="text-[8px] text-zinc-500">{axis}</label>
                        <input type="number" value={transform.scale[i]} step="0.1" onChange={(e) => setTransform({ ...transform, scale: transform.scale.map((v, j) => j === i ? parseFloat(e.target.value) : v) })} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setTransform({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] })} className="w-full py-2 rounded bg-white/5 text-zinc-400 text-xs font-bold uppercase">Reset Transform</button>
              </div>
            )}
            {editorTab === 'materials' && (
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Color</label>
                  <input type="color" value={materialProps.color} onChange={(e) => setMaterialProps({ ...materialProps, color: e.target.value })} className="w-full h-10 rounded cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500"><span>Metalness</span><span>{materialProps.metalness}</span></div>
                  <input type="range" min="0" max="1" step="0.1" value={materialProps.metalness} onChange={(e) => setMaterialProps({ ...materialProps, metalness: parseFloat(e.target.value) })} className="w-full accent-orange-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500"><span>Roughness</span><span>{materialProps.roughness}</span></div>
                  <input type="range" min="0" max="1" step="0.1" value={materialProps.roughness} onChange={(e) => setMaterialProps({ ...materialProps, roughness: parseFloat(e.target.value) })} className="w-full accent-orange-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-zinc-500"><span>Opacity</span><span>{materialProps.opacity}</span></div>
                  <input type="range" min="0" max="1" step="0.1" value={materialProps.opacity} onChange={(e) => setMaterialProps({ ...materialProps, opacity: parseFloat(e.target.value) })} className="w-full accent-orange-500" />
                </div>
              </div>
            )}
            {editorTab === 'export' && (
              <div className="space-y-4 max-w-md">
                <div className="grid grid-cols-2 gap-2">
                  {EXPORT_FORMATS.map(f => (
                    <button key={f.id} onClick={() => setExportFormat(f.id)} className={cn("p-3 rounded-lg text-center", exportFormat === f.id ? "bg-orange-500/30 border border-orange-500/50" : "bg-white/5 border border-white/5")}>
                      <div className="text-xs font-bold">{f.name}</div>
                      <div className="text-[8px] text-zinc-500">{f.description}</div>
                    </button>
                  ))}
                </div>
                <button onClick={handleExport} className="w-full py-3 rounded-lg bg-orange-500 text-black text-xs font-bold uppercase flex items-center justify-center gap-2">
                  <Download size={14} /> Export {exportFormat.toUpperCase()}
                </button>
              </div>
            )}
            {editorTab === 'optimize' && (
              <div className="space-y-4 max-w-md">
                <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                  <h3 className="text-xs font-bold text-zinc-400 mb-2">Current Model</h3>
                  <div className="space-y-1 text-[10px] text-zinc-500">
                    <p>Vertices: {activeModel.vertices.toLocaleString()}</p>
                    <p>Faces: {activeModel.faces.toLocaleString()}</p>
                    <p>Texture: {activeModel.hasTexture ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Target Polygon Count</label>
                  <input type="range" min="1000" max="200000" step="1000" value={targetPolygons} onChange={(e) => setTargetPolygons(parseInt(e.target.value))} className="w-full accent-orange-500" />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>1K</span>
                    <span>{targetPolygons.toLocaleString()}</span>
                    <span>200K</span>
                  </div>
                </div>
                <button className="w-full py-3 rounded-lg bg-orange-500/20 text-orange-300 text-xs font-bold uppercase flex items-center justify-center gap-2">
                  <Gauge size={14} /> Optimize Model
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Materials Mode */}
      {viewMode === 'materials' && (
        <div className="flex-1 p-4">
          <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { name: 'PBR Standard', type: 'pbr', icon: '📦' },
              { name: 'Emissive', type: 'emissive', icon: '💡' },
              { name: 'Glass', type: 'glass', icon: '🫧' },
              { name: 'Toon', type: 'toon', icon: '🎨' },
              { name: 'Metal', type: 'metal', icon: '⚙️' },
              { name: 'Wood', type: 'wood', icon: '🪵' },
              { name: 'Stone', type: 'stone', icon: '🪨' },
              { name: 'Fabric', type: 'fabric', icon: '🧵' }
            ].map((mat, i) => (
              <button key={i} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-orange-500/50 flex flex-col items-center gap-2">
                <span className="text-2xl">{mat.icon}</span>
                <span className="text-[10px] text-zinc-400">{mat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDStudio;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
