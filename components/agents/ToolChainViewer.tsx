import { motion, AnimatePresence } from 'motion/react';
import { Database, Zap, Cpu, Search, Code2, ArrowRight, Activity, Terminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolNode {
  id: string;
  name: string;
  type: 'search' | 'coder' | 'calculator' | 'image' | 'video' | '3d' | 'bio' | 'automation' | 'research' | 'music';
  input: string;
  output: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  confidence?: number;
}

const ToolIcon = ({ type, size = 18 }: { type: ToolNode['type'], size?: number }) => {
  const iconMap = {
    search: <Search size={size} />,
    coder: <Code2 size={size} />,
    calculator: <Cpu size={size} />,
    image: <Zap size={size} />,
    video: <Activity size={size} />,
    '3d': <Database size={size} />,
    bio: <Zap size={size} />,
    automation: <Terminal size={size} />,
    research: <Search size={size} />,
    music: <Zap size={size} />
  };
  return iconMap[type] || <Zap size={size} />;
};

export const ToolChainViewer = ({ tools, isOpen }: { tools?: ToolNode[], isOpen: boolean }) => {
  if (!isOpen || !tools || tools.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-8 p-6 rounded-3xl bg-[#0a0a0b] border border-white/5 shadow-2xl overflow-hidden relative"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
            <Zap size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">MCP_TOOL_CHAIN_FLOW</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Deterministic Multi-Step Execution Logs</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400">
          NODE: QUANTUM_NATIVE
        </div>
      </div>

      <div className="flex flex-col gap-6 relative">
        {tools.map((tool, index) => (
          <div key={tool.id} className="flex flex-col gap-2 relative">
            {index < tools.length - 1 && (
              <div className="absolute left-6 top-10 bottom-0 w-px bg-gradient-to-b from-indigo-500/40 via-indigo-500/10 to-transparent z-0" />
            )}
            
            <div className={cn(
              "flex items-start gap-4 p-4 rounded-2xl border transition-all z-10",
              tool.status === 'running' ? "bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10" : "bg-white/5 border-white/10"
            )}>
              <div className={cn(
                "p-3 rounded-xl shrink-0 transition-all",
                tool.status === 'running' ? "bg-indigo-500 text-white animate-pulse" : "bg-white/10 text-slate-400"
              )}>
                <ToolIcon type={tool.type} />
              </div>
              
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-tight">{tool.name}</span>
                  <div className="flex items-center gap-2">
                    {tool.confidence && (
                      <span className="text-[9px] font-mono text-slate-500">CONF: {tool.confidence}</span>
                    )}
                    <span className={cn(
                      "text-[9px] font-mono px-2 py-0.5 rounded-full uppercase",
                      tool.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                      tool.status === 'running' ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-500/10 text-slate-400"
                    )}>
                      {tool.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-600 uppercase">Input</span>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-indigo-300 truncate">
                      {tool.input}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-600 uppercase">Output</span>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-emerald-400 truncate">
                      {tool.output || 'Awaiting execution...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {index < tools.length - 1 && (
              <div className="flex justify-center ml-12 -my-2 relative z-20">
                <div className="p-1 rounded-full bg-[#0a0a0b] border border-white/10">
                  <ArrowRight size={12} className="text-slate-500 rotate-90" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center opacity-30">
        <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Integrated MCP AgentSwarm Core</span>
      </div>
    </motion.div>
  );
};
