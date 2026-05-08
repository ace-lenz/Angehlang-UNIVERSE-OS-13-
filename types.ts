// Plan Item ID: TI-1
import { LucideIcon } from 'lucide-react';

export interface VirtualFile {
  name: string;
  content?: string;
  type: 'file' | 'folder';
  children?: VirtualFile[];
}

export interface Task {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  subtasks?: Task[];
  progress: number;
}

export interface ScoringAgent {
  id: string;
  name: string;
  score: number;
  feedback: string;
}

export interface CandidateResult {
  id: string;
  content: string;
  score: number;
  selected: boolean;
  scores: ScoringAgent[];
  retryCount: number;
}

// ============ Studio Data Contracts ============

export interface AudioLayer {
  id: string;
  name: string;
  frequency: number;
  type: OscillatorType | string;
  gain: number;
  active: boolean;
  color: string;
  detune?: number;
}

export interface AudioData {
  preset?: 'ambient' | 'synthwave' | 'lo-fi' | 'quantum';
  layers?: AudioLayer[];
  masterGain?: number;
  filterFreq?: number;
}

export interface CodeFile {
  name: string;
  content?: string;
  type: 'file' | 'folder';
  children?: CodeFile[];
  language?: string;
}

export interface CodeData {
  files: CodeFile[];
  title?: string;
  description?: string;
  activeFilePath?: string;
}

export interface BioNode {
  id: string;
  type: 'neuron' | 'synapse' | 'dna' | 'protein';
  status: 'active' | 'inhibited' | 'mutating';
  value: number;
}

export interface BioData {
  genomeId: string;
  nodes: BioNode[];
  synthesisLog: string[];
  strand?: any[]; // For DNA visualization back-compat
}

export interface AutomationTask {
  id: string;
  name: string;
  progress: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface AutomationData {
  workflow: string;
  tasks: AutomationTask[];
}

export interface ImagePrompt {
  id: string;
  prompt: string;
  style: string;
  timestamp: number;
  url?: string;
}

export interface ImageGalleryData {
  prompts: ImagePrompt[];
  activeStyle?: string;
}

export interface BookPage {
  id: string;
  title: string;
  content: string;
  elements: any[];
}

export interface BookContent {
  id: string;
  title: string;
  author: string;
  pages: BookPage[];
  category?: string;
}

export type StudioData = 
  | AudioData 
  | CodeData 
  | BioData 
  | AutomationData 
  | ImageGalleryData 
  | BookContent 
  | ThreeDData
  | VideoData
  | { mission: string; artifacts: string[]; learningPulse: number[] };

export interface ThreeDData {
  nodes: any[];
  environment: string;
  latticeTelemetry?: any;
}

export interface VideoData {
  scenes: any[];
  environment: string;
  latticeTelemetry?: any;
}

export interface StudioView {
  type: '3d' | 'video' | 'image' | 'automation' | 'research' | 'music' | 'system' | 'book' | 'knowledge' | 'code' | 'bio'
    | 'network' | 'dataviz' | 'simulation' | 'music-production' | 'text' | 'security' | 'database'
    | 'cloud' | 'iot' | 'game' | 'browser' | 'os' | 'intelligence' | 'a2a' | 'benchmark' | 'test' | 'evolution';
  data: StudioData;
  status: 'active' | 'generating' | 'completed';
}

// ============ Chat & Mission Orchestration ============

export interface Message {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number | string;
  thinking?: string[];
  thinkingTrace?: string[]; // Internal AI dialogue / Neural Pulse
  studioView?: StudioView;   // Specialized studio data
  type?: 'text' | 'image' | 'video' | '3d' | 'system' | 'bio' | 'automation' | 'research' | 'music' | 'book';
  audioUrl?: string;
  files?: { name: string; type: string; size: number; url?: string }[];
  virtualFiles?: VirtualFile[];
  comments?: string;
  plan?: Task[];
  topSelections?: CandidateResult[]; // Best-of-3 candidates
  agentScores?: ScoringAgent[];      // Scoring agent results
  isSearching?: boolean;    // For Visual Pulse
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number | string;
  lastActive?: number;
}

export interface Agent {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  specialty: string;
}

// ============ Mission & Artifact Orchestration ============

export interface Artifact {
  id: string;
  type: 'plan' | 'code_diff' | 'screenshot' | 'test_result' | 'analysis' | 'document';
  content: any; // Explicitly allowed context-dependent content
  createdBy: string; // Agent ID
  parentMissionId?: string;
  timestamp: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface MissionStep {
  id: string;
  role: string;
  action: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  result?: string | Record<string, unknown>;
  multiFile?: boolean;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  steps: MissionStep[];
  artifacts: string[]; // List of Artifact IDs
  startTime: number;
  endTime?: number;
}

export interface FileNode {
  path: string;
  exports: string[];
  imports: string[];
  classes: string[];
  functions: string[];
}

export interface PatchOperation {
  file: string;
  operation: 'replace' | 'insertAfter' | 'insertBefore' | 'delete';
  anchor?: string;
  newCode: string;
  description: string;
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
