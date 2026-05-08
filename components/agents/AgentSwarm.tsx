import { motion } from 'motion/react';
import { AGENTS } from '@/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AgentSwarm = ({ activeAgentId, focus }: { activeAgentId?: string, focus?: string }) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
      <div className="w-full flex justify-between items-center mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active_Agent_Swarm</span>
          {focus && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[8px] font-mono text-indigo-400 uppercase mt-1"
            >
              Focus: {focus}
            </motion.span>
          )}
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
          <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
      </div>
      {Object.values(AGENTS).map((agent) => (
        <motion.div
          key={agent.id}
          animate={{ 
            scale: activeAgentId === agent.id ? 1.1 : 1,
            opacity: activeAgentId === agent.id ? 1 : 0.4,
            borderColor: activeAgentId === agent.id ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'
          }}
          className={cn(
            "p-2 rounded-xl border flex items-center gap-2 transition-all duration-500",
            activeAgentId === agent.id ? "bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "bg-transparent"
          )}
        >
          <agent.icon className={cn("w-3 h-3", agent.color)} />
          <span className="text-[9px] font-mono text-slate-300">{agent.name}</span>
        </motion.div>
      ))}
    </div>
  );
};
