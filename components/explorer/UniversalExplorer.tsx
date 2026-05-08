import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Folder, 
  File, 
  Image as ImageIcon, 
  Video, 
  Box, 
  FileText,
  Search,
  Download,
  Share2
} from 'lucide-react';
import { VirtualFile } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UniversalExplorerProps {
  files: VirtualFile[];
  onClose: () => void;
  projectName?: string;
}

export const UniversalExplorer: React.FC<UniversalExplorerProps> = ({ files, onClose, projectName }) => {
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(files[0] || null);
  const [viewMode, setViewMode] = useState<'split' | 'full'>('split');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return <ImageIcon size={14} />;
    if (['mp4', 'webm', 'mov'].includes(ext || '')) return <Video size={14} />;
    if (['obj', 'stl', 'fbx', 'gltf'].includes(ext || '')) return <Box size={14} />;
    return <FileText size={14} />;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#030303] flex flex-col font-sans sovereign-grid"
    >
      {/* Top Bar */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{projectName || 'ULTRA-PRIME_VFS_V9.1'}</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 text-violet-400">SYNAPTIC_INDEXING: ACTIVE</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <nav className="flex gap-2">
             <button 
               onClick={() => setViewMode('split')}
               className={cn("p-2 rounded-lg transition-all", viewMode === 'split' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
             >
               <Maximize2 size={14} />
             </button>
             <button 
               onClick={() => setViewMode('full')}
               className={cn("p-2 rounded-lg transition-all", viewMode === 'full' ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300")}
             >
               <Minimize2 size={14} />
             </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-600/10 border border-violet-600/20 rounded-lg text-[10px] font-bold text-violet-400 hover:bg-violet-600/20 transition-all">
               <Download size={12} />
               DUMP_VFS_BUNDLE
            </button>
           <button 
             onClick={onClose}
             className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all text-zinc-500"
           >
             <X size={16} />
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Explorer */}
        <AnimatePresence>
          {viewMode === 'split' && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-white/5 bg-black/20 flex flex-col"
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter manifest..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
                 <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Workspace_Files</div>
                 {filteredFiles.map((file, fi) => (
                   <button
                     key={fi}
                     onClick={() => setSelectedFile(file)}
                     className={cn(
                       "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left",
                       selectedFile === file ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100" : "text-zinc-500 hover:bg-white/5"
                     )}
                   >
                     <span className={cn("transition-colors", selectedFile === file ? "text-indigo-400" : "text-zinc-600")}>
                        {getFileIcon(file.name)}
                     </span>
                     <span className="text-xs truncate">{file.name}</span>
                   </button>
                 ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Viewer */}
        <main className="flex-1 bg-black/40 relative overflow-hidden flex flex-col">
           {selectedFile ? (
             <>
               <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
                  <div className="max-w-4xl mx-auto space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                           <h2 className="text-2xl font-bold tracking-tighter text-white ultra-glow-text">{selectedFile.name}</h2>
                           <span className="text-[10px] font-mono text-violet-400/60 uppercase">Path: sovereign-vfs://root/${selectedFile.name}</span>
                        </div>
                        <div className="flex gap-2">
                           <button className="p-2 bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"><Share2 size={16} /></button>
                        </div>
                     </div>

                     <div className="glass-panel rounded-3xl min-h-[500px] border border-white/5 p-8 relative group hover:glass-panel-glow transition-all">
                        {/* High-Fidelity Content Rendering */}
                        <pre className="font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                           {selectedFile.content}
                        </pre>
                     </div>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-600 italic">
                <Folder size={48} className="opacity-20 translate-y-4" />
                <span>Select a file from the Sovereign manifest to begin inspection.</span>
             </div>
           )}
        </main>
      </div>
    </motion.div>
  );
};
