// Plan Item ID: TI-1
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Cpu, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ThinkingTraceItem {
  thought?: string;
  timestamp?: number;
  logicSeal?: string;
}

interface ThinkingTraceProps {
  trace: string[] | ThinkingTraceItem[];
  isThinking?: boolean;
}

function getStepText(step: string | ThinkingTraceItem): string {
  if (typeof step === 'string') return step;
  if (step.thought) return step.thought;
  try {
    const str = JSON.stringify(step);
    return str.length > 200 ? str.substring(0, 200) + '...' : str;
  } catch (e) {
    return '[Complex Neural Mote]';
  }
}

const getStepColor = (text: string): string => {
  if (text.includes('RRL Cycle')) return 'text-violet-400 font-bold';
  if (text.includes('ACCURACY GAP')) return 'text-amber-400 font-bold';
  if (text.includes('Synaptic Fidelity achieved')) return 'text-emerald-400 font-bold';
  if (text.includes('Zero-Hallucination Circuit')) return 'text-cyan-400 font-black';
  if (text.includes('Hallucination detected')) return 'text-red-400 font-black animate-pulse';
  if (text.includes('Photonic Synthesis')) return 'text-indigo-400 font-bold';
  return 'text-zinc-400';
};

const ThinkingTraceComponent: React.FC<ThinkingTraceProps> = ({ trace, isThinking }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const steps = (trace || []).slice(-30).map(getStepText);

  if (!isThinking && steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 w-full"
    >
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl overflow-hidden">
{/* Clean Hardware Header */}
         <div className="px-4 py-2 border-b border-indigo-500/10 flex items-center justify-between bg-indigo-500/10">
           <div className="flex items-center gap-3">
             <Cpu size={14} className="text-indigo-400" />
             <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Native Inference Trace</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[8px] font-bold text-emerald-400 font-mono">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                 <span className="text-[8px] font-bold text-cyan-400 font-mono">v13</span>
              </div>
           </div>
         </div>

        {/* High-Speed Action Log */}
        <div className="p-4 max-h-[180px] overflow-y-auto custom-scrollbar bg-black/20 font-mono">
          <div className="space-y-1.5">
            {steps.slice(-30).map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                <span className="text-[9px] text-zinc-600 mt-0.5 w-6 flex-shrink-0 text-right tabular-nums">
                  {((i + 1) * 10).toString().padStart(3, '0')}
                </span>
                <p className={cn("text-[10px] leading-relaxed", getStepColor(step))}>
                   <span className="text-indigo-500/50 mr-1">◈</span>
                   {step}
                </p>
              </motion.div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[9px] text-indigo-400/50 mt-0.5 w-6 flex-shrink-0 text-right tabular-nums animate-pulse">
                  ACT
                </span>
                <div className="flex items-center gap-2">
                   <div className="flex gap-1">
                      {[0, 1, 2].map(d => (
                        <motion.div
                          key={d}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                          className="w-1 h-1 rounded-full bg-indigo-400"
                        />
                      ))}
                   </div>
                   <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Processing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingTrace = React.memo(ThinkingTraceComponent);

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
