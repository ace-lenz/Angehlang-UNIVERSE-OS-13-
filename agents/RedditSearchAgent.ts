/**
 * RedditSearchAgent.ts - Reddit Platform Search Agent
 * 
 * Searches Reddit posts, comments, and subreddits
 * Uses Reddit API (no authentication required for basic search)
 * 
 * Features:
 * - Post search
 * - Subreddit search
 * - Trending posts
 * - Comment extraction
 */

import { PlatformSearchAgent, PlatformSearchResult, PlatformConfig } from './PlatformSearchAgent';

const REDDIT_CONFIG: PlatformConfig = {
  platformName: 'Reddit',
  apiEndpoint: 'https://www.reddit.com',
  fallbackEndpoints: [],
  cacheExpiry: 1000 * 60 * 30, // 30 minutes
  rateLimit: 1000,
  authRequired: false // Works without auth
};

export interface RedditPost {
  id: string;
  title: string;
  selftext?: string;
  subreddit: string;
  author: string;
  createdUtc: number;
  score: number;
  numComments: number;
  url: string;
  permalink: string;
  isSelf: boolean;
  isVideo: boolean;
}

export class RedditSearchAgent extends PlatformSearchAgent {
  constructor() {
    super(REDDIT_CONFIG);
  }

  /**
   * Perform Reddit search
   */
  protected async performSearch(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];

    try {
      const apiResults = await this.searchViaApi(query);
      results.push(...apiResults);
    } catch (e) {
      console.warn('[RedditSearchAgent] API failed:', e);
    }

    return results.slice(0, 10);
  }

  /**
   * Search via Reddit API
   */
  private async searchViaApi(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const url = `${this.config.apiEndpoint}/search.json?q=${encodeURIComponent(query)}&limit=10&sr_name=true`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AngehlangUniverseOS/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) return results;
      
      const data = await response.json();
      
      for (const child of data.data.children || []) {
        const post = child.data;
        
        if (!post || post._deleted) continue;
        
        const subreddit = post.subreddit || 'reddit';
        
        results.push(this.normalizeResult(
          post.title || '',
          (post.selftext || post.url || '').substring(0, 300),
          `https://reddit.com${post.permalink}`,
          {
            postId: post.id,
            subreddit: `/r/${subreddit}`,
            author: post.author,
            createdUtc: post.created_utc,
            score: post.score,
            numComments: post.num_comments,
            isSelf: post.is_self,
            isVideo: post.is_video,
            permalink: post.permalink
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[RedditSearchAgent] API search error:', e);
    }
    
    return results;
  }

  /**
   * Get trending posts from popular subreddits
   */
  async getTrending(subreddits: string[] = ['popular', 'all']): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];

    for (const subreddit of subreddits) {
      try {
        const url = `${this.config.apiEndpoint}/r/${subreddit}/hot.json?limit=10`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'AngehlangUniverseOS/1.0'
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();

        for (const child of data.data.children || []) {
          const post = child.data;
          if (!post || post._deleted) continue;

          results.push(this.normalizeResult(
            post.title || '',
            (post.selftext || '').substring(0, 200),
            `https://reddit.com${post.permalink}`,
            {
              postId: post.id,
              subreddit: `/r/${post.subreddit}`,
              score: post.score,
              numComments: post.num_comments
            }
          ));
        }
      } catch (e) {
        console.warn(`[RedditSearchAgent] ${subreddit} failed:`, e);
      }
    }

    return results.slice(0, 10);
  }

  /**
   * Get posts from specific subreddit
   */
  async getSubreddit(subreddit: string, sort: 'hot' | 'new' | 'top' = 'hot'): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const url = `${this.config.apiEndpoint}/r/${subreddit}/${sort}.json?limit=10`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AngehlangUniverseOS/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) return results;
      
      const data = await response.json();
      
      for (const child of data.data.children || []) {
        const post = child.data;
        if (!post) continue;

        results.push(this.normalizeResult(
          post.title || '',
          (post.selftext || '').substring(0, 300),
          `https://reddit.com${post.permalink}`,
          {
            postId: post.id,
            subreddit: `/r/${subreddit}`,
            author: post.author,
            score: post.score,
            numComments: post.num_comments
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[RedditSearchAgent] Subreddit fetch error:', e);
    }
    
    return results;
  }
}

export const redditSearchAgent = new RedditSearchAgent();
export default RedditSearchAgent;