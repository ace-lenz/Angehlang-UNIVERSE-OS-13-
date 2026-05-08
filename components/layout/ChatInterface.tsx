// Plan Item ID: TI-1
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Zap, ShieldCheck, Activity, Brain, Loader2, Code2, BookOpen, Sparkles, Cpu, Gauge, Layers, Infinity, Rocket, Play } from 'lucide-react';
import { useSovereign } from '@/context/SovereignContext';
import { useSovereignInference } from '@/hooks/useSovereignInference';
import { ThinkingTrace } from '@/components/chat/ThinkingTrace';
import { ResponseFeedback } from '@/components/chat/ResponseFeedback';
import { PromptInput } from '@/components/chat/PromptInput';
import { cn } from '@/utils/sovereign-utils';
import { quantumBuilder } from '@/engine/QuantumBuilder';
import { APP_VERSION } from '@/constants';

const StudioDashboard = lazy(() => import('@/components/studios/StudioDashboard').then(m => ({ default: m.StudioDashboard })));

export const ChatInterface: React.FC = () => {
  const { 
    sessions, currentSessionId, ui, setUi 
  } = useSovereign();
  
  const { startInference, streamedText, streamingMsgId } = useSovereignInference();
  
  const [userInput, setUserInput] = useState('');
  const [isDeep, setIsDeep] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [feedbackTarget, setFeedbackTarget] = useState<{ prompt: string; response: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSend = () => {
    startInference(userInput, selectedFiles);
    setUserInput('');
    setSelectedFiles([]);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full relative">
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="max-w-3xl mx-auto px-3 md:px-6 py-8 md:py-16 space-y-6 md:space-y-10 pb-32 md:pb-40">
          {(!currentSession || currentSession.messages.length === 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex flex-col items-center justify-center min-h-[50vh] text-center"
            >
              <div className={cn("flex items-center justify-center w-12 h-12 rounded-full mb-5 shadow-sm", ui.themeConfig.isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-100 text-indigo-600")}>
                <Brain size={24} />
              </div>
              <h1 className={cn("text-[26px] font-bold tracking-tight mb-4", ui.themeConfig.isDark ? "text-slate-100" : "text-slate-900")}>
                Start Synthesizing with Sovereign
              </h1>
              
              {/* Enhanced System Status Dashboard */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "flex flex-wrap justify-center gap-3 mb-6 p-4 rounded-2xl border",
                  ui.themeConfig.isDark 
                    ? "bg-slate-900/40 border-slate-700/50" 
                    : "bg-white/60 border-slate-200"
                )}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                  <Infinity size={14} className="text-indigo-400" />
                  <span className="text-[11px] font-bold text-indigo-300">∞ CONTEXT</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Layers size={14} className="text-purple-400" />
                  <span className="text-[11px] font-bold text-purple-300">1T DIMENSIONS</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Cpu size={14} className="text-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-300">QPPU ACTIVE</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <Gauge size={14} className="text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300">10K STEPS</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <Zap size={14} className="text-rose-400" />
                  <span className="text-[11px] font-bold text-rose-300">500 AGENTS</span>
                </div>
              </motion.div>
              
{/* Advanced Model Switcher */}
              <div className={cn("flex rounded-full p-1 border shadow-lg", ui.themeConfig.isDark ? "bg-slate-900/70 border-slate-700/50" : "bg-white/90 border-slate-200")}>
                 <button 
                    onClick={() => setUi(prev => ({ ...prev, intelligenceMode: 'instant' }))}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all", 
                      ui.intelligenceMode === 'instant' 
                        ? (ui.themeConfig.isDark ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md") 
                        : "text-slate-500 hover:text-indigo-400"
                    )}
                  >
                     <Zap size={14} /> Instant <span className="text-[10px] opacity-60">Fast</span>
                  </button>
                  <button 
                    onClick={() => setUi(prev => ({ ...prev, intelligenceMode: 'expert' }))}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                      ui.intelligenceMode === 'expert' 
                        ? (ui.themeConfig.isDark ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md") 
                        : "text-slate-500 hover:text-indigo-400"
                    )}
                  >
                     <ShieldCheck size={14} /> Expert <span className="text-[10px] opacity-60">Deep</span>
                  </button>
                  <button 
                    onClick={() => setUi(prev => ({ ...prev, intelligenceMode: 'swarm' }))}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all",
                      ui.intelligenceMode === 'swarm' 
                        ? (ui.themeConfig.isDark ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md") 
                        : "text-slate-500 hover:text-indigo-400"
                    )}
                  >
                     <Sparkles size={14} /> Swarm <span className="text-[10px] opacity-60">500+</span>
                  </button>
              </div>
            </motion.div>
          )}

          {currentSession?.messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn("flex gap-4 group", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-indigo-500/5">
                  <Zap size={16} className="text-indigo-400 fill-indigo-400/20" />
                </div>
              )}
              <div className={cn("flex flex-col gap-2 max-w-[88%]", msg.role === 'user' ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl px-6 py-4 text-[13px] leading-[1.7] transition-all border shadow-sm",
                  msg.role === 'user' 
                    ? "bg-indigo-600 border-indigo-500 text-white rounded-tr-sm shadow-indigo-500/10" 
                    : "bg-slate-900/60 backdrop-blur-md border-white/5 text-slate-200 rounded-tl-sm hover:border-indigo-500/20"
                )}>
                  {msg.role === 'user' ? <p className="whitespace-pre-wrap font-medium">{msg.content}</p> : (
                    <div className="prose prose-invert prose-indigo max-w-none text-[13px] font-sans selection:bg-indigo-500/30">
                      {msg.thinking && msg.thinking.length > 0 && (
                        <ThinkingTrace trace={msg.thinking} isThinking={!!streamingMsgId} />
                      )}
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeStr = String(children).replace(/\n$/, '');
                            const isRunable = match?.[1] === 'html' || match?.[1] === 'tsx' || match?.[1] === 'javascript';

                            if (!inline && match) {
                              return (
                                <div className="relative group/code my-4">
                                  <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover/code:opacity-100 transition-all z-10">
                                    {isRunable && (
                                      <button 
                                        onClick={() => {
                                          setUi(prev => ({ ...prev, activeView: 'code' }));
                                          // Note: In a real system, we'd inject this code into the studio state
                                        }}
                                        className="px-2 py-1 rounded bg-emerald-500/90 text-black text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all flex items-center gap-1"
                                      >
                                        <Play size={10} /> Effortless Run
                                      </button>
                                    )}
                                    <button 
                                      onClick={() => navigator.clipboard.writeText(codeStr)}
                                      className="px-2 py-1 rounded bg-white/10 text-white text-[9px] font-bold uppercase hover:bg-white/20 transition-all"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                  <pre className={cn("rounded-xl border border-white/5 bg-black/40 p-4 overflow-x-auto", className)} {...props}>
                                    <code className={className}>{children}</code>
                                  </pre>
                                </div>
                              );
                            }
                            return <code className={className} {...props}>{children}</code>;
                          }
                        }}
                      >
                        {streamingMsgId && i === currentSession!.messages.length - 1 ? streamedText + "▍" : (msg.content || '')}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.studioView && (
                  <Suspense fallback={<div className="mt-2 p-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Synthesis...</div>}>
                    <StudioDashboard studioView={msg.studioView} />
                  </Suspense>
                )}
                {msg.virtualFiles && (
                   <div className="mt-2 flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
                      {msg.virtualFiles.map((f, fi) => (
                        <div key={fi} className="px-3 py-1.5 bg-slate-900/40 border border-white/5 rounded-lg text-[10px] font-bold text-indigo-300 flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-default">
                          <Code2 size={12} className="opacity-60" />
                          {f.name}
                        </div>
                      ))}
                   </div>
                )}
                <div className="flex gap-3 px-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{msg.timestamp}</span>
                  {msg.role === 'assistant' && currentSession!.messages.length > 0 && currentSession!.messages[currentSession!.messages.length - 1]?.thinking && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <Rocket size={10} className="text-emerald-400" />
                      <span className="text-[9px] font-bold text-emerald-400">THOUGHT</span>
                    </motion.div>
                  )}
                  {msg.role === 'assistant' && !streamingMsgId && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button className="text-[10px] font-bold text-slate-500 hover:text-indigo-400 transition-colors">COPY</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Floating) */}
      <div className="p-4 md:p-6 relative bg-gradient-to-t from-black/20 via-black/5 to-transparent">
        <div className="max-w-4xl mx-auto w-full">
          <PromptInput 
            userInput={userInput} 
            setUserInput={setUserInput}
            isDeep={isDeep}
            setIsDeep={setIsDeep}
            onSend={handleSend}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            isThinking={ui.isThinking}
            isListening={false}
            startListening={() => {}}
            ui={ui}
          />
          <div className="mt-3 text-center">
            <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
              Angehlang Sovereign Intelligence Interface v{APP_VERSION} <span className="text-indigo-500">• Native</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
