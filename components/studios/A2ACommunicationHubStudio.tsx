/**
 * A2ACommunicationHubStudio.tsx
 * 
 * Central hub for monitoring real-time agent-to-agent (A2A) communications,
 * message broadcasting, and collaborative task orchestration.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Users, Zap, Activity, Shield, 
  Send, Terminal, Search, Radio, Share2, Server
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { a2aSystem, A2AMessage } from '@/agents/A2ASystem';

export const A2ACommunicationHubStudio: React.FC = () => {
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [inputText, setInputText] = useState('');

  const refreshAgents = () => {
    const list = a2aSystem.getRegistry().listAgents();
    setAgents(list);
  };

  useEffect(() => {
    refreshAgents();
    // In a real system, we would subscribe to an A2A event stream
  }, []);

  const handleSendMessage = async () => {
    if (!inputText) return;
    
    const orchestrator = a2aSystem.getOrchestrator();
    if (orchestrator) {
      const msg: A2AMessage = {
        text: inputText,
        agent: 'User_Console',
        timestamp: Date.now()
      };
      
      setMessages(prev => [msg, ...prev]);
      setInputText('');

      // Simulate orchestrator processing and broadcasting to other agents
      const response = await a2aSystem.research(inputText);
      const resMsg: A2AMessage = {
        text: response,
        agent: 'Orchestrator_Agent',
        timestamp: Date.now(),
        metadata: { status: 'RESOLVED' }
      };
      setMessages(prev => [resMsg, ...prev]);
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b]">
      <StudioHeader 
        title="A2A Communication Hub" 
        subtitle="Sovereign Agent Lattice & Message Broker"
        icon={MessageSquare}
        badge={`${agents.length} Agents Active`}
        badgeColor="cyan"
      >
        <div className="flex gap-2">
          <SovereignButton variant="ghost" size="sm" icon={Radio}>
            Broadcast
          </SovereignButton>
          <SovereignButton variant="secondary" size="sm" icon={Server}>
            Lattice Map
          </SovereignButton>
        </div>
      </StudioHeader>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Agent Registry Sidebar */}
        <div className="lg:col-span-1 border-r border-zinc-800 pr-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={12} className="text-cyan-400" /> Active Registry
            </h4>
            <div className="space-y-2">
              {agents.map(agent => (
                <div key={agent} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between group hover:border-cyan-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-300">{agent}</span>
                  </div>
                  <Share2 size={12} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Lattice Health</h4>
            <div className="flex items-end gap-1 h-8">
              {[40, 70, 45, 90, 65, 80, 30, 95].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="flex-1 bg-cyan-500/40 rounded-t-sm"
                />
              ))}
            </div>
            <p className="text-[9px] text-zinc-500 text-center uppercase">Synaptic Latency: 4ms</p>
          </div>
        </div>

        {/* Communication Feed */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="flex-1 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <div className="flex gap-2">
                {['all', 'system', 'research', 'audit'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${activeFilter === filter ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-zinc-600'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <Activity size={14} className="text-emerald-400" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-20">
                    <Terminal size={48} className="mb-4" />
                    <p className="text-sm">Lattice Communication Idle</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${msg.agent === 'User_Console' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-zinc-500 uppercase">{msg.agent}</span>
                        <span className="text-[8px] text-zinc-700 font-mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${msg.agent === 'User_Console' ? 'bg-cyan-600/10 border border-cyan-500/20 text-cyan-100' : 'bg-zinc-900 border border-zinc-800 text-zinc-300'}`}>
                        {msg.text}
                        {msg.metadata && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex gap-2">
                            {Object.entries(msg.metadata).map(([key, val]) => (
                              <span key={key} className="text-[8px] font-mono bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-500 uppercase">{key}: {String(val)}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
              <div className="relative flex items-center gap-2">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Broadcast to Agent Lattice..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-4 pr-12 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                  />
                  <Zap size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                </div>
                <SovereignButton 
                  variant="primary" 
                  size="sm" 
                  onClick={handleSendMessage}
                  icon={Send}
                >
                  Send
                </SovereignButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default A2ACommunicationHubStudio;
