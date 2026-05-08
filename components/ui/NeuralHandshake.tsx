// Plan Item ID: TI-1
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Cpu, Zap, Activity, ShieldCheck } from 'lucide-react';

interface NeuralHandshakeProps {
  active: boolean;
  onComplete?: () => void;
}

export const NeuralHandshake: React.FC<NeuralHandshakeProps> = ({ active, onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (active) {
      setStage(1);
      const timer1 = setTimeout(() => setStage(2), 800);
      const timer2 = setTimeout(() => setStage(3), 1600);
      const timer3 = setTimeout(() => {
        setStage(4);
        if (onComplete) onComplete();
      }, 2400);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setStage(0);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {active && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#030307]/80 backdrop-blur-xl"
          />
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center gap-8">
        {/* Central Singularity */}
        <motion.div
          animate={{ 
            scale: stage >= 3 ? [1, 1.2, 1] : 1,
            rotate: [0, 360],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="relative w-40 h-40"
        >
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
          <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full scale-110" />
          <div className="absolute inset-0 border border-violet-500/20 rounded-full scale-125 animate-ping" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            {stage === 1 && <Cpu size={48} className="text-indigo-400 animate-bounce" />}
            {stage === 2 && <Zap size={48} className="text-violet-400 animate-pulse" />}
            {stage === 3 && <Sparkles size={48} className="text-emerald-400" />}
            {stage === 4 && <ShieldCheck size={48} className="text-white" />}
          </div>
        </motion.div>

        {/* Status Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]"
          >
            Sovereign Protocol Initiated
          </motion.span>
          <motion.h2 
            key={stage}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-white tracking-tighter"
          >
            {stage === 1 && "Aligning Synapses..."}
            {stage === 2 && "Photonic Handshake..."}
            {stage === 3 && "Quantum Coherence..."}
            {stage === 4 && "System Synchronized"}
          </motion.h2>
          
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ width: 8 }}
                animate={{ 
                  width: stage >= i ? 32 : 8,
                  backgroundColor: stage >= i ? "#6366f1" : "#1e1b4b"
                }}
                className="h-1 rounded-full transition-colors duration-500"
              />
            ))}
          </div>
        </div>

        {/* Spectral Lattice Background Lines */}
        <div className="absolute inset-0 -z-10 w-[800px] h-[800px] opacity-20 overflow-hidden">
           <svg width="100%" height="100%" viewBox="0 0 800 800">
             <defs>
               <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                 <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
               </linearGradient>
             </defs>
             {[...Array(20)].map((_, i) => (
               <motion.line
                 key={i}
                 x1={400} y1={400}
                 x2={Math.random() * 800} y2={Math.random() * 800}
                 stroke="url(#grad1)"
                 strokeWidth="1"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: active ? 1 : 0 }}
                 transition={{ duration: 2, delay: i * 0.1 }}
               />
             ))}
           </svg>
        </div>
      </div>
    </div>
  );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
