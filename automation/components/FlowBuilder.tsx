import React, { useState, useCallback } from 'react';
import { 
  CustomFlow, 
  CustomFlowStep, 
  CustomFlowConnection, 
  CustomFlowVariable,
  FlowTemplate,
  FlowExecution,
  FlowStepAction
} from '../FlexibleFlowEngine';
import { StudioName } from '../engines/CrossStudioIntegrator';
import { useFlexibleFlow, useFlowBuilder, useFlowExecution } from '../hooks/useFlexibleFlow';

interface FlowBuilderUIProps {
  onSave?: (flow: CustomFlow) => void;
  onExecute?: (executionId: string) => void;
}

const STUDIO_COLORS: Record<StudioName, string> = {
  automation: '#6366f1',
  code: '#8b5cf6',
  threed: '#ec4899',
  audio: '#f43f5e',
  image: '#f97316',
  video: '#eab308',
  book: '#22c55e',
  text: '#14b8a6',
  bio: '#06b6d4',
  network: '#3b82f6',
  simulation: '#8b5cf6',
  game: '#d946ef',
  security: '#ef4444',
  database: '#64748b',
  cloud: '#0ea5e9',
  iot: '#84cc16',
  browser: '#06b6d4',
  os: '#71717a',
  intelligence: '#a855f7',
  all: '#ffffff',
  visualization: '#06b6d4'
};

const ACTION_OPTIONS: { value: FlowStepAction; label: string }[] = [
  { value: 'generate', label: 'Generate' },
  { value: 'analyze', label: 'Analyze' },
  { value: 'transform', label: 'Transform' },
  { value: 'execute', label: 'Execute' },
  { value: 'validate', label: 'Validate' },
  { value: 'store', label: 'Store' },
  { value: 'notify', label: 'Notify' },
  { value: 'wait', label: 'Wait' },
  { value: 'branch', label: 'Branch' },
  { value: 'loop', label: 'Loop' },
  { value: 'convert', label: 'Convert' },
  { value: 'merge', label: 'Merge' },
  { value: 'split', label: 'Split' },
  { value: 'filter', label: 'Filter' },
  { value: 'aggregate', label: 'Aggregate' },
  { value: 'call', label: 'Call' },
  { value: 'synthesize', label: 'Synthesize' }
];

const AVAILABLE_STUDIOS: StudioName[] = [
  'automation', 'code', 'threed', 'audio', 'image', 'video', 'book', 'text',
  'bio', 'network', 'simulation', 'game', 'security', 'database', 'cloud',
  'iot', 'browser', 'os', 'intelligence'
];

