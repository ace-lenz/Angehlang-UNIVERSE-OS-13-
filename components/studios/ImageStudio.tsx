// Plan Item ID: TI-1
/**
 * ImageStudio.tsx - Advanced Sovereign Generative Image & Vision Studio v13
 * 
 * Features (compared to industry leaders):
 * - OpenAI DALL-E: Text rendering, multi-subject composition
 * - Google Gemini/Imagen: Natural language understanding  
 * - Midjourney V8.1: Style refs, character refs, parameters (--ar, --s, --c, --weird, --tile)
 * - Adobe Firefly: Generative fill, structure/style reference
 * - FLUX: Text rendering
 * - Stable Diffusion: ControlNet (canny, depth, pose, segmentation)
 * - Baidu: Video generation, Chinese language support
 * 
 * New Features:
 * - Text Rendering
 * - Inpainting & Outpainting
 * - Style References (--sref)
 * - Character References (--cref)
 * - Image References
 * - ControlNet Controls
 * - Video Generation
 * - Advanced Parameters (chaos, stylize, weird, tile)
 * - Multi-language Support
 * - Midjourney Parameter Parsing
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, RefreshCw, Sparkles, Maximize2, Minimize2, Zap, 
  Image as ImageIcon, Sliders, Wand2, Filter, Layers, 
  CheckSquare, Square, Scan, Layers3, Clock, Grid, List,
  Crop, Palette, Edit3, Trash2, Share2, MousePointer2,
  ChevronLeft, ChevronRight, X, Bot, Activity, Star, Heart,
  Settings, ImagePlus, Copy, Maximize, ZoomIn, ZoomOut,
  RotateCcw, FlipHorizontal, FlipVertical, Layers as LayersIcon,
  Sparkle, Wand, Cpu, Gauge, Loader2, Search, SlidersHorizontal,
  Type, PersonStanding, Puzzle, Video, Link,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Move, Box,
  GaugeCircle, Sparkles as ChaosIcon, Layers as StyleIcon,
  Globe, Keyboard, Maximize as OutpaintIcon
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { 
  imageSovereignEngine, 
  ImageAsset, 
  StylePreset, 
  ASPECT_RATIOS,
  STYLE_PRESETS,
  CONTROLNET_TYPES,
  ControlNetSettings,
  VideoGenerationOptions
} from '@/engine/studios/ImageSovereignEngine';
import { useSovereign } from '@/context/SovereignContext';
import { crossStudioOrchestrator } from '@/engine/CrossStudioOrchestrator';

interface GeneratedImage {
  id: string;
  data: string;
  thumbnail?: string;
  seed: number;
  style: string;
  prompt: string;
  negativePrompt?: string;
  aspect: string;
  width: number;
  height: number;
  timestamp: number;
  favorite?: boolean;
  text?: string;
  styleRefs?: string[];
  characterRefs?: string[];
  hasVideo?: boolean;
}

type ViewMode = 'generate' | 'history' | 'editor' | 'advanced' | 'video';
type EditorTab = 'adjust' | 'filters' | 'transform' | 'inpaint';
type AdvancedTab = 'references' | 'controlnet' | 'parameters' | 'text';

export const ImageStudio: React.FC = () => {
  const { sendMessageToChat } = useSovereign();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [fullScreen, setFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('generate');
  const [selectedStyle, setSelectedStyle] = useState<string>('photorealistic');
  const [selectedAspect, setSelectedAspect] = useState<string>('16:9');
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [isFluxMode, setIsFluxMode] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [editorTab, setEditorTab] = useState<EditorTab>('adjust');
  const [advancedTab, setAdvancedTab] = useState<AdvancedTab>('parameters');
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Features State
  const [textPrompt, setTextPrompt] = useState('');
  const [styleImageUrls, setStyleImageUrls] = useState<string[]>([]);
  const [characterImageUrls, setCharacterImageUrls] = useState<string[]>([]);
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [controlNetType, setControlNetType] = useState<string>('canny');
  const [controlNetImage, setControlNetImage] = useState('');
  const [controlNetWeight, setControlNetWeight] = useState(1);
  
  // Advanced Parameters (Midjourney style)
  const [chaos, setChaos] = useState(0);       // --c
  const [stylize, setStylize] = useState(100); // --s
  const [weird, setWeird] = useState(0);       // --weird
  const [tile, setTile] = useState(false);     // --tile
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [useSeed, setUseSeed] = useState(false);

  // Video Generation
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Language
  const [language, setLanguage] = useState('en');
  const [showLanguage, setShowLanguage] = useState(false);

  // Image adjustments
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    sharpen: 0,
    noise: 0,
    exposure: 0
  });

  const [selectedFilter, setSelectedFilter] = useState<string>('none');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeImage = history.find(img => img.id === activeImageId);

  useEffect(() => {
    if (isFluxMode && prompt.length > 5) {
      const timer = setTimeout(() => handleGenerate(), 2000);
      return () => clearTimeout(timer);
    }
  }, [prompt, isFluxMode]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      // Parse Midjourney-style parameters from prompt
      const { cleanedPrompt, options: parsedOptions } = imageSovereignEngine.parseMidjourneyParameters(prompt);
      const finalPrompt = imageSovereignEngine.generateInLanguage(cleanedPrompt, language);
      
      const results: GeneratedImage[] = [];
      
      for (let i = 0; i < batchCount; i++) {
        const asset = await imageSovereignEngine.synthesize(finalPrompt, {
          style: selectedStyle,
          aspect: selectedAspect,
          quality,
          negativePrompt: negativePrompt || undefined,
          text: textPrompt || undefined,
          styleReferences: styleImageUrls.length > 0 ? styleImageUrls : undefined,
          characterReferences: characterImageUrls.length > 0 ? characterImageUrls : undefined,
          imageReferences: referenceImageUrl ? [referenceImageUrl] : undefined,
          controlNet: controlNetImage ? {
            type: controlNetType as ControlNetSettings['type'],
            imageUrl: controlNetImage,
            controlWeight: controlNetWeight
          } : undefined,
          chaos: chaos > 0 ? chaos : undefined,
          stylize: stylize !== 100 ? stylize : undefined,
          weird: weird > 0 ? weird : undefined,
          tile: tile || undefined,
          seed: useSeed ? seed : undefined
        });

        const aspectInfo = ASPECT_RATIOS.find(a => a.id === selectedAspect) || ASPECT_RATIOS[0];
        
        results.push({
          id: asset.id,
          data: asset.url,
          thumbnail: asset.thumbnail,
          seed: asset.seed,
          style: asset.style,
          prompt: finalPrompt,
          negativePrompt,
          aspect: selectedAspect,
          width: aspectInfo.width,
          height: aspectInfo.height,
          timestamp: Date.now(),
          favorite: false,
          text: textPrompt || undefined,
          styleRefs: styleImageUrls,
          characterRefs: characterImageUrls
        });
      }

      setHistory(prev => [...results, ...prev].slice(0, 100));
      if (results.length > 0) {
        setActiveImageId(results[0].id);
      }
    } catch (err) {
      console.error('[ImageStudio] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVariation = async () => {
    if (!activeImage) return;
    setIsGenerating(true);
    
    try {
      const asset = await imageSovereignEngine.synthesize(activeImage.prompt, {
        style: selectedStyle,
        aspect: selectedAspect,
        quality,
        chaos: 50 // Add variation
      });

      const newImg: GeneratedImage = {
        id: asset.id,
        data: asset.url,
        seed: asset.seed,
        style: asset.style,
        prompt: activeImage.prompt,
        aspect: selectedAspect,
        width: activeImage.width,
        height: activeImage.height,
        timestamp: Date.now(),
        favorite: false
      };

      setHistory(prev => [newImg, ...prev]);
      setActiveImageId(newImg.id);
    } catch (err) {
      console.error('[ImageStudio] Variation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpscale = async () => {
    if (!activeImage) return;
    setIsProcessing(true);
    try {
      const upscaledUrl = await imageSovereignEngine.upscale(activeImage.data, 2);
      const newImg: GeneratedImage = {
        id: `upscaled_${Date.now()}`,
        data: upscaledUrl,
        seed: activeImage.seed,
        style: activeImage.style,
        prompt: activeImage.prompt + ' (upscaled)',
        aspect: activeImage.aspect,
        width: activeImage.width * 2,
        height: activeImage.height * 2,
        timestamp: Date.now(),
        favorite: false
      };
      setHistory(prev => [newImg, ...prev]);
      setActiveImageId(newImg.id);
    } catch (err) {
      console.error('[ImageStudio] Upscale error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInpaint = async () => {
    if (!activeImage) return;
    setIsProcessing(true);
    try {
      // Simulated inpaint - in production would use actual mask editing
      const newPrompt = prompt || 'enhanced version';
      const asset = await imageSovereignEngine.inpaint(activeImage.data, '', newPrompt);
      const newImg: GeneratedImage = {
        id: `inpaint_${Date.now()}`,
        data: asset.url,
        seed: asset.seed,
        style: activeImage.style,
        prompt: newPrompt,
        aspect: activeImage.aspect,
        width: 1024,
        height: 1024,
        timestamp: Date.now(),
        favorite: false
      };
      setHistory(prev => [newImg, ...prev]);
      setActiveImageId(newImg.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOutpaint = async (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!activeImage) return;
    setIsProcessing(true);
    try {
      const asset = await imageSovereignEngine.outpaint(activeImage.data, direction, activeImage.prompt);
      const newImg: GeneratedImage = {
        id: `outpaint_${Date.now()}`,
        data: asset.url,
        seed: asset.seed,
        style: activeImage.style,
        prompt: activeImage.prompt + ` (expanded ${direction})`,
        aspect: activeImage.aspect,
        width: asset.width,
        height: asset.height,
        timestamp: Date.now(),
        favorite: false
      };
      setHistory(prev => [newImg, ...prev]);
      setActiveImageId(newImg.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!activeImage) return;
    setIsGeneratingVideo(true);
    try {
      const url = await imageSovereignEngine.generateVideo({
        imageUrl: activeImage.data,
        duration: 3,
        motion: 70,
        prompt: activeImage.prompt
      });
      setVideoUrl(url);
      setHistory(prev => prev.map(img => 
        img.id === activeImage.id ? { ...img, hasVideo: true } : img
      ));
    } catch (err) {
      console.error('[ImageStudio] Video error:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(img => 
      img.id === id ? { ...img, favorite: !img.favorite } : img
    ));
  };

  const handleDownload = () => {
    if (!activeImage) return;
    const link = document.createElement('a');
    link.href = activeImage.data;
    link.download = `sovereign-${activeImage.seed}.png`;
    link.click();
  };

  const handleCopyUrl = () => {
    if (!activeImage) return;
    navigator.clipboard.writeText(activeImage.data);
  };

  const applyFilter = (filterName: string) => {
    setSelectedFilter(filterName);
    switch (filterName) {
      case 'vivid':
        setAdjustments({ ...adjustments, saturation: 140, contrast: 120 });
        break;
      case 'warm':
        setAdjustments({ ...adjustments, hue: 30, saturation: 110 });
        break;
      case 'cool':
        setAdjustments({ ...adjustments, hue: -30, saturation: 110 });
        break;
      case 'mono':
        setAdjustments({ ...adjustments, saturation: 0, contrast: 120 });
        break;
      case 'sepia':
        setAdjustments({ ...adjustments, saturation: 80, hue: 20 });
        break;
      case 'dramatic':
        setAdjustments({ ...adjustments, contrast: 150, brightness: 90 });
        break;
      default:
        setAdjustments({ brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sharpen: 0, noise: 0, exposure: 0 });
    }
  };

  const getFilterStyle = () => {
    const filters: string[] = [];
    filters.push(`brightness(${adjustments.brightness}%)`);
    filters.push(`contrast(${adjustments.contrast}%)`);
    filters.push(`saturate(${adjustments.saturation}%)`);
    filters.push(`hue-rotate(${adjustments.hue}deg)`);
    if (adjustments.blur > 0) filters.push(`blur(${adjustments.blur}px)`);
    return filters.join(' ');
  };

  const addStyleReference = (url: string) => {
    if (url && !styleImageUrls.includes(url)) {
      setStyleImageUrls([...styleImageUrls, url]);
    }
  };

  const addCharacterReference = (url: string) => {
    if (url && !characterImageUrls.includes(url)) {
      setCharacterImageUrls([...characterImageUrls, url]);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-[#030308] text-white overflow-hidden transition-all duration-500",
      fullScreen && "fixed inset-0 z-[100] bg-black"
    )}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <ImageIcon size={18} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase">Image Studio v13</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-purple-500 uppercase tracking-widest">Sovereign Flux</span>
              <span className="text-[8px] text-zinc-600">•</span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase">{history.length} images</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'generate', icon: Sparkles, label: 'Generate' },
            { id: 'advanced', icon: Settings, label: 'Advanced' },
            { id: 'video', icon: Video, label: 'Video' },
            { id: 'history', icon: Clock, label: 'History' },
            { id: 'editor', icon: Edit3, label: 'Editor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={cn(
                "px-2 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5",
                viewMode === tab.id 
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <tab.icon size={12} />
              {tab.label}
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
            {/* Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Prompt</label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsFluxMode(!isFluxMode)}
                    className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase flex items-center gap-1", isFluxMode ? "bg-purple-500 text-white" : "bg-white/10 text-zinc-500")}
                  >
                    <Sparkle size={10} /> Flux
                  </button>
                  <button onClick={() => setShowLanguage(!showLanguage)} className="p-1 rounded hover:bg-white/10">
                    <Globe size={12} className="text-zinc-500" />
                  </button>
                </div>
              </div>
              {showLanguage && (
                <div className="flex gap-1 mb-2">
                  {['en', 'zh', 'ja', 'ko', 'es', 'fr'].map(lang => (
                    <button key={lang} onClick={() => setLanguage(lang)} className={cn("px-2 py-1 rounded text-[8px] uppercase", language === lang ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-zinc-500")}>{lang}</button>
                  ))}
                </div>
              )}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image... (supports --ar, --s, --c, --weird, --tile, --no)"
                className="w-full h-28 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-zinc-300 placeholder:text-zinc-600 resize-none focus:outline-none focus:border-purple-500/50"
              />
              <button onClick={() => setShowNegative(!showNegative)} className="text-[10px] text-zinc-500 hover:text-zinc-400 flex items-center gap-1">
                <SlidersHorizontal size={10} /> Advanced ({negativePrompt ? '1' : '0'})
              </button>
              {showNegative && (
                <input
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Negative prompt: e.g., blurry, low quality"
                  className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-600"
                />
              )}
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setViewMode('advanced')} className={cn("p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center gap-1", textPrompt || styleImageUrls.length > 0 ? "border-purple-500/50" : "")}>
                <Type size={14} className="text-purple-400" />
                <span className="text-[8px] text-zinc-400">Text</span>
              </button>
              <button onClick={() => setViewMode('advanced')} className="p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                <ImageIcon size={14} className="text-pink-400" />
                <span className="text-[8px] text-zinc-400">Style Ref</span>
              </button>
              <button onClick={() => setViewMode('advanced')} className="p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                <PersonStanding size={14} className="text-cyan-400" />
                <span className="text-[8px] text-zinc-400">Char Ref</span>
              </button>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Style</label>
              <div className="grid grid-cols-4 gap-1.5">
                {STYLE_PRESETS.slice(0, 8).map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedStyle(preset.id)}
                    className={cn("p-2 rounded-lg text-center transition-all", selectedStyle === preset.id ? "bg-purple-500/30 border border-purple-500/50" : "bg-white/5 border border-white/5 hover:bg-white/10")}
                  >
                    <div className="text-xs">{preset.icon}</div>
                    <div className="text-[8px] text-zinc-400 mt-0.5 truncate">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect & Quality */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Aspect</label>
                <div className="grid grid-cols-4 gap-1">
                  {ASPECT_RATIOS.slice(0, 4).map(aspect => (
                    <button key={aspect.id} onClick={() => setSelectedAspect(aspect.id)} className={cn("py-1.5 rounded text-[10px] font-bold uppercase", selectedAspect === aspect.id ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-zinc-500")}>{aspect.id}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Quality</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['standard', 'high', 'ultra'] as const).map(q => (
                    <button key={q} onClick={() => setQuality(q)} className={cn("py-1.5 rounded text-[10px] font-bold uppercase", quality === q ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-zinc-500")}>{q[0]}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Params */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Parameters</span>
                <button onClick={() => setViewMode('advanced')} className="text-[8px] text-purple-400">Full Controls</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-zinc-500"><span>Chaos --c</span><span>{chaos}</span></div>
                  <input type="range" min="0" max="100" value={chaos} onChange={(e) => setChaos(parseInt(e.target.value))} className="w-full accent-purple-500 h-1" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-zinc-500"><span>Stylize --s</span><span>{stylize}</span></div>
                  <input type="range" min="0" max="1000" value={stylize} onChange={(e) => setStylize(parseInt(e.target.value))} className="w-full accent-purple-500 h-1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setTile(!tile)} className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase", tile ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-zinc-500")}>--tile</button>
                <button onClick={() => setUseSeed(!useSeed)} className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase", useSeed ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-zinc-500")}>Seed</button>
              </div>
            </div>

            {/* Batch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Batch ({batchCount})</label>
              </div>
              <input type="range" min="1" max="8" value={batchCount} onChange={(e) => setBatchCount(parseInt(e.target.value))} className="w-full accent-purple-500" />
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating} className={cn("w-full py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2", isGenerating ? "bg-purple-500/50 cursor-wait" : "bg-purple-500 hover:bg-purple-400")}>
              {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Sparkle size={14} /> Generate {batchCount > 1 && `(${batchCount})`}</>}
            </button>
          </div>

          {/* Preview */}
          <div className="flex-1 p-4 flex flex-col">
            {activeImage ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-black/40 rounded-xl overflow-hidden relative flex items-center justify-center">
                  <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} src={activeImage.data} alt="Generated" className="max-w-full max-h-full object-contain" style={{ filter: getFilterStyle(), transform: `scale(${zoom})` }} />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 rounded bg-black/60 text-white/70"><ZoomOut size={14} /></button>
                    <span className="px-2 py-1 rounded bg-black/60 text-white/70 text-[10px]">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1.5 rounded bg-black/60 text-white/70"><ZoomIn size={14} /></button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[10px] text-zinc-500">{activeImage.width}×{activeImage.height} • {activeImage.style} • Seed: {activeImage.seed}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavorite(activeImage.id)} className="p-2 rounded-lg hover:bg-white/10"><Heart size={14} className={activeImage.favorite ? "text-red-500 fill-red-500" : "text-zinc-500"} /></button>
                    <button onClick={handleCopyUrl} className="p-2 rounded-lg hover:bg-white/10"><Copy size={14} className="text-zinc-500" /></button>
                    <button onClick={handleGenerateVariation} className="p-2 rounded-lg hover:bg-white/10"><Wand size={14} className="text-zinc-500" /></button>
                    <button onClick={handleUpscale} disabled={isProcessing} className="p-2 rounded-lg hover:bg-white/10">{isProcessing ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <Maximize size={14} className="text-zinc-500" />}</button>
                    <button onClick={handleInpaint} disabled={isProcessing} className="p-2 rounded-lg hover:bg-white/10" title="Inpaint"><Edit3 size={14} className="text-zinc-500" /></button>
                    <button onClick={handleDownload} className="px-3 py-1.5 rounded-lg bg-purple-500 text-black text-[10px] font-bold uppercase flex items-center gap-1.5"><Download size={12} />Download</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600">
                <div className="text-center"><ImageIcon size={48} className="mx-auto mb-4 opacity-30" /><p className="text-sm">Enter a prompt</p><p className="text-xs mt-2 opacity-50">Supports: --ar, --s, --c, --weird, --tile, --no</p></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Mode */}
      {viewMode === 'advanced' && (
        <div className="flex-1 flex">
          <div className="w-24 border-r border-white/5 flex flex-col items-center py-4 gap-2">
            {[
              { id: 'references', icon: Layers, label: 'Refs' },
              { id: 'controlnet', icon: Puzzle, label: 'Control' },
              { id: 'parameters', icon: Sliders, label: 'Params' },
              { id: 'text', icon: Type, label: 'Text' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setAdvancedTab(tab.id as AdvancedTab)} className={cn("p-2 rounded-lg flex flex-col items-center gap-1", advancedTab === tab.id ? "bg-purple-500/20 text-purple-300" : "text-zinc-500")}>
                <tab.icon size={16} /><span className="text-[8px] font-bold uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {advancedTab === 'references' && (
              <div className="space-y-6">
                <div><h3 className="text-xs font-bold text-zinc-400 mb-3">Style References (--sref)</h3>
                  <div className="flex gap-2 mb-2">
                    <input value={styleImageUrls[0] || ''} onChange={(e) => addStyleReference(e.target.value)} placeholder="Style reference image URL" className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
                    <button onClick={() => addStyleReference(styleImageUrls[0] || '')} className="px-3 py-2 rounded bg-purple-500/20 text-purple-300 text-xs">Add</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">{styleImageUrls.map((url, i) => <div key={i} className="relative w-16 h-16 rounded overflow-hidden"><img src={url} alt="" className="w-full h-full object-cover" /><button onClick={() => setStyleImageUrls(s => s.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 p-1 bg-red-500"><X size={10} /></button></div>)}</div>
                  <p className="text-[10px] text-zinc-600 mt-2">Upload reference images to guide style (like Midjourney --sref)</p>
                </div>
                <div><h3 className="text-xs font-bold text-zinc-400 mb-3">Character References (--cref)</h3>
                  <div className="flex gap-2 mb-2">
                    <input value={characterImageUrls[0] || ''} onChange={(e) => addCharacterReference(e.target.value)} placeholder="Character reference image URL" className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
                    <button onClick={() => addCharacterReference(characterImageUrls[0] || '')} className="px-3 py-2 rounded bg-cyan-500/20 text-cyan-300 text-xs">Add</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">{characterImageUrls.map((url, i) => <div key={i} className="relative w-16 h-16 rounded overflow-hidden"><img src={url} alt="" className="w-full h-full object-cover" /><button onClick={() => setCharacterImageUrls(c => c.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 p-1 bg-red-500"><X size={10} /></button></div>)}</div>
                  <p className="text-[10px] text-zinc-600 mt-2">Reference character consistency across generations (like Midjourney --cref)</p>
                </div>
                <div><h3 className="text-xs font-bold text-zinc-400 mb-3">Image Reference</h3>
                  <input value={referenceImageUrl} onChange={(e) => setReferenceImageUrl(e.target.value)} placeholder="Reference image URL for composition" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs mb-2" />
                  <p className="text-[10px] text-zinc-600">Use an image as reference for composition</p>
                </div>
              </div>
            )}
            {advancedTab === 'controlnet' && (
              <div className="space-y-6">
                <div><h3 className="text-xs font-bold text-zinc-400 mb-3">ControlNet</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {CONTROLNET_TYPES.map((cnItem) => (
                      <button key={cnItem.id} onClick={() => setControlNetType(cnItem.id)} className={cn("p-3 rounded-lg text-center", controlNetType === cnItem.id ? "bg-purple-500/30 border border-purple-500/50" : "bg-white/5 border border-white/5")}>
                        <div className="text-lg mb-1 text-zinc-400">{cnItem.icon}</div>
                        <div className="text-[10px] font-bold uppercase">{cnItem.name}</div>
                        <div className="text-[8px] text-zinc-500">{cnItem.description}</div>
                      </button>
                    ))}
                  </div>
                  <input value={controlNetImage} onChange={(e) => setControlNetImage(e.target.value)} placeholder="Control image URL (edge map, depth map, etc.)" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs mb-2" />
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500"><span>Control Weight</span><span>{controlNetWeight}</span></div>
                    <input type="range" min="0" max="2" step="0.1" value={controlNetWeight} onChange={(e) => setControlNetWeight(parseFloat(e.target.value))} className="w-full accent-purple-500" />
                  </div>
                </div>
              </div>
            )}
            {advancedTab === 'parameters' && (
              <div className="space-y-6">
                {[
                  { label: 'Chaos (--c)', value: chaos, setValue: setChaos, min: 0, max: 100, desc: 'Higher = more varied/unexpected results' },
                  { label: 'Stylize (--s)', value: stylize, setValue: setStylize, min: 0, max: 1000, desc: 'Lower = more prompt adherence, higher = more artistic' },
                  { label: 'Weird (--weird)', value: weird, setValue: setWeird, min: 0, max: 3000, desc: 'Experimental/quirky results' }
                ].map(param => (
                  <div key={param.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-zinc-400">{param.label}</span>
                      <span className="text-xs text-purple-400">{param.value}</span>
                    </div>
                    <input type="range" min={param.min} max={param.max} value={param.value} onChange={(e) => param.setValue(parseInt(e.target.value))} className="w-full accent-purple-500 mb-1" />
                    <p className="text-[10px] text-zinc-600">{param.desc}</p>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setTile(!tile)} className={cn("px-4 py-2 rounded-lg font-bold text-xs uppercase", tile ? "bg-purple-500 text-black" : "bg-white/10 text-zinc-400")}>--tile</button>
                  <button onClick={() => setUseSeed(!useSeed)} className={cn("px-4 py-2 rounded-lg font-bold text-xs uppercase", useSeed ? "bg-purple-500 text-black" : "bg-white/10 text-zinc-400")}>--seed {useSeed && seed}</button>
                  {useSeed && <input type="number" value={seed || 0} onChange={(e) => setSeed(parseInt(e.target.value))} className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs w-24" placeholder="Seed number" />}
                </div>
                <button onClick={() => { setChaos(0); setStylize(100); setWeird(0); setTile(false); setUseSeed(false); }} className="w-full py-2 rounded-lg bg-white/5 text-zinc-400 text-xs font-bold uppercase">Reset All Parameters</button>
              </div>
            )}
            {advancedTab === 'text' && (
              <div className="space-y-4">
                <div><h3 className="text-xs font-bold text-zinc-400 mb-3">Text Rendering</h3>
                  <input value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} placeholder="Text to render in image, e.g., 'HELLO WORLD'" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs mb-2" />
                  <p className="text-[10px] text-zinc-600">Generate images with visible text/typography (like DALL-E, FLUX)</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <h4 className="text-xs font-bold text-purple-300 mb-2">Quick Examples</h4>
                  <div className="flex flex-wrap gap-2">
                    {['"HELLO"', '"Welcome"', '"Sale 50%"', '"2024"'].map(text => (
                      <button key={text} onClick={() => setTextPrompt(text)} className="px-2 py-1 rounded bg-white/5 text-zinc-400 text-[10px]">{text}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Mode */}
      {viewMode === 'video' && (
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          <Video size={48} className="text-pink-400 mb-4" />
          <h3 className="text-lg font-bold text-zinc-300 mb-2">Image to Video</h3>
          <p className="text-sm text-zinc-500 mb-6 text-center max-w-md">Convert your generated images into short video animations</p>
          {activeImage ? (
            <div className="space-y-4">
              <img src={activeImage.data} alt="Source" className="w-64 h-64 object-contain rounded-lg border border-white/10" />
              <button onClick={handleGenerateVideo} disabled={isGeneratingVideo} className={cn("px-6 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2", isGeneratingVideo ? "bg-pink-500/50" : "bg-pink-500 hover:bg-pink-400")}>
                {isGeneratingVideo ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Video size={16} /> Generate Video</>}
              </button>
              {videoUrl && (
                <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-xs text-green-400 font-bold mb-2">Video Generated!</p>
                  <video src={videoUrl} controls className="w-full rounded" />
                </div>
              )}
            </div>
          ) : (
            <p className="text-zinc-600">Select an image from history to generate video</p>
          )}
        </div>
      )}

      {/* History Mode */}
      {viewMode === 'history' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {history.map(img => (
              <motion.div key={img.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActiveImageId(img.id)} className={cn("relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all", activeImageId === img.id ? "border-purple-500" : "border-transparent hover:border-white/20")}>
                <img src={img.thumbnail || img.data} alt={img.prompt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[10px] text-white truncate">{img.prompt.slice(0, 25)}...</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[8px] text-zinc-500">{img.style}</p>
                    {img.hasVideo && <Video size={10} className="text-pink-400" />}
                  </div>
                </div>
                {img.favorite && <div className="absolute top-2 right-2"><Heart size={12} className="text-red-500 fill-red-500" /></div>}
              </motion.div>
            ))}
            {history.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600"><Clock size={32} className="mx-auto mb-2 opacity-50" /><p className="text-sm">No history yet</p></div>}
          </div>
        </div>
      )}

      {/* Editor Mode */}
      {viewMode === 'editor' && activeImage && (
        <div className="flex-1 flex">
          <div className="w-20 border-r border-white/5 flex flex-col items-center py-4 gap-2">
            {(['adjust', 'filters', 'transform', 'inpaint'] as const).map(tab => (
              <button key={tab} onClick={() => setEditorTab(tab)} className={cn("p-2 rounded-lg flex flex-col items-center gap-1", editorTab === tab ? "bg-purple-500/20 text-purple-300" : "text-zinc-500")}>
                {tab === 'adjust' && <SlidersHorizontal size={16} />}
                {tab === 'filters' && <Wand size={16} />}
                {tab === 'transform' && <RotateCcw size={16} />}
                {tab === 'inpaint' && <Edit3 size={16} />}
                <span className="text-[8px] font-bold uppercase">{tab}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 p-4">
            {editorTab === 'adjust' && (
              <div className="space-y-4 max-w-md">
                {Object.entries(adjustments).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500 uppercase"><span>{key}</span><span>{value}</span></div>
                    <input type="range" min={key === 'hue' ? -180 : 0} max={key === 'hue' ? 180 : 200} value={value} onChange={(e) => setAdjustments({ ...adjustments, [key]: parseInt(e.target.value) })} className="w-full accent-purple-500" />
                  </div>
                ))}
              </div>
            )}
            {editorTab === 'filters' && (
              <div className="grid grid-cols-3 gap-2 max-w-md">
                {['none', 'vivid', 'warm', 'cool', 'mono', 'sepia', 'dramatic'].map(f => (
                  <button key={f} onClick={() => applyFilter(f)} className={cn("py-3 rounded text-[10px] font-bold uppercase", selectedFilter === f ? "bg-purple-500/30 text-purple-300" : "bg-white/5 text-zinc-500")}>{f}</button>
                ))}
              </div>
            )}
            {editorTab === 'transform' && (
              <div className="space-y-4 max-w-md">
                <div className="flex gap-2">
                  <button className="flex-1 py-3 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><RotateCcw size={12} /> Rotate 90°</button>
                  <button className="flex-1 py-3 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><FlipHorizontal size={12} /> Flip H</button>
                  <button className="flex-1 py-3 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase flex items-center justify-center gap-1"><FlipVertical size={12} /> Flip V</button>
                </div>
                <div className="flex gap-2">
                  {(['left', 'right', 'up', 'down'] as const).map(dir => (
                    <button key={dir} onClick={() => handleOutpaint(dir as any)} disabled={isProcessing} className="flex-1 py-3 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase flex items-center justify-center gap-1">
                      {dir === 'left' && <ArrowLeft size={12} />}
                      {dir === 'right' && <ArrowRight size={12} />}
                      {dir === 'up' && <ArrowUp size={12} />}
                      {dir === 'down' && <ArrowDown size={12} />}
                      {dir}
                    </button>
                  ))}
                </div>
                <button onClick={() => setAdjustments({ brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sharpen: 0, noise: 0, exposure: 0 })} className="w-full py-2 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase">Reset All</button>
              </div>
            )}
            {editorTab === 'inpaint' && (
              <div className="space-y-4 max-w-md">
                <p className="text-[10px] text-zinc-500">Select an area to edit (mask-based inpainting)</p>
                <input placeholder="Describe what to change..." className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs mb-2" />
                <button onClick={handleInpaint} disabled={isProcessing} className="w-full py-3 rounded-lg bg-purple-500 text-black text-xs font-bold uppercase flex items-center justify-center gap-2">
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Edit3 size={14} />}
                  Apply Inpainting
                </button>
              </div>
            )}
            <div className="mt-6"><div className="aspect-video bg-black/40 rounded-lg overflow-hidden flex items-center justify-center" style={{ maxWidth: '400px' }}><img src={activeImage.data} alt="Preview" className="max-w-full max-h-full object-contain" style={{ filter: getFilterStyle() }} /></div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageStudio;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
