/**
 * automation Package - @angehlang/automation
 * Exports: Dashboard, hooks, engines, types
 */

export { AutomationDashboard } from './AutomationDashboard';

export * from './hooks';

export { AutomationEngine, ConditionEvaluator, CodeExecutor, HTTPRequestNode } from './engines/AutomationEngine';
export { CircuitBreaker } from './engines/CircuitBreaker';
export { CrossStudioIntegrator } from './engines/CrossStudioIntegrator';
export { SovereignAutomatonEngine } from './engines/SovereignAutomatonEngine';
export * from './types/index.ts';