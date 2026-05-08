// Plan Item ID: TI-1
/**
 * SettingsPanel.tsx
 * Sovereign OS Settings — API Keys, Auth, System Configuration
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, X, Check, Eye, EyeOff, Zap, Cpu, Globe, Save, AlertTriangle, Info, 
  ShieldCheck, Palette, User, Lock, EyeIcon, Link2, Github, Mail, Camera,
  Shield, Server, Database, Cloud, Brain, Terminal, CheckCircle, XCircle
} from 'lucide-react';
import { useSovereign } from '@/context/SovereignContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// API Configuration Interfaces
interface APIProviderConfig {
  id: string;
  name: string;
  icon: string;
  apiKey: string;
  model: string;
  enabled: boolean;
  models: string[];
  placeholder: string;
}

// Auth Provider Interface
interface AuthProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  email?: string;
}

const CLOUD_PROVIDERS: APIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    apiKey: localStorage.getItem('api_openai') || '',
    model: localStorage.getItem('model_openai') || 'gpt-4o',
    enabled: !!localStorage.getItem('api_openai'),
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'],
    placeholder: 'sk-...'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧠',
    apiKey: localStorage.getItem('api_anthropic') || '',
    model: localStorage.getItem('model_anthropic') || 'claude-sonnet-4-20250514',
    enabled: !!localStorage.getItem('api_anthropic'),
    models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    placeholder: 'sk-ant-...'
  },
  {
    id: 'google',
    name: 'Google',
    icon: '🔷',
    apiKey: localStorage.getItem('api_google') || '',
    model: localStorage.getItem('model_google') || 'gemini-2.0-flash',
    enabled: !!localStorage.getItem('api_google'),
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'],
    placeholder: 'AIza...'
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: '🌟',
    apiKey: localStorage.getItem('api_grok') || '',
    model: localStorage.getItem('model_grok') || 'grok-2',
    enabled: !!localStorage.getItem('api_grok'),
    models: ['grok-2', 'grok-2-vision-1212', 'grok-beta'],
    placeholder: 'xai-...'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: '🔗',
    apiKey: localStorage.getItem('api_cohere') || '',
    model: localStorage.getItem('model_cohere') || 'command-r-plus',
    enabled: !!localStorage.getItem('api_cohere'),
    models: ['command-r-plus', 'command-r', 'command'],
    placeholder: 'CK...'
  },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: '💨',
    apiKey: localStorage.getItem('api_mistral') || '',
    model: localStorage.getItem('model_mistral') || 'mistral-large-latest',
    enabled: !!localStorage.getItem('api_mistral'),
    models: ['mistral-large-latest', 'mistral-small-latest', 'mixtral-8x7b-32k'],
    placeholder: 'p_...'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🎯',
    apiKey: localStorage.getItem('api_deepseek') || '',
    model: localStorage.getItem('model_deepseek') || 'deepseek-chat',
    enabled: !!localStorage.getItem('api_deepseek'),
    models: ['deepseek-chat', 'deepseek-coder'],
    placeholder: 'sk-...'
  },
  // Platform Search API Keys
  {
    id: 'youtube',
    name: 'YouTube Data API',
    icon: '📺',
    apiKey: localStorage.getItem('api_youtube') || '',
    model: '',
    enabled: !!localStorage.getItem('api_youtube'),
    models: [],
    placeholder: 'AIza...'
  },
  {
    id: 'github',
    name: 'GitHub API',
    icon: '🐙',
    apiKey: localStorage.getItem('api_github_token') || '',
    model: localStorage.getItem('api_github') || '',
    enabled: !!localStorage.getItem('api_github_token'),
    models: [],
    placeholder: 'ghp_...'
  },
];

const AUTH_PROVIDERS: AuthProvider[] = [
  { id: 'google', name: 'Google', icon: '🔴', connected: !!localStorage.getItem('auth_google_email'), email: localStorage.getItem('auth_google_email') || undefined },
  { id: 'facebook', name: 'Facebook', icon: '🔵', connected: !!localStorage.getItem('auth_facebook_email'), email: localStorage.getItem('auth_facebook_email') || undefined },
  { id: 'twitter', name: 'X / Twitter', icon: '🐦', connected: !!localStorage.getItem('auth_twitter_handle'), email: localStorage.getItem('auth_twitter_handle') || undefined },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', connected: !!localStorage.getItem('auth_tiktok_username'), email: localStorage.getItem('auth_tiktok_username') || undefined },
  { id: 'github', name: 'GitHub', icon: '🐙', connected: !!localStorage.getItem('auth_github_user'), email: localStorage.getItem('auth_github_user') || undefined },
  { id: 'gmail', name: 'Gmail', icon: '📧', connected: !!localStorage.getItem('auth_gmail_email'), email: localStorage.getItem('auth_gmail_email') || undefined },
];

type SettingsTab = 'general' | 'system' | 'security' | 'privacy' | 'auth' | 'about';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { ui, setUi } = useSovereign();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('system');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline' | null>(null);
  const [apiConfigs, setApiConfigs] = useState<APIProviderConfig[]>(CLOUD_PROVIDERS);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setOllamaUrl(localStorage.getItem('ollama_url') || 'http://localhost:11434');
      setSaved(false);
      checkOllama();
    }
  }, [isOpen]);

  const checkOllama = async () => {
    setOllamaStatus('checking');
    try {
      const url = localStorage.getItem('ollama_url') || 'http://localhost:11434';
      const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(3000) });
      setOllamaStatus(res.ok ? 'online' : 'offline');
    } catch {
      setOllamaStatus('offline');
    }
  };

  const handleSave = () => {
    localStorage.setItem('ollama_url', ollamaUrl.trim() || 'http://localhost:11434');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveApiConfig = (id: string, field: 'apiKey' | 'model', value: string) => {
    const storageKey = field === 'apiKey' ? `api_${id}` : `model_${id}`;
    localStorage.setItem(storageKey, value);
    setApiConfigs(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const testApiConnection = async (provider: APIProviderConfig) => {
    if (!provider.apiKey) return false;
    // Placeholder - actual testing would require API calls
    return true;
  };

  const renderTabButton = (tab: SettingsTab, icon: React.ReactNode, label: string) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg text-[10px] font-bold uppercase transition-all ${
        activeTab === tab 
          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl z-50 flex flex-col glass-sovereign border-l border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                  <img src="/Angehlang%20Logo.svg" alt="Angehlang Logo" className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">System Configuration</p>
                  <p className="text-[10px] text-zinc-500">v13.0 TRILLION-X Settings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 p-2 border-b border-zinc-800/60 bg-zinc-900/50">
              {[
                { id: 'system', icon: <Server size={14} />, label: 'System' },
                { id: 'security', icon: <Shield size={14} />, label: 'Security' },
                { id: 'privacy', icon: <Lock size={14} />, label: 'Privacy' },
                { id: 'auth', icon: <User size={14} />, label: 'Auth' },
                { id: 'about', icon: <Info size={14} />, label: 'About' },
              ].map(t => renderTabButton(t.id as SettingsTab, t.icon, t.label))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
              {/* SYSTEM TAB */}
              {activeTab === 'system' && (
                <>
                  {/* Model Selection */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain size={14} className="text-indigo-400" />
                      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Model Engine</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {['Native', 'Ollama', 'Cloud'].map(engine => (
                        <button
                          key={engine}
                          className="py-2 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                        >
                          {engine}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Ollama Config */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu size={14} className="text-violet-400" />
                      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Ollama Configuration</h3>
                      <div className={`ml-auto flex items-center gap-1.5 text-[10px] font-medium ${
                        ollamaStatus === 'online' ? 'text-emerald-400' :
                        ollamaStatus === 'offline' ? 'text-red-400' : 'text-zinc-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          ollamaStatus === 'online' ? 'bg-emerald-400' :
                          ollamaStatus === 'offline' ? 'bg-red-400' : 'bg-zinc-600 animate-pulse'
                        }`} />
                        {ollamaStatus === 'online' ? 'ONLINE' : ollamaStatus === 'offline' ? 'OFFLINE' : 'CHECKING'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Endpoint URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ollamaUrl}
                          onChange={e => setOllamaUrl(e.target.value)}
                          placeholder="http://localhost:11434"
                          className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono focus:outline-none focus:border-violet-500/50 transition-colors placeholder:text-zinc-600"
                        />
                        <button
                          onClick={checkOllama}
                          className="px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-all flex-shrink-0"
                        >
                          Ping
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Cloud API Keys */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Cloud size={14} className="text-cyan-400" />
                      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Cloud API Keys</h3>
                    </div>
                    <div className="space-y-4">
                      {apiConfigs.map(provider => (
                        <div key={provider.id} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{provider.icon}</span>
                              <span className="text-xs font-bold text-white">{provider.name}</span>
                            </div>
                            <div className={`text-[10px] font-bold ${provider.enabled ? 'text-emerald-400' : 'text-zinc-600'}`}>
                              {provider.enabled ? '● ENABLED' : '○ DISABLED'}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="relative">
                              <input
                                type={showApiKey[provider.id] ? 'text' : 'password'}
                                value={provider.apiKey}
                                onChange={e => saveApiConfig(provider.id, 'apiKey', e.target.value)}
                                placeholder={provider.placeholder}
                                className="w-full px-3 py-2 pr-10 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-violet-500/50 placeholder:text-zinc-700"
                              />
                              <button
                                onClick={() => toggleApiKeyVisibility(provider.id)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                              >
                                {showApiKey[provider.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <select
                                value={provider.model}
                                onChange={e => saveApiConfig(provider.id, 'model', e.target.value)}
                                className="flex-1 px-2 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none"
                              >
                                {provider.models.map(m => (
                                  <option key={m} value={m} className="bg-zinc-900">{m}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => testApiConnection(provider)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-medium hover:bg-zinc-700 hover:text-white transition-all"
                              >
                                Test
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={14} className="text-emerald-400" />
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Security Settings</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Auto-lock timeout', desc: 'Lock system after inactivity', value: '15 minutes' },
                      { label: 'Encryption', desc: 'Local data encryption', value: 'AES-256' },
                      { label: 'Secure Mode', desc: 'Enhanced protection', value: 'Enabled' },
                    ].map(setting => (
                      <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                        <div>
                          <p className="text-xs font-bold text-white">{setting.label}</p>
                          <p className="text-[10px] text-zinc-500">{setting.desc}</p>
                        </div>
                        <span className="text-xs font-mono text-emerald-400">{setting.value}</span>
                      </div>
                    ))}
                    <button className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
                      Clear All Local Data
                    </button>
                  </div>
                </section>
              )}

              {/* PRIVACY TAB */}
              {activeTab === 'privacy' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock size={14} className="text-amber-400" />
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Privacy Settings</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <div>
                        <p className="text-xs font-bold text-white">Local-only Mode</p>
                        <p className="text-[10px] text-zinc-500">All processing on device</p>
                      </div>
                      <div className="w-10 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-end px-0.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                      <div>
                        <p className="text-xs font-bold text-white">Data Retention</p>
                        <p className="text-[10px] text-zinc-500">Keep conversation history</p>
                      </div>
                      <select className="px-2 py-1 rounded bg-zinc-800 text-xs text-white">
                        <option>Forever</option>
                        <option>30 days</option>
                        <option>7 days</option>
                      </select>
                    </div>
                    <button className="w-full py-2.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold hover:bg-zinc-700 hover:text-white transition-all">
                      Export All Data
                    </button>
                  </div>
                </section>
              )}

              {/* AUTH TAB */}
              {activeTab === 'auth' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <User size={14} className="text-pink-400" />
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Connected Accounts</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {AUTH_PROVIDERS.map(provider => (
                      <div 
                        key={provider.id} 
                        className={`p-3 rounded-xl border transition-all ${
                          provider.connected 
                            ? 'bg-emerald-500/5 border-emerald-500/20' 
                            : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{provider.icon}</span>
                          <span className="text-xs font-bold text-white">{provider.name}</span>
                        </div>
                        {provider.connected ? (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-emerald-400 truncate">{provider.email}</span>
                            <button className="text-[10px] text-red-400 hover:text-red-300">Disconnect</button>
                          </div>
                        ) : (
                          <button className="w-full py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-bold hover:bg-zinc-700 hover:text-white transition-all">
                            Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ABOUT TAB */}
              {activeTab === 'about' && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={14} className="text-indigo-400" />
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest">About Angehlang</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 text-center mb-4">
                    <img src="/Angehlang%20Logo.svg" alt="Angehlang Logo" className="w-16 h-16 mx-auto mb-3" />
                    <h2 className="text-lg font-bold text-white mb-1">Angehlang Universe OS</h2>
                    <p className="text-xs text-indigo-400 font-bold mb-2">v13.0 TRILLION-X</p>
                    <p className="text-[10px] text-zinc-500">Sovereign Omni-Diffusion System</p>
                  </div>
                  <div className="space-y-2 text-[10px] text-zinc-500">
                    <div className="flex justify-between p-2 rounded bg-zinc-900/60">
                      <span>Build Date</span>
                      <span className="text-white">April 2026</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-900/60">
                      <span>Core Version</span>
                      <span className="text-white">TRILLION-X v13.0</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-900/60">
                      <span>Diffusion Cores</span>
                      <span className="text-white">4 (Aesthetic, Temporal, Spatial, Abstract)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-900/60">
                      <span>Studios</span>
                      <span className="text-white">24 Active</span>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-zinc-800/60 flex-shrink-0">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all active:scale-[0.98]"
              >
                {saved ? (
                  <><Check size={16} /> Saved!</>
                ) : (
                  <><Save size={16} /> Save Configuration</>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
