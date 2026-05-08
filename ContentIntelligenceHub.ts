/**
 * ContentIntelligenceHub.ts - Cross-Studio Content Intelligence Engine
 * 
 * Features:
 * - Analyze content across all studios (books, videos, images, code, etc.)
 * - Evaluate content relationships and relevance
 * - Generate smart suggestions based on current content
 * - Create learning paths and study plans
 * - Cross-reference content from different studios
 * - 50D ANGHV storage for intelligence data
 */

import { qppuEngine } from './QPPUCore';

export interface ContentItem {
  id: string;
  type: 'book' | 'video' | 'image' | 'code' | 'audio' | 'note' | 'document' | 'project';
  title: string;
  description: string;
  tags: string[];
  topics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  studio: string;
  metadata: Record<string, any>;
  createdAt: string;
  lastAccessed: string;
  relevanceScore?: number;
}

export interface ContentRelationship {
  sourceId: string;
  targetId: string;
  type: 'prerequisite' | 'related' | 'similar' | 'extended' | 'contradicting' | 'supporting';
  strength: number;
  reasoning: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetTopic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedDuration: string;
  steps: LearningStep[];
  prerequisites: string[];
  outcomes: string[];
}

export interface LearningStep {
  order: number;
  contentId: string;
  contentTitle: string;
  studio: string;
  type: 'read' | 'watch' | 'practice' | 'exercise' | 'project' | 'quiz';
  duration: string;
  objectives: string[];
}

export interface Suggestion {
  id: string;
  contentId: string;
  type: 'content' | 'exercise' | 'project' | 'video' | 'reading' | 'practice';
  title: string;
  description: string;
  relevanceScore: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export interface EvaluationResult {
  contentId: string;
  score: number;
  gaps: string[];
  strengths: string[];
  recommendations: string[];
  nextSteps: string[];
  relatedTopics: string[];
}

export interface TopicGraph {
  topic: string;
  connections: TopicConnection[];
  depth: number;
  categories: string[];
}

type RecordType = Record<string, any>;

export interface TopicConnection {
  topic: string;
  relation: 'parent' | 'child' | 'sibling' | 'related';
  strength: number;
}

class ContentIntelligenceHub {
  private contentIndex: Map<string, ContentItem> = new Map();
  private relationships: Map<string, ContentRelationship[]> = new Map();
  private topicIndex: Map<string, Set<string>> = new Map();
  private learningPaths: LearningPath[] = [];
  private usagePatterns: Map<string, string[]> = new Map();

  constructor() {
    this.initializeDefaultContent();
    this.buildTopicGraph();
  }

