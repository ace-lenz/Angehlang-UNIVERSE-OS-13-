import { motion, AnimatePresence } from 'motion/react';
import { Search, Globe, Zap, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const VisualSearchPulse = ({ isSearching, query }: { isSearching: boolean, query?: string }) => {
  return (
    <AnimatePresence>
      {isSearching && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex items-center gap-3 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
        >
          <div className="relative">
            <Search size={14} className="text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-indigo-500 blur-md opacity-40 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Knowledge_Pulse_Active</span>
            {query && (
              <span className="text-[8px] font-mono text-slate-500 truncate max-w-[150px]">
                GET: https://grounding.universe.os/q?={query}
              </span>
            )}
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-1 h-3 bg-indigo-500/40 rounded-full animate-[shimmer_1s_infinite]" />
            <div className="w-1 h-4 bg-indigo-500/60 rounded-full animate-[shimmer_1.2s_infinite]" />
            <div className="w-1 h-2 bg-indigo-500/40 rounded-full animate-[shimmer_1.4s_infinite]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
