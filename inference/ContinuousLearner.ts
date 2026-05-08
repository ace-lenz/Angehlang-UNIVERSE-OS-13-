// Plan Item ID: TI-1
/**
 * ContinuousLearner.ts — Autonomous Knowledge Acquisition
 */

import { SovereignAuth } from './SovereignAuth';

export interface LearnResult {
  source: 'cache' | 'online' | 'offline';
  content: string;
  results?: { title: string; snippet: string; link: string }[];
}

class ContinuousLearner {
  private knowledgeBase: Map<string, string> = new Map();

  async learn(query: string): Promise<LearnResult> {
    // 1. Check local cache
    if (this.knowledgeBase.has(query)) {
      return { source: 'cache', content: this.knowledgeBase.get(query)! };
    }

    // 2. Check Auth & Credits
    if (!SovereignAuth.consumeCredit()) {
      return { 
        source: 'offline', 
        content: "Search credit exhausted. Upgrade to Pro for unlimited research." 
      };
    }

    // 3. Multi-API Search Strategy
    const results = await this.searchMultiAPI(query);
    
    if (results.length > 0) {
      const summary = results.map(r => r.snippet).join('\n\n');
      this.knowledgeBase.set(query, summary);
      SovereignAuth.addMemory();
      return { source: 'online', content: summary, results };
    }

    return { source: 'offline', content: `No online data found for: ${query}` };
  }

  private async searchMultiAPI(query: string): Promise<{ title: string; snippet: string; link: string }[]> {
    const searchAPIs = [
      // API 1: DDG JSON
      {
        url: `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
        parser: (data: any) => {
          const results: any[] = [];
          if (data.RelatedTopics) {
            data.RelatedTopics.forEach((r: any) => {
              if (r.FirstURL) results.push({ title: r.Text?.split('-')[0] || query, snippet: r.Text || '', link: r.FirstURL });
            });
          }
          return results.slice(0, 5);
        }
      },
      // API 2: DDG Vercel Wrapper
      {
        url: `https://ddg-api.vercel.app/search?q=${encodeURIComponent(query)}&num=5`,
        parser: (data: any) => data.results?.map((r: any) => ({
          title: r.title || query,
          snippet: r.snippet || '',
          link: r.url || ''
        })) || []
      },
      // API 3: Wikipedia MediaWiki API (Reliable Fallback)
      {
        url: `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`,
        parser: (data: any) => {
          const results: any[] = [];
          if (data.query && data.query.search) {
            data.query.search.forEach((r: any) => {
              results.push({
                title: r.title,
                snippet: r.snippet.replace(/<[^>]*>?/gm, ''), // strip html tags
                link: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`
              });
            });
          }
          return results.slice(0, 5);
        }
      }
    ];

    for (const api of searchAPIs) {
      try {
        const res = await fetch(api.url, { 
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          const data = await res.json();
          const parsed = api.parser(data);
          if (parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn(`Search API failed: ${api.url}`, e);
      }
    }

    return [];
  }

  getKnowledgeBaseSize(): number {
    return this.knowledgeBase.size;
  }
}

export const continuousLearner = new ContinuousLearner();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
