/**
 * WikiSearchAgent.ts - Wikipedia Search Agent (Enhanced)
 * 
 * Enhanced Wikipedia/MediaWiki search with:
 * - Full-text search
 * - Page content extraction
 * - Category exploration
 * - Related pages
 * - Image search
 * - Self-learning from search patterns
 */

import { PlatformSearchAgent, PlatformSearchResult, PlatformConfig } from './PlatformSearchAgent';
import { sovereignVault } from '@/storage/SovereignVault';

export interface WikiSearchOptions {
  limit?: number;
  language?: string;
  category?: string;
  notCategory?: string;
}

export interface WikiPageContent {
  pageId: number;
  title: string;
  extract: string;
  content?: string;
  url: string;
  categories?: string[];
  links?: string[];
  images?: string[];
  relatedPages?: string[];
  coordinates?: { lat: number; lon: number };
  infobox?: Record<string, any>;
}

const WIKI_CONFIG: PlatformConfig = {
  platformName: 'Wikipedia',
  apiEndpoint: 'https://en.wikipedia.org/w/api.php',
  fallbackEndpoints: [
    'https://en.wikipedia.org/wiki/Special:Search?search={query}'
  ],
  cacheExpiry: 1000 * 60 * 60 * 24, // 24 hours
  rateLimit: 1000, // 1 second
  authRequired: false
};

export class WikiSearchAgent extends PlatformSearchAgent {
  private wikiLanguage: string = 'en';

  constructor() {
    super(WIKI_CONFIG);
  }

  /**
   * Perform Wikipedia search
   */
  protected async performSearch(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];

    // Primary: MediaWiki API search
    try {
      const apiResults = await this.searchViaApi(query);
      results.push(...apiResults);
    } catch (e) {
      console.warn('[WikiSearchAgent] API search failed:', e);
    }

    // Fallback to opensearch
    if (results.length === 0) {
      try {
        const opensearchResults = await this.searchViaOpenSearch(query);
        results.push(...opensearchResults);
      } catch (e) {
        console.warn('[WikiSearchAgent] OpenSearch failed:', e);
      }
    }

