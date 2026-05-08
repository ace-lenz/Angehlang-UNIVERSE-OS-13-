// Plan Item ID: TI-1
/**
 * IntentAnalyzer.ts — Semantic Intent Deconstruction
 */

import { Task } from '@/types';
import { Intent } from './Types';

export function deepIntentAnalysis(prompt: string): Intent {
  const promptLc = prompt.toLowerCase();
  const intent: Intent = {
    complexity: 'simple',
    requiresTool: null,
    requiresGenerator: null,
    subIntents: [],
    confidence: 1.0,
    studio: 'GENERAL'
  };

  // Tool Detection
  const mathWords = ["calculate", "compute", "sum", "average", "formula", "solve", "math", "√", "^", "+", "-", "*", "/"];
  const codeWords = ["write code", "program", "function", "implement", "create", "script", "develop", "app", "web", "system", "fullstack"];
  
  // Generator Detection
  const imageWords = ["generate image", "draw", "picture", "photo", "portrait", "landscape", "art"];
  const videoWords = ["generate video", "movie", "animation", "clip", "film"];
  const threeDWords = ["3d view", "360 view", "3d model", "render", "community", "environment", "spatial"];
  const bioWords = ["dna", "protein", "synthetic bio", "gene", "genome", "biology"];
  const autoWords = ["automation", "workflow", "pipeline", "employee", "business process"];
  const researchWords = ["research", "innovation", "discovery", "hypothesis", "scientific", "deep learning", "online search", "google search", "find info"];
  const musicWords = ["generate music", "song", "audio", "track", "melody", "beat", "sound"];

  if (promptLc.includes("deep learning") || promptLc.includes("relearn") || promptLc.includes("analyze")) {
    intent.complexity = "complex";
    intent.studio = "DEEP_LEARNING_STUDIO";
  }
  if (promptLc.includes("online search") || promptLc.includes("google search") || promptLc.includes("find info")) {
    intent.requiresGenerator = "research";
    intent.studio = "RESEARCH_STUDIO";
  }

  if (mathWords.some(w => promptLc.includes(w))) {
    intent.requiresTool = "calculator";
    intent.complexity = "moderate";
    intent.studio = "MATH_STUDIO";
  }
  if (codeWords.some(w => promptLc.includes(w))) {
    intent.requiresTool = "coder";
    intent.complexity = "complex";
    intent.studio = "CODE_STUDIO";
    if (promptLc.includes("system") || promptLc.includes("app") || promptLc.includes("fullstack")) {
      intent.requiresGenerator = "system";
    }
  }
  if (imageWords.some(w => promptLc.includes(w))) {
    intent.requiresGenerator = "image";
    intent.complexity = "moderate";
    intent.studio = "IMAGE_STUDIO";
  }
  if (videoWords.some(w => promptLc.includes(w))) {
    intent.requiresGenerator = "video";
    intent.complexity = "complex";
    intent.studio = "VIDEO_STUDIO";
  }
  if (threeDWords.some(w => promptLc.includes(w))) {
    intent.requiresGenerator = "3d";
    intent.complexity = "complex";
    intent.studio = "3D_STUDIO";
  }
  if (bioWords.some(w => promptLc.includes(w))) {
    intent.requiresGenerator = "bio";
    intent.complexity = "complex";
    intent.studio = "SYNTHETIC_BIO_STUDIO";
  }
  if (autoWords.some(w => promptLc.includes(w))) {
    intent.requiresGenerator = "automation";
    intent.complexity = "moderate";
    intent.studio = "AUTOMATION_STUDIO";
  }
  if (researchWords.some(w => promptLc.includes(w))) {
    intent.requiresGenerator = "research";
    intent.complexity = "complex";
    intent.studio = "GENAI_STUDIO";
  }
  if (musicWords.some(w => promptLc.includes(w))) {
    intent.requiresGenerator = "music";
    intent.complexity = "moderate";
    intent.studio = "AUDIO_STUDIO";
  }

  // Sub-intent detection (Chain of Thought triggers)
  if (promptLc.includes(" and ") || promptLc.includes(" then ") || promptLc.includes(" first ")) {
    intent.subIntents = promptLc.split(/and|then|first/).map(s => s.trim()).filter(s => s.length > 0);
    intent.complexity = "complex";
  }

  // [v13.0] Vanguard Quantum Correlation
  if (intent.complexity === 'complex') {
    intent.confidence = 0.9999; // Quantum certainty
    intent.requiresTool = intent.requiresTool || 'vanguard';
  }

  return intent;
}

export function generateExecutionPlan(intent: Intent, prompt: string): Task[] {
  const plan: Task[] = [];
  const id = Date.now();

  // Phase 1: Research
  plan.push({
    id: `research_${id}`,
    label: "Analyze Query & Gather Context",
    status: 'completed',
    progress: 100,
    subtasks: [
      { id: `intent_${id}`, label: "Identify Intent Nodes", status: 'completed', progress: 100 },
      { id: `storage_${id}`, label: "Query Quantum Brain Storage", status: 'completed', progress: 100 }
    ]
  });

  // Phase 2: Action
  if (intent.complexity === 'complex' || intent.requiresGenerator) {
    const actionTask: Task = {
      id: `action_${id}`,
      label: `Synthesize ${intent.studio.replace('_STUDIO', '')} Elements`,
      status: 'active',
      progress: 45,
      subtasks: []
    };

    if (intent.requiresGenerator) {
      actionTask.subtasks?.push({ id: `gen_${id}`, label: `Activate ${intent.requiresGenerator.toUpperCase()}_GENERATOR`, status: 'active', progress: 60 });
    }
    
    if (intent.requiresTool) {
      actionTask.subtasks?.push({ id: `tool_${id}`, label: `Resolve ${intent.requiresTool.toUpperCase()} Logic`, status: 'pending', progress: 0 });
    }

    plan.push(actionTask);
  }

  // Phase 3: QC
  plan.push({
    id: `qc_${id}`,
    label: "Quality Control & Swarm Review",
    status: 'pending',
    progress: 0,
    subtasks: [
      { id: `refine_${id}`, label: "Self-Refinement Loop", status: 'pending', progress: 0 },
      { id: `persist_${id}`, label: "Commit to Artifact Buffer", status: 'pending', progress: 0 }
    ]
  });

  return plan;
}

export const intentAnalyzer = {
  analyze: deepIntentAnalysis,
  generateExecutionPlan
};

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