  private initializeDefaultContent() {
    const defaultContent: ContentItem[] = [
      {
        id: 'book-quantum-1',
        type: 'book',
        title: 'Quantum Computing Fundamentals',
        description: 'Introduction to quantum computing principles, qubits, and quantum gates.',
        tags: ['quantum', 'computing', 'physics', 'qpu'],
        topics: ['quantum computing', 'qubits', 'superposition', 'entanglement'],
        difficulty: 'beginner',
        studio: 'BookStudio',
        metadata: { pages: 320, author: 'Quantum Research Team' },
        createdAt: '2024-01-01',
        lastAccessed: '2024-01-15',
      },
      {
        id: 'book-anghv-1',
        type: 'book',
        title: '50D ANGHV Storage Guide',
        description: 'Complete guide to 50-dimensional holographic storage systems.',
        tags: ['storage', 'holographic', 'anghv', '50d'],
        topics: ['holographic storage', 'data encoding', 'light-speed access', '50D frames'],
        difficulty: 'intermediate',
        studio: 'BookStudio',
        metadata: { pages: 450, author: 'ANGHV Team' },
        createdAt: '2024-01-02',
        lastAccessed: '2024-01-14',
      },
      {
        id: 'book-qppu-1',
        type: 'book',
        title: 'QPPU Architecture',
        description: 'Deep dive into Unified Quantum Photonic Processing Unit design.',
        tags: ['qppu', 'architecture', 'processing', 'photonics'],
        topics: ['QPPU', 'LPU', 'GPU', 'QPU integration', 'photonic circuits'],
        difficulty: 'advanced',
        studio: 'BookStudio',
        metadata: { pages: 580, author: 'QPPU Architects' },
        createdAt: '2024-01-03',
        lastAccessed: '2024-01-15',
      },
      {
        id: 'video-quantum-1',
        type: 'video',
        title: 'Quantum Computing Explained',
        description: 'Visual explanation of quantum computing concepts.',
        tags: ['quantum', 'video', 'tutorial', 'visual'],
        topics: ['quantum computing', 'qubits', 'quantum gates'],
        difficulty: 'beginner',
        studio: 'VideoPlayer',
        metadata: { duration: '45:00', views: 15240 },
        createdAt: '2024-01-05',
        lastAccessed: '2024-01-14',
      },
      {
        id: 'video-mzi-1',
        type: 'video',
        title: 'MZI Photonic Circuits',
        description: 'Mach-Zehnder interferometer implementation in photonic circuits.',
        tags: ['mzi', 'photonics', 'circuit', 'video'],
        topics: ['MZI', 'interferometry', 'photonic logic', 'optical gates'],
        difficulty: 'advanced',
        studio: 'VideoPlayer',
        metadata: { duration: '1:20:00', views: 8240 },
        createdAt: '2024-01-06',
        lastAccessed: '2024-01-15',
      },
      {
        id: 'code-qppu-1',
        type: 'code',
        title: 'QPPU Core Implementation',
        description: 'Complete QPPU engine implementation with quantum modes.',
        tags: ['qppu', 'code', 'typescript', 'implementation'],
        topics: ['QPPU', 'quantum modes', 'photonics', '50D ANGHV'],
        difficulty: 'advanced',
        studio: 'CodeStudio',
        metadata: { language: 'TypeScript', lines: 4500 },
        createdAt: '2024-01-07',
        lastAccessed: '2024-01-15',
      },
      {
        id: 'code-photonic-1',
        type: 'code',
        title: 'Photonic Logic Array',
        description: 'MZI-based photonic logic array implementation.',
        tags: ['photonic', 'logic', 'mzi', 'hardware'],
        topics: ['MZI', 'photonic logic', 'logic gates', 'optical computing'],
        difficulty: 'expert',
        studio: 'CodeStudio',
        metadata: { language: 'TypeScript', lines: 2800 },
        createdAt: '2024-01-08',
        lastAccessed: '2024-01-14',
      },
      {
        id: 'image-quantum-1',
        type: 'image',
        title: 'Quantum Circuit Diagrams',
        description: 'Collection of quantum circuit diagrams and visualizations.',
        tags: ['quantum', 'diagram', 'visual', 'circuit'],
        topics: ['quantum gates', 'circuit design', 'visualization'],
        difficulty: 'intermediate',
        studio: 'ImageGallery',
        metadata: { format: 'SVG', count: 45 },
        createdAt: '2024-01-09',
        lastAccessed: '2024-01-13',
      },
      {
        id: 'image-architecture-1',
        type: 'image',
        title: 'QPPU Architecture Blueprints',
        description: 'Detailed blueprints of QPPU internal architecture.',
        tags: ['qppu', 'architecture', 'blueprint', 'detailed'],
        topics: ['QPPU', 'architecture', 'LPU', 'GPU', 'QPU'],
        difficulty: 'advanced',
        studio: 'ImageGallery',
        metadata: { format: 'PNG', count: 23 },
        createdAt: '2024-01-10',
        lastAccessed: '2024-01-15',
      },
      {
        id: 'audio-quantum-1',
        type: 'audio',
        title: 'Quantum Physics Lectures',
        description: 'Audio lectures on quantum physics fundamentals.',
        tags: ['quantum', 'audio', 'lecture', 'education'],
        topics: ['quantum physics', 'wave functions', 'measurements'],
        difficulty: 'intermediate',
        studio: 'AudioStudio',
        metadata: { duration: '8:30:00', tracks: 12 },
        createdAt: '2024-01-11',
        lastAccessed: '2024-01-12',
      },
      {
        id: 'note-qppu-1',
        type: 'note',
        title: 'QPPU Development Notes',
        description: 'Development notes and progress tracking for QPPU.',
        tags: ['qppu', 'notes', 'development', 'progress'],
        topics: ['QPPU', 'development', 'roadmap', 'features'],
        difficulty: 'intermediate',
        studio: 'BookStudio',
        metadata: { entries: 156 },
        createdAt: '2024-01-12',
        lastAccessed: '2024-01-15',
      },
      {
        id: 'project-studio-1',
        type: 'project',
        title: 'Angehlang Universe OS',
        description: 'Complete sovereign computing system with QPPU.',
        tags: ['os', 'system', 'qppu', 'sovereign'],
        topics: ['QPPU', '50D ANGHV', 'photonic computing', 'studio system'],
        difficulty: 'expert',
        studio: 'GameStudio',
        metadata: { studios: 20, agents: 50 },
        createdAt: '2024-01-13',
        lastAccessed: '2024-01-15',
      },
    ];

    defaultContent.forEach(item => {
      this.contentIndex.set(item.id, item);
      item.topics.forEach(topic => {
        if (!this.topicIndex.has(topic)) {
          this.topicIndex.set(topic, new Set());
        }
        this.topicIndex.get(topic)!.add(item.id);
      });
    });

    this.buildRelationships();
  }

