/**
 * Automation Engines Index
 * Exports all automation engine components
 */

export * from './AutomationEngine';
export * from './SovereignAutomatonEngine';
export * from './SovereignLogicCoreExtension';
export * from './CrossStudioIntegrator';
export * from './A2ACommunicationHub';
export * from './WorkflowQueue';
export * from './WebSocketHub';
export * from './CircuitBreaker';

// Re-export types needed by other modules
export type { NeuralPulseTrigger } from '../types/sovereign-types';

// Legacy compatibility
export { automationEngine, createAutomationEngine } from './AutomationEngine';
export { sovereignAutomaton, createSovereignAutomaton } from './SovereignAutomatonEngine';
export { sovereignLogicCore, SovereignLogicCoreExtended } from './SovereignLogicCoreExtension';
export { crossStudioIntegrator, CrossStudioIntegrator } from './CrossStudioIntegrator';
export { workflowQueue } from './WorkflowQueue';
export { wsHub } from './WebSocketHub';
export { circuitBreakerRegistry, defaultCircuitBreaker } from './CircuitBreaker';