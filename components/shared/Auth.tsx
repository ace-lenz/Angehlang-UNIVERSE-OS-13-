import { useState, createContext, useContext, useEffect, ReactNode } from 'react';
import { User, LogOut, Search, Shield, Database, Brain, Key, Github, Twitter, Facebook, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isPro: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  verificationTier: 0 | 1 | 2 | 3; // 0: Unverified, 1: Node-Verified, 2: Sovereign-Verified, 3: Omni-Prime
  joinedAt: string;
  lastLogin: string;
  memories: number;
  searchCredits: number;
  synapticSignature?: string;
  provider: 'google' | 'github' | 'twitter' | 'facebook' | 'duckduckgo' | 'brave' | 'internal';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithProvider: (provider: string) => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  upgradeToPro: () => void;
  addMemory: (content: string) => void;
  useSearchCredit: () => boolean;
  verifyUser: () => Promise<void>;
  checkNodeIntegrity: () => Promise<boolean>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

function getUsers(): Record<string, User> {
  const saved = localStorage.getItem('angeh_users');
  return saved ? JSON.parse(saved) : {};
}

function saveUsers(users: Record<string, User>) {
  localStorage.setItem('angeh_users', JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('angeh_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Auto-create guest user (no login required)
      const guestUser: User = {
        id: 'guest_' + Date.now(),
        username: 'guest',
        email: 'guest@local',
        isPro: true, // Guest gets pro privileges
        isAdmin: false,
        isVerified: true,
        verificationTier: 2, // Sovereign by default for local guest
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        memories: 999,
        searchCredits: 999,
        synapticSignature: `SIG_${Math.random().toString(36).substring(7).toUpperCase()}`,
        provider: 'internal'
      };
      setUser(guestUser);
      localStorage.setItem('angeh_current_user', JSON.stringify(guestUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    // Instant - no delay
    
    const users = getUsers();
    const userKey = username.toLowerCase();
    const storedUser = users[userKey];
    
    if (storedUser && storedUser.email === password) {
      const updatedUser = { ...storedUser, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
      users[userKey] = updatedUser;
      saveUsers(users);
      localStorage.setItem('angeh_current_user', JSON.stringify(updatedUser));
      setIsLoading(false);
      return true;
    }
    
    setError('Invalid credentials');
    setIsLoading(false);
    return false;
  };

  const loginWithProvider = (provider: string) => {
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const mockUser: User = {
        id: `${provider}_${Date.now()}`,
        username: `${provider}_user_${Date.now().toString(36)}`,
        email: `user@${provider}.com`,
        avatar: undefined,
        isPro: false,
        isAdmin: false,
        isVerified: false,
        verificationTier: 0,
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        memories: provider === 'google' ? 100 : 50,
        searchCredits: provider === 'google' ? 200 : 100,
        provider: provider as User['provider']
      };
      
      setUser(mockUser);
      localStorage.setItem('angeh_current_user', JSON.stringify(mockUser));
      
      const users = getUsers();
      users[mockUser.username.toLowerCase()] = mockUser;
      saveUsers(users);
      
      setIsLoading(false);
    }, 1000);
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    // Instant - no delay
    
    const users = getUsers();
    const userKey = username.toLowerCase();
    
    if (users[userKey]) {
      setError('Username already exists');
      setIsLoading(false);
      return false;
    }
    
    const newUser: User = {
      id: 'user_' + Date.now(),
      username,
      email,
      avatar: undefined,
      isPro: false,
      isAdmin: username.toLowerCase() === 'admin',
      isVerified: false,
      verificationTier: 0,
      joinedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      memories: 0,
      searchCredits: 100,
      provider: 'internal'
    };
    
    users[userKey] = newUser;
    saveUsers(users);
    setUser(newUser);
    localStorage.setItem('angeh_current_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('angeh_current_user');
  };

  const upgradeToPro = () => {
    if (user) {
      const proUser = { ...user, isPro: true, searchCredits: 1000 };
      setUser(proUser);
      localStorage.setItem('angeh_current_user', JSON.stringify(proUser));
      const users = getUsers();
      users[user.username.toLowerCase()] = proUser;
      saveUsers(users);
    }
  };

  const addMemory = (content: string) => {
    if (user) {
      const memories = (user.memories || 0) + 1;
      const updatedUser = { ...user, memories };
      setUser(updatedUser);
      localStorage.setItem('angeh_current_user', JSON.stringify(updatedUser));
      const memoryKey = `memory_${Date.now()}`;
      localStorage.setItem(memoryKey, JSON.stringify({ content, timestamp: new Date().toISOString(), userId: user.id }));
    }
  };

  const useSearchCredit = (): boolean => {
    // Always allow - no credit restrictions
    return true;
  };

  const verifyUser = async () => {
    if (!user) return;
    const nextTier = Math.min(3, user.verificationTier + 1) as User['verificationTier'];
    const updatedUser = { ...user, isVerified: true, verificationTier: nextTier };
    setUser(updatedUser);
    localStorage.setItem('angeh_current_user', JSON.stringify(updatedUser));
  };

  const checkNodeIntegrity = async () => {
    // Simulated deep check of storage and session DNA
    const hasDNA = !!localStorage.getItem('univ_os_quantum_storage_v4');
    return hasDNA;
  };

  return (
    <AuthContext.Provider value={{ 
      user, isLoading, isAuthenticated: !!user, isPro: !!user?.isPro, 
      login, loginWithProvider, register, logout, upgradeToPro, addMemory, useSearchCredit, 
      verifyUser, checkNodeIntegrity, error 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthButton() {
  const { user, isLoading, login, loginWithProvider, logout, upgradeToPro, verifyUser, isAuthenticated, isPro, error } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) {
    return <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowLogin(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-bold text-sm">
          <Key size={16} /><span>Login / Register</span>
        </motion.button>
        <AnimatePresence>{showLogin && <LoginModal onClose={() => setShowLogin(false)} />}</AnimatePresence>
      </>
    );
  }

  return (
    <div className="relative">
      <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
        {user?.avatar ? <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full" /> : <User size={16} className="text-indigo-400" />}
        {user?.username}
        {user?.isVerified && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" title={`Verified Node: Tier ${user.verificationTier}`} />}
        {user?.isPro && <Shield size={12} className="text-amber-400" />}
      </motion.button>
      <AnimatePresence>
        {showDropdown && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-64 glass-blur border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="p-3 border-b border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">{user?.username}</p>
                {user?.isVerified && <span className="text-[8px] font-black text-indigo-400 px-1.5 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20">TIER_{user.verificationTier}</span>}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400"><Globe size={10} /> {user?.provider}</div>
              <div className="flex gap-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><Brain size={10} /> {user?.memories || 0} memories</span>
                <span className="flex items-center gap-1"><Search size={10} /> {user?.searchCredits || 0} credits</span>
              </div>
            </div>
            {user?.verificationTier !== undefined && user.verificationTier < 3 && (
              <button onClick={verifyUser} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors">
                <Shield size={14} className="text-indigo-400" />
                <span className="text-xs text-indigo-400 font-medium tracking-tight">Upgrade Verification</span>
              </button>
            )}
            {!user?.isPro && <button onClick={upgradeToPro} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"><Shield size={14} className="text-amber-400" /><span className="text-xs text-amber-400 font-medium">Upgrade to Pro</span></button>}
            <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-500/10 transition-colors text-red-400"><LogOut size={14} /><span className="text-xs">Logout</span></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loginWithProvider, error } = useAuth();

  const handleOAuth = (provider: string) => { loginWithProvider(provider); onClose(); };
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); let success = isRegister ? await register(username, email, password) : await login(username, password); if (success) onClose(); };

  const providers = [
    { id: 'google', name: 'Google', icon: Globe, color: 'text-blue-400' },
    { id: 'github', name: 'GitHub', icon: Github, color: 'text-white' },
    { id: 'twitter', name: 'X/Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'duckduckgo', name: 'DuckDuckGo', icon: Search, color: 'text-orange-400' },
    { id: 'brave', name: 'Brave', icon: Shield, color: 'text-amber-400' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="glass-blur border border-white/10 rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-2 text-center">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-xs text-slate-400 text-center mb-4">Login with your preferred account</p>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {providers.map(p => (
            <motion.button key={p.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleOAuth(p.id)} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <p.icon size={20} className={p.color} />
              <span className="text-[8px]">{p.name}</span>
            </motion.button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 my-4"><div className="flex-1 h-px bg-white/10" /><span className="text-[10px] text-slate-500">OR</span><div className="flex-1 h-px bg-white/10" /></div>
        
        {error && <div className="mb-4 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-400">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500" required />
          {isRegister && <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500" required />}
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500" required />
          <button type="submit" className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors">{isRegister ? 'Create Account' : 'Login'}</button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} className="w-full mt-3 text-xs text-slate-400 hover:text-white transition-colors">{isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}</button>
      </motion.div>
    </motion.div>
  );
}

export function OnlineSearchGate({ children, showWhenLocked = false }: { children: ReactNode; showWhenLocked?: boolean }) {
  const { user, isAuthenticated, isPro, useSearchCredit } = useAuth();
  const hasAccess = true; // Always allow - no restrictions
  if (!showWhenLocked && !hasAccess) return <>{children}</>;
  if (!hasAccess) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-8 rounded-2xl glass-blur border border-indigo-500/20 bg-indigo-500/5">
        <Search size={32} className="text-indigo-400 mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Search Credits Required</h3>
        <p className="text-xs text-slate-400 text-center max-w-xs mb-4">Login with Google, GitHub, X, Facebook, DuckDuckGo, or Brave to get free search credits!</p>
        <AuthButton />
      </motion.div>
    );
  }
  return <>{children}</>;
}

export function getAccessToken(): string | null { const user = localStorage.getItem('angeh_current_user'); return user ? JSON.parse(user).id : null; }
export function hasSearchCredits(): boolean { return true; } // Always allow
export function consumeSearchCredit(): boolean { return true; } // No restrictions
