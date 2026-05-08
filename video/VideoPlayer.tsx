import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipForward, SkipBack, Edit3, Download, Video, Zap 
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { VideoData } from './video-types';
import { useVideoRender } from './useVideoRender';
import { SovereignVirtualList } from '../shared/SovereignVirtualList';

interface VideoPlayerProps {
  data?: VideoData;
  status?: string;
  onDataChange?: (updated: VideoData) => void;
}

/**
 * VideoPlayer Component - Feature Sliced
 * Uses factorized render engine and virtualized scene editor.
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({ data: externalData, status }) => {
  const [showEditor, setShowEditor] = useState(false);
  const {
    data,
    isPlaying,
    setIsPlaying,
    progress,
    setProgress,
    activeSceneIndex,
    canvasRef
  } = useVideoRender(externalData);

  const exportVideo = () => {
    alert("Synthesizing .webm export... (Simulated in Sovereign Node)");
  };

  return (
    <div className="w-full bg-[#02020a] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl">
      <StudioHeader 
        title="Video Studio" 
        subtitle="Generative Render • 4K Photonic Out" 
        icon={Video}
        badge={status || 'Ready'}
        badgeColor="rose"
      >
        <SovereignButton variant="primary" size="xs" icon={Download} onClick={exportVideo}>Export</SovereignButton>
      </StudioHeader>

      <div className="aspect-video relative bg-black border-b border-zinc-800">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full object-cover" />
        
        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{data.title}</span>
            <span className="text-[18px] font-mono text-white/80 tabular-nums">
                {Math.floor((progress/100)*60).toString().padStart(2, '0')}:{(Math.floor((progress*10)%60)).toString().padStart(2, '0')}
            </span>
        </div>

        {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <SovereignButton size="lg" icon={Play} onClick={() => setIsPlaying(true)}>Resume</SovereignButton>
            </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Timeline */}
        <div className="relative h-1 bg-zinc-800 rounded-full cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(((e.clientX - rect.left) / rect.width) * 100);
        }}>
           <motion.div 
             className="absolute inset-y-0 left-0 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]" 
             style={{ width: `${progress}%` }}
           />
           {data.scenes.map((s, i) => (
               <div 
                 key={s.id} 
                 className="absolute top-0 w-0.5 h-1.5 bg-zinc-600 -translate-y-1/4" 
                 style={{ left: `${(i / data.scenes.length) * 100}%` }} 
               />
           ))}
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <SovereignButton variant="secondary" size="sm" icon={isPlaying ? Pause : Play} onClick={() => setIsPlaying(!isPlaying)} />
              <SovereignButton variant="ghost" size="sm" icon={SkipBack} onClick={() => setProgress(0)} />
              <SovereignButton variant="ghost" size="sm" icon={SkipForward} onClick={() => setProgress(Math.min(100, progress + 10))} />
           </div>
           
           <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                 <Zap size={12} className="text-amber-500" />
                 <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-tighter">{data.scenes[activeSceneIndex]?.vfx || 'idle'}</span>
              </div>
              <SovereignButton variant="ghost" size="sm" icon={Edit3} onClick={() => setShowEditor(!showEditor)} />
           </div>
        </div>

        <AnimatePresence>
            {showEditor && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-zinc-950/50 rounded-xl border border-zinc-800/50"
                >
                    <div className="p-1">
                        <SovereignVirtualList 
                          items={data.scenes}
                          height={200}
                          itemHeight={60}
                          className="custom-scrollbar"
                          renderItem={(scene, i) => (
                            <div className="p-1">
                              <div className={cn(
                                  "flex items-center gap-3 p-2 rounded-lg border transition-all h-[52px]",
                                  activeSceneIndex === i ? "border-rose-500/30 bg-rose-500/5" : "border-zinc-800 bg-zinc-900/30"
                              )}>
                                  <span className="text-[10px] font-mono text-zinc-600">{scene.time}</span>
                                  <div className="flex-1">
                                      <p className="text-[11px] text-zinc-300 font-bold line-clamp-1">{scene.description}</p>
                                      <p className="text-[9px] text-zinc-500 font-mono uppercase">{scene.vfx}</p>
                                  </div>
                                  <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: `hsl(${scene.color},70%,50%)` }} />
                              </div>
                            </div>
                          )}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};
