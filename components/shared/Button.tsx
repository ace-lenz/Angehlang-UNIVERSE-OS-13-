import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:   'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/20',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700',
  ghost:     'bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-transparent',
  danger:    'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30',
  success:   'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[10px] gap-1 rounded-md',
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium transition-all select-none',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className,
      ].filter(Boolean).join(' ')}
      {...(props as any)}
    >
      {loading ? (
        <Loader2 size={size === 'xs' ? 10 : size === 'sm' ? 12 : 14} className="animate-spin flex-shrink-0" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {rightIcon && !loading && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
};
