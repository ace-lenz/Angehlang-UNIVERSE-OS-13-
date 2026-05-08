import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ImageIcon, Maximize2, Download, Share2, Sparkles, Filter, 
  Trash2, Plus, Zap, Heart, Grid, List as ListIcon
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { ImageGalleryData } from '@/types';

interface ImageGalleryProps {
  data?: ImageGalleryData;
  status?: string;
}

const STYLE_PRESETS = [
  { id: 'cinematic', name: 'Cinematic', icon: '🎬', prompt: 'highly detailed, cinematic lighting, 8k, unreal engine' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌃', prompt: 'neon glow, futuristic, high tech, low life, aesthetic' },
  { id: 'surreal', name: 'Surreal', icon: '🌀', prompt: 'dreamlike, melting reality, vibrant, Salvador Dali style' },
  { id: 'sketch', name: 'Sketch', icon: '✏️', prompt: 'pencil drawing, charcoal, hand-drawn, paper texture' },
  { id: 'vaporwave', name: 'Vaporwave', icon: '🌴', prompt: '90s aesthetic, pastel pink, glitch art, retro futuristic' },
];

/**
 * ImageGallery - Feature Sliced
 * Enhanced with style node variations and polished preview substrate.
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({ data, status }) => {
  const [selectedStyle, setSelectedStyle] = useState(STYLE_PRESETS[0].id);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [prompts, setPrompts] = useState(data?.prompts || [
    { id: '1', prompt: "Quantum convergence at the edge of the void", style: "cinematic", timestamp: Date.now() },
    { id: '2', prompt: "Neural architectures blooming in silicon gardens", style: "cyberpunk", timestamp: Date.now() - 3600000 },
  ]);

  const activeStyleConfig = useMemo(() => 
    STYLE_PRESETS.find(s => s.id === selectedStyle), [selectedStyle]
  );

  return (
    <div className="w-full bg-[#02020a] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl h-[650px]">
      <StudioHeader 
        title="Image Studio" 
        subtitle="Prompt Synthesis • Latent Space Explorer" 
        icon={ImageIcon}
        badge={status || 'Ready'}
        badgeColor="rose"
      >
        <div className="flex items-center gap-2">
           <SovereignButton variant="secondary" size="xs" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} icon={viewMode === 'grid' ? ListIcon : Grid} />
           <SovereignButton variant="primary" size="xs" icon={Plus}>Generate</SovereignButton>
        </div>
      </StudioHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Style Sidebar */}
        <div className="w-56 border-r border-zinc-900 bg-zinc-950/40 flex flex-col p-4 space-y-4">
           <div className="flex flex-col gap-1 mb-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Style Layers</span>
           </div>
           <div className="space-y-2">
              {STYLE_PRESETS.map(style => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border",
                    selectedStyle === style.id 
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                      : "bg-zinc-900/40 border-transparent text-zinc-600 hover:text-zinc-400 hover:border-zinc-800"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{style.icon}</span>
                    {style.name}
                  </span>
                  {selectedStyle === style.id && <Zap size={10} className="text-rose-400 fill-rose-400" />}
                </button>
              ))}
           </div>
        </div>

        {/* Gallery Content */}
        <div className="flex-1 bg-black/20 overflow-y-auto custom-scrollbar p-6">
           <div className={cn(
             "grid gap-4",
             viewMode === 'grid' ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
           )}>
              {prompts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative rounded-2xl border border-zinc-900 bg-zinc-950/40 overflow-hidden hover:border-rose-500/20 transition-all aspect-square"
                >
                  {/* Procedural Fallback Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-6 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <Sparkles size={24} className="text-zinc-800" />
                        <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[150px] line-clamp-3">"{p.prompt}"</p>
                     </div>
                  </div>

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm flex flex-col justify-between p-4">
                     <div className="flex justify-end gap-2">
                        <button className="p-2 rounded-lg bg-zinc-900/80 text-white hover:bg-rose-500 transition-all"><Heart size={14} /></button>
                        <button className="p-2 rounded-lg bg-zinc-900/80 text-white hover:bg-indigo-500 transition-all"><Download size={14} /></button>
                     </div>
                     <div className="space-y-1">
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{p.style}</span>
                        <p className="text-[11px] text-white font-bold line-clamp-2">{p.prompt}</p>
                     </div>
                  </div>
                </motion.div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
