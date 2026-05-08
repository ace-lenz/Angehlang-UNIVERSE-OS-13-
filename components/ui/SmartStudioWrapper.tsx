/**
 * SmartStudioWrapper.tsx - Intelligent Studio Container
 * 
 * Features:
 * - Intelligent content suggestions
 * - Cross-studio navigation
 * - Learning path integration
 * - Content evaluation
 * - Smart recommendations panel
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Brain, ChevronRight, X, PanelLeft, Book, Film, Code,
  Image, Music, Gamepad2, FileText, Wifi, GitBranch, Terminal,
  Database, Cloud, Cpu, Lock
} from 'lucide-react';
import { IntelligencePanel } from './IntelligencePanel';
import { cn } from '@/utils/sovereign-utils';
import { contentIntelligence, ContentItem } from '@/engine/ContentIntelligenceHub';

interface SmartStudioWrapperProps {
  children: React.ReactNode;
  studio: string;
  contentId?: string;
  topic?: string;
  showIntelligence?: boolean;
  onNavigate?: (targetStudio: string, contentId?: string) => void;
}

const STUDIO_CONFIG: Record<string, { icon: React.ReactNode; name: string; color: string }> = {
  BookStudio: { icon: <Book className="w-4 h-4" />, name: 'Book Studio', color: 'indigo' },
  VideoPlayer: { icon: <Film className="w-4 h-4" />, name: 'Video Studio', color: 'rose' },
  CodeStudio: { icon: <Code className="w-4 h-4" />, name: 'Code Studio', color: 'emerald' },
  ImageGallery: { icon: <Image className="w-4 h-4" />, name: 'Image Studio', color: 'violet' },
  AudioStudio: { icon: <Music className="w-4 h-4" />, name: 'Audio Studio', color: 'orange' },
  GameStudio: { icon: <Gamepad2 className="w-4 h-4" />, name: 'Game Studio', color: 'pink' },
  NetworkStudio: { icon: <Wifi className="w-4 h-4" />, name: 'Network Studio', color: 'cyan' },
  DataVizStudio: { icon: <GitBranch className="w-4 h-4" />, name: 'DataViz Studio', color: 'blue' },
  SimulationStudio: { icon: <Terminal className="w-4 h-4" />, name: 'Simulation Studio', color: 'green' },
  MusicProductionStudio: { icon: <Music className="w-4 h-4" />, name: 'Music Studio', color: 'purple' },
  TextProcessingStudio: { icon: <FileText className="w-4 h-4" />, name: 'Text Studio', color: 'yellow' },
  SecurityStudio: { icon: <Lock className="w-4 h-4" />, name: 'Security Studio', color: 'red' },
  DatabaseStudio: { icon: <Database className="w-4 h-4" />, name: 'Database Studio', color: 'teal' },
  CloudStudio: { icon: <Cloud className="w-4 h-4" />, name: 'Cloud Studio', color: 'sky' },
  IoTStudio: { icon: <Cpu className="w-4 h-4" />, name: 'IoT Studio', color: 'amber' },
  BrowserStudio: { icon: <Sparkles className="w-4 h-4" />, name: 'Browser Studio', color: 'fuchsia' },
  OSStudio: { icon: <Terminal className="w-4 h-4" />, name: 'OS Studio', color: 'slate' },
};

export function SmartStudioWrapper({ 
  children, 
  studio, 
  contentId, 
  topic, 
  showIntelligence = true,
  onNavigate 
}: SmartStudioWrapperProps) {
  const [showPanel, setShowPanel] = useState(true);
  const [currentContent, setCurrentContent] = useState<ContentItem | null>(null);
  const [suggestionCount, setSuggestionCount] = useState(0);

  const config = STUDIO_CONFIG[studio] || { icon: <Sparkles className="w-4 h-4" />, name: studio, color: 'cyan' };

  useEffect(() => {
    if (contentId) {
      const content = contentIntelligence.getContentById(contentId);
      setCurrentContent(content || null);
      
      if (contentId) {
        const suggs = contentIntelligence.getSuggestions(contentId, 10);
        setSuggestionCount(suggs.length);
      }
    } else if (topic) {
      const paths = contentIntelligence.getLearningPaths(topic);
      setSuggestionCount(paths.length);
    }
  }, [contentId, topic]);

  const handleNavigate = (targetStudio: string, targetContentId?: string) => {
    onNavigate?.(targetStudio, targetContentId);
  };

  return (
    <div className={cn(
      "relative flex gap-4",
      showPanel ? "grid grid-cols-[1fr_320px]" : "grid grid-cols-1"
    )}>
      {/* Main Content */}
      <motion.div 
        className="overflow-hidden"
        animate={{ opacity: 1 }}
      >
        {children}
      </motion.div>

      {/* Intelligence Panel Sidebar */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full overflow-hidden"
          >
            <IntelligencePanel
              currentContentId={contentId}
              currentTopic={topic}
              currentStudio={studio}
              onNavigate={handleNavigate}
              onClose={() => setShowPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel Toggle Button */}
      {showIntelligence && (
        <motion.button
          className={cn(
            "absolute right-4 top-4 z-50 p-2 rounded-lg border transition-all",
            showPanel 
              ? "bg-quantum-cyan/20 border-quantum-cyan/50 text-quantum-cyan" 
              : "bg-quantum-dark/80 border-quantum-cyan/30 text-quantum-cyan hover:bg-quantum-cyan/20"
          )}
          onClick={() => setShowPanel(!showPanel)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ 
            right: showPanel ? 340 : 20 
          }}
        >
          {showPanel ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <div className="relative">
              <Brain className="w-5 h-5" />
              {suggestionCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-quantum-purple rounded-full text-[10px] flex items-center justify-center">
                  {suggestionCount}
                </span>
              )}
            </div>
          )}
        </motion.button>
      )}
    </div>
  );
}

export default SmartStudioWrapper;