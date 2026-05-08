import React, { useEffect, useState } from 'react';
import { AIImprovementSuggester } from '../../agents/AIImprovementSuggester';
import { sovereignVault } from '../../storage/SovereignVault';

interface Suggestion {
  id: string;
  component: string;
  issueType: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  systemRelevance: number;
  suggestedAction: string;
}

export const ErrorTrendDashboard: React.FC = () => {
  const [suggestions, setSuggestions] = useState<{
    critical: Suggestion[];
    high: Suggestion[];
    medium: Suggestion[];
    low: Suggestion[];
  }>({ critical: [], high: [], medium: [], low: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const suggester = AIImprovementSuggester.getInstance();
      const plan = await suggester.generateSystemImprovementPlan();
      setSuggestions(plan);
      await suggester.persistSuggestions([
        ...plan.critical,
        ...plan.high,
        ...plan.medium,
        ...plan.low,
      ]);
    } catch (e) {
      console.error('[ErrorTrendDashboard] Failed to load suggestions:', e);
    } finally {
      setLoading(false);
    }
  };

  const totalIssues = suggestions.critical.length + suggestions.high.length + 
                      suggestions.medium.length + suggestions.low.length;

  const handleViewChangeLog = async () => {
    const log = (await sovereignVault.get('modification_log')) as any[] || [];
    console.log('[Modification Log]', log);
    alert(`Logged changes: ${log.length}`);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
          System Improvement Dashboard
        </h2>
        <button
          onClick={loadSuggestions}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
        >
          Refresh Analysis
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-900/50 p-4 rounded-lg border border-red-500">
          <div className="text-3xl font-bold text-red-400">{suggestions.critical.length}</div>
          <div className="text-sm text-red-300">Critical (Sys Rel ≥9)</div>
        </div>
        <div className="bg-orange-900/50 p-4 rounded-lg border border-orange-500">
          <div className="text-3xl font-bold text-orange-400">{suggestions.high.length}</div>
          <div className="text-sm text-orange-300">High Priority</div>
        </div>
        <div className="bg-yellow-900/50 p-4 rounded-lg border border-yellow-500">
          <div className="text-3xl font-bold text-yellow-400">{suggestions.medium.length}</div>
          <div className="text-sm text-yellow-300">Medium Priority</div>
        </div>
        <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-500">
          <div className="text-3xl font-bold text-blue-400">{totalIssues}</div>
          <div className="text-sm text-blue-300">Total Issues</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Analyzing system...</div>
      ) : (
        <div className="space-y-6">
          {suggestions.critical.length > 0 && (
            <Section title="Critical Issues (System Relevance ≥9)" color="red" items={suggestions.critical} />
          )}
          {suggestions.high.length > 0 && (
            <Section title="High Priority Issues" color="orange" items={suggestions.high} />
          )}
          {suggestions.medium.length > 0 && (
            <Section title="Medium Priority Issues" color="yellow" items={suggestions.medium} />
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-lg font-semibold mb-3 text-gray-300">Quick Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={() => window.open('/PLANS/StudioImprovementPlan.md', '_blank')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            View Full Plan
          </button>
          <button
            onClick={() => window.open('/PLANS/.secure/systems-registry.json', '_blank')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            Systems Registry
          </button>
          <button
            onClick={handleViewChangeLog}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            View Change Log
          </button>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; color: string; items: Suggestion[] }> = ({ title, color, items }) => (
  <div>
    <h3 className={`text-lg font-semibold mb-3 text-${color}-400`}>{title}</h3>
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className={`bg-${color}-900/20 border border-${color}-500/30 p-3 rounded-lg`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-mono text-sm text-gray-300">{item.id}</div>
              <div className="text-white font-medium">{item.component}</div>
              <div className="text-sm text-gray-400">{item.description}</div>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-xs font-bold bg-${color}-500/20 text-${color}-400`}>
                Impact: {item.estimatedImpact}
              </span>
              <div className="text-xs text-gray-500 mt-1">Sys Rel: {item.systemRelevance}/10</div>
            </div>
          </div>
          <div className="mt-2 text-sm text-blue-400">{item.suggestedAction}</div>
        </div>
      ))}
    </div>
  </div>
);