  private buildRelationships() {
    const relationshipRules = [
      { source: 'book-quantum-1', target: 'video-quantum-1', type: 'prerequisite' as const, strength: 0.9, reasoning: 'Book provides theoretical foundation for video explanation' },
      { source: 'book-quantum-1', target: 'code-qppu-1', type: 'prerequisite' as const, strength: 0.85, reasoning: 'Understanding quantum basics essential for QPPU implementation' },
      { source: 'book-qppu-1', target: 'code-photonic-1', type: 'prerequisite' as const, strength: 0.9, reasoning: 'QPPU architecture knowledge required for photonic logic' },
      { source: 'book-qppu-1', target: 'image-architecture-1', type: 'extended' as const, strength: 0.95, reasoning: 'Architecture book complemented by visual blueprints' },
      { source: 'video-quantum-1', target: 'video-mzi-1', type: 'related' as const, strength: 0.7, reasoning: 'Both videos cover quantum/photonics topics' },
      { source: 'code-qppu-1', target: 'code-photonic-1', type: 'extended' as const, strength: 0.8, reasoning: 'QPPU core builds on photonic logic arrays' },
      { source: 'code-qppu-1', target: 'project-studio-1', type: 'related' as const, strength: 0.9, reasoning: 'QPPU core is foundation of Angehlang OS' },
      { source: 'book-anghv-1', target: 'code-qppu-1', type: 'related' as const, strength: 0.75, reasoning: 'ANGHV storage used in QPPU implementation' },
      { source: 'image-quantum-1', target: 'video-quantum-1', type: 'supporting' as const, strength: 0.8, reasoning: 'Diagrams complement video explanations' },
      { source: 'book-quantum-1', target: 'audio-quantum-1', type: 'similar' as const, strength: 0.85, reasoning: 'Both cover quantum physics fundamentals' },
    ];

    relationshipRules.forEach(rule => {
      const existing = this.relationships.get(rule.source) || [];
      existing.push({
        sourceId: rule.source,
        targetId: rule.target,
        type: rule.type,
        strength: rule.strength,
        reasoning: rule.reasoning,
      });
      this.relationships.set(rule.source, existing);
    });
  }

