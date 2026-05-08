import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderOpen, FileCode, FileText, Database, ChevronRight, Brain, Wifi } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkspaceFile {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
}

export const ContextExplorer = ({ isOpen }: { isOpen: boolean }) => {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [brainData, setBrainData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadWorkspace();
      loadBrainStorage();
    }
  }, [isOpen]);

  const loadBrainStorage = () => {
    try {
      const saved = localStorage.getItem('quantum_brain_storage');
      if (saved) {
        setBrainData(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load brain storage', e);
    }
  };

  const loadWorkspace = async () => {
    const mockFiles: WorkspaceFile[] = [
      { name: 'src', type: 'folder', path: '/src' },
      { name: 'InferenceEngine.ts', type: 'file', path: '/src/InferenceEngine.ts', size: 14000 },
      { name: 'types.ts', type: 'file', path: '/src/types.ts', size: 2400 },
      { name: 'constants.ts', type: 'file', path: '/src/constants.ts', size: 850 },
      { name: 'App.tsx', type: 'file', path: '/src/App.tsx', size: 18500 },
      { name: 'components', type: 'folder', path: '/src/components' },
      { name: 'package.json', type: 'file', path: '/package.json', size: 1200 },
    ];
    setFiles(mockFiles);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-24 w-72 max-h-[60vh] glass-blur border border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col"
    >
      <div className="p-4 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-indigo-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Context_Explorer</span>
          <div className="ml-auto flex items-center gap-1">
            <Wifi size={10} className="text-green-400 animate-pulse" />
            <span className="text-[8px] text-green-400">ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        <div className="space-y-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase">Workspace</span>
          {files.map((f, i) => (
            <div 
              key={i}
              onClick={() => setActiveFile(f.path)}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all group",
                activeFile === f.path ? "bg-indigo-500/20" : "hover:bg-white/5"
              )}
            >
              {f.type === 'folder' ? (
                <FolderOpen size={12} className="text-amber-400" />
              ) : f.name.endsWith('.ts') || f.name.endsWith('.tsx') ? (
                <FileCode size={12} className="text-blue-400" />
              ) : (
                <FileText size={12} className="text-slate-400" />
              )}
              <span className="text-[10px] font-medium text-slate-300 flex-1 truncate">{f.name}</span>
              {f.size && <span className="text-[8px] text-slate-600 font-mono">{(f.size/1024).toFixed(1)}kb</span>}
            </div>
          ))}
        </div>

        {Object.keys(brainData).length > 0 && (
          <div className="space-y-1 pt-2 border-t border-white/5">
            <span className="text-[8px] font-mono text-slate-500 uppercase">Quantum_Brain_Storage</span>
            {Object.entries(brainData).slice(0, 5).map(([key, val], i) => (
              <div key={i} className="p-2 rounded-lg bg-white/5">
                <span className="text-[9px] text-indigo-400 font-mono">{key}</span>
                <p className="text-[8px] text-slate-500 truncate mt-1">{val.substring(0, 50)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
