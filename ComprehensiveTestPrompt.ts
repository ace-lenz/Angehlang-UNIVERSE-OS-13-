/**
 * ComprehensiveTestPrompt.ts - Progressive Performance Testing
 * 
 * Tests ALL 22 studios from Easy to Expert difficulty
 * Each level uses more studios and complex tasks
 */

import { qppuEngine } from './QPPUCore';
import { studioBenchmark, BenchmarkResult, StudioType } from './StudioBenchmarkSystem';

export type TestDifficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'quantum';

export interface TestLevel {
  difficulty: TestDifficulty;
  name: string;
  description: string;
  studios: StudioType[];
  taskComplexity: number;
  timeLimit: number;
}

export interface TestTask {
  id: string;
  difficulty: TestDifficulty;
  studio: StudioType;
  task: string;
  expectedOutput: string;
  data: any;
  points: number;
}

export interface TestSession {
  id: string;
  user: string;
  startTime: string;
  endTime?: string;
  difficulty: TestDifficulty;
  tasks: TestTask[];
  results: TaskResult[];
  totalScore: number;
  maxScore: number;
  percentScore: number;
  grade: string;
}

export interface TaskResult {
  taskId: string;
  task: string;
  studio: string;
  score: number;
  quality: string;
  latency: number;
  output: any;
  success: boolean;
  feedback: string;
}

const TEST_LEVELS: TestLevel[] = [
  {
    difficulty: 'easy',
    name: 'Foundation',
    description: 'Basic functionality tests for all studios',
    studios: ['book', 'video', 'image', 'audio'],
    taskComplexity: 1,
    timeLimit: 30000,
  },
  {
    difficulty: 'medium',
    name: 'Intermediate',
    description: 'Multi-studio integration tests',
    studios: ['code', '3d', 'dataviz', 'text', 'network'],
    taskComplexity: 2,
    timeLimit: 60000,
  },
  {
    difficulty: 'hard',
    name: 'Advanced',
    description: 'Complex system integration tests',
    studios: ['simulation', 'music-production', 'database', 'cloud', 'iot'],
    taskComplexity: 3,
    timeLimit: 90000,
  },
  {
    difficulty: 'expert',
    name: 'Expert',
    description: 'Full system orchestration tests',
    studios: ['security', 'game', 'os', 'browser', 'automation'],
    taskComplexity: 4,
    timeLimit: 120000,
  },
  {
    difficulty: 'quantum',
    name: 'Quantum Mastery',
    description: 'Ultimate QPPU-powered multi-studio tests',
    studios: ['intelligence', 'a2a', 'bio', 'text', 'simulation'],
    taskComplexity: 5,
    timeLimit: 180000,
  },
];