  private buildTopicGraph() {
    this.learningPaths = [
      {
        id: 'path-quantum-beginner',
        title: 'Quantum Computing Fundamentals',
        description: 'Master the basics of quantum computing from scratch.',
        targetTopic: 'quantum computing',
        difficulty: 'beginner',
        estimatedDuration: '2 weeks',
        steps: [
          { order: 1, contentId: 'book-quantum-1', contentTitle: 'Quantum Computing Fundamentals', studio: 'BookStudio', type: 'read', duration: '4 hours', objectives: ['Understand qubits', 'Learn superposition', 'Understand entanglement'] },
          { order: 2, contentId: 'video-quantum-1', contentTitle: 'Quantum Computing Explained', studio: 'VideoPlayer', type: 'watch', duration: '45 min', objectives: ['Visual understanding', 'Circuit diagrams'] },
          { order: 3, contentId: 'image-quantum-1', contentTitle: 'Quantum Circuit Diagrams', studio: 'ImageGallery', type: 'read', duration: '1 hour', objectives: ['Study gate diagrams', 'Practice circuit design'] },
        ],
        prerequisites: [],
        outcomes: ['Understand quantum basics', 'Create simple quantum circuits', 'Pass quantum fundamentals quiz'],
      },
      {
        id: 'path-qppu-advanced',
        title: 'QPPU Architecture Mastery',
        description: 'Deep dive into QPPU architecture and implementation.',
        targetTopic: 'QPPU',
        difficulty: 'advanced',
        estimatedDuration: '4 weeks',
        steps: [
          { order: 1, contentId: 'book-quantum-1', contentTitle: 'Quantum Computing Fundamentals', studio: 'BookStudio', type: 'read', duration: '4 hours', objectives: ['Review quantum basics'] },
          { order: 2, contentId: 'book-qppu-1', contentTitle: 'QPPU Architecture', studio: 'BookStudio', type: 'read', duration: '8 hours', objectives: ['Understand QPPU architecture', 'Learn LPU/GPU/QPU integration'] },
          { order: 3, contentId: 'image-architecture-1', contentTitle: 'QPPU Architecture Blueprints', studio: 'ImageGallery', type: 'read', duration: '2 hours', objectives: ['Study architecture diagrams'] },
          { order: 4, contentId: 'code-qppu-1', contentTitle: 'QPPU Core Implementation', studio: 'CodeStudio', type: 'practice', duration: '10 hours', objectives: ['Implement QPPU core', 'Add quantum modes'] },
          { order: 5, contentId: 'project-studio-1', contentTitle: 'Angehlang Universe OS', studio: 'GameStudio', type: 'project', duration: '20 hours', objectives: ['Build complete OS with QPPU'] },
        ],
        prerequisites: ['quantum computing', 'photonic computing'],
        outcomes: ['Master QPPU architecture', 'Implement photonic solutions', 'Build sovereign systems'],
      },
      {
        id: 'path-photonic-expert',
        title: 'Photonic Computing Expert',
        description: 'Become an expert in photonic logic and MZI circuits.',
        targetTopic: 'photonic computing',
        difficulty: 'expert',
        estimatedDuration: '6 weeks',
        steps: [
          { order: 1, contentId: 'book-quantum-1', contentTitle: 'Quantum Computing Fundamentals', studio: 'BookStudio', type: 'read', duration: '4 hours', objectives: ['Quantum foundation'] },
          { order: 2, contentId: 'book-qppu-1', contentTitle: 'QPPU Architecture', studio: 'BookStudio', type: 'read', duration: '8 hours', objectives: ['QPPU integration'] },
          { order: 3, contentId: 'video-mzi-1', contentTitle: 'MZI Photonic Circuits', studio: 'VideoPlayer', type: 'watch', duration: '80 min', objectives: ['Understand MZI原理'] },
          { order: 4, contentId: 'code-photonic-1', contentTitle: 'Photonic Logic Array', studio: 'CodeStudio', type: 'practice', duration: '15 hours', objectives: ['Implement MZI arrays', 'Create optical gates'] },
          { order: 5, contentId: 'code-qppu-1', contentTitle: 'QPPU Core Implementation', studio: 'CodeStudio', type: 'project', duration: '20 hours', objectives: ['Integrate photonic logic'] },
        ],
        prerequisites: ['quantum computing', 'QPPU', 'optical physics'],
        outcomes: ['Design MZI circuits', 'Implement photonic logic', 'Build optical computing systems'],
      },
    ];
  }