    return results.slice(0, 10);
  }

  /**
   * Search via MediaWiki API
   */
  private async searchViaApi(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: '10',
      format: 'json',
      origin: '*'
    });

    const url = `${this.config.apiEndpoint}?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const item of data.query?.search || []) {
        results.push(this.normalizeResult(
          item.title || '',
          this.stripHtml(item.snippet || ''),
          `https://${this.wikiLanguage}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          {
            pageId: item.pageid,
            wordCount: item.wordcount,
            size: item.size,
            timestamp: item.timestamp
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[WikiSearchAgent] API search error:', e);
    }

    return results;
  }

  /**
   * Search via MediaWiki OpenSearch API
   */
  private async searchViaOpenSearch(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const params = new URLSearchParams({
      action: 'opensearch',
      search: query,
      limit: '10',
      namespace: '0',
      format: 'json',
      origin: '*'
    });

    const url = `${this.config.apiEndpoint}?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();
      const titles = data[1] || [];
      const descriptions = data[2] || [];
      const urls = data[3] || [];

      for (let i = 0; i < titles.length; i++) {
        if (titles[i] && urls[i]) {
          results.push(this.normalizeResult(
            titles[i] || '',
            descriptions[i] || '',
            urls[i] || '',
            {}
          ));
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[WikiSearchAgent] OpenSearch error:', e);
    }

    return results;
  }

  /**
   * Get page content
   */
  async getPageContent(title: string): Promise<WikiPageContent | null> {
    const cacheKey = `wiki_content_${title.toLowerCase()}`;
    const cached = await sovereignVault.get<WikiPageContent>(cacheKey);
    
    if (cached) return cached;
    
    const results: PlatformSearchResult[] = [];
    
    // Get page extracts
    const params = new URLSearchParams({
      action: 'query',
      titles: title,
      prop: 'extracts|categories|links|images|info|coordinates',
      exintro: 'true',
      explaintext: 'true',
      exlimit: '1',
      format: 'json',
      origin: '*'
    });

    const url = `${this.config.apiEndpoint}?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const data = await response.json();
      const pages = data.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      
      if (!pageId || pageId === '-1') return null;

      const page = pages[pageId];
      
      const content: WikiPageContent = {
        pageId: parseInt(pageId),
        title: page.title || title,
        extract: page.extract || '',
        url: page.fullurl || `https://${this.wikiLanguage}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        categories: page.categories?.map((c: any) => c.title)?.slice(0, 10) || [],
        links: page.links?.map((l: any) => l.title)?.slice(0, 20) || [],
        images: page.images?.map((i: any) => i.title)?.slice(0, 10) || [],
        coordinates: page.coordinates?.[0] ? {
          lat: page.coordinates[0].lat,
          lon: page.coordinates[0].lon
        } : undefined
      };

      // Get related pages
      try {
        const relatedParams = new URLSearchParams({
          action: 'query',
          titles: title,
          prop: 'links',
          pllimit: '20',
          format: 'json',
          origin: '*'
        });

        const relatedUrl = `${this.config.apiEndpoint}?${relatedParams.toString()}`;
        const relatedResponse = await fetch(relatedUrl);
        
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          const relatedPages = relatedData.query?.pages || {};
          const relatedPage = relatedPages[pageId];
          
          content.relatedPages = relatedPage?.links?.map((l: any) => l.title)?.slice(0, 20) || [];
        }
      } catch (e) {
        console.warn('[WikiSearchAgent] Related pages failed:', e);
      }

      await sovereignVault.set(cacheKey, content);
      return content;
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[WikiSearchAgent] Get content failed:', e);
      return null;
    }
  }

  /**
   * Get pages by category
   */
  async getPagesByCategory(category: string, limit: number = 20): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: category,
      cmlimit: String(limit),
      cmtype: 'page',
      format: 'json',
      origin: '*'
    });

    const url = `${this.config.apiEndpoint}?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const item of data.query?.categorymembers || []) {
        results.push(this.normalizeResult(
          item.title || '',
          '',
          `https://${this.wikiLanguage}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          {
            pageId: item.pageid,
            category
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[WikiSearchAgent] Category search failed:', e);
    }

    return results;
  }

  /**
   * Get category members (subcategories)
   */
  async getSubcategories(category: string, limit: number = 20): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: category,
      cmlimit: String(limit),
      cmtype: 'subcat',
      format: 'json',
      origin: '*'
    });

    const url = `${this.config.apiEndpoint}?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const item of data.query?.categorymembers || []) {
        results.push(this.normalizeResult(
          item.title || '',
          '',
          `https://${this.wikiLanguage}.wikipedia.org/wiki/Category:${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          {
            pageId: item.pageid
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[WikiSearchAgent] Subcategory search failed:', e);
    }

    return results;
  }

  /**
   * Get random articles
   */
  async getRandomArticles(limit: number = 10): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const params = new URLSearchParams({
      action: 'query',
      list: 'random',
      rnnamespace: '0',
      rnlimit: String(limit),
      format: 'json',
      origin: '*'
    });

    const url = `${this.config.apiEndpoint}?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const item of data.query?.random || []) {
        results.push(this.normalizeResult(
          item.title || '',
          '',
          `https://${this.wikiLanguage}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          {
            pageId: item.id
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[WikiSearchAgent] Random failed:', e);
    }

    return results;
  }

  /**
   * Get trending/featured articles
   */
  async getTrendingArticles(): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    // Try to get today's featured article
    const params = new URLSearchParams({
      action: 'query',
      prop: 'featured',
      fdlimit: '10',
      format: 'json',
      origin: '*'
    });

    const url = `${this.config.apiEndpoint}?${params.toString()}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        // Featured articles
        const featured = data.query?.featured || [];
        for (const item of featured) {
          results.push(this.normalizeResult(
            item.title || '',
            item.description || '',
            `https://${this.wikiLanguage}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            {
              type: 'featured'
            }
          ));
        }
      }
    } catch (e) {
      console.warn('[WikiSearchAgent] Featured failed:', e);
    }

    // Fallback to recent changes
    if (results.length === 0) {
      return this.getRandomArticles(10);
    }

    return results;
  }

  /**
   * Set wiki language
   */
  setLanguage(lang: string): void {
    this.wikiLanguage = lang;
    this.config.apiEndpoint = `https://${lang}.wikipedia.org/w/api.php`;
  }

  /**
   * Strip HTML tags
   */
  private stripHtml(html: string): string {
    return html?.replace(/<[^>]*>/g, '')?.replace(/&quot;/g, '"')?.replace(/&amp;/g, '&') || '';
  }
}

// Export singleton instance
export const wikiSearchAgent = new WikiSearchAgent();

export default WikiSearchAgent;