const TEST_TASKS: TestTask[] = [
  // EASY TASKS
  {
    id: 'easy-book-1',
    difficulty: 'easy',
    studio: 'book',
    task: 'Read introduction to Quantum Computing',
    expectedOutput: 'Formatted book chapter with key concepts',
    data: { chapter: 'intro', format: 'formatted' },
    points: 10,
  },
  {
    id: 'easy-video-1',
    difficulty: 'easy',
    studio: 'video',
    task: 'Play educational video about Qubits',
    expectedOutput: 'Video playback with controls',
    data: { video: 'qubit-basics', quality: 'hd' },
    points: 10,
  },
  {
    id: 'easy-image-1',
    difficulty: 'easy',
    studio: 'image',
    task: 'Generate diagram of quantum gate',
    expectedOutput: 'SVG gate diagram',
    data: { type: 'gate', format: 'svg' },
    points: 10,
  },
  {
    id: 'easy-audio-1',
    difficulty: 'easy',
    studio: 'audio',
    task: 'Play quantum physics lecture audio',
    expectedOutput: 'Audio playback',
    data: { track: 'lecture-1', format: 'mp3' },
    points: 10,
  },
  {
    id: 'easy-3d-1',
    difficulty: 'easy',
    studio: '3d',
    task: 'Render simple qubit visualization',
    expectedOutput: '3D model with rotation',
    data: { model: 'qubit', complexity: 'low' },
    points: 10,
  },

  // MEDIUM TASKS
  {
    id: 'medium-code-1',
    difficulty: 'medium',
    studio: 'code',
    task: 'Generate quantum gate implementation',
    expectedOutput: 'TypeScript code with tests',
    data: { gates: ['H', 'X', 'Z'], language: 'typescript' },
    points: 20,
  },
  {
    id: 'medium-dataviz-1',
    difficulty: 'medium',
    studio: 'dataviz',
    task: 'Create performance chart for QPPU metrics',
    expectedOutput: 'Interactive line chart',
    data: { metrics: ['cpu', 'memory'], type: 'line' },
    points: 20,
  },
  {
    id: 'medium-text-1',
    difficulty: 'medium',
    studio: 'text',
    task: 'Analyze sentiment of research abstract',
    expectedOutput: 'Sentiment score with entities',
    data: { text: 'quantum research', analysis: 'full' },
    points: 20,
  },
  {
    id: 'medium-network-1',
    difficulty: 'medium',
    studio: 'network',
    task: 'Scan local network for vulnerabilities',
    expectedOutput: 'Security report',
    data: { scan: 'quick', ports: 'common' },
    points: 20,
  },
  {
    id: 'medium-bio-1',
    difficulty: 'medium',
    studio: 'bio',
    task: 'Design basic DNA sequence for storage',
    expectedOutput: 'DNA sequence with validation',
    data: { length: '100bp', purpose: 'storage' },
    points: 20,
  },

  // HARD TASKS
  {
    id: 'hard-simulation-1',
    difficulty: 'hard',
    studio: 'simulation',
    task: 'Simulate MZI photonic circuit',
    expectedOutput: 'Simulation with timing analysis',
    data: { circuit: 'mzi-2x2', duration: '100ns' },
    points: 30,
  },
  {
    id: 'hard-music-1',
    difficulty: 'hard',
    studio: 'music-production',
    task: 'Compose quantum-themed soundtrack',
    expectedOutput: 'Full mix with effects',
    data: { duration: '2min', style: 'electronic', bpm: 140 },
    points: 30,
  },
  {
    id: 'hard-database-1',
    difficulty: 'hard',
    studio: 'database',
    task: 'Design ANGHV storage schema',
    expectedOutput: 'Optimized schema with indexes',
    data: { tables: 10, optimization: 'full' },
    points: 30,
  },
  {
    id: 'hard-cloud-1',
    difficulty: 'hard',
    studio: 'cloud',
    task: 'Deploy micro-services K8s cluster',
    expectedOutput: 'Running cluster with services',
    data: { services: 5, pods: 20 },
    points: 30,
  },
  {
    id: 'hard-iot-1',
    difficulty: 'hard',
    studio: 'iot',
    task: 'Setup sensor network with rules engine',
    expectedOutput: 'Active sensor network with automation',
    data: { sensors: 50, rules: ['threshold', 'scheduled'] },
    points: 30,
  },

  // EXPERT TASKS
  {
    id: 'expert-security-1',
    difficulty: 'expert',
    studio: 'security',
    task: 'Full OWASP security audit',
    expectedOutput: 'Comprehensive vulnerability report',
    data: { standard: 'OWASP Top 10', scope: 'full' },
    points: 40,
  },
  {
    id: 'expert-game-1',
    difficulty: 'expert',
    studio: 'game',
    task: 'Create quantum puzzle game with physics',
    expectedOutput: 'Playable game with 10 levels',
    data: { genre: 'puzzle', levels: 10, physics: true },
    points: 40,
  },
  {
    id: 'expert-os-1',
    difficulty: 'expert',
    studio: 'os',
    task: 'Optimize QPPU process scheduling',
    expectedOutput: 'Optimized kernel parameters',
    data: { processes: 100, algorithm: 'quantum-aware' },
    points: 40,
  },
  {
    id: 'expert-browser-1',
    difficulty: 'expert',
    studio: 'browser',
    task: 'Build privacy-focused quantum browser',
    expectedOutput: 'Browser with extensions',
    data: { privacy: 'paranoid', quantum: true, extensions: 5 },
    points: 40,
  },
  {
    id: 'expert-automation-1',
    difficulty: 'expert',
    studio: 'automation',
    task: 'Create full CI/CD pipeline',
    expectedOutput: 'Automated deployment pipeline',
    data: { stages: 5, triggers: ['push', 'pr', 'tag'] },
    points: 40,
  },

  // QUANTUM TASKS
  {
    id: 'quantum-intelligence-1',
    difficulty: 'quantum',
    studio: 'intelligence',
    task: 'Generate optimal QPPU learning path',
    expectedOutput: 'Complete learning plan with resources',
    data: { topic: 'QPPU', difficulty: 'expert', duration: '3months' },
    points: 50,
  },
  {
    id: 'quantum-a2a-1',
    difficulty: 'quantum',
    studio: 'a2a',
    task: 'Coordinate 10-agent research collaboration',
    expectedOutput: 'Collaborative research output',
    data: { agents: 10, task: 'research', coordination: 'hierarchical' },
    points: 50,
  },
  {
    id: 'quantum-bio-1',
    difficulty: 'quantum',
    studio: 'bio',
    task: 'Design quantum bio-computer DNA',
    expectedOutput: 'Validated DNA sequence for quantum computing',
    data: { length: '1000bp', purpose: 'quantum-computer', validation: 'full' },
    points: 50,
  },
  {
    id: 'quantum-simulation-1',
    difficulty: 'quantum',
    studio: 'simulation',
    task: 'Full quantum algorithm simulation',
    expectedOutput: 'Simulation with performance analysis',
    data: { algorithm: 'shor', qubits: 100, shots: 10000 },
    points: 50,
  },
  {
    id: 'quantum-integration-1',
    difficulty: 'quantum',
    studio: 'text',
    task: 'Generate comprehensive research summary',
    expectedOutput: 'Research paper with citations',
    data: { topic: 'quantum-computing', sections: 10, citations: 50 },
    points: 50,
  },
];