  getContentById(id: string): ContentItem | undefined {
    return this.contentIndex.get(id);
  }

  getAllContent(): ContentItem[] {
    return Array.from(this.contentIndex.values());
  }

  getContentByStudio(studio: string): ContentItem[] {
    return Array.from(this.contentIndex.values()).filter(c => c.studio === studio);
  }

  getContentByTopic(topic: string): ContentItem[] {
    const contentIds = this.topicIndex.get(topic);
    if (!contentIds) return [];
    return Array.from(contentIds).map(id => this.contentIndex.get(id)).filter(Boolean) as ContentItem[];
  }

  getRelatedContent(contentId: string): ContentRelationship[] {
    return this.relationships.get(contentId) || [];
  }

  searchContent(query: string, filters?: { type?: string; studio?: string; difficulty?: string }): ContentItem[] {
    const results = Array.from(this.contentIndex.values()).filter(item => {
      const matchesQuery = 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
        item.topics.some(t => t.toLowerCase().includes(query.toLowerCase()));

      const matchesType = !filters?.type || item.type === filters.type;
      const matchesStudio = !filters?.studio || item.studio === filters.studio;
      const matchesDifficulty = !filters?.difficulty || item.difficulty === filters.difficulty;

      return matchesQuery && matchesType && matchesStudio && matchesDifficulty;
    });

    return results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, query);
      const bScore = this.calculateRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(item: ContentItem, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    if (item.title.toLowerCase().includes(queryLower)) score += 10;
    if (item.description.toLowerCase().includes(queryLower)) score += 5;
    if (item.tags.some(t => t.includes(queryLower))) score += 3;
    if (item.topics.some(t => t.includes(queryLower))) score += 4;

    return score;
  }

