import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Terminal } from 'lucide-react';
import { SovereignButton } from '@/components/ui/StudioHeader';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  moduleName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * SovereignErrorBoundary - Catch-all for studio module failures.
 * Ensures the OS remains stable even if a specific generative module crashes.
 */
export class SovereignErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Sovereign-Core] Critical Failure in ${this.props.moduleName || 'Unknown Module'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="w-full p-12 rounded-3xl border border-rose-500/20 bg-zinc-950 flex flex-col items-center justify-center text-center gap-6 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-rose-500/5 blur-3xl" />
          
          <div className="relative w-20 h-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center border border-rose-500/30">
             <AlertTriangle size={40} className="text-rose-500" />
          </div>
          
          <div className="relative space-y-2">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Module_Crash_Detected</span>
            <h2 className="text-xl font-black text-white">{this.props.moduleName || 'Substrate'} Failure</h2>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto font-mono">
              {this.state.error?.message || 'Segmentation fault in neural manifold'}
            </p>
          </div>

          <div className="relative pt-4 flex gap-3">
             <SovereignButton variant="primary" size="sm" icon={RefreshCcw} onClick={this.handleReset}>
                Reset Module
             </SovereignButton>
             <SovereignButton variant="secondary" size="sm" icon={Terminal}>
                View Log
             </SovereignButton>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