export function FlowBuilderUI({ onSave, onExecute }: FlowBuilderUIProps) {
  const { templates, createFromTemplate, executeFlow } = useFlexibleFlow();
  const { 
    flow, 
    validation,
    updateFlowInfo,
    addVariable, 
    updateVariable, 
    removeVariable,
    addStep, 
    updateStep, 
    removeStep,
    addConnection,
    removeConnection,
    validate,
    save 
  } = useFlowBuilder();

  const [activeTab, setActiveTab] = useState<'info' | 'steps' | 'variables' | 'connections'>('info');
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleSave = useCallback(() => {
    const savedFlow = save();
    if (savedFlow) {
      onSave?.(savedFlow);
    }
  }, [save, onSave]);

  const handleExecute = useCallback(async () => {
    if (!flow.name || !flow.steps?.length) return;
    
    const savedFlow = save();
    if (savedFlow) {
      setIsExecuting(true);
      try {
        const execution = await executeFlow(savedFlow.id);
        onExecute?.(execution.id);
      } finally {
        setIsExecuting(false);
      }
    }
  }, [flow, save, executeFlow, onExecute]);

  const handleAddStep = useCallback(() => {
    const newStep: CustomFlowStep = {
      id: `step-${Date.now()}`,
      name: `Step ${(flow.steps?.length || 0) + 1}`,
      studio: 'automation',
      action: 'execute',
      inputMapping: {},
      outputMapping: {}
    };
    addStep(newStep);
    setSelectedStepId(newStep.id);
  }, [flow.steps?.length, addStep]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Flow Builder</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => createFromTemplate(templates[0]?.id || '', 'New Flow')}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          >
            Use Template
          </button>
          <button 
            onClick={handleExecute}
            disabled={!flow.name || !flow.steps?.length || isExecuting}
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded"
          >
            {isExecuting ? 'Running...' : 'Execute'}
          </button>
          <button 
            onClick={handleSave}
            disabled={!flow.name || !flow.steps?.length}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded"
          >
            Save Flow
          </button>
        </div>
      </div>

      {validation.errors.length > 0 && (
        <div className="p-2 bg-red-900/50 border-b border-red-700">
          {validation.errors.map((err, i) => (
            <div key={i} className="text-sm text-red-300">
              {err.stepId && `[${err.stepId}] `}{err.message}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-gray-700 flex flex-col">
          <div className="flex border-b border-gray-700">
            {(['info', 'steps', 'variables', 'connections'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-2 py-2 text-xs uppercase ${
                  activeTab === tab ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activeTab === 'info' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Flow Name</label>
                  <input
                    type="text"
                    value={flow.name || ''}
                    onChange={e => updateFlowInfo({ name: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                    placeholder="My Custom Flow"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea
                    value={flow.description || ''}
                    onChange={e => updateFlowInfo({ description: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm h-20"
                    placeholder="What does this flow do?"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select
                    value={flow.status || 'draft'}
                    onChange={e => updateFlowInfo({ status: e.target.value as CustomFlow['status'] })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'steps' && (
              <div className="space-y-2">
                <button
                  onClick={handleAddStep}
                  className="w-full px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                >
                  + Add Step
                </button>
                {flow.steps?.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStepId(step.id)}
                    className={`p-2 rounded cursor-pointer ${
                      selectedStepId === step.id ? 'bg-blue-900/50 border border-blue-500' : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: STUDIO_COLORS[step.studio] }}
                      />
                      <span className="text-sm font-medium">{step.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {step.studio}.{step.action}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'variables' && (
              <div className="space-y-2">
                <button
                  onClick={() => addVariable({ name: `var${(flow.variables?.length || 0) + 1}`, type: 'string', defaultValue: '' })}
                  className="w-full px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
                >
                  + Add Variable
                </button>
                {flow.variables?.map((variable, index) => (
                  <div key={index} className="p-2 bg-gray-800 rounded border border-gray-700">
                    <div className="flex gap-2 mb-1">
                      <input
                        type="text"
                        value={variable.name}
                        onChange={e => updateVariable(index, { name: e.target.value })}
                        className="flex-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs"
                      />
                      <button
                        onClick={() => removeVariable(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                    <select
                      value={variable.type}
                      onChange={e => updateVariable(index, { type: e.target.value as CustomFlowVariable['type'] })}
                      className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-xs"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="object">Object</option>
                      <option value="array">Array</option>
                    </select>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="text-sm text-gray-400">
                Click on a step to connect it to another step
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          {selectedStepId && flow.steps?.find(s => s.id === selectedStepId) ? (
            <StepEditor
              step={flow.steps.find(s => s.id === selectedStepId)!}
              onUpdate={updates => updateStep(selectedStepId, updates)}
              onDelete={() => {
                removeStep(selectedStepId);
                setSelectedStepId(null);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">Select a step to edit</p>
                <p className="text-sm">Or add a new step to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-2 border-t border-gray-700 text-xs text-gray-500">
        {flow.steps?.length || 0} steps | {flow.variables?.length || 0} variables | {flow.connections?.length || 0} connections
      </div>
    </div>
  );
}

interface StepEditorProps {
  step: CustomFlowStep;
  onUpdate: (updates: Partial<CustomFlowStep>) => void;
  onDelete: () => void;
}

function StepEditor({ step, onUpdate, onDelete }: StepEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Step Editor</h3>
        <button
          onClick={onDelete}
          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded"
        >
          Delete Step
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Step Name</label>
          <input
            type="text"
            value={step.name}
            onChange={e => onUpdate({ name: e.target.value })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Studio</label>
          <select
            value={step.studio}
            onChange={e => onUpdate({ studio: e.target.value as StudioName })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
          >
            {AVAILABLE_STUDIOS.map(studio => (
              <option key={studio} value={studio}>
                {studio.charAt(0).toUpperCase() + studio.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Action</label>
          <select
            value={step.action}
            onChange={e => onUpdate({ action: e.target.value as FlowStepAction })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
          >
            {ACTION_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Timeout (ms)</label>
          <input
            type="number"
            value={step.timeout?.ms || 30000}
            onChange={e => onUpdate({ timeout: { ms: parseInt(e.target.value) || 30000 } })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Input Mappings</label>
        <div className="space-y-2">
          {Object.entries(step.inputMapping || {}).map(([key, value], index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={key}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
                readOnly
              />
              <input
                type="text"
                value={value}
                onChange={e => {
                  const newMapping = { ...step.inputMapping };
                  newMapping[key] = e.target.value;
                  onUpdate({ inputMapping: newMapping });
                }}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
                placeholder="variable"
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newMapping = { ...step.inputMapping, newInput: '' };
              onUpdate({ inputMapping: newMapping });
            }}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            + Add Input
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-2">Output Mappings</label>
        <div className="space-y-2">
          {Object.entries(step.outputMapping || {}).map(([key, value], index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={e => {
                  const newMapping = { ...step.outputMapping };
                  newMapping[key] = e.target.value;
                  onUpdate({ outputMapping: newMapping });
                }}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
                placeholder="variable"
              />
              <input
                type="text"
                value={key}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
                readOnly
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newMapping = { ...step.outputMapping, output: 'result' };
              onUpdate({ outputMapping: newMapping });
            }}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            + Add Output
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">On Success (next step)</label>
          <input
            type="text"
            value={step.onSuccess || ''}
            onChange={e => onUpdate({ onSuccess: e.target.value || undefined })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
            placeholder="step-id"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">On Failure (next step)</label>
          <input
            type="text"
            value={step.onFailure || ''}
            onChange={e => onUpdate({ onFailure: e.target.value || undefined })}
            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
            placeholder="step-id"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Retry Configuration</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            placeholder="Max attempts"
            value={step.retry?.maxAttempts || ''}
            onChange={e => onUpdate({ 
              retry: { 
                ...step.retry, 
                maxAttempts: parseInt(e.target.value) || undefined 
              } 
            })}
            className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
          />
          <input
            type="number"
            placeholder="Delay (ms)"
            value={step.retry?.delayMs || ''}
            onChange={e => onUpdate({ 
              retry: { 
                ...step.retry, 
                delayMs: parseInt(e.target.value) || undefined 
              } 
            })}
            className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
          />
          <input
            type="number"
            placeholder="Backoff"
            value={step.retry?.backoffMultiplier || ''}
            onChange={e => onUpdate({ 
              retry: { 
                ...step.retry, 
                backoffMultiplier: parseFloat(e.target.value) || undefined 
              } 
            })}
            className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs"
          />
        </div>
      </div>
    </div>
  );
}

export function FlowDashboard() {
  const { flows, executions, templates, stats, activateFlow, pauseFlow, deleteFlow, executeFlow, createFromTemplate } = useFlexibleFlow();
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'flows' | 'executions' | 'templates'>('flows');

  const selectedFlow = flows.find(f => f.id === selectedFlowId);
  const flowExecutions = selectedFlowId 
    ? executions.filter(e => e.flowId === selectedFlowId)
    : [];

  return (
    <div className="flex h-full bg-gray-900 text-white">
      <div className="w-72 border-r border-gray-700 flex flex-col">
        <div className="p-3 border-b border-gray-700">
          <h2 className="font-bold">Flows</h2>
          <div className="text-xs text-gray-400 mt-1">
            {stats.activeFlows} active | {stats.totalFlows} total
          </div>
        </div>

        <div className="flex border-b border-gray-700">
          {(['flows', 'executions', 'templates'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex-1 px-2 py-2 text-xs ${
                activeView === view ? 'bg-gray-700 text-blue-400' : 'text-gray-400'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeView === 'flows' && flows.map(flow => (
            <div
              key={flow.id}
              onClick={() => setSelectedFlowId(flow.id)}
              className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
                selectedFlowId === flow.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{flow.name}</span>
                <span className={`text-xs px-1 rounded ${
                  flow.status === 'active' ? 'bg-green-900 text-green-300' :
                  flow.status === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {flow.status}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {flow.steps?.length || 0} steps
              </div>
            </div>
          ))}

          {activeView === 'templates' && templates.map(tpl => (
            <div
              key={tpl.id}
              onClick={() => createFromTemplate(tpl.id)}
              className="p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-800"
            >
              <div className="font-medium text-sm">{tpl.name}</div>
              <div className="text-xs text-gray-400 mt-1">{tpl.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                {tpl.studios?.join(' → ')}
              </div>
            </div>
          ))}

          {activeView === 'executions' && executions.slice(0, 20).map(exec => {
            const relatedFlow = flows.find(f => f.id === exec.flowId);
            return (
              <div key={exec.id} className="p-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{relatedFlow?.name || exec.flowId}</span>
                  <span className={`text-xs px-1 rounded ${
                    exec.status === 'completed' ? 'bg-green-900 text-green-300' :
                    exec.status === 'failed' ? 'bg-red-900 text-red-300' :
                    exec.status === 'running' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-700'
                  }`}>
                    {exec.status}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {exec.duration ? `${exec.duration}ms` : new Date(exec.startedAt).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {selectedFlow ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{selectedFlow.name}</h3>
              <div className="flex gap-2">
                {selectedFlow.status === 'active' ? (
                  <button
                    onClick={() => pauseFlow(selectedFlow.id)}
                    className="px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-500 rounded"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => activateFlow(selectedFlow.id)}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded"
                  >
                    Activate
                  </button>
                )}
                <button
                  onClick={() => deleteFlow(selectedFlow.id)}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-500 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => executeFlow(selectedFlow.id)}
                  className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
                >
                  Run
                </button>
              </div>
            </div>

            <p className="text-gray-400 mb-4">{selectedFlow.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-2xl font-bold">{selectedFlow.steps?.length || 0}</div>
                <div className="text-xs text-gray-400">Steps</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-2xl font-bold">{selectedFlow.variables?.length || 0}</div>
                <div className="text-xs text-gray-400">Variables</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-2xl font-bold">{flowExecutions.length}</div>
                <div className="text-xs text-gray-400">Executions</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Steps</h4>
              <div className="space-y-2">
                {selectedFlow.steps?.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                      {index + 1}
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: STUDIO_COLORS[step.studio] }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.name}</div>
                      <div className="text-xs text-gray-400">{step.studio}.{step.action}</div>
                    </div>
                    {step.onSuccess && (
                      <span className="text-xs text-gray-500">→ {step.onSuccess}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {flowExecutions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recent Executions</h4>
                <div className="space-y-2">
                  {flowExecutions.slice(0, 5).map(exec => (
                    <div key={exec.id} className="p-2 bg-gray-800 rounded flex items-center justify-between">
                      <span className="text-sm">{exec.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        exec.status === 'completed' ? 'bg-green-900 text-green-300' :
                        exec.status === 'failed' ? 'bg-red-900 text-red-300' :
                        'bg-blue-900 text-blue-300'
                      }`}>
                        {exec.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <p className="text-lg mb-2">Select a flow to view details</p>
              <p className="text-sm">Or create a new flow using the Flow Builder</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default { FlowBuilderUI, FlowDashboard };