  getSuggestions(currentContentId: string, limit: number = 5): Suggestion[] {
    const currentContent = this.contentIndex.get(currentContentId);
    if (!currentContent) return [];

    const suggestions: Suggestion[] = [];

    const related = this.relationships.get(currentContentId) || [];
    related.forEach(rel => {
      const target = this.contentIndex.get(rel.targetId);
      if (target) {
        suggestions.push({
          id: `sug-${rel.targetId}`,
          contentId: rel.targetId,
          type: this.mapTypeToSuggestionType(target.type),
          title: target.title,
          description: rel.reasoning,
          relevanceScore: rel.strength,
          reason: rel.reasoning,
          priority: rel.strength > 0.8 ? 'high' : rel.strength > 0.6 ? 'medium' : 'low',
          estimatedTime: target.metadata.duration || target.metadata.pages ? `${target.metadata.pages || 0} pages` : '1 hour',
        });
      }
    });

    currentContent.topics.forEach(topic => {
      const topicContent = this.getContentByTopic(topic);
      topicContent.forEach(item => {
        if (item.id !== currentContentId && !suggestions.some(s => s.contentId === item.id)) {
          suggestions.push({
            id: `sug-${item.id}`,
            contentId: item.id,
            type: this.mapTypeToSuggestionType(item.type),
            title: item.title,
            description: `Related topic: ${topic}`,
            relevanceScore: 0.6,
            reason: `Covers related topic: ${topic}`,
            priority: 'medium',
            estimatedTime: item.metadata.duration || '1 hour',
          });
        }
      });
    });

    return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  private mapTypeToSuggestionType(type: string): Suggestion['type'] {
    switch (type) {
      case 'video': return 'video';
      case 'book': return 'reading';
      case 'code': return 'practice';
      case 'audio': return 'video';
      case 'image': return 'video';
      default: return 'content';
    }
  }

  getLearningPaths(topic?: string, difficulty?: string): LearningPath[] {
    let paths = this.learningPaths;

    if (topic) {
      paths = paths.filter(p => 
        p.targetTopic.toLowerCase().includes(topic.toLowerCase()) ||
        p.title.toLowerCase().includes(topic.toLowerCase())
      );
    }

    if (difficulty) {
      paths = paths.filter(p => p.difficulty === difficulty);
    }

    return paths;
  }

  evaluateContent(contentId: string): EvaluationResult {
    const content = this.contentIndex.get(contentId);
    if (!content) {
      return {
        contentId,
        score: 0,
        gaps: ['Content not found'],
        strengths: [],
        recommendations: [],
        nextSteps: [],
        relatedTopics: [],
      };
    }

    const related = this.relationships.get(contentId) || [];
    const gaps: string[] = [];
    const strengths: string[] = [];
    const recommendations: string[] = [];
    const relatedTopics: string[] = [...content.topics];

    related.forEach(rel => {
      if (rel.type === 'prerequisite') {
        strengths.push(`Has prerequisite: ${rel.reasoning}`);
      }
      if (rel.type === 'extended') {
        strengths.push(`Can be extended with: ${rel.reasoning}`);
      }
      if (rel.type === 'related') {
        relatedTopics.push(rel.reasoning);
      }
    });

    content.topics.forEach(topic => {
      const topicContent = this.getContentByTopic(topic);
      const missingTypes = ['video', 'code', 'book', 'image'].filter(
        type => !topicContent.some(c => c.type === type)
      );

      if (missingTypes.length > 0) {
        gaps.push(`Missing ${missingTypes.join(', ')} for topic: ${topic}`);
        missingTypes.forEach(type => {
          recommendations.push(`Add ${type} content for: ${topic}`);
        });
      }
    });

    if (related.length === 0) {
      gaps.push('No related content found');
      recommendations.push('Explore more topics to build connections');
    }

    const score = Math.min(100, 50 + (related.length * 10) + (content.topics.length * 5));

    return {
      contentId,
      score,
      gaps,
      strengths,
      recommendations,
      nextSteps: this.getNextSteps(content),
      relatedTopics: [...new Set(relatedTopics)],
    };
  }

  private getNextSteps(content: ContentItem): string[] {
    const nextSteps: string[] = [];

    const related = this.relationships.get(content.id) || [];
    related.forEach(rel => {
      if (rel.type === 'prerequisite' || rel.type === 'extended') {
        nextSteps.push(`Explore: ${this.contentIndex.get(rel.targetId)?.title || rel.targetId}`);
      }
    });

    content.topics.forEach(topic => {
      const topicContent = this.getContentByTopic(topic);
      if (topicContent.length > 1) {
        nextSteps.push(`Study related: ${topic}`);
      }
    });

    return nextSteps;
  }

  createStudyPlan(targetContentId: string, availableTime?: string): LearningPath | null {
    const content = this.contentIndex.get(targetContentId);
    if (!content) return null;

    const matchingPath = this.learningPaths.find(p => 
      p.steps.some(s => s.contentId === targetContentId)
    );

    if (matchingPath) return matchingPath;

    const path: LearningPath = {
      id: `path-custom-${Date.now()}`,
      title: `Study Plan: ${content.title}`,
      description: `Custom learning path for ${content.title}`,
      targetTopic: content.topics[0] || content.title,
      difficulty: content.difficulty,
      estimatedDuration: availableTime || '2 weeks',
      steps: [
        {
          order: 1,
          contentId: content.id,
          contentTitle: content.title,
          studio: content.studio,
          type: this.mapContentTypeToStepType(content.type),
          duration: 'Variable',
          objectives: content.topics,
        },
      ],
      prerequisites: [],
      outcomes: [`Master ${content.title}`, 'Complete related exercises', 'Build practical project'],
    };

    const suggestions = this.getSuggestions(content.id, 10);
    suggestions.forEach((sug, i) => {
      path.steps.push({
        order: i + 2,
        contentId: sug.contentId,
        contentTitle: sug.title,
        studio: this.contentIndex.get(sug.contentId)?.studio || 'BookStudio',
        type: 'practice',
        duration: sug.estimatedTime,
        objectives: [sug.reason],
      });
      path.prerequisites.push(sug.title);
    });

    return path;
  }

  private mapContentTypeToStepType(type: string): LearningStep['type'] {
    switch (type) {
      case 'book': return 'read';
      case 'video': return 'watch';
      case 'code': return 'practice';
      case 'audio': return 'watch';
      default: return 'exercise';
    }
  }

  getTopicGraph(topic?: string): TopicGraph[] {
    const graphs: TopicGraph[] = [];

    this.topicIndex.forEach((contentIds, topicName) => {
      if (!topic || topicName.toLowerCase().includes(topic.toLowerCase())) {
        const connections: TopicConnection[] = [];

        contentIds.forEach(contentId => {
          const content = this.contentIndex.get(contentId);
          if (content) {
            content.topics.forEach(t => {
              if (t !== topicName) {
                connections.push({
                  topic: t,
                  relation: 'related',
                  strength: 0.7,
                });
              }
            });
          }
        });

        graphs.push({
          topic: topicName,
          connections: connections.slice(0, 10),
          depth: this.calculateTopicDepth(topicName),
          categories: this.getTopicCategories(topicName),
        });
      }
    });

    return graphs.sort((a, b) => b.depth - a.depth).slice(0, 20);
  }

  private calculateTopicDepth(topic: string): number {
    const content = this.getContentByTopic(topic);
    return content.length;
  }

  private getTopicCategories(topic: string): string[] {
    const content = this.getContentByTopic(topic);
    const categories = new Set<string>();
    content.forEach(c => categories.add(c.type));
    return Array.from(categories);
  }

  getStudioOverview(): RecordType {
    const overview: Record<string, { count: number; topics: string[]; latestContent: ContentItem[] }> = {};

    this.contentIndex.forEach(content => {
      if (!overview[content.studio]) {
        overview[content.studio] = { count: 0, topics: [], latestContent: [] };
      }

      overview[content.studio].count++;
      content.topics.forEach(t => {
        if (!overview[content.studio].topics.includes(t)) {
          overview[content.studio].topics.push(t);
        }
      });

      overview[content.studio].latestContent.push(content);
    });

    Object.keys(overview).forEach(studio => {
      overview[studio].latestContent = overview[studio].latestContent
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 5);
    });

    return overview;
  }

