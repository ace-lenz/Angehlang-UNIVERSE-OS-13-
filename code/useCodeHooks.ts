/**
 * Code Hooks - React hooks for CodeStudio automation
 */

import { useState, useEffect, useCallback } from 'react';
import { codeExecutor, CodeExecutionResult, ValidationResult } from './CodeExecutionEngine';
import { codeAutomation, CodeWorkflow, CodePipelineResult } from './CodeAutomation';

// ===================== USE CODE EXECUTION =====================

export function useCodeExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [history, setHistory] = useState<CodeExecutionResult[]>([]);

  const execute = useCallback(async (code: string, language: string = 'javascript') => {
    setIsExecuting(true);
    try {
      const execResult = await codeExecutor.execute(code, language);
      setResult(execResult);
      codeExecutor.saveExecution('current', execResult);
      setHistory(codeExecutor.getExecutionHistory('current'));
      return execResult;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    codeExecutor.clearHistory();
    setHistory([]);
  }, []);

  return { isExecuting, result, history, execute, clearHistory };
}

// ===================== USE CODE VALIDATION =====================

export function useCodeValidation() {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback((code: string, language: string = 'javascript') => {
    setIsValidating(true);
    const result = codeExecutor.validate(code, language);
    setValidation(result);
    setIsValidating(false);
    return result;
  }, []);

  const getSuggestions = useCallback((code: string, errors: any[]) => {
    return codeExecutor.getAutoFixSuggestions(code, errors);
  }, []);

  return { validation, isValidating, validate, getSuggestions };
}

// ===================== USE CODE AUTOMATION =====================

export function useCodeAutomation() {
  const [workflows, setWorkflows] = useState<CodeWorkflow[]>([]);
  const [activePipeline, setActivePipeline] = useState<CodePipelineResult | null>(null);
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0, avgDuration: 0 });

  useEffect(() => {
    setWorkflows(codeAutomation.getAllWorkflows());
    codeAutomation.registerNeuralTriggers();

    const interval = setInterval(() => {
      setStats(codeAutomation.getPipelineStats());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const runWorkflow = useCallback(async (workflowId: string, context: { code: string; fileName: string; language?: string }) => {
    setActivePipeline(null);
    const result = await codeAutomation.executePipeline(workflowId, context);
    setActivePipeline(result);
    setStats(codeAutomation.getPipelineStats());
    return result;
  }, []);

  const enableWorkflow = useCallback((id: string) => {
    codeAutomation.enableWorkflow(id);
    setWorkflows(codeAutomation.getAllWorkflows());
  }, []);

  const disableWorkflow = useCallback((id: string) => {
    codeAutomation.disableWorkflow(id);
    setWorkflows(codeAutomation.getAllWorkflows());
  }, []);

  const executeFromGoal = useCallback(async (goal: string, context?: any) => {
    return await codeAutomation.executeFromGoal({
      text: goal,
      priority: 'high',
      context,
    });
  }, []);

  return { workflows, activePipeline, stats, runWorkflow, enableWorkflow, disableWorkflow, executeFromGoal };
}

// ===================== USE CODE COMPLETION =====================

export function useCodeCompletion(code: string, cursorPosition: number) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const completions = codeExecutor.suggestCompletions(code, cursorPosition);
    setSuggestions(completions);
  }, [code, cursorPosition]);

  return { suggestions };
}

// ===================== USE CODE FORMATTING =====================

export function useCodeFormatting() {
  const format = useCallback((code: string, language: string) => {
    return codeExecutor.formatCode(code, language);
  }, []);

  return { format };
}

// ===================== USE CODE EXPLORER =====================

export { useCodeExplorer } from './useCodeExplorer';