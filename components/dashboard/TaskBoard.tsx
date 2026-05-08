import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { Task } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TaskItem = ({ task, depth = 0 }: { task: Task, depth?: number }) => {
  const isExpandable = task.subtasks && task.subtasks.length > 0;
  
  const statusIcon = {
    pending: <Circle size={14} className="text-slate-600" />,
    active: <Activity size={14} className="text-indigo-400 animate-pulse" />,
    completed: <CheckCircle2 size={14} className="text-emerald-500" />,
    failed: <AlertTriangle size={14} className="text-red-500" />
  };

  return (
    <div className="flex flex-col">
      <div 
        className={cn(
          "flex items-center gap-3 py-2 px-3 rounded-xl transition-all group",
          task.status === 'active' ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-white/5"
        )}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="shrink-0">{statusIcon[task.status]}</div>
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              "text-[11px] font-medium truncate",
              task.status === 'completed' ? "text-slate-500 line-through" : "text-slate-200"
            )}>
              {task.label}
            </span>
            <span className="text-[9px] font-mono text-slate-500">{task.progress}%</span>
          </div>
          <div className="w-full bg-white/5 h-0.5 rounded-full mt-1 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              className={cn(
                "h-full transition-all duration-500",
                task.status === 'completed' ? "bg-emerald-500" : "bg-indigo-500"
              )}
            />
          </div>
        </div>
      </div>
      {isExpandable && task.subtasks && (
        <div className="mt-1 flex flex-col gap-1">
          {task.subtasks.map(sub => (
            <TaskItem key={sub.id} task={sub} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TaskBoard = ({ plan, isOpen }: { plan?: Task[], isOpen: boolean }) => {
  if (!isOpen || !plan || plan.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 rounded-3xl bg-[#0a0a0b] border border-white/5 shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Activity size={80} className="text-indigo-500" />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic_Execution_Plan</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Real-time Agentic Workflow Status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400">
            STRATEGY: ADAPTIVE
          </div>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        {plan.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Circle size={10} /> PENDING</span>
          <span className="flex items-center gap-1.5 text-indigo-400"><Activity size={10} /> ACTIVE</span>
          <span className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 size={10} /> DONE</span>
        </div>
        <span className="uppercase tracking-widest">v4.2_PLANNER_ACTIVE</span>
      </div>
    </motion.div>
  );
};
