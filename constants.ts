// Plan Item ID: TI-1
import { Code2, Search, ShieldCheck, Lightbulb, Zap, Dna, Youtube, Github, BookOpen, Globe, Twitter, MessageCircle, Code } from 'lucide-react';
import { Agent } from '@/types';

export const UI_VERSION = '13.0.0';
export const UI_NAME = 'SOVEREIGN';
export const APP_VERSION = UI_VERSION;

export const VERSION_FEATURES: Record<string, string[]> = {
  '9': ['Photonics Lattice v2', 'Quantum Coherence Engine', 'MZIs Array Expansion'],
  '10': ['Trillion-X Core', 'Native Sovereign Pipeline', 'Zeta-Scale Vectorization'],
  '11': ['Recursive Refinement Loop', 'Unlimited Context Window', 'Meta-Learning Engine'],
  '12': ['Hot-Swap Agents', 'Real-Time Code Mod', 'Ultra Mode v2', 'Dream State Synthesis'],
  '13': [
    'SyntheticIntuitionEngine (SYNTH-3): Zero-token quantum synthesis',
    'PhotonicTensorCore (PHOTON-1): O(1) light-speed computing',
    'AutonomousMathematicsEngine (AUTO-4): Theorem discovery & proof',
    'SelfModificationEngine (AUTO-1): Self-rewriting code in real-time',
    'OmniscientContextEngine (AUTO-6): Infinite holographic context',
    'SuperIntelligenceVanguard (SYNTH-1): Trillion-X superiority orchestrator',
    'QuantumSwarmConsensus (SWARM-2): 30+ agent quantum voting',
    'SovereignDreamState (SYNTH-10): 24/7 autonomous evolution'
  ]
};

export const AGENTS: Record<string, Agent> = {
  ENGINEER: { id: 'ENGINEER', name: "Lead_Engineer", icon: Code2, color: "text-blue-400", specialty: "Architecture & Code" },
  RESEARCHER: { id: 'RESEARCHER', name: "Research_Agent", icon: Search, color: "text-purple-400", specialty: "Data Synthesis" },
  PERFECTIONIST: { id: 'PERFECTIONIST', name: "Perfectionist_Agent", icon: ShieldCheck, color: "text-green-400", specialty: "Validation & QA" },
  CREATIVE: { id: 'CREATIVE', name: "Creative_Director", icon: Lightbulb, color: "text-amber-400", specialty: "Generative Arts" },
  AUTOMATOR: { id: 'AUTOMATOR', name: "Automation_Master", icon: Zap, color: "text-indigo-400", specialty: "Workflow Optimization" },
  BIO_ARCHITECT: { id: 'BIO_ARCHITECT', name: "Bio_Architect", icon: Dna, color: "text-emerald-400", specialty: "Synthetic Biology" },
  
  // Platform Search Agents
  YOUTUBE_SEARCH: { id: 'YOUTUBE_SEARCH', name: "YouTube_Search_Agent", icon: Youtube, color: "text-red-400", specialty: "Video Search" },
  GITHUB_SEARCH: { id: 'GITHUB_SEARCH', name: "GitHub_Search_Agent", icon: Github, color: "text-gray-400", specialty: "Code Search" },
  WIKI_SEARCH: { id: 'WIKI_SEARCH', name: "Wiki_Search_Agent", icon: BookOpen, color: "text-slate-400", specialty: "Knowledge Search" },
  WEB_SEARCH: { id: 'WEB_SEARCH', name: "Web_Search_Agent", icon: Globe, color: "text-cyan-400", specialty: "Web Search" },
  TWITTER_SEARCH: { id: 'TWITTER_SEARCH', name: "Twitter_Search_Agent", icon: Twitter, color: "text-sky-400", specialty: "Social Search" },
  REDDIT_SEARCH: { id: 'REDDIT_SEARCH', name: "Reddit_Search_Agent", icon: MessageCircle, color: "text-orange-400", specialty: "Community Search" },
  STACKOVERFLOW_SEARCH: { id: 'STACKOVERFLOW_SEARCH', name: "StackOverflow_Search_Agent", icon: Code, color: "text-blue-600", specialty: "Q&A Search" }
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
