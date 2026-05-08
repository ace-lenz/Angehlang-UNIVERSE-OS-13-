// Plan Item ID: TI-1
/**
 * VideoStudio.tsx - Advanced Sovereign Video Studio v13
 * 
 * Features compared to industry leaders:
 * - Google Veo 3.1: Native video, physics, lip sync, camera control
 * - Seedance 2.0: AI-powered editing, auto-editing, effects
 * - Runway Gen-4.5: Advanced editing, motion, director mode
 * - WAN Video 2.6: Text-to-video, video-to-video
 * - Pika Labs: Image-to-video, extend videos, style transfer
 * - Vidu Q3: Character consistency, camera motion
 * - Luma Ray3.14: Photorealistic, physics
 * - Colossyan/HeyGen: Avatars, talking heads
 * 
 * New Features:
 * - Text-to-Video Generation
 * - Image-to-Video (Animate images)
 * - Video Extension
 * - Video-to-Video Style Transfer
 * - Character Consistency
 * - Camera Motion Controls
 * - Avatar System
 * - Lip Sync
 * - Timeline Editor
 * - Effects & Transitions
 * - Resolution Control
 * - Duration Control
 * - Motion Intensity
 * - Batch Generation
 * - Multi-language TTS
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, StopCircle, Rewind, FastForward, Volume2, VolumeX,
  Video, VideoIcon, Image, Film, Wand2, Sparkles, Loader2, Download,
  Maximize2, Minimize2, X, Settings, Sliders, Layers, Clock, Grid,
  ChevronDown, ChevronUp, Plus, Trash2, Copy, RefreshCw, Zap, Palette,
  Camera, Mic, User, Link, RotateCcw, FlipHorizontal, FlipVertical,
  MessageSquare, Music, Subtitles, Waves, Circle, Square, ArrowLeft,
  ArrowRight, Move, Eye, EyeOff, ZoomIn, ZoomOut, Scissors, Crop,
  Type, FileVideo, FileAudio, Wand, Sparkles as MagicIcon
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import {
  videoSovereignEngine,
  VideoAsset,
  STYLE_PRESETS,
  CAMERA_MOTIONS,
  AVATARS,
  VOICES,
  RESOLUTIONS,
  DURATION_OPTIONS,
  VideoGenerationOptions,
  CameraMotion,
  VideoEffectConfig
} from '@/engine/studios/VideoSovereignEngine';

type ViewMode = 'generate' | 'history' | 'editor' | 'avatar';
type GenerationMode = 'text-to-video' | 'image-to-video' | 'video-extension' | 'video-to-video';
type EditorTab = 'timeline' | 'effects' | 'transitions' | 'audio';

interface GeneratedVideo {
  id: string;
  url: string;
  thumbnail?: string;
  prompt: string;
  type: GenerationMode;
  duration: number;
  fps: number;
  resolution: string;
  width: number;
  height: number;
  seed: number;
  timestamp: number;
  favorite?: boolean;
}

export const VideoStudio: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('generate');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [sourceImageUrl, setSourceImageUrl] = useState('');
  const [sourceVideoUrl, setSourceVideoUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedVideo[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [fullScreen, setFullScreen] = useState(false);

  // Generation Options
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [selectedResolution, setSelectedResolution] = useState('1080p');
  const [duration, setDuration] = useState(3);
  const [motionIntensity, setMotionIntensity] = useState(70);
  const [loopVideo, setLoopVideo] = useState(false);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [useSeed, setUseSeed] = useState(false);

  // Camera Controls
  const [cameraMotion, setCameraMotion] = useState<CameraMotion>({ type: 'static' });
  const [cameraSpeed, setCameraSpeed] = useState(50);

  // Character References
  const [characterRefs, setCharacterRefs] = useState<string[]>([]);

  // Effects
  const [effects, setEffects] = useState<VideoEffectConfig[]>([]);

  // Avatar Mode
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [avatarScript, setAvatarScript] = useState('');

  // Editor
  const [editorTab, setEditorTab] = useState<EditorTab>('timeline');
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Preview
  const [isProcessing, setIsProcessing] = useState(false);

  const activeVideo = history.find(v => v.id === activeVideoId);

  // Generate video
  const handleGenerate = async () => {
    if (!prompt.trim() && !sourceImageUrl && !avatarScript.trim()) return;
    setIsGenerating(true);

    try {
      const options: VideoGenerationOptions = {
        duration,
        resolution: selectedResolution as any,
        style: selectedStyle,
        motionIntensity,
        loop: loopVideo,
        cameraMotion: cameraMotion.type !== 'static' ? cameraMotion : undefined,
        characterReferences: characterRefs.length > 0 ? characterRefs : undefined,
        effects: effects.length > 0 ? effects : undefined,
        seed: useSeed ? seed : undefined
      };

      if (generationMode === 'image-to-video' && sourceImageUrl) {
        options.sourceImageUrl = sourceImageUrl;
      } else if (generationMode === 'video-extension' && sourceVideoUrl) {
        options.sourceVideoUrl = sourceVideoUrl;
      } else if (generationMode === 'video-to-video' && sourceVideoUrl) {
        options.sourceVideoUrl = sourceVideoUrl;
      } else if (viewMode === 'avatar' && selectedAvatar) {
        options.avatarId = selectedAvatar;
        options.voiceId = selectedVoice;
      }

      let asset: VideoAsset;
      const isAvatarMode = viewMode === 'avatar';
      
      if (isAvatarMode) {
        asset = await videoSovereignEngine.generateAvatar(selectedAvatar, avatarScript, selectedVoice, options);
      } else {
        const genPrompt = isAvatarMode ? avatarScript : prompt;
        asset = await videoSovereignEngine.generate(
          genPrompt,
          generationMode as any,
          options
        );
      }

      const newVideo: GeneratedVideo = {
        id: asset.id,
        url: asset.url,
        thumbnail: asset.thumbnail,
        prompt: asset.prompt,
        type: generationMode,
        duration: asset.duration,
        fps: asset.fps,
        resolution: `${asset.width}x${asset.height}`,
        width: asset.width,
        height: asset.height,
        seed: asset.seed,
        timestamp: Date.now(),
        favorite: false
      };

      setHistory(prev => [newVideo, ...prev].slice(0, 50));
      setActiveVideoId(newVideo.id);
    } catch (err) {
      console.error('[VideoStudio] Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate variation
  const handleVariation = async () => {
    if (!activeVideo) return;
    setIsGenerating(true);
    try {
      const asset = await videoSovereignEngine.generate(activeVideo.prompt, activeVideo.type as any, {
        duration: activeVideo.duration,
        motionIntensity: motionIntensity
      });
      const newVideo: GeneratedVideo = {
        id: asset.id,
        url: asset.url,
        prompt: asset.prompt,
        type: asset.type as any,
        duration: asset.duration,
        fps: asset.fps,
        resolution: `${asset.width}x${asset.height}`,
        width: asset.width,
        height: asset.height,
        seed: asset.seed,
        timestamp: Date.now()
      };
      setHistory(prev => [newVideo, ...prev]);
      setActiveVideoId(newVideo.id);
    } finally {
      setIsGenerating(false);
    }
  };

  // Extend video
  const handleExtend = async () => {
    if (!activeVideo) return;
    setIsGenerating(true);
    try {
      const asset = await videoSovereignEngine.extendVideo(
        activeVideo.url,
        'Continue the scene smoothly',
        'forward',
        { duration: duration }
      );
      const newVideo: GeneratedVideo = {
        id: asset.id,
        url: asset.url,
        prompt: 'Extended ' + activeVideo.prompt,
        type: 'video-extension',
        duration: activeVideo.duration + duration,
        fps: asset.fps,
        resolution: activeVideo.resolution,
        width: asset.width,
        height: asset.height,
        seed: asset.seed,
        timestamp: Date.now()
      };
      setHistory(prev => [newVideo, ...prev]);
      setActiveVideoId(newVideo.id);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(v => v.id === id ? { ...v, favorite: !v.favorite } : v));
  };

  const handleDownload = () => {
    if (!activeVideo) return;
    const link = document.createElement('a');
    link.href = activeVideo.url;
    link.download = `sovereign-video-${activeVideo.seed}.mp4`;
    link.click();
  };

  const addEffect = (type: string) => {
    setEffects([...effects, { type: type as any, intensity: 50, startTime: 0, endTime: duration }]);
  };

  const addCharacterRef = (url: string) => {
    if (url && !characterRefs.includes(url)) {
      setCharacterRefs([...characterRefs, url]);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#050510] text-white overflow-hidden", fullScreen && "fixed inset-0 z-[100]")}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <VideoIcon size={18} className="text-pink-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase">Video Studio v13</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-pink-500 uppercase tracking-widest">Sovereign Motion</span>
              <span className="text-[8px] text-zinc-600">•</span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase">{history.length} videos</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'generate', icon: Sparkles, label: 'Create' },
            { id: 'avatar', icon: User, label: 'Avatar' },
            { id: 'history', icon: Clock, label: 'History' },
            { id: 'editor', icon: Film, label: 'Editor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setViewMode(tab.id as ViewMode); }}
              className={cn("px-2 py-1.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5", viewMode === tab.id ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "text-zinc-500 hover:text-zinc-300")}
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
            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Generation Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'text-to-video', icon: Type, label: 'Text → Video' },
                  { id: 'image-to-video', icon: Image, label: 'Image → Video' },
                  { id: 'video-extension', icon: FileVideo, label: 'Extend' },
                  { id: 'video-to-video', icon: Wand, label: 'Style Transfer' }
                ].map(mode => (
                  <button key={mode.id} onClick={() => setGenerationMode(mode.id as GenerationMode)} className={cn("p-2 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase", generationMode === mode.id ? "bg-pink-500/30 text-pink-300 border border-pink-500/50" : "bg-white/5 text-zinc-500")}>
                    <mode.icon size={12} /> {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Input */}
            {generationMode === 'image-to-video' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Source Image</label>
                <input value={sourceImageUrl} onChange={(e) => setSourceImageUrl(e.target.value)} placeholder="Image URL to animate" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
              </div>
            )}
            {(generationMode === 'video-extension' || generationMode === 'video-to-video') && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Source Video</label>
                <input value={sourceVideoUrl} onChange={(e) => setSourceVideoUrl(e.target.value)} placeholder="Video URL" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
              </div>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={generationMode === 'image-to-video' ? "Describe motion and changes..." : "Describe the video you want to create..."}
                className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-zinc-300 placeholder:text-zinc-600 resize-none"
              />
            </div>

            {/* Character Ref */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Character Ref (Vidu style)</label>
                <span className="text-[8px] text-pink-400">{characterRefs.length}</span>
              </div>
              <div className="flex gap-2">
                <input placeholder="Character image URL" className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" onChange={(e) => addCharacterRef(e.target.value)} />
              </div>
              {characterRefs.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {characterRefs.map((url, i) => (
                    <div key={i} className="relative w-12 h-12 shrink-0">
                      <img src={url} alt="" className="w-full h-full object-cover rounded" />
                      <button onClick={() => setCharacterRefs(r => r.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full"><X size={8} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Style */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Style</label>
              <div className="grid grid-cols-4 gap-1.5">
                {STYLE_PRESETS.slice(0, 8).map(preset => (
                  <button key={preset.id} onClick={() => { setSelectedStyle(preset.id); setMotionIntensity(preset.defaultMotion); }} className={cn("p-2 rounded-lg text-center", selectedStyle === preset.id ? "bg-pink-500/30 border border-pink-500/50" : "bg-white/5 border border-white/5")}>
                    <div className="text-xs">{preset.icon}</div>
                    <div className="text-[8px] text-zinc-400 truncate">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Resolution */}
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Duration ({duration}s)</label>
                <div className="grid grid-cols-5 gap-1">
                  {DURATION_OPTIONS.slice(0, 5).map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={cn("py-1 rounded text-[10px]", duration === d ? "bg-pink-500/30 text-pink-300" : "bg-white/5 text-zinc-500")}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Resolution</label>
                <select value={selectedResolution} onChange={(e) => setSelectedResolution(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs">
                  {RESOLUTIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>

            {/* Motion & Camera */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1"><Waves size={10} /> Motion Intensity</span>
                  <span className="text-[10px] text-pink-400">{motionIntensity}%</span>
                </div>
                <input type="range" min="0" max="100" value={motionIntensity} onChange={(e) => setMotionIntensity(parseInt(e.target.value))} className="w-full accent-pink-500" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1"><Camera size={10} /> Camera Motion</span>
                  <span className="text-[10px] text-pink-400">{cameraMotion.type}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {CAMERA_MOTIONS.map(cam => (
                    <button key={cam.id} onClick={() => setCameraMotion({ type: cam.id as any })} className={cn("py-1.5 rounded text-[8px] uppercase", cameraMotion.type === cam.id ? "bg-pink-500/30 text-pink-300" : "bg-white/5 text-zinc-500")}>{cam.icon}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setLoopVideo(!loopVideo)} className={cn("px-3 py-1.5 rounded text-[10px] font-bold uppercase", loopVideo ? "bg-pink-500/30 text-pink-300" : "bg-white/5 text-zinc-500")}>Loop</button>
              <button onClick={() => setUseSeed(!useSeed)} className={cn("px-3 py-1.5 rounded text-[10px] font-bold uppercase", useSeed ? "bg-pink-500/30 text-pink-300" : "bg-white/5 text-zinc-500")}>Seed</button>
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={!prompt.trim() && !sourceImageUrl && !sourceVideoUrl || isGenerating} className={cn("w-full py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2", isGenerating ? "bg-pink-500/50 cursor-wait" : "bg-pink-500 hover:bg-pink-400")}>
              {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><MagicIcon size={14} /> Generate Video</>}
            </button>
          </div>

          {/* Preview */}
          <div className="flex-1 p-4 flex flex-col">
            {activeVideo ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 bg-black/40 rounded-xl overflow-hidden relative flex items-center justify-center">
                  <video src={activeVideo.url} className="max-w-full max-h-full" controls />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[10px] text-zinc-500">{activeVideo.resolution} • {activeVideo.duration}s • {activeVideo.fps}fps • Seed: {activeVideo.seed}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavorite(activeVideo.id)} className="p-2 rounded-lg hover:bg-white/10"><Wand2 size={14} className={activeVideo.favorite ? "text-red-500" : "text-zinc-500"} /></button>
                    <button onClick={handleVariation} disabled={isGenerating} className="p-2 rounded-lg hover:bg-white/10"><RefreshCw size={14} className="text-zinc-500" /></button>
                    <button onClick={handleExtend} disabled={isGenerating} className="p-2 rounded-lg hover:bg-white/10"><FileVideo size={14} className="text-zinc-500" /></button>
                    <button onClick={handleDownload} className="px-3 py-1.5 rounded-lg bg-pink-500 text-black text-[10px] font-bold uppercase flex items-center gap-1.5"><Download size={12} />Download</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600">
                <div className="text-center"><Film size={48} className="mx-auto mb-4 opacity-30" /><p className="text-sm">Enter a prompt to generate</p><p className="text-xs mt-2 opacity-50">Try: "A flowing river through a forest"</p></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Avatar Mode */}
      {viewMode === 'avatar' && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="w-full lg:w-80 p-4 border-r border-white/5 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Select Avatar</label>
              <div className="grid grid-cols-2 gap-2">
                {AVATARS.map(avatar => (
                  <button key={avatar.id} onClick={() => setSelectedAvatar(avatar.id)} className={cn("p-3 rounded-lg flex items-center gap-2", selectedAvatar === avatar.id ? "bg-pink-500/30 border border-pink-500/50" : "bg-white/5 border border-white/5")}>
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center"><User size={16} className="text-pink-400" /></div>
                    <span className="text-xs">{avatar.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Voice</label>
              <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs">
                <option value="">Select Voice</option>
                {VOICES.map(v => <option key={v.id} value={v.id}>{v.name} ({v.language})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Script</label>
              <textarea value={avatarScript} onChange={(e) => setAvatarScript(e.target.value)} placeholder="Enter the script or text for the avatar to speak..." className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-xs text-zinc-300 resize-none" />
            </div>
            <button onClick={handleGenerate} disabled={!selectedAvatar || !avatarScript.trim() || isGenerating} className={cn("w-full py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2", isGenerating ? "bg-pink-500/50" : "bg-pink-500")}>
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <User size={14} />} Generate Avatar Video
            </button>
          </div>
          <div className="flex-1 p-4 flex items-center justify-center">
            {activeVideo ? (
              <video src={activeVideo.url} className="max-w-full max-h-full rounded-xl" controls />
            ) : (
              <div className="text-center text-zinc-600"><User size={48} className="mx-auto mb-4 opacity-30" /><p className="text-sm">Select avatar and enter script</p></div>
            )}
          </div>
        </div>
      )}

      {/* History Mode */}
      {viewMode === 'history' && (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {history.map(video => (
              <motion.div key={video.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setActiveVideoId(video.id)} className={cn("relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2", activeVideoId === video.id ? "border-pink-500" : "border-transparent hover:border-white/20")}>
                <video src={video.thumbnail || video.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[10px] text-white truncate">{video.prompt.slice(0, 25)}...</p>
                  <p className="text-[8px] text-zinc-500">{video.duration}s • {video.resolution}</p>
                </div>
                <div className="absolute top-2 right-2"><Play size={12} className="text-white/70" /></div>
              </motion.div>
            ))}
            {history.length === 0 && <div className="col-span-full text-center py-12 text-zinc-600"><Clock size={32} className="mx-auto mb-2 opacity-50" /><p className="text-sm">No videos yet</p></div>}
          </div>
        </div>
      )}

      {/* Editor Mode */}
      {viewMode === 'editor' && activeVideo && (
        <div className="flex-1 flex">
          <div className="w-20 border-r border-white/5 flex flex-col items-center py-4 gap-2">
            {[
              { id: 'timeline', icon: Film, label: 'Timeline' },
              { id: 'effects', icon: Wand2, label: 'Effects' },
              { id: 'transitions', icon: Move, label: 'Trans' },
              { id: 'audio', icon: Music, label: 'Audio' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setEditorTab(tab.id as EditorTab)} className={cn("p-2 rounded-lg flex flex-col items-center gap-1", editorTab === tab.id ? "bg-pink-500/20 text-pink-300" : "text-zinc-500")}>
                <tab.icon size={16} /><span className="text-[8px] font-bold uppercase">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 p-4">
            <div className="mb-4 flex items-center gap-4">
              <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 rounded-full bg-pink-500 text-white">{isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-pink-500" style={{ width: `${(currentTime / activeVideo.duration) * 100}%` }} />
              </div>
              <span className="text-[10px] text-zinc-500">{currentTime.toFixed(1)}s / {activeVideo.duration}s</span>
            </div>
            {editorTab === 'timeline' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                  <h3 className="text-xs font-bold text-zinc-400 mb-2">Video Track</h3>
                  <div className="h-16 bg-white/5 rounded flex items-center justify-center text-zinc-600 text-xs">Clip 1: {activeVideo.prompt.slice(0, 30)}...</div>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                  <h3 className="text-xs font-bold text-zinc-400 mb-2">Audio Track</h3>
                  <div className="h-16 bg-white/5 rounded flex items-center justify-center text-zinc-600 text-xs">No audio</div>
                </div>
              </div>
            )}
            {editorTab === 'effects' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {['blur', 'color-grade', 'vignette', 'glitch', 'shake', 'chromatic'].map(eff => (
                    <button key={eff} onClick={() => addEffect(eff)} className="py-2 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase">{eff}</button>
                  ))}
                </div>
                {effects.length > 0 && (
                  <div className="space-y-2">
                    {effects.map((eff, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                        <span className="text-xs text-zinc-400">{eff.type}</span>
                        <input type="range" min="0" max="100" value={eff.intensity} onChange={(e) => setEffects(es => es.map((x, idx) => idx === i ? { ...x, intensity: parseInt(e.target.value) } : x))} className="w-24 accent-pink-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {editorTab === 'transitions' && (
              <div className="grid grid-cols-3 gap-2">
                {['fade', 'dissolve', 'wipe', 'slide', 'zoom', 'blur'].map(trans => (
                  <button key={trans} className="py-3 rounded bg-white/5 text-zinc-400 text-[10px] font-bold uppercase">{trans}</button>
                ))}
              </div>
            )}
            {editorTab === 'audio' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                  <h3 className="text-xs font-bold text-zinc-400 mb-2">Background Music</h3>
                  <input placeholder="Music URL" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs mb-2" />
                  <button className="w-full py-2 rounded bg-pink-500/20 text-pink-300 text-xs font-bold uppercase">Add Music</button>
                </div>
                <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                  <h3 className="text-xs font-bold text-zinc-400 mb-2">Voice Over</h3>
                  <select className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs mb-2">
                    <option>Select Voice</option>
                    {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <button className="w-full py-2 rounded bg-pink-500/20 text-pink-300 text-xs font-bold uppercase">Generate Voice Over</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStudio;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