  getCrossStudioSuggestions(currentContentId: string): { studio: string; items: ContentItem[] }[] {
    const content = this.contentIndex.get(currentContentId);
    if (!content) return [];

    const studioCounts = new Map<string, number>();
    const topicContents = new Map<string, ContentItem[]>();

    content.topics.forEach(topic => {
      const related = this.getContentByTopic(topic);
      related.forEach(item => {
        const current = topicContents.get(item.studio) || [];
        current.push(item);
        topicContents.set(item.studio, current);

        studioCounts.set(item.studio, (studioCounts.get(item.studio) || 0) + 1);
      });
    });

    const result: { studio: string; items: ContentItem[] }[] = [];
    studioCounts.forEach((count, studio) => {
      if (studio !== content.studio) {
        result.push({
          studio,
          items: topicContents.get(studio)?.filter(i => i.id !== currentContentId).slice(0, 3) || [],
        });
      }
    });

    return result.sort((a, b) => b.items.length - a.items.length);
  }

  analyzeContentGaps(): { topic: string; missingTypes: string[]; suggestions: string[] }[] {
    const gaps: { topic: string; missingTypes: string[]; suggestions: string[] }[] = [];

    this.topicIndex.forEach((contentIds, topic) => {
      const types = new Set<string>();
      contentIds.forEach(id => {
        const content = this.contentIndex.get(id);
        if (content) types.add(content.type);
      });

      const allTypes = ['book', 'video', 'code', 'image', 'audio'];
      const missing = allTypes.filter(t => !types.has(t as any));

      if (missing.length > 0) {
        gaps.push({
          topic,
          missingTypes: missing,
          suggestions: missing.map(t => `Create ${t} content for ${topic}`),
        });
      }
    });

    return gaps.sort((a, b) => b.missingTypes.length - a.missingTypes.length);
  }

  activateQuantumMode(mode: string = 'intelligence') {
    qppuEngine.activateQuantumMode(mode);
  }
}

export const contentIntelligence = new ContentIntelligenceHub();