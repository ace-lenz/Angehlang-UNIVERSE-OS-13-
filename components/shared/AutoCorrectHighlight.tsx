import { motion } from 'motion/react';
import { Edit3, Check, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Change {
  original: string;
  corrected: string;
  desc: string;
}

interface AutoCorrectHighlightProps {
  text: string;
  changes?: string[];
  showChanges?: boolean;
}

export const AutoCorrectHighlight = ({ text, changes = [], showChanges = true }: AutoCorrectHighlightProps) => {
  const [showDetail, setShowDetail] = useState(false);

  if (!showChanges || changes.length === 0) {
    return (
      <div className="prose prose-invert max-w-none text-sm">
        {text}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative"
    >
      {showDetail && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-0 mb-2 p-3 rounded-xl bg-amber-900/30 border border-amber-500/30 shadow-lg max-w-[300px] z-20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Edit3 size={12} className="text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase">Text Corrections Applied</span>
          </div>
          <div className="space-y-1">
            {changes.map((c, i) => (
              <div key={i} className="text-[9px] text-slate-300 flex items-center gap-2">
                <Check size={10} className="text-green-400" />
                {c}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div 
        className="relative inline cursor-help"
        onMouseEnter={() => setShowDetail(true)}
        onMouseLeave={() => setShowDetail(false)}
      >
        <span className="relative">
          <span className="text-slate-300">{text}</span>
          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-amber-500/50 animate-pulse" />
          <div className="absolute -top-4 right-0">
            <AlertCircle size={10} className="text-amber-400" />
          </div>
        </span>
      </div>
    </motion.div>
  );
};

export const CorrectionBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30"
    >
      <Edit3 size={10} className="text-amber-400" />
      <span className="text-[8px] font-bold text-amber-400">{count} corrections</span>
    </motion.div>
  );
};
