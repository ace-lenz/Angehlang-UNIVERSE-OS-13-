/**
 * IntelligencePanel.tsx - AI-Powered Content Intelligence Panel
 * 
 * Features:
 * - Cross-studio content suggestions
 * - Evaluation metrics and gaps
 * - Learning paths and study plans
 * - Related content discovery
 * - Topic exploration
 * - Smart recommendations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, Lightbulb, Target, TrendingUp, Book, Video, Code, 
  Image, Music, FileText, ChevronRight, ChevronDown, X, Clock,
  Star, ThumbsUp, ArrowRight, Layers, Network, Search, Filter,
  Gauge, Users, Zap, Calendar, CheckCircle, AlertTriangle, Info,
  BookOpen, Film, Laptop, Palette, Headphones, File
} from 'lucide-react';
import { cn } from '@/utils/sovereign-utils';
import { contentIntelligence, ContentItem, Suggestion, LearningPath, EvaluationResult } from '@/engine/ContentIntelligenceHub';

interface IntelligencePanelProps {
  currentContentId?: string;
  currentTopic?: string;
  currentStudio?: string;
  onNavigate?: (studio: string, contentId?: string) => void;
  onClose?: () => void;
}

type ViewMode = 'suggestions' | 'evaluation' | 'paths' | 'related' | 'topic' | 'gaps';

export function IntelligencePanel({ 
  currentContentId, 
  currentTopic, 
  currentStudio, 
  onNavigate,
  onClose 
}: IntelligencePanelProps) {
  const [activeView, setActiveView] = useState<ViewMode>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
  const [topicGraph, setTopicGraph] = useState<any[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    setTimeout(() => {
      if (currentContentId) {
        const sugg = contentIntelligence.getSuggestions(currentContentId, 8);
        setSuggestions(sugg);
        
        const evalResult = contentIntelligence.evaluateContent(currentContentId);
        setEvaluation(evalResult);
        
        const crossStudio = contentIntelligence.getCrossStudioSuggestions(currentContentId);
        setRelatedContent(crossStudio.flatMap(c => c.items));
      }

      if (currentTopic) {
        const paths = contentIntelligence.getLearningPaths(currentTopic);
        setLearningPaths(paths);
        
        const graph = contentIntelligence.getTopicGraph(currentTopic);
        setTopicGraph(graph);
      }

      if (!currentContentId && !currentTopic) {
        const paths = contentIntelligence.getLearningPaths();
        setLearningPaths(paths);
        
        const graph = contentIntelligence.getTopicGraph();
        setTopicGraph(graph);
      }

      setLoading(false);
    }, 500);
  }, [currentContentId, currentTopic]);

  const studioIcons: Record<string, React.ReactNode> = {
    BookStudio: <BookOpen className="w-4 h-4" />,
    VideoPlayer: <Film className="w-4 h-4" />,
    CodeStudio: <Laptop className="w-4 h-4" />,
    ImageGallery: <Palette className="w-4 h-4" />,
    AudioStudio: <Headphones className="w-4 h-4" />,
    GameStudio: <File className="w-4 h-4" />,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Film className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <Laptop className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const filteredSuggestions = useMemo(() => {
    if (!searchQuery) return suggestions;
    return suggestions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suggestions, searchQuery]);

  return (
    <div className="bg-quantum-deep/95 backdrop-blur-xl rounded-2xl border border-quantum-cyan/20 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-quantum-dark/50 border-b border-quantum-cyan/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-quantum-cyan" />
          <span className="font-medium text-quantum-white">Intelligence Hub</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-quantum-dark/50 rounded"
        >
          <X className="w-4 h-4 text-quantum-gray" />
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 px-2 py-2 bg-quantum-dark/30 border-b border-quantum-cyan/10 overflow-x-auto">
        {(['suggestions', 'evaluation', 'paths', 'related', 'topic'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setActiveView(mode)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeView === mode 
                ? "bg-quantum-cyan/20 text-quantum-cyan" 
                : "text-quantum-gray hover:text-quantum-white"
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-quantum-cyan/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-quantum-gray" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content..."
            className="w-full pl-9 pr-3 py-1.5 bg-quantum-dark/50 rounded-lg text-sm border border-quantum-cyan/20 focus:border-quantum-cyan/50 outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-quantum-cyan animate-spin mx-auto mb-2" />
              <p className="text-sm text-quantum-gray">Analyzing content...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeView === 'suggestions' && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-quantum-yellow" />
                  <span className="text-sm font-medium text-quantum-white">Smart Suggestions</span>
                </div>

                {filteredSuggestions.length === 0 ? (
                  <p className="text-sm text-quantum-gray text-center py-8">
                    No suggestions available
                  </p>
                ) : (
                  filteredSuggestions.map(sug => (
                    <motion.div
                      key={sug.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01]",
                        sug.priority === 'high' 
                          ? "bg-quantum-cyan/10 border-quantum-cyan/40" 
                          : "bg-quantum-dark/30 border-quantum-cyan/20 hover:border-quantum-cyan/40"
                      )}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onNavigate?.('suggestion', sug.contentId)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(sug.type)}
                          <span className="font-medium text-quantum-white text-sm">{sug.title}</span>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-xs",
                          sug.priority === 'high' ? "bg-quantum-cyan/20 text-quantum-cyan" :
                          sug.priority === 'medium' ? "bg-quantum-yellow/20 text-quantum-yellow" :
                          "bg-quantum-dark/50 text-quantum-gray"
                        )}>
                          {sug.priority}
                        </div>
                      </div>
                      <p className="text-xs text-quantum-gray mb-2">{sug.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-quantum-gray flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {sug.estimatedTime}
                        </span>
                        <span className="text-quantum-cyan flex items-center gap-1">
                          {Math.round(sug.relevanceScore * 100)}% match
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeView === 'evaluation' && (
              <motion.div
                key="evaluation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {evaluation && (
                  <>
                    <div className="p-4 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-quantum-gray">Content Score</span>
                        <span className="text-2xl font-bold text-quantum-cyan">{evaluation.score}%</span>
                      </div>
                      <div className="h-2 bg-quantum-dark/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-quantum-cyan to-quantum-purple"
                          animate={{ width: `${evaluation.score}%` }}
                        />
                      </div>
                    </div>

                    {evaluation.strengths.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-quantum-green flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4" />
                          Strengths
                        </h4>
                        {evaluation.strengths.map((s, i) => (
                          <div key={i} className="text-xs text-quantum-gray pl-6">
                            • {s}
                          </div>
                        ))}
                      </div>
                    )}

                    {evaluation.gaps.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-quantum-yellow flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Gaps
                        </h4>
                        {evaluation.gaps.map((g, i) => (
                          <div key={i} className="text-xs text-quantum-gray pl-6">
                            • {g}
                          </div>
                        ))}
                      </div>
                    )}

                    {evaluation.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-quantum-cyan flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Recommendations
                        </h4>
                        {evaluation.recommendations.map((r, i) => (
                          <motion.div
                            key={i}
                            className="flex items-center gap-2 text-xs text-quantum-white pl-4 cursor-pointer hover:text-quantum-cyan"
                            whileHover={{ x: 4 }}
                          >
                            <ChevronRight className="w-3 h-3" />
                            {r}
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {evaluation.nextSteps.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-quantum-purple flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Next Steps
                        </h4>
                        {evaluation.nextSteps.map((n, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-quantum-white pl-4">
                            <ChevronRight className="w-3 h-3 text-quantum-purple" />
                            {n}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {activeView === 'paths' && (
              <motion.div
                key="paths"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-quantum-purple" />
                  <span className="text-sm font-medium text-quantum-white">Learning Paths</span>
                </div>

                {learningPaths.map(path => (
                  <motion.div
                    key={path.id}
                    className="p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20 cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedPath(selectedPath?.id === path.id ? null : path)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-quantum-white text-sm">{path.title}</h4>
                      {selectedPath?.id === path.id ? (
                        <ChevronDown className="w-4 h-4 text-quantum-gray" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-quantum-gray" />
                      )}
                    </div>
                    <p className="text-xs text-quantum-gray mb-2">{path.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-quantum-cyan flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {path.estimatedDuration}
                      </span>
                      <span className="text-quantum-purple">{path.steps.length} steps</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded",
                        path.difficulty === 'beginner' ? "bg-quantum-green/20 text-quantum-green" :
                        path.difficulty === 'intermediate' ? "bg-quantum-yellow/20 text-quantum-yellow" :
                        path.difficulty === 'advanced' ? "bg-quantum-orange/20 text-quantum-orange" :
                        "bg-quantum-red/20 text-quantum-red"
                      )}>
                        {path.difficulty}
                      </span>
                    </div>

                    <AnimatePresence>
                      {selectedPath?.id === path.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-quantum-cyan/10 space-y-2"
                        >
                          {path.steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="w-5 h-5 rounded-full bg-quantum-cyan/20 text-quantum-cyan flex items-center justify-center">
                                {step.order}
                              </span>
                              <span className="text-quantum-gray">{step.contentTitle}</span>
                              <span className="text-quantum-purple ml-auto">{step.type}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeView === 'related' && (
              <motion.div
                key="related"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-4 h-4 text-quantum-green" />
                  <span className="text-sm font-medium text-quantum-white">Cross-Studio Content</span>
                </div>

                {relatedContent.length === 0 ? (
                  <p className="text-sm text-quantum-gray text-center py-8">
                    No related content found
                  </p>
                ) : (
                  relatedContent.map(item => (
                    <motion.div
                      key={item.id}
                      className="p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20 cursor-pointer"
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onNavigate?.(item.studio, item.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {studioIcons[item.studio] || <File className="w-4 h-4" />}
                        <span className="font-medium text-quantum-white text-sm">{item.title}</span>
                      </div>
                      <p className="text-xs text-quantum-gray mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.topics.slice(0, 3).map(topic => (
                          <span key={topic} className="px-2 py-0.5 bg-quantum-dark/50 rounded text-xs text-quantum-gray">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeView === 'topic' && (
              <motion.div
                key="topic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-quantum-pink" />
                  <span className="text-sm font-medium text-quantum-white">Topic Explorer</span>
                </div>

                {topicGraph.slice(0, 10).map(topic => (
                  <div
                    key={topic.topic}
                    className="p-3 rounded-lg bg-quantum-dark/30 border border-quantum-cyan/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-quantum-white text-sm">{topic.topic}</h4>
                      <span className="text-xs text-quantum-cyan">{topic.depth} resources</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {topic.categories.map(cat => (
                        <span key={cat} className="px-2 py-0.5 bg-quantum-purple/20 rounded text-xs text-quantum-purple">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-3 py-2 bg-quantum-dark/30 border-t border-quantum-cyan/10 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-quantum-gray flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            {suggestions.length} suggestions
          </span>
          <span className="text-quantum-gray flex items-center gap-1">
            <Zap className="w-3 h-3" />
            QPPU Active
          </span>
        </div>
      </div>
    </div>
  );
}

export default IntelligencePanel;