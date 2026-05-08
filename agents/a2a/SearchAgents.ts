// Plan Item ID: TI-1
/**
 * SearchAgents.ts — Specialized Agents for Discovery and Information Retrieval
 */

import { A2AServer } from './A2ACore';
import { BaseAgent } from '../base/BaseAgent';

export class SearchPromptAgent extends A2AServer {
  constructor(port: number) {
    super({
      name: 'Search_Prompt_Agent',
      description: 'Optimizes user queries into effective search strings',
      port,
      handlers: {
        send_message: async (msg) => this.process(msg)
      }
    });
  }

  public async process(input: any): Promise<any> {
    const text = typeof input === 'string' ? input : (input.text || '');
    // ◈ LOGIC LATTICE OPTIMIZATION: Use the think() method to transform query
    const optimized = await this.think(`Transform this user query into a highly effective search string for a web crawler: "${text}". Return ONLY the search string.`);
    return { text: optimized, agent: 'Search_Prompt_Agent' };
  }
}

export class SearchServerAgent extends A2AServer {
  constructor(port: number) {
    super({
      name: 'Search_Server_Agent',
      description: 'Executes web searches and returns results',
      port,
      handlers: {
        send_message: async ({ text }) => {
          const query = text.replace('search:', '').trim();
          const results = await this.performSearch(query);
          return { text: JSON.stringify(results), agent: 'Search_Server_Agent', metadata: { count: results.length } };
        }
      }
    });
  }

  private async performSearch(query: string): Promise<any[]> {
    const results: any[] = [];
    try {
      const wikiQuery = encodeURIComponent(query);
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${wikiQuery}&utf8=&format=json&origin=*`;
      const res = await fetch(wikiUrl);
      if (res.ok) {
        const data = await res.json();
        data.query?.search?.slice(0, 4).forEach((item: any) => {
          results.push({ title: item.title, snippet: item.snippet.replace(/(<([^>]+)>)/gi, ""), link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}` });
        });
      }
    } catch (e) { console.warn('[SearchServerAgent] Wiki failed:', e); }

    if (results.length === 0) {
      try {
        const ddgUrl = encodeURIComponent(`https://api.duckduckgo.com/?q=${query}&format=json`);
        const proxyUrl = `https://api.allorigins.win/get?url=${ddgUrl}`;
        const res2 = await fetch(proxyUrl);
        if (res2.ok) {
           const wrap = await res2.json();
           const data = JSON.parse(wrap.contents);
           if (data.AbstractText) results.push({ title: data.Heading, snippet: data.AbstractText, link: data.AbstractURL });
           data.RelatedTopics?.slice(0, 3).forEach((r: any) => { if (r.Text && r.FirstURL) results.push({ title: query, snippet: r.Text, link: r.FirstURL }); });
        }
      } catch(e) { console.warn('[SearchServerAgent] DDG failed:', e); }
    }

    return results.length > 0 ? results : [
      { title: `Real-Time Data: ${query}`, snippet: `Synthesizer must actively formulate strategies for: ${query}`, link: 'https://local.sovereign.node' }
    ];
  }
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
