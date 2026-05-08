import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: { message: string; type: ToastType } | null;
  onDismiss: () => void;
}

const TYPE_CONFIG: Record<ToastType, { icon: React.ReactNode; borderColor: string; iconColor: string }> = {
  success: { icon: <CheckCircle2 size={14} />, borderColor: 'border-emerald-500/30', iconColor: 'text-emerald-400' },
  error:   { icon: <XCircle size={14} />,      borderColor: 'border-red-500/30',     iconColor: 'text-red-400' },
  warning: { icon: <AlertTriangle size={14} />, borderColor: 'border-amber-500/30',  iconColor: 'text-amber-400' },
  info:    { icon: <Info size={14} />,          borderColor: 'border-indigo-500/30', iconColor: 'text-indigo-400' },
};

/** Single toast that appears at the bottom-center of the screen */
export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const config = toast ? TYPE_CONFIG[toast.type] : null;

  return (
    <AnimatePresence>
      {toast && config && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={[
            'fixed bottom-24 left-1/2 z-[60]',
            'flex items-center gap-3 px-4 py-3',
            'rounded-xl border bg-zinc-900/95 backdrop-blur-xl shadow-2xl',
            'text-sm text-zinc-100 max-w-sm',
            config.borderColor,
          ].join(' ')}
        >
          <span className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</span>
          <span className="flex-1 text-xs">{toast.message}</span>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Multi-toast stack manager */
interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastStack: React.FC<ToastStackProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 items-end pointer-events-none">
    <AnimatePresence>
      {toasts.map((t, i) => {
        const config = TYPE_CONFIG[t.type];
        return (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28, delay: i * 0.05 }}
            className={[
              'pointer-events-auto flex items-center gap-3 px-4 py-3',
              'rounded-xl border bg-zinc-900/95 backdrop-blur-xl shadow-xl',
              'text-xs text-zinc-100 min-w-[220px] max-w-xs',
              config.borderColor,
            ].join(' ')}
          >
            <span className={`flex-shrink-0 ${config.iconColor}`}>{config.icon}</span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => onDismiss(t.id)} className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <X size={12} />
            </button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);
