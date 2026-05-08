/**
 * SmartTemplateWizard.tsx - Intelligent Template Generation UI
 * 
 * Integrates with IntentAnalyzer, LanguageSelector, TemplateGeneratorEngine
 * ErrorPrevention, WikiGenerator, and OutputHandler
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Code2, Copy, Check, Download, FolderOpen, File, 
  ChevronRight, ChevronDown, Terminal, Play, Settings, 
  Zap, Search, Filter, X, CheckCircle, AlertTriangle,
  Package, Smartphone, Globe, Bot, Cpu, Brain,
  Terminal as Sys, Workflow, Wrench, Layers, 
  ArrowRight, ArrowDown, FileText, SearchCode
} from 'lucide-react';
import { intentAnalyzer, IntentResult, TemplateCategory } from '@/engine/IntentAnalyzer';
import { languageSelector, LanguageSelection } from '@/engine/LanguageSelector';
import { templateEngine, GeneratedProject } from '@/engine/TemplateGeneratorEngine';
import { errorPrevention, ValidationResult } from '@/engine/ErrorPrevention';
import { wikiGenerator, WikiContent } from '@/engine/WikiGenerator';
import { outputHandler } from '@/engine/OutputHandler';

interface SmartTemplateWizardProps {
  onClose?: () => void;
  onGenerate?: (project: GeneratedProject) => void;
}

type ViewMode = 'input' | 'analysis' | 'preview' | 'wiki';

const CATEGORY_ICONS: Record<TemplateCategory, React.ReactNode> = {
  pwa: <Smartphone className="w-5 h-5" />,
  mobile: <Smartphone className="w-5 h-5" />,
  web_extension: <Globe className="w-5 h-5" />,
  fullstack: <Layers className="w-5 h-5" />,
  agent: <Bot className="w-5 h-5" />,
  engine: <Cpu className="w-5 h-5" />,
  llm: <Brain className="w-5 h-5" />,
  system: <Sys className="w-5 h-5" />,
  automation: <Workflow className="w-5 h-5" />,
  universal: <Code2 className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  pwa: 'text-green-400',
  mobile: 'text-blue-400',
  web_extension: 'text-cyan-400',
  fullstack: 'text-purple-400',
  agent: 'text-pink-400',
  engine: 'text-orange-400',
  llm: 'text-yellow-400',
  system: 'text-red-400',
  automation: 'text-emerald-400',
  universal: 'text-indigo-400',
};

export function SmartTemplateWizard({ onClose, onGenerate }: SmartTemplateWizardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('input');
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [intent, setIntent] = useState<IntentResult | null>(null);
  const [selection, setSelection] = useState<LanguageSelection | null>(null);
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [wiki, setWiki] = useState<WikiContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const analyzePrompt = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    const analyzedIntent = intentAnalyzer.analyzePrompt(prompt);
    setIntent(analyzedIntent);
    
    const langSelection = languageSelector.selectLanguage(
      analyzedIntent.requirements.map(r => r.type),
      selectedLanguage as any || undefined,
      !!selectedLanguage
    );
    setSelection(langSelection);
    
    setViewMode('analysis');
    
    setTimeout(() => {
      generateProject(analyzedIntent, langSelection);
    }, 500);
  };

  const generateProject = (analyzedIntent: IntentResult, langSelection: LanguageSelection) => {
    const generatedProject = templateEngine.generateProject(prompt, projectName || undefined);
    setProject(generatedProject);
    
    const wikiContent = wikiGenerator.generateWiki(
      prompt,
      analyzedIntent.category,
      [langSelection.primary, ...langSelection.fallbacks],
      generatedProject.files
    );
    setWiki(wikiContent);
    
    const code = generatedProject.files[0]?.content || '';
    const result = errorPrevention.validate(code, langSelection.primary.id);
    setValidation(result);
    
    setIsGenerating(false);
    setViewMode('preview');
    
    if (onGenerate) onGenerate(generatedProject);
  };

  const handleCopyToClipboard = async () => {
    if (!project) return;
    
    const content = outputHandler.generateClipboardContent(project);
    const success = await outputHandler.copyToClipboard(content);
    setCopySuccess(success);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownload = () => {
    if (!project) return;
    
    const files = outputHandler.prepareForDownload(project, {
      format: 'folder',
      includeWiki: true,
      includeConfig: true,
      projectName: project.name,
    });
    
    const content = outputHandler.exportAsMarkdown(project);
    outputHandler.downloadFile(content, `${project.name}-README.md`, 'text/markdown');
  };

  const categories = intentAnalyzer.getAllCategories();

  return (
    <div className="bg-quantum-deep/95 backdrop-blur-xl rounded-2xl border border-quantum-cyan/20 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-quantum-dark/50 border-b border-quantum-cyan/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-quantum-cyan" />
          <span className="font-medium text-quantum-white">Smart Template Generator</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-quantum-dark/50 rounded">
            <X className="w-4 h-4 text-quantum-gray" />
          </button>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-quantum-dark/20 border-b border-quantum-cyan/5">
        {(['input', 'analysis', 'preview'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => viewMode !== 'input' && setViewMode(mode)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${viewMode === mode ? 'bg-quantum-cyan/20 text-quantum-cyan' : 'text-quantum-gray hover:text-quantum-white'}`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {viewMode === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Prompt Input */}
              <div>
                <label className="text-sm text-quantum-gray mb-2 block">What do you want to create?</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a PWA with offline support, or Build a full stack app with React and Python backend"
                  className="w-full h-32 px-4 py-3 bg-quantum-dark/50 rounded-xl border border-quantum-cyan/20 focus:border-quantum-cyan/50 outline-none text-quantum-white resize-none"
                />
              </div>

              {/* Project Name */}
              <div>
                <label className="text-sm text-quantum-gray mb-2 block">Project Name (optional)</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-project"
                  className="w-full px-4 py-2 bg-quantum-dark/50 rounded-xl border border-quantum-cyan/20 focus:border-quantum-cyan/50 outline-none text-quantum-white"
                />
              </div>

              {/* Language Override */}
              <div>
                <label className="text-sm text-quantum-gray mb-2 block">Language (optional - auto-selected if empty)</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 bg-quantum-dark/50 rounded-xl border border-quantum-cyan/20 focus:border-quantum-cyan/50 outline-none text-quantum-white"
                >
                  <option value="">Auto-select best language</option>
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={analyzePrompt}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-3 bg-quantum-cyan text-quantum-black font-medium rounded-xl hover:bg-quantum-cyan/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Generate Project
                  </>
                )}
              </button>
            </motion.div>
          )}

          {viewMode === 'analysis' && intent && selection && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Intent Analysis Results */}
              <div className="p-4 rounded-xl bg-quantum-dark/30 border border-quantum-cyan/20">
                <h3 className="text-lg font-medium text-quantum-white mb-3">Analysis Results</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-quantum-gray">Category</span>
                    <div className="flex items-center gap-2 mt-1">
                      {CATEGORY_ICONS[intent.category]}
                      <span className={CATEGORY_COLORS[intent.category]}>{intent.categoryName}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-quantum-gray">Languages</span>
                    <div className="text-quantum-cyan mt-1">{intent.languageCount}</div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-quantum-gray">Primary Language</span>
                    <div className="text-quantum-white mt-1">{selection.primary.fullName}</div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-quantum-gray">Complexity</span>
                    <div className="text-quantum-purple mt-1 capitalize">{intent.complexity}</div>
                  </div>
                </div>
              </div>

              {/* Selection Reasons */}
              <div className="p-4 rounded-xl bg-quantum-dark/30 border border-quantum-cyan/20">
                <h4 className="text-sm font-medium text-quantum-white mb-2">Why This Selection</h4>
                <ul className="text-xs text-quantum-gray space-y-1">
                  {selection.selectionReason.map((reason, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-quantum-green" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Error Prevention Status */}
              <div className="p-4 rounded-xl bg-quantum-green/10 border border-quantum-green/30">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-quantum-green" />
                  <span className="text-quantum-green font-medium">Error Prevention Enabled</span>
                </div>
                <p className="text-xs text-quantum-gray mt-1">
                  All templates include: Strict types, Null safety, Bounds checking, Input sanitization
                </p>
              </div>

              <button
                onClick={() => project && setViewMode('preview')}
                disabled={isGenerating}
                className="w-full py-3 bg-quantum-cyan text-quantum-black font-medium rounded-xl hover:bg-quantum-cyan/90 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <Sparkles className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    View Generated Code
                  </>
                )}
              </button>
            </motion.div>
          )}

          {viewMode === 'preview' && project && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Project Summary */}
              <div className="p-4 rounded-xl bg-quantum-cyan/10 border border-quantum-cyan/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-quantum-white">{project.name}</h3>
                    <p className="text-xs text-quantum-gray">{project.files.length} files generated</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyToClipboard}
                      className="px-3 py-1.5 bg-quantum-dark/50 rounded-lg text-sm text-quantum-cyan hover:bg-quantum-dark transition-all flex items-center gap-1"
                    >
                      {copySuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? 'Copied!' : 'Copy All'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-3 py-1.5 bg-quantum-dark/50 rounded-lg text-sm text-quantum-cyan hover:bg-quantum-dark transition-all flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated Files */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-quantum-white">Generated Files</h4>
                {project.files.slice(0, 5).map((file, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-quantum-cyan" />
                        <span className="text-sm text-quantum-white">{file.path}</span>
                      </div>
                      <span className="text-xs text-quantum-gray">{file.language}</span>
                    </div>
                  </div>
                ))}
                {project.files.length > 5 && (
                  <p className="text-xs text-quantum-gray text-center">
                    + {project.files.length - 5} more files
                  </p>
                )}
              </div>

              {/* Validation Status */}
              {validation && (
                <div className="p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20">
                  <div className="flex items-center gap-2">
                    {validation.valid ? (
                      <CheckCircle className="w-4 h-4 text-quantum-green" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-quantum-yellow" />
                    )}
                    <span className="text-sm text-quantum-white">
                      {validation.valid ? 'Code Validated ✓' : `${validation.errors.length} issues found`}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SmartTemplateWizard;