export class ComprehensiveTestPrompt {
  private sessions: Map<string, TestSession> = new Map();
  private currentSession: TestSession | null = null;

  getTestLevels(): TestLevel[] {
    return TEST_LEVELS;
  }

  getTasksByDifficulty(difficulty: TestDifficulty): TestTask[] {
    return TEST_TASKS.filter(t => t.difficulty === difficulty);
  }

  getAllTasks(): TestTask[] {
    return TEST_TASKS;
  }

  async startTestSession(user: string, difficulty?: TestDifficulty): Promise<TestSession> {
    const selectedDifficulty = difficulty || 'easy';
    const tasks = this.getTasksByDifficulty(selectedDifficulty);
    const level = TEST_LEVELS.find(l => l.difficulty === selectedDifficulty)!;

    const session: TestSession = {
      id: `session-${Date.now()}`,
      user,
      startTime: new Date().toISOString(),
      difficulty: selectedDifficulty,
      tasks,
      results: [],
      totalScore: 0,
      maxScore: tasks.reduce((sum, t) => sum + t.points, 0),
      percentScore: 0,
      grade: 'F',
    };

    this.sessions.set(session.id, session);
    this.currentSession = session;

    qppuEngine.activateQuantumMode('testing');
    
    return session;
  }

  async runNextTask(): Promise<TaskResult | null> {
    if (!this.currentSession) return null;

    const completedCount = this.currentSession.results.length;
    const tasks = this.currentSession.tasks;

    if (completedCount >= tasks.length) {
      return null;
    }

    const task = tasks[completedCount];
    const startTime = Date.now();

    const result = await studioBenchmark.runBenchmark(task.studio);

    const latency = Date.now() - startTime;
    const success = result.score >= 70;
    const score = success ? task.points : Math.floor(task.points * (result.score / 100));

    const taskResult: TaskResult = {
      taskId: task.id,
      task: task.task,
      studio: task.studio,
      score,
      quality: result.output.quality,
      latency,
      output: result.output,
      success,
      feedback: success 
        ? `Successfully completed with ${result.output.quality} quality`
        : `Needs improvement - Score: ${result.score.toFixed(0)}%`,
    };

    this.currentSession.results.push(taskResult);
    this.currentSession.totalScore += score;

    const percentScore = (this.currentSession.totalScore / this.currentSession.maxScore) * 100;
    this.currentSession.percentScore = percentScore;
    this.currentSession.grade = this.calculateGrade(percentScore);

    return taskResult;
  }

  async runFullSession(): Promise<TestSession> {
    if (!this.currentSession) {
      throw new Error('No active session. Call startTestSession first.');
    }

    for (let i = 0; i < this.currentSession.tasks.length; i++) {
      await this.runNextTask();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.currentSession.endTime = new Date().toISOString();
    return this.currentSession;
  }

  private calculateGrade(percentScore: number): string {
    if (percentScore >= 95) return 'A+';
    if (percentScore >= 90) return 'A';
    if (percentScore >= 85) return 'A-';
    if (percentScore >= 80) return 'B+';
    if (percentScore >= 75) return 'B';
    if (percentScore >= 70) return 'B-';
    if (percentScore >= 65) return 'C+';
    if (percentScore >= 60) return 'C';
    if (percentScore >= 55) return 'C-';
    if (percentScore >= 50) return 'D';
    return 'F';
  }

  getCurrentSession(): TestSession | null {
    return this.currentSession;
  }

  getSession(sessionId: string): TestSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionHistory(): TestSession[] {
    return Array.from(this.sessions.values());
  }

  getDifficultySummary(difficulty: TestDifficulty): { tasks: number; maxPoints: number; studios: number } {
    const tasks = this.getTasksByDifficulty(difficulty);
    const studios = new Set(tasks.map(t => t.studio));
    
    return {
      tasks: tasks.length,
      maxPoints: tasks.reduce((sum, t) => sum + t.points, 0),
      studios: studios.size,
    };
  }
}

export const testPrompt = new ComprehensiveTestPrompt();