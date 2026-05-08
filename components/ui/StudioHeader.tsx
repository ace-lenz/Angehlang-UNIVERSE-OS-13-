import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StudioHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: string;
  badgeColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'zinc' | 'violet' | 'purple' | 'pink';
  children?: React.ReactNode;
  quantumMode?: boolean;
  onToggleQuantum?: () => void;
  fullScreenMode?: 'normal' | 'expanded' | 'immersive' | 'cinema' | 'lightbox';
  onToggleFullScreen?: () => void;
  stats?: {
    content?: number;
    suggestions?: number;
    paths?: number;
    synapses?: string;
    [key: string]: string | number | undefined;
  };
}

const BADGE_STYLES: Record<string, string> = {
  cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  zinc: 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
  violet: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
  purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  pink: 'bg-pink-500/10 border-pink-500/30 text-pink-400',
};

export const StudioHeader: React.FC<StudioHeaderProps> = ({ 
  title, subtitle, icon: Icon, iconColor = 'text-cyan-400', badge, badgeColor = 'cyan', children,
  quantumMode, onToggleQuantum, fullScreenMode, onToggleFullScreen, stats
}) => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
      <div className={`w-8 h-8 rounded-xl bg-zinc-950/50 border border-zinc-800 flex items-center justify-center ${iconColor}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2">
          {title} 
          {badge && (
            <span className={`text-[8px] px-1.5 py-0.5 rounded border ${BADGE_STYLES[badgeColor]}`}>
              {badge}
            </span>
          )}
          {quantumMode && (
            <span className="text-[8px] px-1.5 py-0.5 rounded border bg-purple-500/10 border-purple-500/30 text-purple-400 animate-pulse">
              QUANTUM
            </span>
          )}
        </p>
        <p className="text-[10px] text-zinc-500 font-mono italic">{subtitle}</p>
      </div>
      
      {stats && (
        <div className="flex items-center gap-3 ml-4 px-3 py-1 rounded-lg bg-zinc-950/50 border border-zinc-800">
          {Object.entries(stats).map(([key, value]) => (
            value !== undefined && (
              <div key={key} className="flex items-center gap-1.5">
                <span className="text-[9px] text-zinc-500 uppercase">{key}:</span>
                <span className="text-[10px] font-mono text-zinc-300">{value}</span>
              </div>
            )
          ))}
        </div>
      )}
      
      <div className="ml-auto flex items-center gap-2">
        {onToggleQuantum && (
          <button 
            onClick={onToggleQuantum}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
              quantumMode 
                ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {quantumMode ? '⚛ QPU' : 'CPU'}
          </button>
        )}
        
        {onToggleFullScreen && fullScreenMode && fullScreenMode !== 'normal' && fullScreenMode !== 'lightbox' && (
          <button 
            onClick={onToggleFullScreen}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {fullScreenMode === 'expanded' && <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />}
              {fullScreenMode === 'immersive' && <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />}
              {fullScreenMode === 'cinema' && <path d="M2 12h20M12 2v20" />}
            </svg>
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
};

export interface SovereignButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

export const SovereignButton: React.FC<SovereignButtonProps> = ({ 
  variant = 'primary', size = 'md', icon: Icon, children, className = '', ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses: Record<string, string> = {
    primary: 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 active:scale-95',
    secondary: 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white',
    danger: 'bg-rose-500/10 border border-rose-500/40 text-rose-400 hover:bg-rose-500/20',
    ghost: 'bg-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800',
  };

  const sizeClasses: Record<string, string> = {
    xs: 'px-2 py-1 text-[9px]',
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>
      {Icon && <Icon size={size === 'xs' ? 10 : 13} />}
      {children}
    </button>
  );
};