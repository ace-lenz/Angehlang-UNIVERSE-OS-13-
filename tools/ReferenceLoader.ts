/**
 * ReferenceLoader.ts — v1.0
 * Specialized tool for fetching and parsing high-fidelity external references.
 */

export interface ReferenceContent {
  url: string;
  title: string;
  rawContent: string;
  type: 'github' | 'docs' | 'arxiv' | 'generic';
  timestamp: number;
}

class ReferenceLoader {
  async fetch(url: string): Promise<ReferenceContent> {
    const type = this.detectType(url);
    let content: ReferenceContent;

    switch (type) {
      case 'github':
        content = await this.fetchGitHub(url);
        break;
      case 'arxiv':
        content = await this.fetchArxiv(url);
        break;
      case 'docs':
      default:
        content = await this.fetchGeneric(url);
        break;
    }

    return content;
  }

  private detectType(url: string): 'github' | 'arxiv' | 'docs' | 'generic' {
    if (url.includes('github.com')) return 'github';
    if (url.includes('arxiv.org')) return 'arxiv';
    if (url.includes('docs.') || url.includes('/docs/')) return 'docs';
    return 'generic';
  }

  private async fetchGitHub(url: string): Promise<ReferenceContent> {
    // Basic GitHub API ingestion (fetching README as a proxy for the repo's 'wisdom')
    // A more advanced version would traverse the file tree.
    const parts = url.replace('https://github.com/', '').split('/');
    const owner = parts[0];
    const repo = parts[1];
    
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
      const resp = await fetch(apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      });
      
      if (!resp.ok) throw new Error(`GitHub API ${resp.status}`);
      
      const text = await resp.text();
      return {
        url,
        title: `${owner}/${repo} Repository`,
        rawContent: text,
        type: 'github',
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn('[ReferenceLoader] GitHub fetch failed, falling back to generic:', err);
      return this.fetchGeneric(url);
    }
  }

  private async fetchArxiv(url: string): Promise<ReferenceContent> {
    const id = url.split('/').pop()?.replace('.pdf', '');
    try {
      // arXiv API (XML)
      const apiUrl = `https://export.arxiv.org/api/query?id_list=${id}`;
      const resp = await fetch(apiUrl);
      const xml = await resp.text();
      
      // Basic extraction of summary/title from XML
      const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
      
      return {
        url,
        title: titleMatch ? titleMatch[1].trim() : `arXiv:${id}`,
        rawContent: summaryMatch ? summaryMatch[1].trim() : 'Content extraction failed.',
        type: 'arxiv',
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn('[ReferenceLoader] arXiv fetch failed:', err);
      return this.fetchGeneric(url);
    }
  }

  private async fetchGeneric(url: string): Promise<ReferenceContent> {
    try {
      // Using a proxy if needed for CORS, but trying direct first.
      // Many docs sites block direct browser fetch.
      const resp = await fetch(url);
      const html = await resp.text();
      
      // Basic HTML-to-Text conversion (strip tags)
      const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/);
      const cleanText = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        url,
        title: titleMatch ? titleMatch[1].trim() : url,
        rawContent: cleanText.slice(0, 50000), // Cap at 50k chars
        type: 'generic',
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn('[ReferenceLoader] Generic fetch failed:', err);
      throw new Error(`Failed to fetch reference: ${err}`);
    }
  }
}

export const referenceLoader = new ReferenceLoader();
export default referenceLoader;
