import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, Copy, Check, Download, FolderOpen, File, 
  ChevronRight, Maximize2, Minimize2, Search, Cpu 
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { CodeData, CodeFile, LANGUAGE_COLORS } from './code-types';
import { useCodeExplorer } from './useCodeExplorer';
import { upeEngine } from '@/engine/UnifiedProcessingEngine';
import { wavefrontExecutor } from '@/engine/WavefrontExecutor';

const FileTreeNode: React.FC<{
  node: CodeFile;
  depth: number;
  selected: string | null;
  onSelect: (path: string, node: CodeFile) => void;
  path: string;
}> = ({ node, depth, selected, onSelect, path }) => {
  const [open, setOpen] = useState(depth < 1);
  const isSelected = selected === path;

  return (
    <div>
      <button
        onClick={() => {
          if (node.type === 'folder') setOpen(o => !o);
          else onSelect(path, node);
        }}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-xs transition-all duration-200",
          isSelected 
            ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" 
            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30 border border-transparent"
        )}
        style={{ paddingLeft: `${depth * 10 + 8}px` }}
      >
        {node.type === 'folder' ? (
          <>
            <motion.span animate={{ rotate: open ? 90 : 0 }} className="flex-shrink-0">
               <ChevronRight size={12} className="text-zinc-600" />
            </motion.span>
            <FolderOpen size={13} className={cn("flex-shrink-0", open ? "text-indigo-400" : "text-amber-500/80")} />
          </>
        ) : (
          <>
            <span className="w-3 flex-shrink-0" />
            <File size={13} className="text-zinc-600 flex-shrink-0" />
          </>
        )}
        <span className="truncate flex-1 tracking-tight">{node.name}</span>
      </button>
      <AnimatePresence>
        {node.type === 'folder' && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {node.children?.map((child, i) => (
              <FileTreeNode
                key={i}
                node={child}
                depth={depth + 1}
                selected={selected}
                onSelect={onSelect}
                path={`${path}/${child.name}`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CodeStudio: React.FC<{ data?: CodeData; status?: string }> = ({ data: externalData, status }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [coherence, setCoherence] = useState(0.9998);

  const {
    files,
    selectedPath,
    selectedFile,
    searchQuery,
    setSearchQuery,
    language,
    onSelect
  } = useCodeExplorer(externalData);

  const copyContent = useCallback(() => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [selectedFile?.content]);

  const langColor = LANGUAGE_COLORS[language] ?? '#71717a';

  const analyzeModule = async () => {
    if (!selectedFile?.content) return;
    setAnalyzing(true);
    
    // 1. Dispatch Photonic Match Trajectory (UQIS)
    const bundle = `(PH_INTERFERE_ADD (PH_ENTANGLE_MAP "${selectedFile.name}") 1.0)`;
    const res = await upeEngine.dispatch('logic', bundle, 'photonic');
    
    // 2. Parallel Pattern Search
    await wavefrontExecutor.propagate({
      id: `CODE_${selectedFile.name}`,
      ast: ['PH_COHERENCE_GATE', {} as any, 0.9],
      coherence: res.fidelity || 0.99
    });

    setCoherence(res.fidelity || 0.9998);
    setAnalyzing(false);
  };

  return (
    <div className={cn(
      "w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] flex flex-col transition-all duration-700 ease-in-out shadow-2xl",
      expanded ? "fixed inset-8 z-[100] scale-100 opacity-100" : "h-[500px]"
    )}>
      <StudioHeader 
        title="Code Studio" 
        subtitle="Sovereign IDE • Logical Synthesis" 
        icon={Code2}
        badge={status || 'Ready'}
        badgeColor="indigo"
      >
        <div className="flex items-center gap-1.5">
           <SovereignButton variant="ghost" size="xs" onClick={() => setExpanded(!expanded)} icon={expanded ? Minimize2 : Maximize2} />
        </div>
      </StudioHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Explorer Sidebar */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-950/60 flex flex-col">
           <div className="p-4 border-b border-zinc-800/40">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                 <input 
                    placeholder="Search logic..."
                    className="w-full bg-zinc-900 border border-zinc-800/50 rounded-xl py-2 pl-9 pr-3 text-[11px] text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-3 custom-scrollbar flex flex-col gap-1">
              {files.map((node, i) => (
                <FileTreeNode
                  key={i}
                  node={node}
                  depth={0}
                  selected={selectedPath}
                  onSelect={onSelect}
                  path={node.name}
                />
              ))}
           </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-zinc-950/30">
           {selectedFile ? (
             <>
               <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: langColor }} />
                      <span className="text-[12px] font-mono font-bold text-zinc-200 tracking-tight">{selectedFile.name}</span>
                      <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/5 border border-indigo-500/20">PLA_OPTIMIZED</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/40 border border-zinc-700/30">
                         <Cpu size={10} className={cn("text-zinc-500", analyzing && "animate-pulse text-indigo-400")} />
                         <span className="text-[8px] font-mono text-zinc-500">UPIS_SYNC: {coherence.toFixed(4)}</span>
                      </div>
                      <button 
                        onClick={analyzeModule}
                        className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-mono transition-all",
                          analyzing ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-zinc-800 text-zinc-400 border border-zinc-700/30 hover:bg-zinc-700"
                        )}
                      >
                        {analyzing ? 'ANALYZING...' : 'RE-SCAN'}
                      </button>
                      <button onClick={copyContent} className="text-zinc-500 hover:text-zinc-200 transition-all p-1.5 rounded-lg hover:bg-zinc-800">
                         {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={15} />}
                      </button>
                      <SovereignButton variant="secondary" size="xs" icon={Download}>Export</SovereignButton>
                   </div>
               </div>
               <div className="flex-1 overflow-auto p-6 font-mono text-[13px] text-zinc-400 custom-scrollbar whitespace-pre leading-[1.6] select-text selection:bg-indigo-500/30 scroll-smooth">
                  <span className="text-zinc-700 pointer-events-none select-none inline-block w-8 mr-4 text-right border-r border-zinc-800 pr-4">1</span>
                  {selectedFile.content || "// No logical manifest present"}
               </div>
             </>
           ) : (
             <div className="flex-1 flex items-center justify-center flex-col text-zinc-600 gap-6">
                <div className="relative">
                   <div className="w-20 h-20 rounded-[2rem] border border-zinc-800 bg-zinc-900/40 flex items-center justify-center animate-pulse">
                      <Cpu size={40} className="text-zinc-700" />
                   </div>
                   <div className="absolute inset-0 bg-indigo-500/5 blur-3xl animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                   <p className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-700">NEURAL_READY</p>
                   <p className="text-xs text-zinc-600 italic">Select a module to interface with its code substrate</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
