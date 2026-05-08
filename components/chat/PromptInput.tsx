// Plan Item ID: TI-1
import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, ChevronUp, Loader2, Brain, Mic, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSovereign } from '@/context/SovereignContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PromptInputProps {
  userInput: string;
  setUserInput: (val: string) => void;
  onSend: () => void;
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  isThinking: boolean;
  isListening: boolean;
  isDeep: boolean;
  setIsDeep: (val: boolean) => void;
  startListening: () => void;
  ui: any;
}

export const PromptInput = ({
  userInput,
  setUserInput,
  onSend,
  selectedFiles,
  setSelectedFiles,
  isThinking,
  isListening,
  isDeep,
  setIsDeep,
  startListening,
  ui,
}: PromptInputProps) => {
  const { ui: contextUi, setUi } = useSovereign();
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isStudioDragging = contextUi.draggingStudio !== null;

  const handleStudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (contextUi.draggingStudio) {
      const newInput = userInput + (userInput ? ' ' : '') + `[${contextUi.draggingStudio} Studio]`;
      setUserInput(newInput);
      setUi(prev => ({ ...prev, draggingStudio: null }));
      setIsDragging(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [userInput]);

  const handleSend = () => {
    if ((!userInput.trim() && selectedFiles.length === 0) || isThinking) return;
    onSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setSelectedFiles(prev => [...prev, ...files]);
  };

  const canSend = (userInput.trim().length > 0 || selectedFiles.length > 0) && !isThinking;

  const [showActions, setShowActions] = useState(false);

  // ... (keep rest of previous code until return)

  return (
    <div className="w-full flex justify-center pb-6">
      <div
        className="w-full max-w-3xl flex flex-col items-center relative"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          if (isStudioDragging) {
            handleStudioDrop(e);
          } else {
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) setSelectedFiles(prev => [...prev, ...files]);
          }
          setIsDragging(false);
        }}
      >
        {/* Studio Drop Indicator */}
        <AnimatePresence>
          {isStudioDragging && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-12 left-0 right-0 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold"
            >
              <Sparkles size={14} className="animate-pulse" />
              Drop studio to add to prompt
            </motion.div>
          )}
        </AnimatePresence>
        {/* Contextual Quick Actions (Collapsible) */}
        <AnimatePresence>
          {showActions && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 mb-4 w-full justify-center overflow-x-auto no-scrollbar pb-1 px-1 overflow-hidden"
            >
              {[
                { id: 'analyze_coherence', label: 'Analyze', color: 'text-indigo-500 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
                { id: 'run_diagnostics', label: 'Diagnostics', color: 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
                { id: 'synthesize_ui', label: 'Design UI', color: 'text-cyan-500 bg-cyan-50 hover:bg-cyan-100 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20' }
              ].map(action => (
                <button
                  key={action.id}
                  onClick={() => {
                    setUserInput(userInput ? `${userInput} /${action.id} ` : `/${action.id} `);
                    setShowActions(false);
                  }}
                  className={cn(
                    "flex-shrink-0 px-4 py-1.5 rounded-full border text-[11px] font-bold transition-all shadow-sm",
                    action.color
                  )}
                >
                  {action.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* File attachments */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mb-3 pb-2 w-full"
            >
              {selectedFiles.map((f, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 shadow-sm">
                  <Paperclip size={12} className="text-slate-500" />
                  <span className="truncate max-w-[140px] font-medium">{f.name}</span>
                  <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 ml-1 transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input box (The Centered Pill) */}
        <div className={cn(
          "w-full flex items-end gap-1 rounded-[1.5rem] border transition-all duration-300 shadow-md px-1",
          ui.themeConfig.isDark ? "bg-slate-900 border-slate-700/60 shadow-black/40" : "bg-white border-slate-200/80 shadow-slate-200/50",
          isFocused ? (ui.themeConfig.isDark ? "border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.15)]" : "border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.15)]") : "",
          (isDragging || isStudioDragging) && "border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20"
        )}>
          {/* Inner Left Controls (Plus, DeepThink, Voice - Icons Only) */}
          <div className="flex items-center gap-1 pl-2 pb-2.5 pt-2.5 flex-shrink-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className={cn(
                "p-2 rounded-full transition-colors",
                showActions 
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" 
                  : "text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
              title="Quick Actions"
            >
              <Plus size={18} className={cn("transition-transform", showActions && "rotate-45")} />
            </button>
            <button
              onClick={() => setIsDeep(!isDeep)}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDeep
                  ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
                  : "text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
              title="Deep Analysis"
            >
              <Brain size={18} />
            </button>
            <button
              onClick={startListening}
              className={cn(
                "p-2 rounded-full transition-colors",
                isListening
                  ? "bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 animate-pulse"
                  : "text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            placeholder="Message Sovereign... (Try: 'create a music app', 'build dashboard', 'open code studio')"
            className={cn(
              "flex-1 bg-transparent border-none py-4 px-2 focus:outline-none resize-none text-[15px] leading-relaxed",
              ui.themeConfig.isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"
            )}
            style={{ maxHeight: '200px', minHeight: '52px' }}
          />

          {/* Right controls */}
          <div className="flex items-center gap-2 pr-1 pb-2 flex-shrink-0">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              title="Attach files"
            >
              <Paperclip size={18} />
            </button>

            {/* Send */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "p-2 rounded-full transition-all flex items-center justify-center h-10 w-10 mr-0.5",
                canSend
                  ? "bg-black text-white hover:bg-slate-800 shadow-md active:scale-95 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                  : "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
              )}
            >
              {isThinking
                ? <Loader2 size={16} className="animate-spin" />
                : <Send size={16} className={canSend ? "-ml-0.5 -mt-0.5" : ""} />
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
