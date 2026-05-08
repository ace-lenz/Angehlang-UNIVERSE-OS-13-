import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  delay = 400,
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SIDE_CLASSES: Record<string, string> = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left:   'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right:  'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };

  const MOTION_INITIAL: Record<string, any> = {
    top:    { opacity: 0, y: 4 },
    bottom: { opacity: 0, y: -4 },
    left:   { opacity: 0, x: 4 },
    right:  { opacity: 0, x: -4 },
  };

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="tooltip"
            role="tooltip"
            initial={MOTION_INITIAL[side]}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={MOTION_INITIAL[side]}
            transition={{ duration: 0.12 }}
            className={[
              'absolute z-[70] pointer-events-none',
              'px-2 py-1 rounded-lg',
              'text-[10px] font-medium text-zinc-200 whitespace-nowrap',
              'bg-zinc-800 border border-zinc-700 shadow-lg',
              SIDE_CLASSES[side],
            ].join(' ')}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
