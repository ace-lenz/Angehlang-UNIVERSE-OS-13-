/**
 * ContinuousLearner.ts — v6.0
 * Topic-based knowledge accumulation system.
 * Expands the system's knowledge base autonomously over time through
 * session extraction, frequency tracking, and concept graph building.
 */

export interface KnowledgeEntry {
  topic: string;
  summary: string;
  confidence: number;       // 0.0 – 1.0
  frequency: number;        // how many times this topic was encountered
  sources: string[];        // session IDs or query snippets
  lastSeen: number;         // ms timestamp
  relatedTopics: string[];
}

export interface LearningSnapshot {
  totalTopics: number;
  topTopics: KnowledgeEntry[];
  averageConfidence: number;
  sessionCount: number;
  lastUpdatedAt: number;
}

const STORAGE_KEY = 'angehl_continuous_learner_v6';

class ContinuousLearner {
  private knowledge: Map<string, KnowledgeEntry> = new Map();
  private sessionCount = 0;

  constructor() {
    this.load();
  }

  /** Ingest a user message and extract topical knowledge */
  ingest(text: string, sessionId: string): void {
    this.sessionCount++;
    const topics = this.extractTopics(text);

    topics.forEach(topic => {
      const existing = this.knowledge.get(topic.toLowerCase());
      if (existing) {
        existing.frequency++;
        existing.confidence = Math.min(1, existing.confidence + 0.05);
        existing.lastSeen = Date.now();
        if (!existing.sources.includes(sessionId)) {
          existing.sources = [sessionId, ...existing.sources].slice(0, 10);
        }
      } else {
        this.knowledge.set(topic.toLowerCase(), {
          topic,
          summary: `Auto-learned from session context: "${text.slice(0, 120)}"`,
          confidence: 0.2,
          frequency: 1,
          sources: [sessionId],
          lastSeen: Date.now(),
          relatedTopics: [],
        });
      }
    });

    this.buildRelationships();
    this.persist();
  }

  private extractTopics(text: string): string[] {
    // Naive keyword extractor — looks for capitalized terms, quoted strings, and technical tokens
    const capitalized = text.match(/\b[A-Z][a-zA-Z0-9]{3,}\b/g) ?? [];
    const quoted = text.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) ?? [];
    const code = text.match(/`([^`]+)`/g)?.map(s => s.replace(/`/g, '')) ?? [];
    const combined = [...new Set([...capitalized, ...quoted, ...code])];
    // Filter stop words
    const STOP = new Set(['The', 'This', 'That', 'With', 'From', 'Have', 'When', 'Will', 'Your', 'More', 'Some', 'Just', 'Been', 'Also']);
    return combined.filter(t => !STOP.has(t)).slice(0, 8);
  }

  private buildRelationships(): void {
    // Link topics that co-appear in the same source
    const topicsArr = Array.from(this.knowledge.values());
    topicsArr.forEach(entry => {
      const related = topicsArr
        .filter(other => other.topic !== entry.topic && other.sources.some(s => entry.sources.includes(s)))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
        .map(o => o.topic);
      entry.relatedTopics = related;
    });
  }

  lookup(topic: string): KnowledgeEntry | null {
    return this.knowledge.get(topic.toLowerCase()) ?? null;
  }

  search(query: string, limit = 5): KnowledgeEntry[] {
    const q = query.toLowerCase();
    return Array.from(this.knowledge.values())
      .filter(e => e.topic.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q))
      .sort((a, b) => b.frequency * b.confidence - a.frequency * a.confidence)
      .slice(0, limit);
  }

  getSnapshot(): LearningSnapshot {
    const entries = Array.from(this.knowledge.values());
    const top = [...entries].sort((a, b) => b.frequency * b.confidence - a.frequency * a.confidence).slice(0, 10);
    const avg = entries.length ? entries.reduce((s, e) => s + e.confidence, 0) / entries.length : 0;

    return {
      totalTopics: this.knowledge.size,
      topTopics: top,
      averageConfidence: avg,
      sessionCount: this.sessionCount,
      lastUpdatedAt: Date.now(),
    };
  }

  private persist(): void {
    try {
      const data = JSON.stringify({ knowledge: Array.from(this.knowledge.entries()), sessionCount: this.sessionCount });
      localStorage.setItem(STORAGE_KEY, data);
    } catch (_) {}
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.knowledge = new Map(parsed.knowledge ?? []);
      this.sessionCount = parsed.sessionCount ?? 0;
    } catch (_) {
      this.knowledge = new Map();
    }
  }

  clear(): void {
    this.knowledge.clear();
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const continuousLearner = new ContinuousLearner();
