// Plan Item ID: TI-1
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  delay?: number;
}

const GLASS_BASE = `
  relative overflow-hidden
  bg-white/5 backdrop-blur-xl
  border border-white/10
  rounded-2xl
`;

const GLASS_HOVER = `
  hover:bg-white/10 hover:border-white/20
  transition-all duration-300 ease-out
`;

const GLASS_GLOW = `
  before:absolute before:inset-0
  before:rounded-2xl before:p-[1px]
  before:bg-gradient-to-br before:from-white/20 before:via-indigo-500/20 before:to-purple-500/20
  before:-z-10 before:blur-sm
`;

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  glow = false,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={[
        GLASS_BASE,
        hover && GLASS_HOVER,
        glow && GLASS_GLOW,
        className
      ].filter(Boolean).join(' ')}
    >
      {children}
    </motion.div>
  );
};

export const GlassPanel: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  glow = true,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ scale: 1.01 }}
      className={[
        GLASS_BASE,
        'p-6',
        hover && GLASS_HOVER,
        glow && GLASS_GLOW,
        className
      ].filter(Boolean).join(' ')}
    >
      {children}
    </motion.div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = ''
}) => {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = ''
}) => {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.4, 
            ease: [0.25, 0.1, 0.25, 1]
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface PulseProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  className = '',
  active = true
}) => {
  return (
    <motion.div
      animate={active ? { 
        boxShadow: [
          '0 0 0 0 rgba(99, 102, 241, 0)',
          '0 0 0 8px rgba(99, 102, 241, 0.1)',
          '0 0 0 0 rgba(99, 102, 241, 0)'
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem'
}) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={[
        'bg-zinc-800 rounded-lg animate-pulse',
        className
      ].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  );
};

export default {
  GlassCard,
  GlassPanel,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  Pulse,
  Skeleton
};
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
