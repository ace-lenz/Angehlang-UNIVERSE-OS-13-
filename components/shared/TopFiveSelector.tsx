import { motion, AnimatePresence } from 'motion/react';
import { Award, Star, CheckCircle, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TopFiveItem {
  id: string;
  title: string;
  body: string;
  totalScore: number;
  perfectionistScore: number;
  engineerScore: number;
}

interface TopFiveSelectorProps {
  items: TopFiveItem[];
  onSelect?: (item: TopFiveItem) => void;
  selectedId?: string;
}

export const TopFiveSelector = ({ items, onSelect, selectedId }: TopFiveSelectorProps) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <Award size={20} className="text-amber-400" />
        <span className="text-[12px] font-black uppercase tracking-widest text-amber-400">
          Top-5 Best Answers Selected
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelect?.(item)}
            className={cn(
              "relative p-4 rounded-2xl border cursor-pointer transition-all group",
              selectedId === item.id 
                ? "bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/20" 
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            )}
          >
            {idx === 0 && (
              <div className="absolute -top-2 -right-2">
                <Star size={16} className="text-amber-400 fill-amber-400" />
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                idx === 0 ? "bg-amber-500 text-black" : 
                idx < 2 ? "bg-indigo-500 text-white" : "bg-white/10 text-slate-400"
              )}>
                {idx + 1}
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 truncate">
                {item.id}
              </span>
            </div>
            
            <h4 className="text-[11px] font-bold text-white mb-2 line-clamp-2">
              {item.title}
            </h4>
            
            <p className="text-[9px] text-slate-400 line-clamp-3 mb-3">
              {item.body}
            </p>
            
            <div className="flex justify-between items-center text-[8px]">
              <div className="flex gap-1">
                <span className="text-green-400">P:{item.perfectionistScore}</span>
                <span className="text-blue-400">E:{item.engineerScore}</span>
              </div>
              <div className={cn(
                "font-bold",
                item.totalScore >= 90 ? "text-amber-400" : 
                item.totalScore >= 80 ? "text-green-400" : "text-slate-400"
              )}>
                {item.totalScore}
              </div>
            </div>
            
            {selectedId === item.id && (
              <div className="absolute bottom-2 right-2">
                <CheckCircle size={14} className="text-green-400" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
