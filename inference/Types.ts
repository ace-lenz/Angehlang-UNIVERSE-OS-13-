// Plan Item ID: TI-1
import { CandidateResult, StudioView, Task, ScoringAgent, VirtualFile } from '@/types';

export interface DeepAnalysis {
  intent: string;
  complexity: string;
  keywords: string[];
  approach: string;
  studio: StudioView['type'];
}

export interface GeneratedFile {
  name: string;
  language: string;
  content: string;
  description: string;
}

export interface Solution {
  files: GeneratedFile[];
  summary: string;
}

export interface PlanItem {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
}

export interface TopAnswer {
  name: string;
  description: string;
  score: number;
}

export interface TestResult {
  passed: number;
  failed: number;
  total: number;
  errors: string[];
}

export interface ProcessPhase {
  phase: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  details: string;
  duration: number;
}

export interface FileContent {
  name: string;
  title: string;
  body?: string;
  type: 'file' | 'folder';
  children?: FileContent[];
  qualityScore: number;
  refinementLevel: number;
}

export interface AutonomousProcess {
  id: string;
  status: 'active' | 'completed' | 'idle';
  currentStep: string;
  progress: number;
  prompt?: string;
  phases?: ProcessPhase[];
  selectedCandidate?: CandidateResult;
  researchData?: Record<string, string>;
  plan?: Task[];
  fileContents?: FileContent[];
  refinementLoop?: number;
  qualityScore?: number;
  isComplete?: boolean;
}

export interface LearnResult {
  source: 'cache' | 'online' | 'offline';
  content: string;
  results?: { title: string; snippet: string; link: string }[];
}

export interface Intent {
  complexity: 'simple' | 'moderate' | 'complex';
  requiresTool: string | null;
  requiresGenerator: 'image' | 'video' | '3d' | 'system' | 'bio' | 'automation' | 'research' | 'music' | null;
  subIntents: string[];
  confidence: number;
  studio: string;
}

export interface ContentUnit {
  id: string;
  title: string;
  body: string;
  score: number;
  perfectionistScore: number;
  engineerScore: number;
  diversityScore: number;
  totalScore: number;
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
