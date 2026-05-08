// Plan Item ID: TI-1
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatSession, Message, VirtualFile } from '@/types';
import { neuralTelemetry, NeuralVitals } from '@/engine/NeuralTelemetry';

interface SovereignContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  currentModel: string;
  setCurrentModel: (model: string) => void;
  neuralStatus: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  vitals: NeuralVitals;
  availableModels: string[];
  hasOllama: boolean;
  ui: {
    sidebarOpen: boolean;
    zenMode: boolean;
    isThinking: boolean;
    activeView: string;
    splitView: boolean;
    themeConfig: { background: string; isDark: boolean; accentColor: string; panelTheme: string };
    intelligenceMode: 'instant' | 'expert' | 'swarm';
    autoHideNav: boolean;
    toast: { message: string, type: 'success' | 'error' } | null;
    explorerManifest: { name: string, files: VirtualFile[] } | null;
    draggingStudio: string | null;
    latticeDensity: number;
  };
  setUi: React.Dispatch<React.SetStateAction<SovereignContextType['ui']>>;
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  createNewChat: () => void;
  deleteSession: (e: React.MouseEvent, id: string) => void;
  clearAllHistory: () => void;
  sendMessageToChat: (content: string, type?: Message['type']) => void;
}

const SovereignContext = createContext<SovereignContextType | undefined>(undefined);

export const SovereignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>(localStorage.getItem('sovereign_model') || 'qwen2.5-coder:0.5b');
  const [neuralStatus, setNeuralStatus] = useState<'ONLINE' | 'OFFLINE' | 'CONNECTING'>('OFFLINE');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [hasOllama, setHasOllama] = useState(() => !!localStorage.getItem('ollama_url'));
  const [vitals, setVitals] = useState<NeuralVitals>(neuralTelemetry.getSnapshot());

  const [ui, setUi] = useState<SovereignContextType['ui']>({
    sidebarOpen: true,
    zenMode: false,
    isThinking: false,
    activeView: 'chat',
    splitView: false,
    themeConfig: { background: 'bg-slate-950', isDark: true, accentColor: 'indigo', panelTheme: 'bg-slate-900/50' },
    intelligenceMode: 'expert',
    autoHideNav: true,
    toast: null,
    explorerManifest: null,
    draggingStudio: null,
    latticeDensity: 802
  });

  // Persist sessions
  useEffect(() => {
    const saved = localStorage.getItem('univ_os_v4_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
        else createNewChat();
      } catch (e) {
        console.error('Failed to parse sessions:', e);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Persist sessions with debounce and safety
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessions.length === 0) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        // Keep only last 20 sessions to prevent localStorage overflow and performance lag
        const prunedSessions = sessions.slice(0, 20).map(s => ({
          ...s,
          messages: s.messages.slice(-50) // Limit history per session
        }));
        
        localStorage.setItem('univ_os_v4_data', JSON.stringify(prunedSessions));
      } catch (e) {
        console.error('[Persistence] Massive data event failed:', e);
        if (e instanceof Error && e.name === 'QuotaExceededError') {
          // If quota exceeded, clear some old sessions
          setSessions(prev => prev.slice(0, 5));
        }
      }
    }, 1000); // Debounce by 1 second

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [sessions]);

  // Vitals subscription
  useEffect(() => {
    return neuralTelemetry.subscribe(setVitals);
  }, []);

  // Neural Core Init
  useEffect(() => {
    import('@/engine/NativeNeuralCore').then(({ nativeNeuralCore }) => {
      nativeNeuralCore.initialize().then(() => {
        const health = nativeNeuralCore.getHealth();
        setCurrentModel(health.model);
        setNeuralStatus(health.status as any);
        if (health.available?.length > 0) setAvailableModels(health.available);
      });
    });
    
    // Initialize SovereignWeightsCore (Native Trillion-Dimensional)
    import('@/memory/SovereignWeightsCore').then(({ SovereignWeightsCore, sovereignWeightsCore }) => {
      const core = SovereignWeightsCore.getInstance();
      if (core) {
        console.log('[SovereignContext] SovereignWeightsCore:', core.getInfo());
      }
    });
  }, []);

  const sendMessageToChat = (content: string, type: Message['type'] = 'text') => {
    if (!currentSessionId) {
      const newId = `session_${Date.now()}`;
      const newSession: ChatSession = {
        id: newId,
        title: 'New Sovereign Task',
        messages: [{
          id: `msg_${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
          type
        }],
        timestamp: Date.now(),
        lastActive: Date.now()
      };
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newId);
    } else {
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, {
              id: `msg_${Date.now()}`,
              role: 'user',
              content,
              timestamp: Date.now(),
              type
            }],
            lastActive: Date.now()
          };
        }
        return s;
      }));
    }
    setUi(prev => ({ ...prev, activeView: 'chat' }));
  };

  const createNewChat = () => {
    const id = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: 'New Sovereign Task',
      messages: [],
      timestamp: Date.now(),
      lastActive: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(id);
    setUi(prev => ({ ...prev, activeView: 'chat' }));
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  };

  const clearAllHistory = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem('univ_os_v4_data');
    createNewChat();
  };

  return (
    <SovereignContext.Provider value={{
      sessions,
      currentSessionId,
      setCurrentSessionId,
      currentModel,
      setCurrentModel,
      neuralStatus,
      vitals,
      availableModels,
      hasOllama,
      ui,
      setUi,
      setSessions,
      createNewChat,
      deleteSession,
      clearAllHistory,
      sendMessageToChat
    }}>
      {children}
    </SovereignContext.Provider>
  );
};

export const useSovereign = () => {
  const context = useContext(SovereignContext);
  if (!context) throw new Error('useSovereign must be used within SovereignProvider');
  return context;
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
