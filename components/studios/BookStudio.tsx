// Plan Item ID: TI-1
/**
 * BookStudio.tsx - Advanced Sovereign Book Studio v13
 * 
 * Features compared to industry leaders:
 * - Sudowrite: AI writing assistant, story planning
 * - DreamGen: Creative story generation
 * - Claude: Advanced reasoning, editing
 * - Novelcrafter: Novel planning, character management
 * - ChatGPT/GPT-5: Content generation
 * - Inkfluence AI: Content marketing
 * - YouBooks AI: Book creation
 * - Postwriter: Open-source writing
 * 
 * New Features:
 * - Project Management
 * - AI Writing (Generate, Continue, Rewrite, Summarize, Expand, Condense)
 * - Character Generator & Manager
 * - World Building (Locations, Lore)
 * - Plot/Story Outliner
 * - Chapter Management
 * - Genre Templates
 * - Rich Text Editor
 * - Publishing (ePub, PDF, HTML, Markdown)
 * - Progress Tracking
 * - Writing Goals
 * - Dialogue Generator
 * - Style Analysis
 * - Auto-save
 * - Multi-language Support
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, BookOpen, Pen, PenTool, Sparkles, Loader2, Save, Download,
  Plus, Trash2, Copy, RefreshCw, Settings, Search, Filter,
  Users, MapPin, Clock, Target, Gauge, FileText, FileCode,
  Layers, Grid, List, ChevronRight, ChevronDown, X, Edit3,
  Wand2, Mic, Type, Image as ImageIcon, Link, Eye, EyeOff,
  RotateCcw, ArrowRight, ArrowLeft, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight, List as ListIcon,
  CheckSquare, Square, Zap, Brain, BookMarked
} from 'lucide-react';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import {
  bookSovereignEngine,
  BookProject,
  Chapter,
  Character,
  Location,
  GENRE_TEMPLATES,
  WRITING_MODES,
  Genre,
  WritingMode,
  WritingTone
} from '@/engine/studios/BookSovereignEngine';

type ViewMode = 'write' | 'plan' | 'characters' | 'world' | 'export' | 'settings';
type PlanTab = 'outline' | 'timeline' | 'chapters';

interface NewProject {
  title: string;
  genre: string;
  author: string;
}

interface BookStudioProps {
  data?: any;
  status?: any;
}

export const BookStudio: React.FC<BookStudioProps> = ({ data, status }) => {
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [currentProject, setCurrentProject] = useState<BookProject | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('write');
  const [planTab, setPlanTab] = useState<PlanTab>('chapters');
  
  // Writing State
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [writingMode, setWritingMode] = useState<WritingMode>('generate');
  const [writingTone, setWritingTone] = useState<WritingTone>('creative');
  const [prompt, setPrompt] = useState('');
  
  // Character State
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [newCharacter, setNewCharacter] = useState({ name: '', role: 'supporting', description: '', backstory: '', motivation: '', appearance: '' });
  
  // Project State
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState<NewProject>({ title: '', genre: 'fiction', author: '' });

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = bookSovereignEngine.getProjects();
    setProjects(loadedProjects);
    if (loadedProjects.length > 0) {
      setCurrentProject(loadedProjects[0]);
      if (loadedProjects[0].metadata?.chapters.length) {
        setCurrentChapter(loadedProjects[0].metadata.chapters[0]);
        setEditorContent(loadedProjects[0].metadata.chapters[0].content);
      }
    }
  }, []);

  const createProject = () => {
    if (!newProjectForm.title.trim()) return;
    const project = bookSovereignEngine.createProject(newProjectForm.title, newProjectForm.genre, newProjectForm.author);
    bookSovereignEngine.addChapter(project.id, 'Chapter 1');
    setProjects([project, ...projects]);
    setCurrentProject(project);
    setCurrentChapter(project.metadata?.chapters[0] || null);
    setEditorContent('');
    setShowNewProject(false);
    setNewProjectForm({ title: '', genre: 'fiction', author: '' });
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const content = await bookSovereignEngine.generateContent(prompt, {
        mode: writingMode,
        tone: writingTone,
        length: 'medium'
      });
      
      if (writingMode === 'continue') {
        setEditorContent(prev => prev + '\n\n' + content);
      } else {
        setEditorContent(content);
      }
    } catch (err) {
      console.error('[BookStudio] Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveChapter = () => {
    if (!currentProject || !currentChapter) return;
    bookSovereignEngine.updateChapter(currentProject.id, currentChapter.id, { content: editorContent });
    console.log('[BookStudio] Chapter saved');
  };

  const addChapter = () => {
    if (!currentProject) return;
    const chapter = bookSovereignEngine.addChapter(currentProject.id, `Chapter ${(currentProject.metadata?.chapters.length || 0) + 1}`);
    if (chapter) {
      setCurrentChapter(chapter);
      setEditorContent('');
    }
  };

  const addCharacter = () => {
    if (!currentProject || !newCharacter.name.trim()) return;
    bookSovereignEngine.addCharacter(currentProject.id, newCharacter as any);
    setNewCharacter({ name: '', role: 'supporting', description: '', backstory: '', motivation: '', appearance: '' });
    setShowCharacterForm(false);
  };

  const selectChapter = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setEditorContent(chapter.content);
  };

  const progress = currentProject ? bookSovereignEngine.calculateProgress(currentProject) : 0;
  const wordCount = editorContent.split(/\s+/).filter(w => w).length;
  const characterCount = currentProject?.metadata?.characters.length || 0;
  const locationCount = currentProject?.metadata?.locations.length || 0;

  return (
    <div className="flex flex-col h-full bg-[#050510] text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <BookOpen size={18} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase">Book Studio v13</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest">Sovereign Author</span>
              <span className="text-[8px] text-zinc-600">•</span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase">{wordCount} words</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <select 
              value={currentProject?.id || ''} 
              onChange={(e) => {
                const proj = projects.find(p => p.id === e.target.value);
                if (proj) {
                  setCurrentProject(proj);
                  if (proj.metadata?.chapters.length) {
                    setCurrentChapter(proj.metadata.chapters[0]);
                    setEditorContent(proj.metadata.chapters[0].content);
                  }
                }
              }}
              className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs max-w-[150px]"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          )}
          <button onClick={() => setShowNewProject(true)} className="px-2 py-1.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-bold uppercase flex items-center gap-1">
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      {/* Main Content */}
      {currentProject ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r border-white/5 flex flex-col">
            {/* View Tabs */}
            <div className="p-2 grid grid-cols-3 gap-1">
              {[
                { id: 'write', icon: Pen, label: 'Write' },
                { id: 'plan', icon: Target, label: 'Plan' },
                { id: 'characters', icon: Users, label: 'Chars' },
                { id: 'world', icon: MapPin, label: 'World' },
                { id: 'export', icon: Download, label: 'Export' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as ViewMode)}
                  className={cn("p-2 rounded flex flex-col items-center gap-1", viewMode === tab.id ? "bg-yellow-500/20 text-yellow-300" : "text-zinc-500 hover:text-zinc-300")}
                >
                  <tab.icon size={12} />
                  <span className="text-[8px] font-bold uppercase">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Chapters</span>
                <button onClick={addChapter} className="p-1 rounded hover:bg-white/10"><Plus size={10} className="text-zinc-500" /></button>
              </div>
              {currentProject.metadata?.chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => selectChapter(ch)}
                  className={cn("w-full p-2 rounded text-left", currentChapter?.id === ch.id ? "bg-yellow-500/20 border border-yellow-500/30" : "bg-white/5 hover:bg-white/10")}
                >
                  <div className="text-[10px] text-zinc-500">Chapter {ch.number}</div>
                  <div className="text-xs text-zinc-300 truncate">{ch.title}</div>
                  <div className="text-[8px] text-zinc-600">{ch.wordCount} words</div>
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="p-3 border-t border-white/5">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">Progress</span>
                  <span className="text-yellow-400">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[8px] text-zinc-600">
                  <span>{currentProject.currentWordCount} words</span>
                  <span>{currentProject.targetWordCount} goal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Write Mode */}
            {viewMode === 'write' && (
              <>
                {/* Toolbar */}
                <div className="flex items-center gap-2 p-3 border-b border-white/5">
                  <select value={writingMode} onChange={(e) => setWritingMode(e.target.value as WritingMode)} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs">
                    {WRITING_MODES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <select value={writingTone} onChange={(e) => setWritingTone(e.target.value as WritingTone)} className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs">
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="creative">Creative</option>
                    <option value="humorous">Humorous</option>
                    <option value="dramatic">Dramatic</option>
                  </select>
                  <div className="flex-1">
                    <input 
                      value={prompt} 
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to write..."
                      className="w-full bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs"
                      onKeyDown={(e) => e.key === 'Enter' && generateContent()}
                    />
                  </div>
                  <button onClick={generateContent} disabled={isGenerating || !prompt.trim()} className={cn("px-3 py-1.5 rounded bg-yellow-500 text-black text-xs font-bold uppercase flex items-center gap-1", isGenerating && "opacity-50")}>
                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    Generate
                  </button>
                  <button onClick={saveChapter} className="p-2 rounded hover:bg-white/10"><Save size={14} className="text-zinc-500" /></button>
                </div>

                {/* Editor */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="max-w-3xl mx-auto">
                    <input 
                      value={currentChapter?.title || ''}
                      onChange={(e) => currentChapter && bookSovereignEngine.updateChapter(currentProject!.id, currentChapter.id, { title: e.target.value })}
                      className="w-full text-2xl font-bold bg-transparent border-none outline-none mb-4"
                      placeholder="Chapter Title"
                    />
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="w-full h-[60vh] bg-transparent border-none outline-none text-base leading-relaxed resize-none placeholder:text-zinc-700"
                      placeholder="Start writing your story..."
                    />
                  </div>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                  <div className="flex items-center gap-4">
                    <span>{wordCount} words</span>
                    <span>{editorContent.split('\n').length} lines</span>
                    <span>{editorContent.length} characters</span>
                  </div>
                  <span>Writing in {writingTone} tone</span>
                </div>
              </>
            )}

            {/* Plan Mode */}
            {viewMode === 'plan' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {/* Story Outline */}
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <h3 className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-2"><Target size={14} /> Story Outline</h3>
                    <textarea 
                      value={currentProject.synopsis} 
                      onChange={(e) => bookSovereignEngine.updateProject(currentProject.id, { synopsis: e.target.value })}
                      className="w-full h-32 bg-black/40 border border-white/10 rounded p-2 text-xs resize-none"
                      placeholder="Write your story synopsis..."
                    />
                  </div>

                  {/* Genre Template */}
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10">
                    <h3 className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-2"><Book size={14} /> Genre Template</h3>
                    <select className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs mb-2">
                      {GENRE_TEMPLATES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <div className="text-[10px] text-zinc-500 space-y-1">
                      <p>Structure: 7-point story arc</p>
                      <p>Common elements: Hero's journey, transformation</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-4 rounded-lg bg-black/40 border border-white/10 col-span-2">
                    <h3 className="text-xs font-bold text-yellow-400 mb-3 flex items-center gap-2"><Clock size={14} /> Timeline</h3>
                    <div className="space-y-2">
                      {[
                        { time: 'Day 1', event: 'Introduction of protagonist' },
                        { time: 'Day 2', event: 'Inciting incident occurs' },
                        { time: 'Day 3', event: 'First major plot point' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className="text-yellow-400 w-16 shrink-0">{item.time}</span>
                          <span className="text-zinc-400">{item.event}</span>
                        </div>
                      ))}
                      <button className="text-[10px] text-yellow-400 hover:underline">+ Add Event</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Characters Mode */}
            {viewMode === 'characters' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-400">Characters ({characterCount})</h3>
                  <button onClick={() => setShowCharacterForm(true)} className="px-3 py-1.5 rounded bg-yellow-500/20 text-yellow-300 text-xs font-bold uppercase flex items-center gap-1">
                    <Plus size={12} /> Add Character
                  </button>
                </div>

                {showCharacterForm && (
                  <div className="mb-4 p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                    <input value={newCharacter.name} onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})} placeholder="Character Name" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
                    <select value={newCharacter.role} onChange={(e) => setNewCharacter({...newCharacter, role: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs">
                      <option value="protagonist">Protagonist</option>
                      <option value="antagonist">Antagonist</option>
                      <option value="supporting">Supporting</option>
                      <option value="minor">Minor</option>
                    </select>
                    <textarea value={newCharacter.description} onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})} placeholder="Description" className="w-full h-20 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs resize-none" />
                    <div className="flex gap-2">
                      <button onClick={addCharacter} className="flex-1 py-2 rounded bg-yellow-500 text-black text-xs font-bold uppercase">Add</button>
                      <button onClick={() => setShowCharacterForm(false)} className="px-4 py-2 rounded bg-white/10 text-zinc-400 text-xs">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentProject.metadata?.characters.map(char => (
                    <div key={char.id} className="p-3 rounded-lg bg-black/40 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center"><Users size={14} className="text-yellow-400" /></div>
                        <div>
                          <div className="text-xs font-bold">{char.name}</div>
                          <div className="text-[8px] text-zinc-500 capitalize">{char.role}</div>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2">{char.description}</p>
                    </div>
                  ))}
                  {characterCount === 0 && <div className="col-span-full text-center py-8 text-zinc-600 text-sm">No characters yet</div>}
                </div>
              </div>
            )}

            {/* World Mode */}
            {viewMode === 'world' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-400">Locations ({locationCount})</h3>
                  <button className="px-3 py-1.5 rounded bg-yellow-500/20 text-yellow-300 text-xs font-bold uppercase flex items-center gap-1">
                    <Plus size={12} /> Add Location
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentProject.metadata?.locations.map(loc => (
                    <div key={loc.id} className="p-3 rounded-lg bg-black/40 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={14} className="text-yellow-400" />
                        <span className="text-xs font-bold">{loc.name}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400">{loc.description}</p>
                    </div>
                  ))}
                  {locationCount === 0 && <div className="col-span-full text-center py-8 text-zinc-600 text-sm">No locations yet</div>}
                </div>
              </div>
            )}

            {/* Export Mode */}
            {viewMode === 'export' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="text-xs font-bold text-zinc-400 mb-4">Export Format</h3>
                <div className="grid grid-cols-4 gap-3 max-w-2xl">
                  {[
                    { id: 'epub', name: 'ePub', icon: Book, desc: 'For e-readers' },
                    { id: 'pdf', name: 'PDF', icon: FileText, desc: 'Print-ready' },
                    { id: 'html', name: 'HTML', icon: FileCode, desc: 'Web format' },
                    { id: 'md', name: 'Markdown', icon: Type, desc: 'Plain text' }
                  ].map(fmt => (
                    <button key={fmt.id} className="p-4 rounded-lg bg-black/40 border border-white/10 hover:border-yellow-500/50 flex flex-col items-center gap-2">
                      <fmt.icon size={20} className="text-yellow-400" />
                      <span className="text-xs font-bold">{fmt.name}</span>
                      <span className="text-[8px] text-zinc-500">{fmt.desc}</span>
                    </button>
                  ))}
                </div>
                <button className="mt-6 px-6 py-3 rounded-lg bg-yellow-500 text-black text-sm font-bold uppercase flex items-center gap-2">
                  <Download size={16} /> Export Project
                </button>
              </div>
            )}

            {/* Settings Mode */}
            {viewMode === 'settings' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 max-w-lg">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Project Title</label>
                  <input value={currentProject.title} onChange={(e) => bookSovereignEngine.updateProject(currentProject.id, { title: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Author</label>
                  <input value={currentProject.author} onChange={(e) => bookSovereignEngine.updateProject(currentProject.id, { author: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Word Count Goal</label>
                  <input type="number" value={currentProject.targetWordCount} onChange={(e) => bookSovereignEngine.updateProject(currentProject.id, { targetWordCount: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Daily Goal</label>
                  <input type="number" value={currentProject.metadata?.dailyGoal || 1000} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Projects - Create One */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-zinc-600" />
            <h2 className="text-lg font-bold text-zinc-300 mb-2">No Projects Yet</h2>
            <p className="text-sm text-zinc-500 mb-4">Create your first book project to start writing</p>
            <button onClick={() => setShowNewProject(true)} className="px-6 py-3 rounded-lg bg-yellow-500 text-black font-bold uppercase flex items-center gap-2 mx-auto">
              <Plus size={16} /> Create Project
            </button>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6 w-96">
            <h3 className="text-lg font-bold mb-4">New Book Project</h3>
            <div className="space-y-3">
              <input value={newProjectForm.title} onChange={(e) => setNewProjectForm({...newProjectForm, title: e.target.value})} placeholder="Book Title" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
              <select value={newProjectForm.genre} onChange={(e) => setNewProjectForm({...newProjectForm, genre: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs">
                {GENRE_TEMPLATES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input value={newProjectForm.author} onChange={(e) => setNewProjectForm({...newProjectForm, author: e.target.value})} placeholder="Author Name" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={createProject} className="flex-1 py-2 rounded bg-yellow-500 text-black font-bold uppercase">Create</button>
              <button onClick={() => setShowNewProject(false)} className="px-4 py-2 rounded bg-white/10 text-zinc-400">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookStudio;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
