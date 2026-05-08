// Plan Item ID: TI-1
/**
 * StudioRouter.ts - Smart Prompt to Studio Routing
 * 
 * Features:
 * - Intent detection from prompts
 * - Auto-navigation to studios
 * - Drag-drop playground builder
 * - Workspace automation
 */

import { useSovereign } from '@/context/SovereignContext';
import { useState } from 'react';

export interface StudioIntent {
  studio: string;
  action: string;
  confidence: number;
  params?: Record<string, any>;
}

export interface Workspace {
  id: string;
  name: string;
  studios: string[];
  layout: 'grid' | 'stack' | 'split';
  automations: Automation[];
}

export interface Automation {
  id: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

const STUDIO_KEYWORDS: Record<string, string[]> = {
  code: ['code', 'programming', 'developer', 'script', 'function', 'class', 'api', 'build', 'create component'],
  audio: ['audio', 'music', 'sound', 'song', 'beat', 'synthesize', 'generate audio', 'melody'],
  video: ['video', 'render', 'encode', 'edit video', 'generate video'],
  image: ['image', 'picture', 'generate image', 'draw', 'art', 'photo', 'create image'],
  '3d': ['3d', 'model', 'three.js', 'dimension', 'render 3d'],
  book: ['book', 'write', 'novel', 'chapter', 'story', 'author', 'document'],
  database: ['database', 'sql', 'query', 'table', 'schema', 'migrate', 'db'],
  network: ['network', 'http', 'request', 'api call', 'fetch', 'server'],
  iot: ['iot', 'device', 'sensor', 'smart home', 'arduino', 'raspberry'],
  game: ['game', 'gaming', 'play', 'unity', 'gameplay', 'level'],
  simulation: ['simulation', 'simulate', 'model', 'scientific', 'experiment'],
  security: ['security', 'scan', 'vulnerability', 'audit', 'encrypt', 'hack'],
  cloud: ['cloud', 'deploy', 'aws', 'vercel', 'hosting', 'infrastructure'],
  dataviz: ['chart', 'graph', 'visualize', 'dashboard', 'data', 'analytics'],
};

function detectStudioIntent(prompt: string): StudioIntent | null {
  const lowerPrompt = prompt.toLowerCase();
  
  let bestMatch = { studio: '', action: 'create', confidence: 0, params: {} };
  
  for (const [studio, keywords] of Object.entries(STUDIO_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        const confidence = keyword.length / 20; // Longer matches = higher confidence
        if (confidence > bestMatch.confidence) {
          bestMatch = { studio, confidence, action: 'create', params: {} };
        }
      }
    }
  }
  
  // Detect action keywords
  if (lowerPrompt.includes('edit') || lowerPrompt.includes('modify')) {
    bestMatch.action = 'edit';
  } else if (lowerPrompt.includes('view') || lowerPrompt.includes('show')) {
    bestMatch.action = 'view';
  } else if (lowerPrompt.includes('automate') || lowerPrompt.includes('workflow')) {
    bestMatch.action = 'automate';
  } else if (lowerPrompt.includes('generate') || lowerPrompt.includes('create')) {
    bestMatch.action = 'generate';
  }
  
  if (bestMatch.confidence > 0.15) {
    return bestMatch;
  }
  
  return null;
}

export function useStudioRouter() {
  const { ui, setUi } = useSovereign();
  
  const navigateToStudio = (studioId: string) => {
    setUi(prev => ({ ...prev, activeView: studioId }));
  };
  
  const detectAndNavigate = (prompt: string): boolean => {
    const intent = detectStudioIntent(prompt);
    if (intent) {
      navigateToStudio(intent.studio);
      return true;
    }
    return false;
  };
  
  return {
    navigateToStudio,
    detectAndNavigate,
    detectStudioIntent,
  };
}

export function useWorkspace() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  
  const createWorkspace = (name: string, studios: string[]) => {
    const workspace: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      studios,
      layout: 'grid',
      automations: [],
    };
    setWorkspaces(prev => [...prev, workspace]);
    return workspace;
  };
  
  const addAutomation = (workspaceId: string, automation: Omit<Automation, 'id'>) => {
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id === workspaceId) {
        return {
          ...ws,
          automations: [...ws.automations, { ...automation, id: `auto-${Date.now()}` }],
        };
      }
      return ws;
    }));
  };
  
  const removeWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
  };
  
  return {
    workspaces,
    createWorkspace,
    addAutomation,
    removeWorkspace,
  };
}

export default useStudioRouter;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
