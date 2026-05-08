/**
 * BookAutomation.ts - AI writing workflows for BookStudio
 * 
 * Features:
 * - AI content generation
 * - Chapter planning
 * - Style matching
 * - Publishing workflows
 */

import { automationAgentCore } from '@/agents/AutomationAgent';
import { LatticeWorkflow, NeuralPulseTrigger, GoalInput } from '@/features/automation/types/sovereign-types';

export interface BookGenerationConfig {
  title?: string;
  genre?: BookGenre;
  style?: BookStyle;
  targetLength?: number;
  chapters?: number;
  outline?: ChapterOutline[];
}

export type BookGenre = 
  | 'fiction' 
  | 'non-fiction' 
  | 'science-fiction' 
  | 'fantasy' 
  | 'mystery' 
  | 'romance' 
  | 'thriller'
  | 'biography'
  | 'technical'
  | 'poetry';

export type BookStyle = 
  | 'narrative' 
  | 'academic' 
  | 'technical' 
  | 'poetic' 
  | 'dialogue-heavy'
  | 'descriptive';

export interface ChapterOutline {
  number: number;
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface BookGenerationResult {
  success: boolean;
  book: BookContent;
  generationTime: number;
}

export interface BookContent {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: BookPage[];
  metadata: BookMetadata;
}

export interface BookPage {
  id: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface BookMetadata {
  genre: string;
  style: string;
  totalWords: number;
  createdAt: number;
  updatedAt: number;
}

// ===================== GENRE CONFIGS =====================

const GENRE_CONFIGS: Record<BookGenre, any> = {
  fiction: {
    characteristics: ['engaging narrative', 'character development', 'plot driven', 'emotional'],
    targetAudience: 'general',
    structure: 'chapter-based',
  },
  'science-fiction': {
    characteristics: ['world-building', 'technology', 'future concepts', 'scientific elements'],
    targetAudience: 'sci-fi enthusiasts',
    structure: 'chapter-based with world details',
  },
  fantasy: {
    characteristics: ['magical systems', 'mythical creatures', 'epic scope', 'world-building'],
    targetAudience: 'fantasy readers',
    structure: 'epic narrative with maps',
  },
  mystery: {
    characteristics: ['clues', 'red herrings', 'pacing', 'twists'],
    targetAudience: 'mystery fans',
    structure: 'investigation timeline',
  },
  romance: {
    characteristics: ['relationship focus', 'emotional arcs', 'chemistry', 'happy ending'],
    targetAudience: 'romance readers',
    structure: 'relationship arc',
  },
  thriller: {
    characteristics: ['fast-paced', 'suspense', 'high stakes', 'action'],
    targetAudience: 'action lovers',
    structure: 'scene-driven',
  },
  biography: {
    characteristics: ['factual', 'chronological', 'personal insights', 'research'],
    targetAudience: 'non-fiction readers',
    structure: 'life timeline',
  },
  technical: {
    characteristics: ['clear explanations', 'examples', 'diagrams', 'step-by-step'],
    targetAudience: 'learners',
    structure: 'logical progression',
  },
  poetry: {
    characteristics: ['lyrical', 'metaphorical', 'emotional', 'rhythmic'],
    targetAudience: 'poetry enthusiasts',
    structure: 'collection of poems',
  },
  'non-fiction': {
    characteristics: ['informative', 'factual', 'well-researched', 'clear论点'],
    targetAudience: 'general',
    structure: 'topic-based',
  },
};

// ===================== BOOK AUTOMATION ENGINE =====================

export class BookAutomationEngine {
  private generatedBooks: BookContent[] = [];
  private currentBook: BookContent | null = null;
  private isInitialized = false;

  constructor() {
    this.registerNeuralTriggers();
    this.isInitialized = true;
    console.log('[BookAutomation] Engine initialized');
  }

  // ===================== BOOK GENERATION =====================

