import { motion, AnimatePresence } from 'motion/react';
import { AGENTS } from '@/constants';
import { MessageCircle, Zap, ShieldCheck, Code2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Commentary {
  agentId: string;
  text: string;
  type: 'info' | 'warning' | 'success';
}

export const AgentCommentary = ({ activeCommentary }: { activeCommentary?: Commentary }) => {
  if (!activeCommentary) return null;

  const agent = AGENTS[activeCommentary.agentId];
  if (!agent) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      className="absolute bottom-full left-4 mb-4 z-50 pointer-events-none"
    >
      <div className={cn(
        "relative p-4 rounded-2xl shadow-2xl border flex flex-col gap-2 min-w-[200px] max-w-[300px] glass-blur",
        activeCommentary.type === 'warning' ? "border-amber-500/30" : "border-indigo-500/30"
      )}>
        {/* Pointer */}
        <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#0a0a0b] rotate-45 border-r border-b border-white/5" />
        
        <div className="flex items-center gap-2">
          <agent.icon className={cn("w-3 h-3", agent.color)} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{agent.name}</span>
        </div>
        <p className="text-[11px] font-medium leading-relaxed text-slate-200 italic">
          "{activeCommentary.text}"
        </p>
        
        <div className="flex justify-end">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse [animation-delay:0.2s]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