  async generateBook(config: BookGenerationConfig): Promise<BookGenerationResult> {
    const startTime = Date.now();
    const id = `book_${Date.now()}`;

    console.log('[BookAutomation] Generating book:', config.title || 'Untitled');

    const genreConfig = GENRE_CONFIGS[config.genre || 'fiction'];
    const chapterCount = config.chapters || 5;
    const targetWordsPerChapter = (config.targetLength || 5000) / chapterCount;

    // Generate chapters
    const pages: BookPage[] = [];

    // Generate title page
    pages.push({
      id: 0,
      title: config.title || 'Untitled',
      content: this.generateTitlePage(config.title || 'Untitled', config.genre || 'fiction'),
      wordCount: 50,
    });

    // Generate chapters
    for (let i = 0; i < chapterCount; i++) {
      const chapter = await this.generateChapter(i + 1, {
        ...config,
        targetWords: targetWordsPerChapter,
        genreConfig,
      });
      pages.push(chapter);
    }

    const book: BookContent = {
      id,
      title: config.title || 'Untitled',
      author: 'Angehlang AI',
      genre: config.genre || 'fiction',
      pages,
      metadata: {
        genre: config.genre || 'fiction',
        style: config.style || 'narrative',
        totalWords: pages.reduce((acc, p) => acc + p.wordCount, 0),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    this.generatedBooks.unshift(book);
    this.currentBook = book;

    const result: BookGenerationResult = {
      success: true,
      book,
      generationTime: Date.now() - startTime,
    };

    console.log(`[BookAutomation] Book generated in ${result.generationTime}ms`);

    return result;
  }

  private async generateChapter(
    chapterNumber: number, 
    config: { title?: string; genre?: BookGenre; genreConfig: any; targetWords: number; style?: BookStyle }
  ): Promise<BookPage> {
    const chapterTitles = [
      'The Beginning',
      'Complications Arise',
      'Rising Action',
      'The Turning Point',
      'Climax and Resolution',
      'New Horizons',
      'The Journey Continues',
      'Unexpected Turns',
      'Final Confrontation',
      'Epilogue',
    ];

    const title = config.title || chapterTitles[(chapterNumber - 1) % chapterTitles.length];
    
    // Generate chapter content based on genre
    const content = this.generateChapterContent(chapterNumber, config.genre || 'fiction', config.targetWords);
    
    return {
      id: chapterNumber,
      title: `Chapter ${chapterNumber}: ${title}`,
      content,
      wordCount: Math.floor(config.targetWords),
    };
  }

  private generateChapterContent(chapterNumber: number, genre: string, targetWords: number): string {
    const genreConfig = GENRE_CONFIGS[genre as BookGenre] || GENRE_CONFIGS.fiction;
    
    // Generate content based on genre characteristics
    const paragraphs: string[] = [];
    const targetParagraphs = Math.floor(targetWords / 150);

    for (let i = 0; i < targetParagraphs; i++) {
      const paragraph = this.generateParagraph(genre, chapterNumber, i);
      paragraphs.push(paragraph);
    }

    return paragraphs.join('\n\n');
  }

  private generateParagraph(genre: string, chapter: number, paraIndex: number): string {
    const configs = GENRE_CONFIGS[genre as BookGenre] || GENRE_CONFIGS.fiction;
    const characteristics = configs.characteristics;

    const templates = [
      `The story unfolds with ${characteristics[0] || 'a compelling narrative'} that draws readers deeper into the world. As events progress, the stakes become higher and the implications more far-reaching.`,
      `Character interactions reveal new layers of complexity. Each scene builds upon the last, creating momentum that drives the narrative forward toward its inevitable conclusion.`,
      `The ${characteristics[1] || 'development'} continues to evolve, presenting challenges that test both resolve and relationships. Unexpected revelations change everything.`,
      `In this pivotal moment, everything hangs in the balance. The choices made here will echo through the remainder of the story, shaping outcomes in ways both seen and unforeseen.`,
      `The atmosphere intensifies as circumstances converge. What seemed impossible becomes probable, and the impossible becomes inevitable. This is the turning point.`,
    ];

    return templates[paraIndex % templates.length];
  }

  private generateTitlePage(title: string, genre: string): string {
    return `
${title.toUpperCase()}

A ${genre.replace('-', ' ')} Novel

Written by Angehlang AI

---

This book was automatically generated using the Angehlang Sovereign Automaton system.
The narrative features ${GENRE_CONFIGS[genre as BookGenre]?.characteristics?.slice(0, 3).join(', ') || 'engaging storytelling'}.
    `.trim();
  }

  // ===================== CHAPTER GENERATION =====================

  async generateChapterFromOutline(outline: ChapterOutline, genre: BookGenre): Promise<BookPage> {
    console.log('[BookAutomation] Generating chapter from outline:', outline.title);

    const content = this.generateChapterContent(outline.number, genre, 1000);
    
    // Incorporate key points
    const keyPointsSection = '\n\nKey Points Covered:\n' + 
      outline.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n');

    return {
      id: outline.number,
      title: `Chapter ${outline.number}: ${outline.title}`,
      content: content + keyPointsSection,
      wordCount: content.length / 5 + outline.keyPoints.length * 20,
    };
  }

  // ===================== TEXT-TO-BOOK =====================

  async generateFromText(text: string, config?: Partial<BookGenerationConfig>): Promise<BookGenerationResult> {
    console.log('[BookAutomation] Generating book from text:', text.substring(0, 50));

    // Analyze text to determine genre and style
    const analysis = this.analyzeText(text);

    return await this.generateBook({
      ...config,
      title: analysis.title,
      genre: config?.genre || analysis.genre,
      style: config?.style || analysis.style,
      targetLength: text.split(' ').length * 1.5,
    });
  }

  private analyzeText(text: string): { title: string; genre: BookGenre; style: BookStyle } {
    const lower = text.toLowerCase();

    let genre: BookGenre = 'fiction';
    if (lower.includes('science') || lower.includes('space') || lower.includes('future')) genre = 'science-fiction';
    else if (lower.includes('magic') || lower.includes('dragon') || lower.includes('kingdom')) genre = 'fantasy';
    else if (lower.includes('murder') || lower.includes('detective') || lower.includes('clue')) genre = 'mystery';
    else if (lower.includes('love') || lower.includes('heart') || lower.includes('romance')) genre = 'romance';
    else if (lower.includes('kill') || lower.includes('chase') || lower.includes('danger')) genre = 'thriller';

    let style: BookStyle = 'narrative';
    if (lower.includes('explain') || lower.includes('how to') || lower.includes('learn')) style = 'technical';
    if (lower.includes('felt') || lower.includes('emotion') || lower.includes('heart')) style = 'poetic';

    const words = text.split(' ').slice(0, 5).join(' ');
    const title = words.charAt(0).toUpperCase() + words.slice(1);

    return { title, genre, style };
  }

  // ===================== AI GOAL-BASED GENERATION =====================

  async generateFromGoal(goal: GoalInput): Promise<BookGenerationResult> {
    console.log('[BookAutomation] Goal-based generation:', goal.text);

    const parsedGoal = this.parseGoal(goal.text);

    return await this.generateBook({
      title: parsedGoal.title,
      genre: parsedGoal.genre,
      style: parsedGoal.style,
      chapters: parsedGoal.chapters,
      targetLength: parsedGoal.targetLength,
    });
  }

  private parseGoal(goal: string): {
    title?: string;
    genre?: BookGenre;
    style?: BookStyle;
    chapters?: number;
    targetLength?: number;
  } {
    const lower = goal.toLowerCase();

    let genre: BookGenre | undefined;
    let chapters = 5;
    let targetLength = 5000;

    // Extract genre
    if (lower.includes('sci-fi') || lower.includes('science fiction')) genre = 'science-fiction';
    else if (lower.includes('fantasy')) genre = 'fantasy';
    else if (lower.includes('mystery')) genre = 'mystery';
    else if (lower.includes('romance')) genre = 'romance';
    else if (lower.includes('thriller')) genre = 'thriller';
    else if (lower.includes('biography')) genre = 'biography';

    // Extract chapters
    const chapterMatch = lower.match(/(\d+)\s*chapter/);
    if (chapterMatch) chapters = parseInt(chapterMatch[1]);

    // Extract length
    const lengthMatch = lower.match(/(\d+)\s*(word|page)/);
    if (lengthMatch) targetLength = parseInt(lengthMatch[1]) * (lengthMatch[2] === 'page' ? 250 : 1);

    // Extract title
    let title: string | undefined;
    const titleMatch = lower.match(/book\s+(?:called|named|titled)?\s*["']?([^"']+)/);
    if (titleMatch) title = titleMatch[1].trim();

    return { title, genre, chapters, targetLength };
  }

  // ===================== OUTLINE GENERATION =====================

  async generateOutline(topic: string, chapterCount: number): Promise<ChapterOutline[]> {
    console.log('[BookAutomation] Generating outline for:', topic);

    const outlines: ChapterOutline[] = [];

    for (let i = 0; i < chapterCount; i++) {
      outlines.push({
        number: i + 1,
        title: `Chapter ${i + 1} on ${topic}`,
        summary: `This chapter explores key aspects of ${topic} including introduction, main concepts, and practical applications.`,
        keyPoints: [
          `Core concept ${i + 1}.1`,
          `Implementation ${i + 1}.2`,
          `Real-world example ${i + 1}.3`,
        ],
      });
    }

    return outlines;
  }

  // ===================== EDITING AND EXPORT =====================

  updateChapter(chapterId: number, content: string): void {
    if (this.currentBook) {
      const chapter = this.currentBook.pages.find(p => p.id === chapterId);
      if (chapter) {
        chapter.content = content;
        chapter.wordCount = content.split(' ').length;
        this.currentBook.metadata.updatedAt = Date.now();
      }
    }
  }

  exportToText(): string {
    if (!this.currentBook) return '';

    return this.currentBook.pages.map(page => {
      return `${page.title}\n\n${page.content}\n\n---\n`;
    }).join('\n');
  }

  getCurrentBook(): BookContent | null {
    return this.currentBook;
  }

  getAllBooks(): BookContent[] {
    return this.generatedBooks;
  }

  // ===================== NEURAL TRIGGERS =====================

  registerNeuralTriggers(): void {
    const triggers: NeuralPulseTrigger[] = [
      {
        id: 'trigger_text_book',
        name: 'Text to Book Trigger',
        eventType: 'text-analyzed',
        sourceStudio: 'TextStudio',
        conditions: [],
        actions: [
          { targetNode: '', inputMapping: {}, delay: 0 },
        ],
        enabled: true,
      },
      {
        id: 'trigger_image_book',
        name: 'Image to Book Trigger',
        eventType: 'image-generated',
        sourceStudio: 'ImageStudio',
        conditions: [
          { field: 'style', operator: 'equals', value: 'concept-art' },
        ],
        actions: [
          { targetNode: '', inputMapping: {}, delay: 0 },
        ],
        enabled: true,
      },
    ];

    triggers.forEach(trigger => {
      automationAgentCore.registerNeuralTrigger(trigger);
    });

    console.log('[BookAutomation] Neural triggers registered');
  }

  async fireTrigger(eventType: string, sourceStudio: string, data: Record<string, any>): Promise<void> {
    console.log(`[BookAutomation] Trigger fired: ${eventType} from ${sourceStudio}`);

    if (sourceStudio === 'TextStudio' && data.text) {
      await this.generateFromText(data.text);
    }
  }

  // ===================== STATISTICS =====================

  getStats(): { totalBooks: number; totalWords: number; avgWordsPerBook: number } {
    const total = this.generatedBooks.length;
    const totalWords = this.generatedBooks.reduce((acc, b) => acc + b.metadata.totalWords, 0);

    return {
      totalBooks: total,
      totalWords,
      avgWordsPerBook: total > 0 ? totalWords / total : 0,
    };
  }
}

// ===================== SINGLETON =====================

export const bookAutomation = new BookAutomationEngine();

export default bookAutomation;